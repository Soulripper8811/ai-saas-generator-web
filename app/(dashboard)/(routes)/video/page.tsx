"use client";

import Heading from "@/components/Heading";
import { VideoIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchmea } from "./constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import axios from "axios";

const VideoPage = () => {
  const router = useRouter();
  const [video, setVideo] = useState<string | undefined>();
  const form = useForm<z.infer<typeof formSchmea>>({
    resolver: zodResolver(formSchmea),
    defaultValues: {
      prompt: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchmea>) => {
    try {
      setVideo(undefined);
      const response = await axios.post("/api/video", values);

      if (response.data && response.data.urls && response.data.urls.output) {
        setVideo(response.data.urls.output);
      }

      form.reset();
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Video Generations"
        description="Generate Video with AI"
        icon={VideoIcon}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
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
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="A bird flying on a hotdog!"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
              type="submit"
            >
              Generate
            </Button>
          </form>
        </Form>
      </div>
      <div className="space-y-4 mt-4">
        {isLoading && (
          <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
            <Loader />
          </div>
        )}
        {!video && !isLoading && <Empty label="No Video Generated Yet" />}

        {video && !isLoading && (
          <div className="flex flex-col items-center space-y-4 mt-8">
            <video
              controls
              className="flex justify-center items-center mx-auto w-full max-w-lg"
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video element.
            </video>
            <a
              href={video}
              download="generated_video.mp4"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-600"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
