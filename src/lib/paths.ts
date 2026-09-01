const configuredBase = import.meta.env.BASE_URL || "/";

export const basePath = configuredBase === "/" ? "" : configuredBase.replace(/\/$/, "");

export function withBase(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) return path;
  return `${basePath}${path}` || "/";
}
