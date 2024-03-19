import pino from "pino";
import pretty from "pino-pretty";
import fs from "fs";

import { Configuration } from "../../singleton/configuration.js";

export class Logger {
  logger;

  constructor() {
    const prettyStream = pretty.default({
      colorize: true,
      translateTime: "yyyy-dd-mm HH:MM:ss",
    });

    var streams: any[] = [{ level: Configuration.get("system.log-level"), stream: prettyStream }];

    const logFilePath = Configuration.get("system.log-file-path");
    if (logFilePath) {
      const fileStream = fs.createWriteStream(logFilePath);
      streams.push({ level: Configuration.get("system.log-level"), stream: fileStream });
    }

    this.logger = pino.default({ level: Configuration.get("system.log-level") }, pino.multistream(streams));
  }

  public getLogger(): any {
    return this.logger;
  }
}
