export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative isolate min-h-dvh w-full overflow-y-auto overflow-x-hidden bg-[#0b1748]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e3a8a_0%,#172554_42%,#0b1748_100%)]" />

      <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#071133]/70 to-transparent" />

      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </main>
  );
}
