import express from "express";
import { AuthenticateUser, CheckScope } from "../../middleware/authenticate.js";
import GET__Stats from "../shared/stats.get.js";

const SystemAdminRouter = express.Router();

SystemAdminRouter.get("/stats", AuthenticateUser, CheckScope("admin:configuration:read"), GET__Stats);

export default SystemAdminRouter;
