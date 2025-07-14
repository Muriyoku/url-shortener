import { handlePostgresqlErrors } from "../middleware/errors/postgresql.middleware";
import { generateRandomCode } from "../helper/generateRandomCode.helper";
import { addToCache } from "../infra/cache/cache.infra";
import { recordErrors } from "../helper/recordErrors";
import { 
  getLongUrlByCode, 
  getShortUrlByCode, 
  incrementClickCount, 
  insertShortUrl 
} from "../database/sql.database";

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

    await insertShortUrl(url, code);
  } catch (err) {
    handlePostgresqlErrors(err);
    recordErrors(err);
    throw new Error(`Unkown Error`);
  };
};

export async function getRedirectCode(code: string) {
  try {
    const [{ long_url }] = await getLongUrlByCode(code);

    await incrementClickCount(code);
    addToCache(code, long_url);

    return long_url;
  } catch (err) {
    handlePostgresqlErrors(err);

    throw new Error("Unknown Error");
  }
}

async function getShortUrl(code: string): Promise<ShortUrlRow | undefined> {
  try {
    const [ shortUrlRow ] = await getShortUrlByCode(code); 

    return shortUrlRow;
  } catch (err) {
    handlePostgresqlErrors(err);
    throw err;
  }
}

export async function updateClicksCount(code: string) {
  try {
    await incrementClickCount(code);
  } catch(err) {
    handlePostgresqlErrors(err);
    throw err;
  };
};