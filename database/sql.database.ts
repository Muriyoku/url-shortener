import { sql } from "bun";

type ShortUrlRow = [{short_url: string}] | undefined;
type LongUrlRow  = [{long_url: string}]  | undefined;

export async function insertShortUrl(url: string, code: string) {
  await sql`
    INSERT INTO url_shortner (long_url, short_url) 
    VALUES (${url}, ${code})
  `;
};

export async function getLongUrlByCode(code: string): Promise<LongUrlRow> {
  return await sql`
	  SELECT long_url 
	  FROM url_shortner
	  WHERE short_url = ${code}
	`;
};

export async function getShortUrlByCode(code: string): Promise<ShortUrlRow> {
 return await sql`
		SELECT short_url 
		FROM url_shortner 
		WHERE short_url = ${code}
	`;
};

export async function incrementClickCount(code: string) {
  await sql`
	  UPDATE url_shortner 
	  SET clicks = clicks + 1 
	  WHERE short_url = ${code}
	`;
};