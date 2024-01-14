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

The template uses a configuration class (`src/service/configuration/confoguration.ts`) which relies on a JSON file (`src/service/configuration/options.json`) that has a list of all the options to be used by the microservice and their default values. You can extend this JSON file to add your own options related to your service.

- When you want to configure an option, just copy the `envName` field of the option and add it to your `.env` file.
- When you want to retrieve an option value, call the Configuration singleton's get function. For example,

```js
Configuration.get("your.option-name");
```

### Liquid Connection

The service uses [Liquid](https://github.com/shrihari-prakash/liquid) for API authentication. This connectivity requires the following options to be configured in env file:

1. liquid.host
2. liquid.client-id
3. liquid.client-secret
4. liquid.auth-cache-expiry

For instance, a sample env file with Liquid options configured looks like this:

```bash
LIQUID_HOST=http://localhost:2000 # Replace with your Liquid instance host
LIQUID_CLIENT_ID=application_client # Client ID for communicating with your Liquid instance
LIQUID_CLIENT_SECRET=super-secure-client-secret # Client Secret for communicating with your Liquid instance
LIQUID_AUTH_CACHE_EXPIRY=300
```

### Adding New APIs

You should add new APIs in the API service folder present in `src\service\api`. This folder has authentication middleware that you can use to verify bearer tokens acquired from yout Liquid instance.

APIs are classified into three categories:

The file `src\service\api\api.ts` is used to setup routing to different API sections. By default, there is just a `/system` router which will return some stats about the process. You can add a folder similar to `system` to create other APIs. APIs are classified into three types:

- Client API: Accessible by tokens acquired through client_credentials grant in Liquid. Starts with the prefix `/client-api`.
- Delegated API: Simply put outside the `client-api` or `admin-api` folder. These are accessible by tokens acquired through authorization_code grant in Liquid.
- Admin API: Accessible by tokens acquired through authorization_code grant in Liquid. Not much different from Delegated APIs, but simply put in the `admin-api` folder to explicitly state that these APIs can do some elevated actions. Starts with prefix `/admin-api`.

It is recommended that you checkout the `src\service\api\system` folder to see an example of how to build these APIs.

### Scope Management

In the beggining of your API executions, you usually need to call the `isScopeAllowedForRequest` function in of the ScopeManager singleton to check if a scope is allowed for the request. To add scopes into the system, you need to add your scopes to scopes.json (`src\service\scope-manager\scopes.json`) file.

Now that you have added your scopes, it is important that Liquid is also aware of these additional scopes so that these scopes can appear in the Nitrogen admin panel and can be given access to when tokens are requested. To do this, make a copy of your scopes.json file and simply remove the `*` scope object. Now, simply mount this new file to `/var/liquid/scope-extensions.json` of the container.

### Running the service

Run `npm run start:dev`.

### Building the service

Run `npm run build`.
