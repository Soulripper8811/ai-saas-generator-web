"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useProModal } from "@/hooks/use-pro-modal";
import { Badge } from "../ui/badge";
import { DialogDescription } from "@radix-ui/react-dialog";
import { tools } from "@/lib/constant";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { Check, Zap } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";

const ProModal = () => {
  const { isOpen, onOpen, onClose } = useProModal();
  const [loading, setLoading] = useState(false);
  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(`Error subscribing to pro in Client: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center flex-col gap-y-4 pb-4">
            <div className="flex items-center gap-x-2 font-bold py-1">
              Upgrade to Genius
              <Badge className="uppercase text-sm py-1" variant={"premium"}>
                Pro
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
            {tools.map((tool) => (
              <Card
                className="p-3 border-black/5 flex items-center justify-between"
                key={tool.label}
              >
                <div className="flex items-center gap-x-4">
                  <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                    <tool.icon className={cn("w-6 h-6", tool.color)} />
                  </div>
                  <div className="font-semibold text-sm">{tool.label}</div>
                </div>
                <Check className="text-primary w-5 h-5" />
              </Card>
            ))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full"
            variant={"premium"}
            size={"lg"}
            onClick={onSubscribe}
          >
            Upgrade <Zap className="w4 h-4 w-full fill-white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;
