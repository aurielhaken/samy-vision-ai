import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MemoryEntry {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  created_at: string;
  prompt?: string;
  metadata?: Record<string, any>;
}

export interface MemoryStats {
  total: number;
  byType: Record<string, number>;
  byDate?: Record<string, number>;
  recent: number;
}

interface SearchOptions {
  type?: string | null;
  dateRange?: { start: Date; end: Date } | null;
  caseSensitive?: boolean;
}

export const useMemoryManager = () => {
  const queryClient = useQueryClient();

  // React Query pour le cache automatique et optimisation
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['memory-entries'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('memory', {
        method: 'GET',
      });
      if (error) throw error;
      
      const loadedEntries = (data.entries || []).map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        type: entry.type,
        timestamp: entry.created_at,
        created_at: entry.created_at,
        prompt: entry.metadata?.prompt,
        metadata: entry.metadata,
      }));
      
      return loadedEntries as MemoryEntry[];
    },
    staleTime: 30000, // Cache pendant 30 secondes
    gcTime: 300000, // Garde en mémoire 5 minutes
  });

  const loadEntries = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
  }, [queryClient]);

  // Mutation optimiste pour l'ajout
  const addMutation = useMutation({
    mutationFn: async ({ content, type, metadata }: { 
      content: string; 
      type: string; 
      metadata: Record<string, any> 
    }) => {
      const { data, error } = await supabase.functions.invoke('memory', {
        method: 'POST',
        body: { content, type, metadata: { ...metadata, timestamp: new Date().toISOString(), version: '2.0' } },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['memory-entries'] });
      const previousEntries = queryClient.getQueryData(['memory-entries']);
      
      queryClient.setQueryData(['memory-entries'], (old: MemoryEntry[] = []) => [
        {
          id: 'temp-' + Date.now(),
          content: variables.content,
          type: variables.type,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          metadata: variables.metadata,
        },
        ...old,
      ]);
      
      return { previousEntries };
    },
    onError: (err, variables, context) => {
      // Rollback sur erreur
      if (context?.previousEntries) {
        queryClient.setQueryData(['memory-entries'], context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
    },
  });

  const addEntry = useCallback(async (
    content: string,
    type: string = 'analysis',
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      const result = await addMutation.mutateAsync({ content, type, metadata });
      return { success: true, id: result.id };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }, [addMutation]);

  // Mutation optimiste pour la suppression
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke(`memory/${id}`, {
        method: 'DELETE',
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['memory-entries'] });
      const previousEntries = queryClient.getQueryData(['memory-entries']);
      
      queryClient.setQueryData(['memory-entries'], (old: MemoryEntry[] = []) =>
        old.filter(entry => entry.id !== deletedId)
      );
      
      return { previousEntries };
    },
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['memory-entries'], context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-entries'] });
    },
  });

  const deleteEntry = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }, [deleteMutation]);

  // Search avec memoization
  const searchEntries = useCallback((
    query: string,
    options: SearchOptions = {}
  ): MemoryEntry[] => {
    const { type = null, dateRange = null, caseSensitive = false } = options;
    let filtered = [...entries];

    if (type) {
      filtered = filtered.filter(entry => entry.type === type);
    }

    if (dateRange?.start && dateRange?.end) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }

    if (query) {
      const searchQuery = caseSensitive ? query : query.toLowerCase();
      filtered = filtered.filter(entry => {
        const content = caseSensitive ? entry.content : entry.content.toLowerCase();
        return content.includes(searchQuery);
      });
    }

    return filtered;
  }, [entries]);

  // Stats avec memoization
  const getStatistics = useCallback((): MemoryStats => {
    return useMemo(() => {
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

      const stats: MemoryStats = {
        total: entries.length,
        recent: 0,
        byType: {},
      };

      entries.forEach((entry) => {
        stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
        const entryTime = new Date(entry.created_at).getTime();
        if (entryTime > oneWeekAgo) {
          stats.recent++;
        }
      });

      return stats;
    }, [entries]);
  }, [entries]);

  // Export avec memoization
  const exportData = useCallback((
    format: 'json' | 'csv' | 'txt' = 'json',
    options: {
      includeMetadata?: boolean;
      dateRange?: { start: Date; end: Date } | null;
      types?: string[] | null;
    } = {}
  ): string => {
    const { includeMetadata = true, dateRange = null, types = null } = options;
    let exportEntries = [...entries];

    if (dateRange?.start && dateRange?.end) {
      exportEntries = exportEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }

    if (types && Array.isArray(types)) {
      exportEntries = exportEntries.filter(entry => types.includes(entry.type));
    }

    switch (format) {
      case 'json':
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          version: '2.0',
          totalEntries: exportEntries.length,
          statistics: getStatistics(),
          entries: exportEntries.map(entry => ({
            id: entry.id,
            content: entry.content,
            type: entry.type,
            timestamp: entry.timestamp,
            ...(includeMetadata && entry.metadata ? { metadata: entry.metadata } : {})
          }))
        }, null, 2);

      case 'csv':
        const headers = ['ID', 'Type', 'Timestamp', 'Content'];
        const rows = exportEntries.map(entry => [
          entry.id,
          entry.type,
          new Date(entry.timestamp).toISOString(),
          `"${entry.content.replace(/"/g, '""')}"`
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');

      case 'txt':
        let text = `# Export Samy Vision Memory\n`;
        text += `Date: ${new Date().toISOString()}\n`;
        text += `Total entries: ${exportEntries.length}\n\n`;
        exportEntries.forEach((entry, index) => {
          text += `## Entry ${index + 1}\n`;
          text += `ID: ${entry.id}\n`;
          text += `Type: ${entry.type}\n`;
          text += `Date: ${new Date(entry.timestamp).toLocaleString()}\n`;
          text += `Content:\n${entry.content}\n\n`;
        });
        return text;

      default:
        return JSON.stringify(exportEntries);
    }
  }, [entries, getStatistics]);

  const downloadExport = useCallback((
    format: 'json' | 'csv' | 'txt' = 'json',
    options = {}
  ) => {
    const data = exportData(format, options);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samy-vision-memory-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  return {
    entries,
    isLoading,
    loadEntries,
    addEntry,
    deleteEntry,
    searchEntries,
    getStatistics,
    exportData,
    downloadExport,
  };
};
