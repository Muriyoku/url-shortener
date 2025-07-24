import { test, mock, expect, describe, afterEach, beforeEach } from 'bun:test';
import { generateRandomCode } from '../../helper/generateRandomCode.helper';
import { generateShortUrl, getShortUrl } from '../../services/url.service';
import { handleDatabaseErrors } from '../../database/errors.database';
import { insertShortUrl } from '../../database/sql.database';
import { recordErrors } from '../../helper/recordErrors';

mock.module('../../helper/generateRandomCode.helper', () => {
  return {
    generateRandomCode: mock(),
  };
});

mock.module('../../database/errors.database', () => {
  return { 
    handleDatabaseErrors: mock(),
  }
})

mock.module('../../helper/recordErrors', () => {
  return {
    recordErrors: mock()
  }
});

mock.module('../../services/url.service', () => {
  return {
    getShortUrl: mock()
  };
});

mock.module('../../database/sql.database', () => {
  return {
    insertShortUrl: mock(),
    handleDatabaseErrors: mock()
  };
});

beforeEach(() => {
  console.log("running test.");
});

afterEach(() => {
  console.log("done with test.");
  mock.restore();
});

describe('generate short url', () => {

  test("inserts a new short URL when there is no collision on first attempt", async () => {
    (generateRandomCode as any).mockReturnValueOnce('dwreq123jf');
    (getShortUrl as any).mockReturnValueOnce(null);
  
    await generateShortUrl('https://example.com');

    expect(generateRandomCode).toHaveBeenCalledTimes(1);
    expect(getShortUrl).toHaveBeenCalledWith("dwreq123jf");
    expect(insertShortUrl).toHaveBeenCalledWith("https://example.com", "dwreq123jf");
    expect(recordErrors).not.toHaveBeenCalled();
  }); 

  (generateRandomCode as any).mockClear();
  (getShortUrl as any).mockClear();

  test.failing("it fails when exceed five attempts", async () => {
    (generateRandomCode as any).mockReturnValue('dwreq123jf');
    (getShortUrl as any).mockReturnValue('dwreq123jf');

    await generateShortUrl('https//example.com');

    expect(await generateShortUrl('https://example.com'))
    .rejects.toThrow("Number of attempts exceeded");

    expect(generateRandomCode).toBeCalledTimes(5);
    expect(getShortUrl).toBeCalledTimes(5);
    expect(insertShortUrl).not.toHaveBeenCalled();
  });

  (generateRandomCode as any).mockClear();
  (getShortUrl as any).mockClear();

  test('register exception on log', async () => {
    (generateRandomCode as any).mockReturnValue('dwreq123jf');
    (getShortUrl as any).mockReturnValue('dwreq123jf');

    expect(recordErrors).toBeCalledTimes(1);
    expect(handleDatabaseErrors).toBeCalledTimes(1);
    expect(generateShortUrl).toThrow();
  });
});