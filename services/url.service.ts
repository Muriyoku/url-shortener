import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { PostgresError } from "../error/database.error";
import { sql } from "bun";

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
    if ((err as PostgresError).errno === "23505") {
      throw new PostgresError(
        "23505",
        "Already there is a code attached to url"
      );
    }
    console.error(err)
    throw new Error(`Unkown Error`);
  }
}

export async function redirectToLongUrlService(code: string) {
  try {
    const [long_url] = await sql`
      SELECT long_url FROM url_shortner WHERE short_url = ${code}
    `;
    return long_url.long_url;
  } catch (err) {
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
    throw err;
  }
}
