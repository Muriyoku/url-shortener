import { handleDatabaseErrors } from "../database/errors.database";
import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { addToCache } from "../infra/cache/cache.infra";
import { recordErrors } from "../helper/recordErrors";
import { 
  getLongUrlByCode, 
  getShortUrlByCode, 
  incrementClickCount, 
  insertShortUrl 
} from "../database/sql.database";

export async function generateShortUrl(url: string) {
  let code = "";
  let collision;
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

    await insertShortUrl(url, code);
  } catch (err) {
    recordErrors(err);
    throw handleDatabaseErrors(err);
  };
};

export async function getRedirectCode(code: string) {
  try {
    const longUrlRow = await getLongUrlByCode(code) ?? [];
    const longUrl    = longUrlRow[0]?.long_url;

    addToCache(code, longUrl);

    return longUrl;
  } catch (err) {
    recordErrors(err);
    return handleDatabaseErrors(err);
  }
}

export async function getShortUrl(code: string) {
  try {
    const shortUrlRow = await getShortUrlByCode(code) ?? []; 
    const shortUrl    = shortUrlRow[0]?.short_url;

    return shortUrl;
  } catch (err) {
    recordErrors(err);
    return handleDatabaseErrors(err);
  }
}

export async function updateClicksCount(code: string) {
  try {
    await incrementClickCount(code);
  } catch(err) {
    recordErrors(err);
    return handleDatabaseErrors(err);
  };
};