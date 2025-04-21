// import { OpenAI } from "openai";
// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
// import { checkSubscription } from "@/lib/subscription";

// const openai = new OpenAI({
//   apiKey: process.env.OPEN_AI_KEY,
// });

// export async function POST(req: Request) {
//   try {
//     const { userId } = await auth();
//     const body = await req.json();
//     const { prompt, resolution = "512x512" } = body;

//     console.log(prompt);

//     if (!userId) return NextResponse.json("Unauthorized", { status: 401 });
//     if (!prompt) {
//       return NextResponse.json("Prompt is required.", { status: 400 });
//     }

//     const freeTrial = await checkApiLimit();
//     const isPro = await checkSubscription();

//     if (!freeTrial && !isPro) {
//       return NextResponse.json("You have reached your free trial limit.", {
//         status: 403,
//       });
//     }

//     const response = await openai.images.generate({
//       model: "dall-e-2",
//       prompt,
//       n: 1,
//       size: resolution,
//     });

//     const imageUrl = response.data?.[0]?.url;

//     if (!imageUrl) {
//       return NextResponse.json("Failed to generate image.", { status: 500 });
//     }

//     if (!isPro) {
//       await increaseApiLimit();
//     }
//     return NextResponse.json(imageUrl);
//   } catch (error) {
//     console.error("[IMAGE_GENERATION_ERROR]", error);
//     return NextResponse.json("Internal Server Error", { status: 500 });
//   }
// }
// app/api/image/route.ts
import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import Replicate from "replicate";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, resolution = "512x512", provider = "openai" } = body;

    if (!userId) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json("Prompt is required.", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return NextResponse.json("You have reached your free trial limit.", {
        status: 403,
      });
    }

    let imageUrl: string;

    // Generate image based on selected provider
    if (provider === "openai") {
      // OpenAI (DALL-E) generation
      const response = await openai.images.generate({
        model: "dall-e-2",
        prompt,
        n: 1,
        size: resolution,
      });

      imageUrl = response.data?.[0]?.url || "";
    } else if (provider === "replicate") {
      const dimensions = resolution.split("x");
      const width: number = dimensions[0] ? parseInt(dimensions[0]) : 1024;
      const height: number = dimensions[1] ? parseInt(dimensions[1]) : 1024;

      // Use prediction instead of run to avoid streaming
      const prediction = await replicate.predictions.create({
        version:
          "6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe",
        input: {
          seed: Math.floor(Math.random() * 10000),
          width,
          height,
          prompt: prompt,
          scheduler: "K_EULER",
          num_outputs: 1,
          guidance_scale: 0,
          negative_prompt: "worst quality, low quality",
          num_inference_steps: 4,
        },
      });

      // Wait for the prediction to complete
      let finalPrediction;

      // Poll for completion
      while (!finalPrediction?.output && !finalPrediction?.error) {
        console.log("Waiting for Replicate prediction to complete...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
        finalPrediction = await replicate.predictions.get(prediction.id);
      }

      console.log("Final prediction:", finalPrediction);

      if (finalPrediction.error) {
        console.error("Replicate error:", finalPrediction.error);
        return NextResponse.json(`Replicate error: ${finalPrediction.error}`, {
          status: 500,
        });
      }

      if (
        Array.isArray(finalPrediction.output) &&
        finalPrediction.output.length > 0
      ) {
        imageUrl = finalPrediction.output[0];
      } else {
        console.error(
          "Unexpected Replicate output format:",
          finalPrediction.output
        );
        return NextResponse.json("Failed to generate image with Replicate", {
          status: 500,
        });
      }
    } else {
      return NextResponse.json("Invalid provider selected", { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json("Failed to generate image.", { status: 500 });
    }

    // Increment API usage limit if not a pro user
    if (!isPro) {
      await increaseApiLimit();
    }

    return NextResponse.json(imageUrl);
  } catch (error) {
    console.error("[IMAGE_GENERATION_ERROR]", error);
    if (error instanceof Error) {
      return NextResponse.json(`Internal Server Error: ${error.message}`, {
        status: 500,
      });
    }
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
