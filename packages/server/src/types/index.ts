import {  Types } from "mongoose";

type ExpressRequest = import("express").Request;

export interface DecodedToken {
  id: Types.ObjectId;
}

export interface Context {
  decodedToken: DecodedToken;
}

export interface Request extends ExpressRequest {
  ctx: Readonly<Context>;
}
