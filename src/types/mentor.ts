export interface MentorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}