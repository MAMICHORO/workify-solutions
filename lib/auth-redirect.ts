export function getSafePublicReturnPath(
  value: string | null | undefined
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return null;
  }

  const pathname = value.split(/[?#]/, 1)[0];

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/login"
  ) {
    return null;
  }

  return value;
}
