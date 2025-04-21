// app/api/music/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import Replicate from "replicate";

// Initialize Replicate client with API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    // Check authentication
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate input
    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // Check if user is on free trial or has pro subscription
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    // Call Replicate API using Riffusion model
    const prediction = await replicate.predictions.create({
      version:
        "8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      input: {
        alpha: 0.5,
        prompt_a: prompt, // Use the user's prompt as prompt_a
        denoising: 0.75,
        seed_image_id: "vibes",
        num_inference_steps: 50,
      },
    });

    // Wait for the prediction to complete
    const result = await replicate.wait(prediction);
    console.log("Riffusion API complete result:", result);

    // The result should now contain the URLs to the generated audio
    if (!result || !result.output || !result.output.audio) {
      return new NextResponse("Failed to generate audio", { status: 500 });
    }

    const audioUrl = result.output.audio;

    // Increment API usage limit if not a pro user
    if (!isPro) {
      await increaseApiLimit();
    }

    // Return the audio URL to the frontend
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Music generation error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
