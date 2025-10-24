import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MemoryEntry {
  id: string;
  content: string;
  type: string;
  timestamp: string;
  prompt?: string;
  metadata?: Record<string, any>;
}

export interface MemoryStats {
  total: number;
  byType: Record<string, number>;
  byDate: Record<string, number>;
  recent: number;
}

interface SearchOptions {
  type?: string | null;
  dateRange?: { start: Date; end: Date } | null;
  caseSensitive?: boolean;
}

export const useMemoryManager = () => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all entries
  const loadEntries = useCallback(async (limit = 100, type?: string | null) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (type) params.append('type', type);

      const { data, error } = await supabase.functions.invoke('memory', {
        method: 'GET',
      });

      if (error) throw error;

      const loadedEntries = (data.entries || []).map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        type: entry.type,
        timestamp: entry.created_at,
        prompt: entry.metadata?.prompt,
        metadata: entry.metadata,
      }));

      setEntries(loadedEntries);
      return loadedEntries;
    } catch (error) {
      console.error('Error loading entries:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add entry
  const addEntry = useCallback(async (
    content: string,
    type = 'analysis',
    metadata: Record<string, any> = {}
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('memory', {
        body: {
          content,
          type,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            version: '2.0'
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        const newEntry: MemoryEntry = {
          id: data.id,
          content,
          type,
          timestamp: new Date().toISOString(),
          metadata
        };
        
        setEntries(prev => [newEntry, ...prev]);
        return { success: true, id: data.id };
      }

      throw new Error('Failed to add entry');
    } catch (error) {
      console.error('Error adding entry:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, []);

  // Delete entry
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(`memory/${entryId}`, {
        method: 'DELETE',
      });

      if (error) throw error;

      if (data.success) {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        return { success: true };
      }

      throw new Error('Failed to delete entry');
    } catch (error) {
      console.error('Error deleting entry:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, []);

  // Search entries
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

  // Get statistics
  const getStatistics = useCallback((): MemoryStats => {
    const stats: MemoryStats = {
      total: entries.length,
      byType: {},
      byDate: {},
      recent: 0
    };

    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    entries.forEach(entry => {
      // By type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;

      // By date (month)
      const date = new Date(entry.timestamp);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      stats.byDate[monthKey] = (stats.byDate[monthKey] || 0) + 1;

      // Recent (last week)
      if (new Date(entry.timestamp).getTime() > oneWeekAgo) {
        stats.recent++;
      }
    });

    return stats;
  }, [entries]);

  // Export data
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

    // Filter by date
    if (dateRange?.start && dateRange?.end) {
      exportEntries = exportEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      });
    }

    // Filter by type
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

  // Download export
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
