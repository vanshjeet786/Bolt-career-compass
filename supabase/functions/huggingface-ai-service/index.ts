import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hugging Face AI Service function is ready.");

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json();

    // 1. Get Hugging Face API key from Supabase secrets
    const huggingFaceApiKey = Deno.env.get('HUGGINGFACE_API_TOKEN');
    if (!huggingFaceApiKey) {
      throw new Error("Hugging Face API token is not set in Supabase secrets.");
    }

    // 2. Call the Hugging Face API
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

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();

    // 3. Return the response
    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
