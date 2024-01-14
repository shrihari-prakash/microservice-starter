import express from "express";

import SystemClientRouter from "./client-api/routes";
import SystemAdminRouter from "./admin-api/routes";
import GET__Version from "./version.get";

const SystemRouter = express.Router();

// Delegated APIs
SystemRouter.get("/version", GET__Version);

// Admin APIs
SystemRouter.use("/admin-api", SystemAdminRouter);

// Application client APIs
SystemRouter.use("/client-api", SystemClientRouter);

export default SystemRouter;
