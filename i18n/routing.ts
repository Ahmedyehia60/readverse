import { createElement, useCallback, useMemo } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  type LinkProps,
} from "react-router-dom";

type LocalizedLinkProps = Omit<LinkProps, "to"> & { href: string };

/** Localized navigation helpers shared by the application components. */
export function Link({ href, ...props }: LocalizedLinkProps) {
  const pathname = useLocation().pathname;
  const locale = pathname.match(/^\/(ar|en)(?:\/|$)/)?.[1] ?? "en";
  const to = href.startsWith("/") && !/^\/(ar|en)(?:\/|$)/.test(href)
    ? `/${locale}${href === "/" ? "" : href}`
    : href;
  return createElement(RouterLink, { to, ...props });
}

export function usePathname() {
  return useLocation().pathname;
}

export function useRouter() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const locale = pathname.match(/^\/(ar|en)(?:\/|$)/)?.[1] ?? "en";

  const localize = useCallback((path: string) => {
    if (!path.startsWith("/") || /^\/(ar|en)(?:\/|$)/.test(path)) return path;
    return `/${locale}${path === "/" ? "" : path}`;
  }, [locale]);

  return useMemo(() => ({
    push: (path: string) => navigate(localize(path)),
    replace: (path: string) => navigate(localize(path), { replace: true }),
    back: () => navigate(-1),
  }), [navigate, localize]);
}
