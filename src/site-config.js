/**
 * Configuração central dos endereços públicos da LavaMed.
 *
 * Somente SITE_URL com a origem principal libera indexação. Contextos de
 * preview prevalecem sobre variáveis herdadas; produção mal configurada falha.
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
  if (["deploy-preview", "branch-deploy", "dev"].includes(environment.CONTEXT)) return "";
  const origin = normalizeSiteUrl(environment[domainConfig.activeUrlEnvironmentVariable]);
  if (environment.CONTEXT === "production" && origin !== domainConfig.primaryUrl) {
    throw new Error(`Production requires SITE_URL=${domainConfig.primaryUrl}`);
  }
  return origin === domainConfig.primaryUrl ? origin : "";
}

export function domainStage(siteUrl) {
  if (!siteUrl) return "local";
  if (siteUrl === domainConfig.secondaryUrl) return "secondary";
  if (siteUrl === domainConfig.primaryUrl) return "production";
  return "custom";
}
