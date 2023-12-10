import { v4 as uuidv4 } from "uuid";

class CustomError extends Error {
  status: number;
  errorId: string;

  constructor(status: number, message?: string) {
    super();
    this.status = status ?? 500;
    this.errorId = uuidv4();

    if (process.env.NODE_ENV === "development") {
      this.message = String(message);
    } else {
      if (this.status >= 500) {
        this.message = "Internal Server Error " + this.errorId;
      } else {
        this.message = String(message);
      }
    }
  }
}

export default CustomError;
