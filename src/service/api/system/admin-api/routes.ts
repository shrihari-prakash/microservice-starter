import express from "express";
import { AuthenticateUser } from "../../middleware/authenticate";
import GET__Stats from "../shared/stats.get";

const SystemAdminRouter = express.Router();

SystemAdminRouter.get("/stats", AuthenticateUser, GET__Stats);

export default SystemAdminRouter;
