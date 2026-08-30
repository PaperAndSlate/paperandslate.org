import type { AuthorizedActor, DeveloperProject, OrganizationRole } from "./model";

export type Permission =
  | "project.create"
  | "project.read"
  | "project.update"
  | "project.delete"
  | "key.create"
  | "key.list"
  | "key.rotate"
  | "key.revoke"
  | "audit.read"
  | "membership.manage";

export const rolePermissions: Record<OrganizationRole, ReadonlySet<Permission>> = {
  owner: new Set([
    "project.create",
    "project.read",
    "project.update",
    "project.delete",
    "key.create",
    "key.list",
    "key.rotate",
    "key.revoke",
    "audit.read",
    "membership.manage",
  ]),
  admin: new Set([
    "project.create",
    "project.read",
    "project.update",
    "key.create",
    "key.list",
    "key.rotate",
    "key.revoke",
    "audit.read",
    "membership.manage",
  ]),
  developer: new Set(["project.read", "key.create", "key.list", "key.rotate"]),
  read_only_analyst: new Set(["project.read", "key.list", "audit.read"]),
};

export class AuthorizationError extends Error {
  readonly code = "DCP_AUTHORIZATION_DENIED";

  constructor() {
    super("The requested control-plane operation is not authorized");
    this.name = "AuthorizationError";
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export function authorizeOrganization(
  actor: AuthorizedActor,
  organizationId: string,
  permission: Permission,
  options: { requireFreshSession?: boolean } = {},
) {
  if (
    actor.organizationId !== organizationId ||
    !rolePermissions[actor.role].has(permission) ||
    (options.requireFreshSession && !actor.sessionFresh)
  )
    throw new AuthorizationError();
}

export function authorizeProject(
  actor: AuthorizedActor,
  project: DeveloperProject,
  permission: Permission,
  options: { requireFreshSession?: boolean } = {},
) {
  if (project.status !== "active") throw new AuthorizationError();
  authorizeOrganization(actor, project.organizationId, permission, options);
}
