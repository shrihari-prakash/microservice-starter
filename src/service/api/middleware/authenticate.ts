import { Logger } from "../../../singleton/logger";
const log = Logger.getLogger().child({ from: "liquid-connector" });

import { NextFunction, Request, Response } from "express";

import { errorMessages, statusCodes } from "../../../utils/http-status";
import { ErrorResponse } from "../../../utils/response";
import { LiquidConnector } from "../../../singleton/liquid-connector";
import Role from "../../../enum/role";

const authenticateToken = async (req: Request, res: Response) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
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
      return res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
    }
    const user = token.user;
    if (isClient(user.role)) {
      log.warn("Entity %s with role %s is not a user", user.username, user.role);
      return res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
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
    res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
    return;
  }
};

export const AuthenticateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await authenticateToken(req, res);
    if (!token) {
      return res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
    }
    const user = token.user;
    if (!isClient(user.role)) {
      log.warn("Entity %s with role %s is not a client", user.username, user.role);
      return res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
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
    res.status(statusCodes.unauthorized).json(new ErrorResponse(errorMessages.unauthorized));
    return;
  }
};
