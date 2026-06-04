export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-[radial-gradient(circle_at_top,#1d4ed8_0%,#0f172a_35%,#1e3a8a_65%,#60a5fa_100%)]">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </main>
  );
}
