import { Response } from "express";

export class CustomResponse {
  message: string;
  data: any;
  status: number;
  headers?: {};
  redirect?: string;

  constructor(
    message?: string,
    data?: any,
    status = 200,
    headers?: {},
    redirect?: string,
  ) {
    this.message = message ?? "ok";
    this.data = data ?? undefined;
    this.status = status;
    this.headers = headers ?? {};
    this.redirect = redirect;
  }
}

export function handleCustomResponse(
  customResponse: CustomResponse,
  res: Response,
): void {
  if (customResponse.redirect) {
    res.redirect(customResponse.redirect);
    return;
  }

  const { message, data, status, headers } = customResponse;

  res.status(status);
  res.set(headers);

  //@ts-ignore
  res.customResponse = message;
  res.json({ message, data });
}
