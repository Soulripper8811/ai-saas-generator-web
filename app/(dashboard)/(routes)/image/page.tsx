"use client";

import Heading from "@/components/Heading";
import { Download, ImageIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { amountOptions, formSchmea, resolutionOptions } from "./constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import NoImage from "./_components/NoImage";
import { useProModal } from "@/hooks/use-pro-modal";

const ImagePage = () => {
  const { onOpen } = useProModal();
  const [singleImage, setSingleImage] = useState<string>("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchmea>>({
    resolver: zodResolver(formSchmea),
    defaultValues: {
      prompt: "",
      resolution: "512x512",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchmea>) => {
    try {
      const response = await axios.post("/api/image", values);
      setSingleImage(response.data); // Ensure response has correct structure
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        onOpen();
      }
      console.error("Error generating image:", error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn Your prompt into an Image"
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-8">
                  <FormControl>
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="A picture of a cat walking on a mountain"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amountOptions.map((option) => (
                        <SelectItem value={option.value} key={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            /> */}
            <FormField
              name="resolution"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resolutionOptions.map((option) => (
                        <SelectItem value={option.value} key={option.label}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </form>
        </Form>
      </div>
      <div className="space-y-4 mt-4">
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {!singleImage && !isLoading && (
          <Empty label="No images generated yet." />
        )}
        {singleImage && !isLoading && (
          <div className=" flex justify-center items-center mx-auto w-[400px]   mt-8 itemc">
            <Card className="rounded-lg overflow-hidden  w-full h-full">
              <div className="relative aspect-square">
                {!singleImage ? (
                  <NoImage />
                ) : (
                  <Image src={singleImage} fill alt="Generated Image" />
                )}
              </div>
              <CardFooter className="mb-4 z-20">
                <Button
                  variant="secondary"
                  className="w-full z-20"
                  onClick={() => window.open(singleImage, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePage;
