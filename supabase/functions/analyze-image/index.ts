import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, prompt } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SAMY_VISION_API_KEY = Deno.env.get('SAMY_VISION_API_KEY');
    const SAMY_VISION_API_URL = 'https://9c4a969603f2.ngrok-free.app';

    if (!SAMY_VISION_API_KEY) {
      console.error('SAMY_VISION_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Samy Vision API...');
    
    // Call the Samy Vision API
    const response = await fetch(`${SAMY_VISION_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SAMY_VISION_API_KEY,
      },
      body: JSON.stringify({
        image: image,
        prompt: prompt || "Décris cette image en détail",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Samy Vision API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to analyze image",
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Analysis successful');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
