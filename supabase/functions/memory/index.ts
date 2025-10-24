import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MemoryEntry {
  id?: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header (optional for this function)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // GET /memory - List entries
    if (req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const type = url.searchParams.get('type');
      
      let query = supabase
        .from('memory_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          entries: data || [],
          count: data?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /memory - Add entry
    if (req.method === 'POST') {
      const { content, type, metadata } = await req.json() as MemoryEntry;

      if (!content) {
        return new Response(
          JSON.stringify({ success: false, error: 'Content is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const entry = {
        content,
        type: type || 'analysis',
        metadata: metadata || {},
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('memory_entries')
        .insert([entry])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          id: data.id,
          entry: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /memory/:id - Delete entry
    if (req.method === 'DELETE') {
      const entryId = pathParts[pathParts.length - 1];

      if (!entryId || entryId === 'memory') {
        return new Response(
          JSON.stringify({ success: false, error: 'Entry ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let query = supabase
        .from('memory_entries')
        .delete()
        .eq('id', entryId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in memory function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
