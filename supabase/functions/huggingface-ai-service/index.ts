import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Hugging Face AI Service function is ready.");

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Function received a request. Method:", req.method);
    const body = await req.json();
    console.log("Request body parsed successfully.");
    const { prompt } = body;

    if (!prompt) {
      throw new Error("No 'prompt' found in the request body.");
    }
    console.log("Prompt received.");

    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_TOKEN');
    if (!huggingFaceApiKey) {
      console.error("CRITICAL: HUGGINGFACE_API_TOKEN secret not found in environment variables.");
      throw new Error("Hugging Face API token is not set in Supabase secrets.");
    }
    console.log("Hugging Face API token found.");

    console.log("Calling Hugging Face API...");
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );
    console.log("Hugging Face API response status:", response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hugging Face API Error:", errorBody);
      throw new Error(`Hugging Face API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Successfully received and parsed response from Hugging Face API.");

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("An error occurred in the Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});