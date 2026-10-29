/**
 * Configuração central dos endereços públicos da LavaMed.
 *
 * Nenhuma URL abaixo é ativada automaticamente. O build só publica canonical,
 * sitemap e URLs absolutas quando SITE_URL estiver definido explicitamente.
 */
export const domainConfig = Object.freeze({
  netlifySiteName: "lavamed",
  secondaryUrl: "https://lavamed.netlify.app",
  primaryUrl: "https://lavamed.com.br",
  wwwUrl: "https://www.lavamed.com.br",
  activeUrlEnvironmentVariable: "SITE_URL",
  searchConsoleVerificationEnvironmentVariable: "GOOGLE_SITE_VERIFICATION"
});

export function normalizeSiteUrl(value = "") {
  const input = String(value).trim();
  if (!input) return "";

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "https:") throw new Error("SITE_URL must use HTTPS");
  if (parsed.username || parsed.password) throw new Error("SITE_URL cannot contain credentials");
  if (parsed.search || parsed.hash) throw new Error("SITE_URL cannot contain a query string or hash");
  if (parsed.pathname !== "/") throw new Error("SITE_URL must contain only the site origin, without a path");

  return parsed.origin;
}

export function resolveActiveSiteUrl(environment = process.env) {
  return normalizeSiteUrl(environment[domainConfig.activeUrlEnvironmentVariable]);
}

export function domainStage(siteUrl) {
  if (!siteUrl) return "local";
  if (siteUrl === domainConfig.secondaryUrl) return "secondary";
  if (siteUrl === domainConfig.primaryUrl) return "production";
  return "custom";
}
