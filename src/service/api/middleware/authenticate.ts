import { Logger } from "../../../singleton/logger";
const log = Logger.getLogger().child({ from: "liquid-connector" });

import { NextFunction, Request, Response } from "express";

import { errorMessages, statusCodes } from "../../../utils/http-status";
import { ErrorResponse } from "../../../utils/response";
import { LiquidConnector } from "../../../singleton/liquid-connector";
import Role from "../../../enum/role";

const sendUnauthorizedError = (res: Response) =>
  res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));

const authenticateToken = async (req: Request, res: Response) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendUnauthorizedError(res);
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    sendUnauthorizedError(res);
    return;
  }
  return await LiquidConnector.authenticate(token);
};

const isClient = (role: string) => {
  return role === Role.INTERNAL_CLIENT || role === Role.EXTERNAL_CLIENT;
};

export const AuthenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await authenticateToken(req, res);
    if (!token) {
      return sendUnauthorizedError(res);
    }
    const user = token.user;
    if (isClient(user.role)) {
      log.warn("Entity %s with role %s is not a user", user.username, user.role);
      return sendUnauthorizedError(res);
    }
    res.locals.token = token;
    res.locals.user = user;
    delete res.locals.token.user;
    return next();
  } catch (err) {
    log.error("Authenticate error:");
    log.error(err);
    if (res.headersSent) {
      return;
    }
    sendUnauthorizedError(res);
    return;
  }
};

export const AuthenticateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await authenticateToken(req, res);
    if (!token) {
      return sendUnauthorizedError(res);
    }
    const user = token.user;
    if (!isClient(user.role)) {
      log.warn("Entity %s with role %s is not a client", user.username, user.role);
      return sendUnauthorizedError(res);
    }
    res.locals.token = token;
    res.locals.user = user;
    delete res.locals.token.user;
    return next();
  } catch (err) {
    log.error("Authenticate error:");
    log.error(err);
    if (res.headersSent) {
      return;
    }
    sendUnauthorizedError(res);
    return;
  }
};
