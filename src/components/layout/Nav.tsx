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
        "items-center bg-card/65 p-1 ring-1 ring-border/70",
        mobile
          ? "grid w-full grid-cols-4 gap-1 rounded-2xl"
          : "flex gap-1 rounded-full",
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
              "min-w-0 rounded-full py-2 text-center text-sm font-medium transition-colors",
              mobile ? "px-1" : "px-4",
              active
                ? "bg-secondary text-foreground shadow-[0_1px_3px_rgb(42_38_30_/_8%)]"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}