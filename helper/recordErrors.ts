import { appendFile } from "node:fs/promises";
import * as z from "zod/v4";

const logPath = process.env.LOG_PATH as string; 

const logQueue: string[] = [];
let isWriting = false;

export function recordErrors(err: any) {
  const currentDate = new Date().toISOString();
  let formattedErr: string;

  if (err instanceof z.ZodError) {
    const issue = err.issues[0];
    formattedErr = `[${currentDate}] ${issue?.message ?? "Unknown validation error"}\n`;
  } else {
    formattedErr = `[${currentDate}] ${err?.message ?? "Unknown error"}\n`;
  };

  logQueue.push(formattedErr);
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