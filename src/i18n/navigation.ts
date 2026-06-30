import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * These wrap Next's <Link>, useRouter, usePathname, redirect with the
 * locale + translated-pathname logic from routing.ts baked in.
 * Components should import Link/useRouter from here, never from "next/link"
 * or "next/navigation" directly, or the localized pathnames silently break.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
