import { Logger } from "./singleton/logger";
const log = Logger.getLogger().child({ from: "main" });

import * as dotenv from "dotenv";
dotenv.config();

import * as path from "path";
import * as fs from "fs";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import compression from "compression";

const version = fs.readFileSync(path.join(__dirname, "VERSION"), { encoding: "utf8" });
const banner = `
  Version ${version}
  Copyright (c) 2022 - ${new Date().getFullYear()} Your Company Name
`;
log.info(banner);

import { Configuration } from "./singleton/configuration";
const environment = Configuration.get("environment");
process.env.NODE_ENV = environment;
log.info("Environment: %s", environment);

import { MongoDB } from "./singleton/mongo-db";
import { Api } from "./singleton/api/api";
import { activateRateLimiters } from "./service/rate-limiter/rate-limiter";
import { Mailer } from "./singleton/mailer";
import { errorMessages, statusCodes } from "./utils/http-status";
import { ErrorResponse } from "./utils/response";

const app = express();
app.disable("x-powered-by");

// ********** Rate Limiting ********** //
if (environment !== "test") {
  activateRateLimiters(app);
}
if (Configuration.get("system.stats.enable-request-counting")) {
  log.debug("Request counting enabled.");
  const key = Configuration.get("system.stats.request-count-key") as unknown as string;
  app.set(key, 0);
  app.use("*", (_, __, next) => {
    app.set(key, app.get(key) + 1);
    next();
  });
}
// ********** End Rate Limiting ********** //

app.use(bodyParser.json({ limit: Configuration.get("system.request-body.json.max-size") }));
app.use(bodyParser.urlencoded({ extended: false }));

// ********** CORS ********** //
const systemCORS = Configuration.get("cors.allowed-origins") as string[];
log.debug("CORS origins %o", systemCORS);
app.use(
  cors({
    credentials: true,
    origin: systemCORS,
  })
);
// ********** End CORS ********** //

// ********** Response Compression ********** //
if (Configuration.get("system.enable-response-compression")) {
  log.info("Response compression is enabled.");
  app.use(compression());
}
// ********** End Response Compression ********** //

// ********** Singleton Init ********** //
if (environment !== "test") {
  MongoDB.connect();
}
Api.initialize(app);
Mailer.initialize(app);
// ********** End Singleton Init ********** //

app.all("*", function (_, res) {
  res.status(statusCodes.notFound).json(new ErrorResponse(errorMessages.notFound));
});

// ********** Reverse Proxy Setup ********** //
const isReverseProxy = Configuration.get("system.reverse-proxy-mode");
if (isReverseProxy) {
  app.set("trust proxy", true);
}
// ********** End Reverse Proxy Setup ********** //

app.listen(Configuration.get("system.app-port"), () => {
  log.info(
    `${Configuration.get("system.app-name")} auth is listening at http://localhost:${Configuration.get(
      "system.app-port"
    )}`
  );
});

export default app;
