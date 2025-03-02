import { z } from "zod";
export const formSchmea = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 1024 * 5, //5mb
    "File size must be less than 10MB"
  ),
});
