# Microservice Starter With Liquid Integration

This is a starter template for creating a microservice with [Liquid](https://github.com/shrihari-prakash/liquid) integration.

## Getting Started

### Configurations and Variables

The template uses a Configuration class which relies on a JSON file that has a list of all the options to be used by the microservice and their default values. The file can be found at `src\service\configuration\options.json`. You can extend this JSON file to add your own options related to your service.

When you want to configure an option, just copy the `envName` field of the option and add it to your .env file.

When you want to use an option, call the Configuration singleton's get function. For example,

```js
Configuration.get("your.option-name");
```

### Liquid Connection

To connect the service to your Liquid instance, simply add the following variables to your .env file:

```
LIQUID_HOST=http://localhost:2000 # Replace with your Liquid instance host
LIQUID_CLIENT_ID=application_client # Client ID for communicating with your Liquid instance
LIQUID_CLIENT_SECRET=super-secure-client-secret # Client Secret for communicating with your Liquid instance
LIQUID_AUTH_CACHE_EXPIRY=5
```

### Running the service

Run `npm run start:dev`

### Adding APIs

You can add APIs to your application by adding a folder structure similar to `src\service\api\system` in `src\service\api`. Taking a look at the files in this folder should give you a good idea on how to add new APIs with authentication and authorization.
