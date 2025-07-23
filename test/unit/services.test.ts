import { test, mock, expect, describe, afterEach, beforeEach } from 'bun:test';
import { recordErrors } from '../../helper/recordErrors';
import { generateRandomCode } from '../../helper/generateRandomCode.helper';
import { generateShortUrl, getShortUrl } from '../../services/url.service';
import { insertShortUrl } from '../../database/sql.database';

mock.module('../../helper/generateRandomCode.helper', () => {
  return {
    generateRandomCode: mock(),
  };
});

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
});