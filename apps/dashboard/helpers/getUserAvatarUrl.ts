export interface UserAvatarSources {
  userAvatarUrl?: string | null;
  staffProfileImageUrl?: string | null;
  applicationProfileImageUrl?: string | null;
}

/**
 * Resolve the best avatar URL for a user, with a consistent priority order.
 * 1) User-level avatarUrl
 * 2) Staff application profileImageUrl
 * 3) Staff profileImageUrl
 * 4) null (caller should fall back to initials/Gravatar)
 */
export function getUserAvatarUrl({
  userAvatarUrl,
  staffProfileImageUrl,
  applicationProfileImageUrl,
}: UserAvatarSources): string | null {
  if (userAvatarUrl && userAvatarUrl.trim().length > 0) {
    return userAvatarUrl;
  }

  if (applicationProfileImageUrl && applicationProfileImageUrl.trim().length > 0) {
    return applicationProfileImageUrl;
  }

  if (staffProfileImageUrl && staffProfileImageUrl.trim().length > 0) {
    return staffProfileImageUrl;
  }

  return null;
}
