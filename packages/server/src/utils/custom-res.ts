import { Response } from "express";

export class CustomResponse {
  message: string;
  data: any;
  status: number;

  constructor(message?: string, data?: any, status = 200) {
    this.message = message ?? "ok";
    this.data = data ?? null;
    this.status = status;
  }
}

export function handleCustomResponse(
  customResponse: CustomResponse,
  res: Response
): void {
  const { message, data, status } = customResponse;

  res.status(status);

  //@ts-ignore
  res.customResponse = message;
  res.json({ message, data });
}
