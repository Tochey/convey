import { Response } from "express";

export class CustomResponse {
  message: string;
  data: any;
  status: number;
  headers?: {};

  constructor(message?: string, data?: any, status = 200, headers = {}) {
    this.message = message ?? "ok";
    this.data = data ?? null;
    this.status = status;
    this.headers = headers;
  }
}

export function handleCustomResponse(
  customResponse: CustomResponse,
  res: Response
): void {
  const { message, data, status, headers } = customResponse;

  res.status(status);
  res.set(headers);

  //@ts-ignore
  res.customResponse = message;
  res.json({ message, data });
}
