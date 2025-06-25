import { generateShortUrlService } from "../services/url.service";
import type { BunRequest } from "bun";
import * as z from "zod/v4";

const allowedProtocols = ["http:", "https:"];

const urlScheme = z.object({
  url: z.url().max(2000).trim().refine(
    (value) => {
      try {
        const url = new URL(value);
        return allowedProtocols.includes(url.protocol);
      } catch {
        return false;
      }
    },{message: "Only HTTP or HTTPS URLs are allowed."}
  ),
});

export async function generateShortUrlRoute(req: BunRequest<"/api/url">) {
  try {
    const parsedInput = await urlScheme.parseAsync(await req.json());
    await generateShortUrlService(parsedInput.url);
    return Response.json({}, {status: 200, statusText: 'Ok'});
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { message: err.issues },
        { status: 400, statusText: "Bad Request" }
      );
    }
    console.log(err)
    return Response.json(
      { status: 500, statusText: "Internal Server Error" }
    );
  }
}
