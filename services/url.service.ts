import { handlePostgresqlErrors } from "../middleware/errors/postgresql.middleware";
import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { addToCache } from "../infra/cache/cache.infra";
import { sql } from "bun";

type ShortUrlRow = { short_url: string };

export async function generate_short_url_service(url: string) {
  let code;
  let collisions;
  let attempts_count = 0;
  const MAX_GENERATION_ATTEMPTS = 5;

  try {
	do {
    code = generateRandomCode();
    collisions = (await get_short_url_code_service(code)) as ShortUrlRow;

    if (!collisions) break;

    attempts_count++;
    } while (
      collisions.short_url.length > 0 &&
      attempts_count <= MAX_GENERATION_ATTEMPTS
    );

    if (attempts_count > MAX_GENERATION_ATTEMPTS) {
      throw new Error("Number of attempts exceeded");
    }

    await sql`
	 	INSERT INTO url_shortner (long_url, short_url) 
		VALUES (${url}, ${code})
	`;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error(`Unkown Error`);
  }
}

export async function redirect_to_original_url_service(code: string) {
  try {
    const [LONG_URL] = await sql`
		SELECT long_url 
		FROM url_shortner
		WHERE short_url = ${code}
	`;

    await update_click_count_service(code);
    addToCache(code, LONG_URL.long_url);

    return LONG_URL.long_url;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error("Unknown Error");
  }
}

async function get_short_url_code_service(
  code: string
): Promise<ShortUrlRow | undefined> {
  try {
    const [SHORT_URL_ROW] = await sql`
		SELECT short_url 
		FROM url_shortner 
		WHERE short_url = ${code}
	`;

    return SHORT_URL_ROW;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw err;
  }
}

async function update_click_count_service(code: string) {
  try {
    const CURRENT_CLICKS_OBJ = await get_clicks_count_service(code);
    const CURRENT_CLIKS_INT = CURRENT_CLICKS_OBJ[0]?.clicks;

    if (typeof CURRENT_CLIKS_INT !== "number") {
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

async function get_clicks_count_service(code: string) {
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