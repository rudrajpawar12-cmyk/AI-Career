import { supabase } from "@/lib/supabase";

import type { MentorMessage } from "@/types/mentor";

interface MentorResponse {
  success: boolean;
  reply?: string;
  error?: string;
}

export async function askMentor(
  messages: MentorMessage[]
): Promise<string> {

  const { data, error } =
    await supabase.functions.invoke<MentorResponse>(
      "ai-mentor",
      {
        body: { messages },
      }
    );

  if (error) {
    throw new Error("AI Mentor unavailable.");
  }

  if (!data?.success) {
    throw new Error(data?.error || "Unknown error");
  }

  return data.reply || "";
}