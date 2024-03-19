import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { statusCodes } from "../../../utils/http-status.js";
import { SuccessResponse } from "../../../utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = fs.readFileSync(path.join(__dirname, "../../../", "VERSION"), { encoding: "utf8" });

const GET__Version = async (_: Request, res: Response) => {
  return res.status(statusCodes.success).json(new SuccessResponse({ version }));
};

export default GET__Version;
