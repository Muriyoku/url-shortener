import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { sql } from "bun";
import { handlePostgresqlErrors } from "../middleware/errors/postgresql.middleware";

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

    await sql`
      INSERT INTO url_shortner 
      (long_url, short_url) VALUES (${url}, ${code});
    `;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw new Error(`Unkown Error`);
  }
}

export async function redirectToLongUrlService(code: string) {
  try {
    const [long_url] = await sql`
      SELECT long_url FROM url_shortner WHERE short_url = ${code}
    `;
    await updateClickCountOfShortUrl(code);
    return long_url.long_url;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw new Error("Unknown Error");
  }
}

async function getShortUrlCodeService(
  code: string
): Promise<shortUrlRow | undefined> {
  try {
    const [shortUrlRow] = (await sql`
      SELECT short_url FROM url_shortner WHERE short_url = ${code}
    `) as shortUrlRow[];
    return shortUrlRow;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw err;
  }
}

async function updateClickCountOfShortUrl(code: string) {
  try {
    const currentClicksObj = await getClicksCountOfShortUrl(code) as {clicks: number}[]; 
    const currentClicksint = currentClicksObj[0]?.clicks;

    if(typeof currentClicksint !== 'number') {
      throw new Error().message = "The click column is not a number";
    }

    await sql`UPDATE url_shortner SET clicks = ${currentClicksint+ 1} WHERE short_url = ${code}`
  } catch(err) {
    handlePostgresqlErrors(err);
    throw err; 
  };
};

async function getClicksCountOfShortUrl(code: string) {
  try {
    return await sql`SELECT clicks FROM url_shortner WHERE short_url = ${code}`;
  } catch(err) {
    handlePostgresqlErrors(err);
    throw err; 
  };
};