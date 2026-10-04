import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
import crypto from "node:crypto";


if (!globalThis.crypto) {
  globalThis.crypto = crypto as Crypto;
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  
});



