import express from "express";
import GET__Stats from "../shared/stats.get.js";
import { AuthenticateClient } from "../../middleware/authenticate.js";

const SystemClientRouter = express.Router();

SystemClientRouter.get("/stats", AuthenticateClient, GET__Stats);

export default SystemClientRouter;
