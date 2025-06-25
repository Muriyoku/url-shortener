export class PostgresError extends Error {
  errno: string;
  constructor(errno: string, message?: string) {
    super(message);
    this.errno = errno; 
    
  };
};