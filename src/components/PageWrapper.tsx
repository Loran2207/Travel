"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NO_NAV_ROUTES = ["/results", "/trip"];

export function PageWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = NO_NAV_ROUTES.some((p) => pathname.startsWith(p));

  return <div className={hideNav ? "" : "pb-20"}>{children}</div>;
}
