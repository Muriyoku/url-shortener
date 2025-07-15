import * as z from "zod/v4";
import { recordErrors } from "../../helper/recordErrors";
import { PostgresError } from "../../database/errors.database";

export function handleRouteErrors(err: any) {
  if (err instanceof PostgresError) return databaseIssues();
  if (err instanceof z.ZodError) return zodIssues();

  recordErrors(err);

  return internalServerIssues();
};

function internalServerIssues() {
  return Response.json({}, { status: 500, statusText: "Internal Server Error" });
}

function databaseIssues() {
  return Response.json({}, { status: 500, statusText: "Internal Server Error"});
}

function zodIssues() {
  return Response.json({}, { status: 400, statusText: "Bad Request" });
}
