import { appendFile } from "node:fs/promises";
import * as z from "zod/v4";

const logPath = process.env.LOG_PATH as string; 
const logQueue: any[] = [];
let isWriting = false;

// Get sensive information from Errors and record it in a log file. 
export function recordErrors(err: any) {
  let error: string;

  if (err instanceof z.ZodError) {
    const firstIssue = err.issues[0];
    error = `[${new Date().toISOString()}] ${firstIssue?.message ?? "Unknown validation error"}\n`;
  } else {
    error = `[${new Date().toISOString()}] ${err?.message ?? "Unknown error"}\n`;
  };

  logQueue.push(error);
  flushLogQueue();
};

async function flushLogQueue() {
  if (isWriting) return;
  isWriting = true;

  while (logQueue.length > 0) {
    const entry = logQueue.shift();
    if (entry) {
      try {
        await appendFile(logPath, entry, "utf8");
      } catch (err) {
        console.error("Log write failed:", err);
      }
    }
  }

  isWriting = false;
};