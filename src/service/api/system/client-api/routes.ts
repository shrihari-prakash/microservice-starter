import express from "express";
import GET__Stats from "../shared/stats.get.js";
import { AuthenticateClient, CheckScope } from "../../middleware/authenticate.js";

const SystemClientRouter = express.Router();

SystemClientRouter.get("/stats", AuthenticateClient, CheckScope("client:configuration:read"), GET__Stats);

export default SystemClientRouter;

