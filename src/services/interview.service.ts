import { askMentor } from "./mentor.service";
import type { MentorMessage } from "@/types/mentor";

export async function analyzeInterview(
  question: string,
  answer: string
) {
  const messages: MentorMessage[] = [
    {
      id: crypto.randomUUID(),
      role: "user",
      createdAt: new Date().toISOString(),
      content: `
You are an expert FAANG interviewer.

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate this answer.

Return ONLY this format:

Overall Score: X/10

Strengths:
- ...

Weaknesses:
- ...

Suggested Better Answer:
...

Tips:
- ...
      `,
    },
  ];

  return askMentor(messages);
}