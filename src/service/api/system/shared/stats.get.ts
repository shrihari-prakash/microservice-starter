import { Logger } from "../../../../singleton/logger.js";
const log = Logger.getLogger().child({ from: "system/shared/stats.get" });

import { Request, Response } from "express";
import * as os from "os";

import app from "../../../../index.js";
import { errorMessages, statusCodes } from "../../../../utils/http-status.js";
import { ErrorResponse, SuccessResponse } from "../../../../utils/response.js";
import { Configuration } from "../../../../singleton/configuration.js";
import { LiquidAuthenticator } from "../../../../singleton/liquid-authenticator.js";

const GET__Stats = async (_: Request, res: Response) => {
  try {
    const token = res.locals.token;
    if (
      !LiquidAuthenticator.checkTokenScope("admin:configuration:read", token) &&
      !LiquidAuthenticator.checkTokenScope("client:configuration:read", token)
    ) {
      return res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.insufficientPrivileges));
    }
    const heapTotal = process.memoryUsage().heapTotal / 1024 / 1024;
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const stats = {
      processId: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      cpuMake: os.cpus()[0].model,
      upTime: process.uptime(),
      requestsHandled: app.get(Configuration.get("system.stats.request-count-key")),
      heapTotal: Math.round(heapTotal * 100) / 100,
      heapUsed: Math.round(heapUsed * 100) / 100,
    };
    return res.status(statusCodes.success).json(new SuccessResponse({ stats }));
  } catch (err) {
    log.error(err);
    return res.status(statusCodes.internalError).json(new ErrorResponse(errorMessages.internalError));
  }
};

export default GET__Stats;
