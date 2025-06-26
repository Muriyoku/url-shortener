// The CODE is necessary for generate unique codes. 
// The algorithm get some character from CODE, 11 times, group all random
// characters from CODE and generate the CODE for the short url.
const CODES = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CODE_LENGTH = 10;

export function generateRandomCode() {
  let code = '';
  for(let l = 0; l <= CODE_LENGTH; l++) {
    code += CODES.at(Math.floor(Math.random() * CODES.length));
  };
  return code;
};