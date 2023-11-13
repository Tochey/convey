type ExpressRequest = import("express").Request;

export interface DecodedToken {
  uid: string;
}

export interface Context {
  decodedToken: DecodedToken;
}

export interface Request extends ExpressRequest {
  ctx: Readonly<Context>;
}
