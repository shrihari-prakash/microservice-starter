import { Logger } from "../../singleton/logger";
const log = Logger.getLogger().child({ from: "scope-manager" });

import { Response } from "express";

import Scopes from "./scopes.json";

interface Scope {
  name: string;
  description: string;
  parent?: string;
}

export class ScopeManager {
  scopes: any;
  constructor() {
    let scopes = Scopes;
    log.debug(this.getScopeTree(scopes));
    this.scopes = scopes.reduce((scopes, scope) => Object.assign(scopes, { [scope.name]: scope }), {});
    log.info("Scopes initialized.");
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
    if (this.isScopeAllowed(scope, allowedScopes)) {
      return true;
    } else {
      log.debug("Scope blocked for user %s. Scopes allowed: %o.", res.locals.user?.username, allowedScopes);
      return false;
    }
  }

  isScopeAllowed(scope: string, allowedScopes: string[] = []): boolean {
    const scopeObject = this.scopes[scope];
    if (!scopeObject) {
      log.warn("Unknown scope %s. Did you forget to configure this scope in scopes.json?", scope);
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
