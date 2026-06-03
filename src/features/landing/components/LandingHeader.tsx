"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="#home" className="shrink-0">
          <img
            src="/loading-logo.svg"
            alt="MVP Clínicas"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 md:flex"
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

            <SheetContent
              side="right"
              className="w-1/2! max-w-[240px]! border-white/10 bg-[#1e3a8a]/65 px-2 py-4 text-white backdrop-blur-xl"
            >
              <SheetHeader className="space-y-0">
                <SheetTitle className="text-left text-base font-semibold text-white">
                  Menu
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Navegação mobile" className="mt-2 flex flex-col">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
