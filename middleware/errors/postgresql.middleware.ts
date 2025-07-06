import { PostgresError } from "../../error/errors";
// implement the error code: 42703 handling
export function handlePostgresqlErrors(err: unknown) {
  const ERROR = (err as PostgresError).errno;

  if(!ERROR) return;

  if (ERROR === "23505") {
    throw new PostgresError(
      "23505",
      "Bad Request",
      400,
      "Already there is a code attached to url"
    );
  }

  if (ERROR === "23502") {
    throw new PostgresError(
      "23502",
      "Bad Request",
      400,
      "The value(s) cannot be null"
    );
  }
  // the transaction was aborted 
  if (ERROR === "40P01") {
    throw new PostgresError(
      "40P01",
      "internal Server Error",
      500,
      "An error occuried in the process"
    );
  }

  console.error("Unhandled error:", err);
  throw err;
}
