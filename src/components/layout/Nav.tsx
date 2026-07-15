import Link from "next/link";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "首页" },
  { href: "/record", label: "记录" },
  { href: "/history", label: "历史" },
  { href: "/insight", label: "复盘" },
] as const;

interface NavProps {
  pathname: string;
  mobile?: boolean;
}

function isActivePath(pathname: string, href: string): boolean {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export default function Nav({ pathname, mobile = false }: NavProps) {
  return (
    <nav
      aria-label="主导航"
      className={cn(
        "flex items-center",
        mobile ? "gap-1 overflow-x-auto" : "gap-1",
      )}
    >
      {navigationItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
