"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScanEye, UploadCloud } from "lucide-react";
import { Loader } from "@/components/Loader";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Heading from "@/components/Heading";
import toast from "react-hot-toast";
import { useProModal } from "@/hooks/use-pro-modal";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  file: z.any(),
});

const UploadForm = () => {
  const { onOpen } = useProModal();
  const router = useRouter();
  const [result, setResult] = useState<string | undefined>();
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [removePreview, setRemovePreview] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const isLoading = form.formState.isSubmitting;

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemovePreview(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onloadend = () => {
      setPreview(filereader.result as string);
    };
  };

  const onSubmit = async () => {
    try {
      const response = await axios.post("/api/imageanalysis", { preview });
      setResult(response.data);
      toast.success("Image Analysis Generated Successfully");
    } catch (error: any) {
      if (error?.response?.status === 403) {
        onOpen();
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="">
      <Heading
        title="Image Analysis"
        description="Image Analysis with AI"
        icon={ScanEye}
        iconColor="text-orange-700"
        bgColor="text-orange-700/10"
      />

      <Card className="p-6 w-full max-w-md shadow-lg border border-gray-200 rounded-xl text-center mx-auto">
        <h2 className="text-xl font-semibold mb-4">Upload an Image</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {preview && !removePreview ? (
              <div>
                <img
                  src={preview}
                  alt="preview"
                  className="w-full rounded-lg"
                />
                <Button
                  onClick={() => {
                    setRemovePreview(true);
                    setPreview(undefined);
                    setResult(undefined);
                  }}
                >
                  Remove Preview
                </Button>
              </div>
            ) : (
              <FormField
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center  hover:bg-gray-50">
                        <label
                          htmlFor="FileInput"
                          className="mt-2 text-sm text-gray-600 cursor-pointer justify-center items-center flex flex-col"
                        >
                          <UploadCloud className="w-12 h-12 text-gray-500  " />
                          Drag & Drop or Click to Upload
                        </label>
                        <Input
                          id="FileInput"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImage}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full " disabled={isLoading}>
              {isLoading ? <Loader /> : "Generate"}
            </Button>
          </form>
        </Form>
      </Card>
      {isLoading && (
        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
          <Loader />
        </div>
      )}
      {result && (
        <div className="mt-6 p-6 flex flex-col items-center border shadow-md">
          <ReactMarkdown
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                  <pre {...props} />
                </div>
              ),
            }}
            className={"text-sm overflow-hidden leading-7"}
          >
            {result}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
