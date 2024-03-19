import Redis from "../service/redis/redis.js";
import RedisFake from "../service/redis/redis-fake.js";
import { Configuration } from "./configuration.js";

let redis: Redis;
if (Configuration.get("privilege.can-use-cache") && Configuration.get("environment") !== "test") {
  redis = new Redis();
} else {
  redis = new RedisFake() as unknown as Redis;
}

export { redis as Redis };
