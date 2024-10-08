# Microservice Starter With Liquid Integration

This is a starter template for creating a microservice with [Liquid](https://github.com/shrihari-prakash/liquid) integration.

## Getting Started

### Folder Structure

```
+---src
|   +---enum
|   +---model
|   |   \---mongo
|   +---service
|   |   +---api
|   |   |   +---middleware
|   |   |   \---system
|   |   |       +---admin-api
|   |   |       +---client-api
|   |   |       \---shared
|   |   +---configuration
|   |   +---liquid-connector
|   |   +---logger
|   |   +---mailer
|   |   +---mongo-db
|   |   +---rate-limiter
|   |   +---redis
|   |   +---s3
|   |   \---scope-manager
|   +---singleton
|   |   \---api
|   \---utils
\---test
    \---integration
        \---system
```

### Configurations and Options

The service's configuration is managed through the class `Configuration` (`src/service/configuration/configuration.ts`). Options and their default values are specified in file `src/service/configuration/options.json`. You can extend this JSON file to add your own options related to your service.

- When you want to configure an option, just copy the `name` field of the option (inside options.json) and add it to a JSON file, say, `app-config.json`.
- Pass this JSON file path to the node process using the environment variable `SYSTEM_APP_CONFIG_FILE_PATH`.
- When you want to retrieve an option value, call the Configuration singleton's get function. Sample usage:

```js
Configuration.get("your.option-name");
```

### Liquid Connection

The service uses [Liquid](https://github.com/shrihari-prakash/liquid) for API authentication. This connectivity requires the following options (options names from options.json) to be configured in env file:

1. **liquid.host:** Host address of your Liquid instance.
2. **liquid.client-id:** Client ID for communication with your Liquid instance.
3. **liquid.client-secret:** Client Secret of your Liquid client.
4. **liquid.auth-cache-expiry:** Expiry time for how long results of token authentication should be cached.

For instance, a sample `app-config.json` file with Liquid options configured looks like this:

```json
{
  "liquid.host": "http://localhost:2000",
  "liquid.client-id": "application_client",
  "liquid.client-secret": "super-secure-client-secret",
  "liquid.auth-cache-expiry": 300
}
```

### Adding New APIs

APIs are organized in `src/service/api`. Use provided authentication middleware to verify bearer tokens acquired from your Liquid instance.

The file `src/service/api/api.ts` is used to setup routing to different API sections. By default, there is just a `/system` router which will return some stats about the process. You can add a folder similar to `system` to create other APIs.

Consider an API, say "blog", where admin users can post blogs, delegated users can read blogs and client / applications can delete blogs.

An entry for all APIs starting with `/blogs` should be added in file `src/service/api/api.ts` like:

```ts
app.use("/blog", BlogRouter);
```

Now you should create a `blog` folder of the following structure:

```
src
\---service
    \---api
       \---blog
           \---admin-api
               \---blog.post.ts
           \---client-api
                \---blog.delete.ts
           \---blog.get.ts
           \---router.ts
```

APIs are classified into three categories:

- **Client API:** Accessible by tokens acquired through client_credentials grant in Liquid.
- **Delegated API:** These are accessible by tokens acquired through authorization_code grant in Liquid.
- **Admin API:** Accessible by tokens acquired through authorization_code grant in Liquid. Not much different from Delegated APIs, but simply put in the `admin-api` folder to explicitly state that these APIs can do some elevated actions.

The router.ts file is something similar to the one present in `src/service/api/system/router.ts`

It is recommended that you checkout the `src/service/api/system` folder to see an example of how to build these APIs.

### Scope Management

To learn about scopes and how you can extend Liquid scopes, see [this article](https://github.com/shrihari-prakash/liquid/wiki/Understanding-Access-Control-and-Integrating-with-Other-Microservices). Once you've successfully extended Liquid scopes, in the chain of middlewares correcponding to your API, you usually need to call the `CheckScope("your:api:scope")` function **after** authentication present in the authentication middleware file.

For example:

```js
import { AuthenticateUser, CheckScope } from "../../middleware/authenticate.js";

YourRouter.get("/your-api", AuthenticateUser, CheckScope("your:scope:to:check"), METHOD_YourAPIHandler);
```

### Running the service

Run `npm run start:dev`.

### Building the service

Run `npm run build`.
