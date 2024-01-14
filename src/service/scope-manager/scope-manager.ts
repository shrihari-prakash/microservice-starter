import { Logger } from "../../singleton/logger";
const log = Logger.getLogger().child({ from: "scope-manager" });

import { Response } from "express";
import fs from "fs";

import Scopes from "./scopes.json";
import { Configuration } from "../../singleton/configuration";

interface Scope {
  name: string;
  description: string;
  parent?: string;
}

export class ScopeManager {
  scopes: any;
  constructor() {
    const startTime = +new Date();
    log.debug("Initializing scopes...");
    let scopes = Scopes;
    const scopeExtensionsPath = Configuration.get("system.scope-extension-file-path");
    if (fs.existsSync(scopeExtensionsPath)) {
      try {
        log.debug("Scope extensions detected, extending system scopes...");
        const extendedScopes = JSON.parse(fs.readFileSync(scopeExtensionsPath, "utf8"));
        scopes = [...Scopes, ...extendedScopes];
      } catch (e) {
        log.error("Error parsing scope extensions.");
        log.error(e);
      }
    } else {
      log.debug("No scope extensions detected.");
    }
    log.debug(this.getScopeTree(scopes));
    this.scopes = scopes.reduce((scopes, scope) => Object.assign(scopes, { [scope.name]: scope }), {});
    const milliseconds = +new Date() - startTime;
    log.info("Scopes initialized in %s ms", milliseconds);
  }

  getScopeTree(scopes: Scope[], root: string | null | undefined = null) {
    return Object.fromEntries(
      scopes.filter((scope) => scope.parent == root).map((s): any => [s.name, this.getScopeTree(scopes, s.name)])
    );
  }

  getScopes() {
    return this.scopes;
  }

  isScopeAllowedForRequest(scope: string, res: Response) {
    const token = res.locals?.token;
    const allowedScopes = token?.scope || [];
    const clientAllowedScopes = token?.client.scope || [];
    log.debug("Scopes allowed: %o, client scopes allowed: %o", allowedScopes, clientAllowedScopes);
    if (this.isScopeAllowed(scope, allowedScopes) && this.isScopeAllowed(scope, clientAllowedScopes)) {
      return true;
    } else {
      log.debug("Scope blocked for user %s, client %s.", res.locals.user?.username, token?.client?.clientId);
      return false;
    }
  }

  canRequestScope(scopes: string[], entity: any) {
    if (!scopes) {
      log.debug("Scope not specified %s", scopes);
      return false;
    }
    return scopes.every((requestedScope: string) => this.isScopeAllowed(requestedScope, entity.scope));
  }

  isScopeAllowed(scope: string, allowedScopes: string[] = []): boolean {
    const scopeObject = this.scopes[scope];
    if (!scopeObject) {
      log.debug("No scope object found for %s", scope);
      return false;
    }
    if (allowedScopes.includes(scopeObject.name) || allowedScopes.includes(scopeObject.parent)) {
      return true;
    } else if (scopeObject.parent) {
      return this.isScopeAllowed(scopeObject.parent, allowedScopes);
    } else {
      return false;
    }
  }
}
