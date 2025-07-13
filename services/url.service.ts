import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { sql } from "bun";
import { handlePostgresqlErrors } from "../middleware/errors/postgresql.middleware";
import { addToCache } from "../infra/cache/cache.infra";
import type { PostgresError } from "../error/errors";

type shortUrlRow = { short_url: string };

export async function generateShortUrlService(url: string) {
  let code;
  let collisions;

  try {
    do {
      code = generateRandomCode();
      collisions = ((await getShortUrlCodeService(code)) as shortUrlRow);
      if(!collisions) break;
    } while (collisions.short_url.length > 0);

    await sql`INSERT INTO url_shortner (long_url, short_url) VALUES (${url}, ${code});`;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error(`Unkown Error`);
  };
};

export async function redirectToOriginalUrlService(code: string) {
  try {
    const [long_url] = await sql`SELECT long_url FROM url_shortner WHERE short_url = ${code}`;

    await updateClickCountService(code);
    addToCache(code, long_url.long_url);

    return long_url.long_url;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error("Unknown Error");
  };
};

async function getShortUrlCodeService(code: string): Promise<shortUrlRow | undefined> {
  try {
    const [ shortUrlRow ]: shortUrlRow[]= (await sql`SELECT short_url FROM url_shortner WHERE short_url = ${code}`);
    
    if(!shortUrlRow?.short_url) {
      throw new Error("short_url does not exists");
    };

    return shortUrlRow;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw err;
  };
};

async function updateClickCountService(code: string) {
  try {
    const currentClicksObj = await getClicksCountService(code) as {clicks: number}[]; 
    const currentClicksint = currentClicksObj[0]?.clicks;

    if(typeof currentClicksint !== 'number') {
      throw new TypeError("The click column is not a number");
    };

    await sql`UPDATE url_shortner SET clicks = clicks + 1 WHERE short_url = ${code}`;
  } catch(err) {
    handlePostgresqlErrors(err);

    throw err; 
  };
};

async function getClicksCountService(code: string) {
  try {
    return await sql`SELECT clicks FROM url_shortner WHERE short_url = ${code}`;
  } catch(err) {
    handlePostgresqlErrors(err);

    throw err; 
  };
};