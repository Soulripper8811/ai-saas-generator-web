"use client";

import Heading from "@/components/Heading";
import { MusicIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchmea } from "./constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";

const MusicPage = () => {
  const { onOpen } = useProModal();
  const router = useRouter();
  const [music, setMusic] = useState<string | undefined>();
  const form = useForm<z.infer<typeof formSchmea>>({
    resolver: zodResolver(formSchmea),
    defaultValues: {
      prompt: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchmea>) => {
    try {
      setMusic(undefined);
      // Convert the response data to a blob URL
      const response = await axios.post("/api/music", values);
      setMusic(response.data);

      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        onOpen();
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
      console.error("Error generating music:", error);
      // Optionally, show the error to the user
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Music Generations"
        description="Generate Music with AI"
        icon={MusicIcon}
        iconColor="text-emerald-700"
        bgColor="bg-emerald-700/10"
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
                      placeholder="A soft music with guitar!!"
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
        {!music && !isLoading && <Empty label="No Music Generated Yet" />}

        {music && !isLoading && (
          <div className="flex flex-col items-center space-y-4 mt-48">
            <audio
              controls
              className="flex justify-center items-center mx-auto"
            >
              <source src={music} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <a
              href={music}
              download="generated_music.mp3"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-600"
            >
              Download Music
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPage;
