import {
  AUTH_SHELL_BASE_BG,
  AUTH_SHELL_OVERLAY_BG,
} from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "relative isolate min-h-dvh w-full overflow-y-auto overflow-x-hidden",
        AUTH_SHELL_BASE_BG,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          AUTH_SHELL_OVERLAY_BG,
        )}
      />

      <div className="pointer-events-none absolute left-1/2 top-[-140px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-300/10 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#071133]/70 to-transparent" />

      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 py-8">
        {children}
      </div>
    </main>
  );
}
