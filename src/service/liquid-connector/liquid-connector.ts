import { Logger } from "../../singleton/logger";
const log = Logger.getLogger().child({ from: "liquid-connector" });

import LiquidNodeConnector from "liquid-node-connector";
import { Redis } from "../../singleton/redis";
import { Configuration } from "../../singleton/configuration";

export class LiquidConnector {
  connector: LiquidNodeConnector;

  constructor() {
    log.info("Initializing liquid node connector...");
    this.connector = new LiquidNodeConnector({
      host: Configuration.get("liquid.host"),
      clientId: Configuration.get("liquid.client-id"),
      clientSecret: Configuration.get("liquid.client-secret"),
      cacheOptions: {
        client: Configuration.get("privilege.can-use-cache") ? Redis.client : null,
        expire: Configuration.get("liquid.auth-cache-expiry"),
      },
      logger: log,
    });
  }

  async authenticate(token: string) {
    return await this.connector.authenticate(token);
  }

  async getAccessToken() {
    const { accessToken } = await this.connector.getAccessToken();
    return accessToken;
  }
}
