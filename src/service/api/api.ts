import express from "express";
import SystemRouter from "./system/router";

export class Api {
  public initialize(app: express.Application): void {
    app.use("/system", SystemRouter);
    app.get("/health", function (_, res) {
      res.send({ status: "UP" });
    });
  }
}
