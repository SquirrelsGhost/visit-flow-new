import { PERMISSIONS, type Permission } from "@/types/permissions.types";

const VALID_PERMISSIONS = new Set<string>(PERMISSIONS);

/**
 * Domänen-Hierarchien: Höhere Capabilities schließen untergeordnete Rechte derselben Domäne ein.
 */
const PERMISSION_IMPLICATIONS: Partial<Record<Permission, readonly Permission[]>> = {
  "admin:*": [
    "team:*",
    "streets:*",
    "crm:*",
    "abrechnung:*",
    "simulator:*",
    "battle:*",
    "logbook:*",
    "daily:*",
    "statistics:*",
    "partner:dashboard",
    "profile:*",
    "settings:*",
  ],
  "streets:*": ["streets:struktur", "streets:mentor", "streets:view"],
  "streets:struktur": ["streets:mentor", "streets:view"],
  "streets:mentor": ["streets:view"],
  "crm:*": ["crm:team", "crm:own"],
  "crm:team": ["crm:own"],
  "team:manage": ["team:view", "team:performance"],
};

const BERATER_BASE_PERMISSIONS: readonly Permission[] = [
  "crm:own",
  "abrechnung:*",
  "simulator:*",
  "battle:*",
  "logbook:*",
  "daily:*",
  "statistics:*",
  "team:performance",
  "profile:*",
  "settings:*",
];

export function isValidPermission(value: unknown): value is Permission {
  return typeof value === "string" && VALID_PERMISSIONS.has(value);
}

export function sanitizePermissions(list: unknown): Permission[] {
  if (!Array.isArray(list)) return [];
  const unique = new Set<Permission>();
  for (const item of list) {
    if (isValidPermission(item)) unique.add(item);
  }
  return [...unique];
}

/**
 * Edge- und Server-kompatibler Wildcard-Matcher (`*`, `<domain>:*` sowie Domänen-Inklusion).
 */
export function hasPermission(
  userPermissions: readonly (Permission | string)[] | undefined | null,
  required: Permission,
): boolean {
  if (!userPermissions || userPermissions.length === 0) return false;

  return userPermissions.some((perm) => {
    if (perm === "*" || perm === required) return true;

    if (perm.endsWith(":*")) {
      const namespace = perm.slice(0, -1); // z. B. "admin:" oder "team:"
      if (required.startsWith(namespace)) return true;
    }

    const implied = PERMISSION_IMPLICATIONS[perm as Permission];
    if (implied) {
      if (implied.includes(required)) return true;
      for (const imp of implied) {
        if (imp.endsWith(":*") && required.startsWith(imp.slice(0, -1))) return true;
      }
    }

    return false;
  });
}

/**
 * Mappt eine klassische Vertriebs-Rolle (Preset) auf ihre granularen Capabilities.
 */
export function permissionsForRole(role: string | undefined | null): Permission[] {
  switch (role) {
    case "admin":
      return ["*", "admin:*", "team:*", "streets:*", "crm:*", "partner:dashboard", ...BERATER_BASE_PERMISSIONS];
    case "gebietsmanager":
      return [
        "team:view",
        "team:manage",
        "team:backoffice",
        "team:reports",
        "team:crm",
        "streets:struktur",
        "crm:team",
        ...BERATER_BASE_PERMISSIONS,
      ];
    case "teamleiter":
      return [
        "team:view",
        "team:manage",
        "team:backoffice",
        "team:licensing",
        "team:reports",
        "team:crm",
        "crm:team",
        ...BERATER_BASE_PERMISSIONS,
      ];
    case "strukturleiter":
      return ["team:view", "streets:struktur", "crm:team", ...BERATER_BASE_PERMISSIONS];
    case "mentor":
      return ["team:view", "streets:mentor", ...BERATER_BASE_PERMISSIONS];
    case "berater":
      return [...BERATER_BASE_PERMISSIONS];
    default:
      return [];
  }
}

export interface PermissionBearingUser {
  role?: string;
  roles?: unknown;
  permissions?: unknown;
  partnerStatus?: unknown;
  banned?: boolean;
  isBlocked?: boolean;
  gesperrtAm?: string;
  isActive?: boolean;
}

/**
 * Berechnet alle aktuell wirksamen Capabilities eines Nutzers aus:
 * 1. Echtzeit-Sperrprüfung (`banned`, `isBlocked`, `gesperrtAm`, `isActive === false` -> sofort `[]`)
 * 2. Explizit vergebenen Capabilities (`user.permissions`)
 * 3. Stamm- und Zusatzrollen-Presets (`user.role` & `user.roles`)
 * 4. Freigeschaltetem Partnerprogramm (`user.partnerStatus === "approved"`)
 */
export function effectiveUserPermissions(user: PermissionBearingUser | null | undefined): Permission[] {
  if (!user) return [];
  if (user.banned === true || user.isBlocked === true || Boolean(user.gesperrtAm) || user.isActive === false) {
    return [];
  }

  const set = new Set<Permission>(sanitizePermissions(user.permissions));

  for (const p of permissionsForRole(user.role)) {
    set.add(p);
  }

  if (Array.isArray(user.roles)) {
    for (const extraRole of user.roles) {
      if (typeof extraRole === "string") {
        for (const p of permissionsForRole(extraRole)) {
          set.add(p);
        }
      }
    }
  }

  if (user.partnerStatus === "approved") {
    set.add("partner:dashboard");
  }

  return [...set];
}

/**
 * Prüft in einem Schritt, ob ein Nutzer (über explizite Capabilities oder Rollen-Presets) ein Recht besitzt.
 */
export function can(user: PermissionBearingUser | null | undefined, required: Permission): boolean {
  return hasPermission(effectiveUserPermissions(user), required);
}
