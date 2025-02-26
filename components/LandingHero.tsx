"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@clerk/nextjs";
import { TypeAnimation } from "react-type-animation";

const LandingHero = () => {
  const { isSignedIn } = useAuth();
  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
        <h1>The Best AI tool for</h1>
        <div className=" text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypeAnimation
            sequence={[
              // Same substring at the start will only be typed out once, initially
              "Chatbot.",
              3 * 1000, // wait 1s before replacing "Mice" with "Hamsters"
              "Photo Generation.",
              3 * 1000,
              "Code Generation.",
              3 * 1000,
              "Music Generation.",
              3 * 1000,
            ]}
            wrapper="span"
            speed={50}
            style={{ display: "inline-block" }}
            repeat={Infinity}
          />
        </div>
      </div>
      <div className="text-sm md:text-xl font-light text-zinc-400">
        Create content using AI 10x faster.
      </div>
      <div>
        <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
          <Button
            variant="premium"
            className="md:text-lg p-4 md:p-6 rounded-full font-semibold"
          >
            Start Generating For Free
          </Button>
        </Link>
      </div>
      <div className="text-zinc-400 text-xs md:text-sm font-normal">
        No credit card required.
      </div>
    </div>
  );
};

export default LandingHero;
