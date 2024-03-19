import { Logger } from "../../singleton/logger.js";
const log = Logger.getLogger().child({ from: "rate-limiter" });

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";

import { Configuration } from "../../singleton/configuration.js";
import { errorMessages } from "../../utils/http-status.js";
import { ErrorResponse } from "../../utils/response.js";
import { Redis } from "../../singleton/redis.js";
import { Request } from "express";

const message = async () => {
  return new ErrorResponse(errorMessages.rateLimitError);
};
const windowSize = Configuration.get("system.rate-limit.window-size");
const standardOpts: any = { windowMs: windowSize * 1000, standardHeaders: true, legacyHeaders: false, message };

const keyGenerator = (req: Request) => {
  return `${req.ip}-${req.method}-${req.path}`;
};

if (Configuration.get("privilege.can-use-cache")) {
  standardOpts.store = new RedisStore({
    prefix: "rate_limiter:",
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => Redis.client.call(...args),
  });
}

if (Configuration.get("system.rate-limit.count-by-route")) {
  log.info(
    "API hits for rate limiting is counted per route for any given IP instead of a global counter. If you'd like to have a single counter per IP, disable the option `system.rate-limit.count-by-route`."
  );
  standardOpts.keyGenerator = keyGenerator;
}

export const RateLimiter = {
  LIGHT: rateLimit({ max: Configuration.get("system.rate-limit.light-api-max-limit"), ...standardOpts }),
  MEDIUM: rateLimit({ max: Configuration.get("system.rate-limit.medium-api-max-limit"), ...standardOpts }),
  HEAVY: rateLimit({ max: Configuration.get("system.rate-limit.heavy-api-max-limit"), ...standardOpts }),
  EXTREME: rateLimit({ max: Configuration.get("system.rate-limit.extreme-api-max-limit"), ...standardOpts }),
};

export function activateRateLimiters(app: any) {
  // For each sub class of APIs you add in API service, add an entry here to set the rate limits
  // for all APIs except admin and client APIs. The addition should be of the following format:
  // app.use(/\/your-api-class\/(?!client-api|admin-api).*/, RateLimiter.MEDIUM);
  // This means users will have a medium rate limit for all the APIs of /your-api/class/*
  app.use(/\/system\/(?!client-api|admin-api).*/, RateLimiter.MEDIUM);
  // Use a lighter Rate Limit for admin and client APIs.
  app.use("/system/admin-api", RateLimiter.LIGHT);
  app.use("/system/client-api", RateLimiter.LIGHT);
}
