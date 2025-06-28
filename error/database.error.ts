export class PostgresError extends Error {
  errno: string;
  status: number; 
  statusText: string;
  constructor(errno: string, statusText: string, status: number, message?: string) {
    super(message);
    this.errno = errno; 
    this.status = status;
    this.statusText = statusText;
    
  };
};