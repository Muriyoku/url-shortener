/*
  Future features, manutention, and updates:
  
  1 - Separete raw SQL from services into two different layers 
  2 - Rename columns of PostgresSQL for a better readibility 
  3 - Improve error handling of PostgresSQL, in addition, generic errors.
  4 - Refatore loops, for a better performance and readibility 
  5 - Rename functions names for readibility 
*/

import { handlePostgresqlErrors } from "../middleware/errors/postgresql.middleware";
import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { addToCache } from "../infra/cache/cache.infra";
import { sql } from "bun";

type ShortUrlRow = { short_url: string };
type ShortUrl = ShortUrlRow | undefined;

export async function generateShortUrl(url: string) {
  let code = "";
  let collision: ShortUrl;
  const maxAttempts = 5;

  try {
    for(let attemptsCount = 1; attemptsCount <= maxAttempts; attemptsCount++) {
      code = generateRandomCode();
      collision = await getShortUrl(code);
  
      if (!collision) break;

      if (attemptsCount >= maxAttempts) {
        throw new Error("Number of attempts exceeded");
      };
    };

    await sql`
	 	  INSERT INTO url_shortner (long_url, short_url) 
		  VALUES (${url}, ${code})
	  `;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error(`Unkown Error`);
  }
}

export async function getRedirectCode(code: string) {
  try {
    const [{ long_url }] = await sql`
		  SELECT long_url 
		  FROM url_shortner
		  WHERE short_url = ${code}
	  `;

    await updateClickCount(code);
    addToCache(code, long_url);

    return long_url;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error("Unknown Error");
  }
}

async function getShortUrl(code: string): Promise<ShortUrlRow | undefined> {
  try {
    const [ shortUrlRow ] = await sql`
		  SELECT short_url 
		  FROM url_shortner 
		  WHERE short_url = ${code}
	  `;

    return shortUrlRow;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw err;
  }
}

async function updateClickCount(code: string) {
  try {
    const currentClicksObj = await getClicksCount(code);
    const currentClicksInt = currentClicksObj[0]?.clicks;

    if (typeof currentClicksInt !== "number") {
      throw new TypeError("The click column is not a number");
    }

    await sql`
		  UPDATE url_shortner 
		  SET clicks = clicks + 1 
		  WHERE short_url = ${code}
	  `;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw err;
  }
}

async function getClicksCount(code: string) {
  try {
    return await sql`
		  SELECT clicks 
		  FROM url_shortner 
		  WHERE short_url = ${code}
	  `;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw err;
  }
}
