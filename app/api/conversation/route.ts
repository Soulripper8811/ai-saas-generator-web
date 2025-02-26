import { OpenAI } from "openai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages } = body;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json("Messages are required and must be an array.", {
        status: 400,
      });
    }

    const validRoles = ["system", "user", "assistant"];
    const sanitizedMessages = messages.map((msg) => {
      if (!msg.role || !msg.content || !validRoles.includes(msg.role)) {
        throw new Error(`Invalid message format: ${JSON.stringify(msg)}`);
      }
      return { role: msg.role, content: msg.content };
    });

    // console.log(
    //   "Sending messages to Groq:",
    //   JSON.stringify(sanitizedMessages, null, 2)
    // );

    const freeTrail = await checkApiLimit();

    if (!freeTrail) {
      return NextResponse.json("You have reached your limit of fre trail.", {
        status: 403,
      });
    }
    const groqResponse = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: sanitizedMessages,
    });

    await increaseApiLimit();
    return NextResponse.json({
      role: "system",
      content: groqResponse.choices[0].message.content,
    });
  } catch (error) {
    console.log("Conversation error", error);
    return NextResponse.json("Interal Server error", { status: 500 });
  }
}
