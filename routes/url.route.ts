import { getFromCache } from "../infra/cache/cache.infra";
import { handleRouteErrors} from "./errors/routeErrors.route";
import type { BunRequest } from "bun";
import * as z from "zod/v4";

import { 
  generateShortUrl, 
  getRedirectCode, 
  updateClicksCount 
} from "../services/url.service";

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

const urlCode = z.string();

export async function handleShortUrlGeneration(req: BunRequest<"/api/url">) {
  try {
    const parsedInput = await urlScheme.parseAsync(await req.json());

    await generateShortUrl(parsedInput.url);

    return Response.json({}, {status: 200, statusText: 'Ok'});
  } catch (err) {
    return handleRouteErrors(err);
  };
};

export async function redirectToOriginalUrl(req: BunRequest<"/api/url">) {
  const query = new URLSearchParams(req.url);
  let code: undefined | string;

  for (const value of query.values()) code = value;
  try {
    const cache = getFromCache(urlCode.parse(code));
    
    if(cache) {
      updateClicksCount(urlCode.parse(code));
      return Response.redirect(cache.value)
    };

    const longUrl = await getRedirectCode(urlCode.parse(code));

    if(longUrl) {
      updateClicksCount(urlCode.parse(code));
      return Response.redirect(longUrl);
    };

    throw new Error("Url no longer available")
  } catch (err) {
    return handleRouteErrors(err);
  };
};
