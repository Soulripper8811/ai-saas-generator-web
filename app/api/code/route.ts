import { OpenAI } from "openai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const instructionMessage = {
  role: "system",
  content: `You are a code generator AI. You are given a task and you need to generate code. Your output should be a valid code in the language specified by the user. You should not generate anything else. The user will then copy and paste the code to the IDE. You can also provide additional information to help the user. Please keep your responses short and concise. If you are unable to generate a code, please respond with "I'm sorry, I am unable to generate a code for this task."`,
};
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

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages:[instructionMessage, ...messages],
    // });

    // const paid = response.choices[0].message.content;
    // Validate the messages structure
    const validRoles = ["system", "user", "assistant"];
    const sanitizedMessages = messages.map((msg) => {
      if (!msg.role || !msg.content || !validRoles.includes(msg.role)) {
        throw new Error(`Invalid message format: ${JSON.stringify(msg)}`);
      }
      return { role: msg.role, content: msg.content };
    });

    
    if (!freeTrail && !isPro) {
      return NextResponse.json("You have reached your limit of fre trail.", {
        status: 403,
      });
    }

    const groqResponse = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [instructionMessage, ...sanitizedMessages],
    });
    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json({
      role: "system",
      content: groqResponse.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json("Interal Server error", { status: 500 });
  }
}
