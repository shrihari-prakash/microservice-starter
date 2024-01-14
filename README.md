# Microservice Starter With Liquid Integration

This is a starter template for creating a microservice with [Liquid](https://github.com/shrihari-prakash/liquid) integration.

## Getting Started

### Folder Structure (src)

The src folder consists of the following folders:

- **enum:** Typically, all your constants reside here. By default, roles are configured as an enum which can be extended using options `system.role.extended-roles` and `system.role.ranking` (More about options and configurations later).
- **model:** All your MongoDB models go inside mongo folder in here. You can also choose to add your other models.
- **service:** This is one of the most important folders in the project. This has code for services like configuration, logging, database, etc.
  - **api:** This folder consists API related stuff like authentication middleware, routers, and code for actual API controllers. APIs are generally classified into three categories.
    - **client-api:** These APIs can be used through only tokens acquired by using `client_credentials` grant in your Liquid instance.
    - **admin-api:** These APIs are not very different from normal delegated APIs, but just syntactically put in a different folder to indicate that they could do some elevated stuff.
    - **General / Delegated APIs:** Not a folder as such, these are regular APIs that most users can access by default. Comes in the parent level of `admin-api` folder.
  - **configuration:** The template uses a Configuration class which relies on a JSON file that has a list of all the options to be used by the microservice and their default values. The file can be found at `options.json`. You can extend this JSON file to add your own options related to your service.
    - When you want to configure an option, just copy the `envName` field of the option and add it to your .env file.
    - When you want to use an option, call the Configuration singleton's get function. For example, `Configuration.get("your.option-name");`
  - **liquid-connector:** Contains code to connect to your Liquid instance. To connect with your Liquid instance, the code usually requires 4 options to be set in your env file:
    - `LIQUID_HOST=http://localhost:2000 # Replace with your Liquid instance host`
    - `LIQUID_CLIENT_ID=application_client # Client ID for communicating with your Liquid instance`
    - `LIQUID_CLIENT_SECRET=super-secure-client-secret # Client Secret for communicating with your Liquid instance`
    - `LIQUID_AUTH_CACHE_EXPIRY=300`
  - **logger:** Logger service.
  - **mailer:** Email service.
  - **mongo-db:** MongoDB service with built in transactions support.
  - **rate-limiter:** Rate limiter service. You will need to modify this as you add new APIs.
  - **redis:** Redis service.
  - **s3:** Amazon S3 file service.
  - **scope-manager:** Scope manager service. You usually need to call the `isScopeAllowedForRequest` function in this service to check if a scope is allowed for the request. To add scopes into the system, you need to add your scopes to `scopes.json` file and you also need to add these extensions to your Liquid instance.
- **singleton:** Initializes services that are used throughout the application or services that continuously run in the background.
- **utils:** Folder containing all the utilities.

### Running the service

Run `npm run start:dev`
