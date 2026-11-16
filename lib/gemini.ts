import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getClient() {
  if (!client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenerativeAI(key);
  }
  return client;
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export async function askGemini(systemPrompt: string, history: ChatTurn[], message: string) {
  const model = getClient().getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({
    history: history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}
