import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization:
              req.headers.get("Authorization") ?? "",
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { messages } = await req.json();
    const groqMessages = messages.map(
  (m: { role: string; content: string }) => ({
    role: m.role,
    content: m.content,
  })
);

    const groq = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0.7,
          messages: [
  {
    role: "system",
    content:
      "You are CareerOS AI Mentor. Help students with resumes, GitHub, interviews, roadmaps, internships, coding, placements and career growth. Keep answers practical and motivating.",
  },
  ...groqMessages,
],
        }),
      }
    );

   const result = await groq.json();

console.log("Groq Response:", JSON.stringify(result));

if (!groq.ok) {
  return new Response(
    JSON.stringify({
      success: false,
      error: result.error?.message || "Groq API Error",
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

const reply = result?.choices?.[0]?.message?.content;

if (!reply) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Groq returned an empty response.",
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

return new Response(
  JSON.stringify({
    success: true,
    reply,
  }),
  {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);

} catch (err) {
  return new Response(
    JSON.stringify({
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error",
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

});