import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    if (!prompt) {
      return NextResponse.json("Messages are required and must be an array.", {
        status: 400,
      });
    }
    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrail && !isPro) {
      return NextResponse.json("You have reached your limit of fre trail.", {
        status: 403,
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small",
      {
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(prompt),
      }
    );

    const buffer = await response.arrayBuffer();
    const base64String = arrayBufferToBase64(buffer);
    const mimeType = "audio/mpeg"; // Change if needed
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    if (!isPro) {
      await increaseApiLimit();
    }
    return NextResponse.json(dataUrl);
  } catch (error) {
    console.log("Code error", error);
    return NextResponse.json("Interal Server error", { status: 500 });
  }
}

function arrayBufferToBase64(buffer: any) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
