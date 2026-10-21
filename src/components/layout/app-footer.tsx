import { APP_NAME } from "@/lib/constants";

export function AppFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p>Built with Next.js & PostgreSQL</p>
      </div>
    </footer>
  );
}
