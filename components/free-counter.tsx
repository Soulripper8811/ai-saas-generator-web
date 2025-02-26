"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { MAX_FREE_COUNT } from "@/lib/constant";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useProModal } from "@/hooks/use-pro-modal";

interface FreeCounterProps {
  apiLimitCount: number;
  isPro: boolean;
}
const FreeCounter = ({ apiLimitCount, isPro = false }: FreeCounterProps) => {
  const { isOpen, onOpen } = useProModal();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  if (isPro) return null;
  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-white mb-4 space-y-2">
            <p>
              {apiLimitCount}/{MAX_FREE_COUNT} Free Generations Remaining
            </p>
            <Progress
              value={(apiLimitCount / MAX_FREE_COUNT) * 100}
              className="h-3"
            />
          </div>
          <Button onClick={onOpen} className="w-full" variant={"premium"}>
            Upgrade
            <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeCounter;
