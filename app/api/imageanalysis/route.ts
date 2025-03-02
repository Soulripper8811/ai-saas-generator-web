import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { preview } = body;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    if (!preview) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrail && !isPro) {
      return NextResponse.json("You have reached your limit of fre trail.", {
        status: 403,
      });
    }

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const response = await model.generateContent([
      { inlineData: { mimeType: "image/*", data: preview.split(",")[1] } },
      "What is the content of the image?",
    ]);
    if (!isPro) {
      await increaseApiLimit();
    }
    const result = await response.response.text();
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
