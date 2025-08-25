import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (req) => {
  console.log("Hugging Face AI Service function invoked:", req.method, req.url);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    console.log("HUGGINGFACE_API_KEY status:", HUGGINGFACE_API_KEY ? "Set" : "Missing");
    if (!HUGGINGFACE_API_KEY) {
      throw new Error("Hugging Face API token is not set in Supabase secrets.");
    }

    const { prompt } = await req.json();
    console.log("Received prompt:", prompt);

    // Input validation (merged from Supabase AI version)
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt input is required");
    }
    if (prompt.length > 500) {
      throw new Error("Input prompt is too long. Maximum 500 characters allowed.");
    }

    const model = "mistralai/Mistral-7B-Instruct-v0.2";
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 400,  // Increased for better responses
            return_full_text: false,
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hugging Face API request failed:", response.status, errorBody);
      throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    console.log("Hugging Face response:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("hf-assist error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
