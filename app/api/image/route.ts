import { OpenAI } from "openai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { HfInference } from "@huggingface/inference";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
  baseURL: process.env.BASE_URL_FOR_OPEN_AI,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const client = new HfInference("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");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, resolution = "512x512" } = body;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    if (!prompt) {
      return NextResponse.json("Prompt is required and must be a string.", {
        status: 400,
      });
    }

    if (!resolution) {
      return NextResponse.json("Resolution is required and must be a number.", {
        status: 400,
      });
    }
    // const response = await openai.images.generate({
    //   model: "flux-dev",
    //   prompt: prompt,
    //   size: resolution,
    // });
    // console.log(response.data);
    // return NextResponse.json(response.data[0].url);

    const freeTrail = await checkApiLimit();

    if (!freeTrail) {
      return NextResponse.json("You have reached your limit of fre trail.", {
        status: 403,
      });
    }
    const image = await client.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
      provider: "hf-inference",
    });
    const buffer = await image.arrayBuffer();
    const base64String = arrayBufferToBase64(buffer);

    const mimeType = "image/png"; // Change if needed
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    await increaseApiLimit();
    return NextResponse.json(dataUrl);
  } catch (error) {
    console.log("Image error", error);
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
