import { z } from "zod";
export const formSchmea = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});
