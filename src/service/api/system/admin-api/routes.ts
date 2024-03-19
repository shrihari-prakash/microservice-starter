import express from "express";
import { AuthenticateUser } from "../../middleware/authenticate.js";
import GET__Stats from "../shared/stats.get.js";

const SystemAdminRouter = express.Router();

SystemAdminRouter.get("/stats", AuthenticateUser, GET__Stats);

export default SystemAdminRouter;
