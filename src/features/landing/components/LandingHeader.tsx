"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  LANDING_HEADER_CLASS,
  LANDING_SHEET_CLASS,
} from "@/features/landing/constants/theme";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "#home", label: "Home" },
  { href: "#quem-somos", label: "Quem somos" },
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#suporte", label: "Suporte" },
  { href: "#planos", label: "Planos" },
] as const;

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={LANDING_HEADER_CLASS}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="#home" className="shrink-0">
          <img
            src="/logo.png"
            alt="MVP Clínicas"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <nav
            aria-label="Navegação principal"
            className="flex items-center gap-1"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-blue-100/90 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button
            asChild
            className="ml-2 h-10 rounded-2xl bg-white px-5 text-sm font-semibold text-blue-950 shadow-md transition hover:bg-blue-50"
          >
            <Link href="/login">Sou cliente</Link>
          </Button>
        </div>

        <div className="flex items-center md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 text-white hover:bg-white/10 hover:text-white"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className={LANDING_SHEET_CLASS}>
              <SheetHeader className="space-y-0">
                <SheetTitle className="text-left text-base font-semibold text-white">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <nav
                aria-label="Navegação mobile"
                className="mt-4 flex flex-col gap-1"
              >
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}

                <Button
                  asChild
                  className="mt-4 h-10 w-full rounded-2xl bg-white px-5 text-sm font-semibold text-blue-950 shadow-md transition hover:bg-blue-50"
                >
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Sou cliente
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
