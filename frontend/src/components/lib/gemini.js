import { GoogleGenerativeAI } from "@google/generative-ai";

export async function sendMessage(message) {
  try {
    const res = await fetch("http://localhost:8080/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    return data.reply;
  } catch (err) {
    return "⚠ Không thể kết nối server AI!";
  }
}



