export class PostgresError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "PostgresError";

    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this, PostgresError);
    }
  }
}

export function handleDatabaseErrors(err: any) {
  try {
    abortedTransaction(err);
    uniqueConstraint(err);
    nullConstraint(err);
    return Error("Unknown Error");
  } catch(dbErr: any) {
    return dbErr;
  };
};

function uniqueConstraint(err: any) {
  if (assertErrnoCode(err) === "23505") {
    throw new PostgresError(
      "The Url is not longer available",
    );
  };
}

function nullConstraint(err: any) {
  if (assertErrnoCode(err) === "23502") {
    throw new PostgresError("Empty values are not allowed");
  }
}

function abortedTransaction(err: any) {
  if (assertErrnoCode(err) === "40P01") {
    throw new PostgresError("Operation Aborted");
  }
}

function assertErrnoCode(err: any): string {
  return err.errno ?? "";
};
