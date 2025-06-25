import { PostgresError } from "../error/database.error";
import { sql } from "bun";
// The alphabet is necessary for generate unique codes. 
// The algorithm get some character from alphabet, 20 times, group all random
// characters from Alphabet and generate the code for the short url.
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export async function generateShortUrlService(url: string) {
  let code = '';

  for(let i = 0; i <= 10; i++) {
    code += alphabet.at(Math.floor(Math.random() * alphabet.length));
  };

  try {
    const codeExists = await sql`
      SELECT short_url FROM url_shortner WHERE short_url = ${code}
    `;

    // Check if a do..while loop is better in perfomance
    if(Array.from(codeExists).length !== 0) {
      console.log('trying again...')
      return generateShortUrlService(url);
    };

   await sql`
      INSERT INTO url_shortner 
      (long_url, short_url) VALUES (${url}, ${code});
    `;
  } catch (err){
    if((err as PostgresError).errno === '23505') {
      throw new PostgresError('23505', "Already there is a code attached to url");
    };

    throw new Error(`Unkown Error`); 
  };
}; 

export async function redirectToLongUrlService(code: string) {
  try {
    const [ long_url ] = await sql`
      SELECT long_url FROM url_shortner WHERE short_url = ${code}
    `;
    return long_url.long_url;
  } catch(err) {
    throw new Error("Unknown Error");
  };
};

