import type { UserRole } from '../store/userStore';

/** Maps API role strings (e.g. NGO) to app store values. */
export function normalizeUserRole(role: string | null | undefined): UserRole {
  if (!role) return null;

  const normalized = role.toLowerCase();
  if (normalized === 'donor' || normalized === 'recipient' || normalized === 'ngo') {
    return normalized;
  }

  return null;
}
