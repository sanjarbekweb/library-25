export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-canvas-warm">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] text-foreground">
          ShelfSync
        </h1>
        <p className="text-muted-foreground text-lg">
          School Library Management Platform
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow text-black font-semibold text-sm">
          Scaffolding Complete — Unit 00
        </div>
      </div>
    </main>
  );
}
