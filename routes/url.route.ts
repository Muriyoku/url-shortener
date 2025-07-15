import { generateShortUrl, getRedirectCode, updateClicksCount } from "../services/url.service";
import type { BunRequest } from "bun";
import * as z from "zod/v4";
import { recordErrors } from "../helper/recordErrors";
import { getFromCache } from "../infra/cache/cache.infra";
import { PostgresError } from "../database/errors.database";

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

export async function generateShortUrlRoute(req: BunRequest<"/api/url">) {
  try {
    const parsedInput = await urlScheme.parseAsync(await req.json());
    await generateShortUrl(parsedInput.url);
    return Response.json({}, {status: 200, statusText: 'Ok'});
  } catch (err) {

    if (err instanceof z.ZodError) {
      recordErrors(err);
      return Response.json(
        { message: err.issues },
        { status: 400, statusText: "Bad Request" }
      );
    };

    if(err instanceof PostgresError) {
      return Response.json({}, { status: 500, statusText: err.message});
    };

    recordErrors(err);
    return Response.json(
      { status: 500, statusText: "Internal Server Error" }
    );
  };
};

export async function redirectToOriginalUrlRoute(req: BunRequest<"/api/url">) {
  const query = new URLSearchParams(req.url);
  let value: undefined | string;
  for (const values of query.values()) value = values;
  try {
    const cache = getFromCache(urlCode.parse(value));
    
    if(cache) {
      updateClicksCount(urlCode.parse(value));
      return Response.redirect(cache.value)
    };

    const longUrl = await getRedirectCode(urlCode.parse(value));

    if(!longUrl) {
      throw new Error("Url no longer available")
    }

    updateClicksCount(urlCode.parse(value));
    return Response.redirect(longUrl);
  } catch (err) {
    if (err instanceof z.ZodError) {
      recordErrors(err)
      return Response.json(
        { message: err.issues },
        { status: 400, statusText: "Bad Request" }
      );
    }
    recordErrors(err)
    return Response.json(
      { status: 500, statusText: "Internal Server Error" }
    );
  };
};
