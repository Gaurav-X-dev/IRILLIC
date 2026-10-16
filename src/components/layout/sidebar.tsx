import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Users", href: "/dashboard/users", icon: "👥" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/" className="text-xl font-bold text-primary-600">
          {APP_NAME}
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
