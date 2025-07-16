type cacheType = {
  value: string; 
  expiration: number; 
};

const expirationTime = 5 * 60 * 1000; // 5 min 
const cache: Map<string, cacheType> = new Map();

export function getFromCache(code: string) {
  const cachedValue = cache.get(code);

  if(cachedValue) {
    if(cachedValue.expiration < Date.now()) {
      cache.delete(code)
    }; 

    return cachedValue;
  } else {
    return null
  };
};

export function addToCache(key: string, value: string | undefined | null) {
  if(typeof value === 'undefined' || !value) return;
   
  cache.set(key, {
    value: value,
    expiration: Date.now() + expirationTime,
  });
};