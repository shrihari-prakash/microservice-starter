import express from "express";

import SystemClientRouter from "./client-api/routes.js";
import SystemAdminRouter from "./admin-api/routes.js";
import GET__Version from "./version.get.js";

const SystemRouter = express.Router();

// Delegated APIs
SystemRouter.get("/version", GET__Version);

// Admin APIs
SystemRouter.use("/admin-api", SystemAdminRouter);

// Application client APIs
SystemRouter.use("/client-api", SystemClientRouter);

export default SystemRouter;
