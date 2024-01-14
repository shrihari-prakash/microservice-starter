import express from "express";
import GET__Stats from "../shared/stats.get";
import { AuthenticateClient } from "../../middleware/authenticate";

const SystemClientRouter = express.Router();

SystemClientRouter.get("/stats", AuthenticateClient, GET__Stats);

export default SystemClientRouter;
