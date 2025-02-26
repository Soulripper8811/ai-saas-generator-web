import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          "8c47da666861d081eeb4d1261853087de23923a268a69b63febdf5dc1dee08e4",
        input: {
          cfg: 3,
          model: "0.9.1",
          steps: 30,
          length: 97,
          prompt: prompt,
          target_size: 640,
          aspect_ratio: "16:9",
          negative_prompt:
            "low quality, worst quality, deformed, distorted, watermark",
          image_noise_scale: 0.15,
        },
      }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
