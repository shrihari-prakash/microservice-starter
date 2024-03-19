import { Logger } from "../../singleton/logger.js";
const log = Logger.getLogger().child({ from: "liquid-authenticator" });

import LiquidNodeAuthenticator from "liquid-node-authenticator";
import { Redis } from "../../singleton/redis.js";
import { Configuration } from "../../singleton/configuration.js";

export class LiquidAuthenticator {
  connector: LiquidNodeAuthenticator;

  constructor() {
    log.info("Initializing liquid node connector...");
    this.connector = new LiquidNodeAuthenticator({
      host: Configuration.get("liquid.host"),
      clientId: Configuration.get("liquid.client-id"),
      clientSecret: Configuration.get("liquid.client-secret"),
      cacheOptions: {
        client: Configuration.get("privilege.can-use-cache") ? Redis.client : null,
        expire: Configuration.get("liquid.auth-cache-expiry"),
      },
      debugging: true,
    });
  }

  async authenticate(token: string) {
    return await this.connector.authenticate(token);
  }

  async getAccessToken() {
    const { accessToken } = await this.connector.getAccessToken();
    return accessToken;
  }

  checkTokenScope(scope: string, token: any) {
    return this.connector.checkTokenScope(scope, token);
  }
}
