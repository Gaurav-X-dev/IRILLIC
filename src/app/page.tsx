export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold tracking-tight text-gray-900">
          Hello World
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          Welcome to <span className="font-semibold text-primary-600">IRILLIC</span> — built with Next.js, TypeScript & PostgreSQL
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/api/health"
            className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            Check API Health
          </a>
        </div>
        <div className="pt-8 flex gap-6 text-sm text-gray-500">
          <span>⚡ Next.js 15</span>
          <span>🎨 Tailwind CSS</span>
          <span>🐘 PostgreSQL</span>
          <span>🔷 TypeScript</span>
        </div>
      </div>
    </main>
  );
}
