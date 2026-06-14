import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  FileText,
  Headphones,
  Mail,
  MessageCircle,
  Shield,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLINIC_PLAN_OPTIONS } from "@/features/auth/constants/plans";
import {
  LANDING_GLOW_PRIMARY,
  LANDING_GLOW_SECONDARY,
  LANDING_HERO_CLASS,
  LANDING_PAGE_CLASS,
  LANDING_SECTION_CLASS,
} from "@/features/landing/constants/theme";

import { LandingHeader } from "./LandingHeader";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Agenda inteligente",
    description:
      "Agendamentos online, confirmações por e-mail e lembretes automáticos por WhatsApp e SMS para reduzir faltas.",
  },
  {
    icon: Users,
    title: "Gestão de pacientes",
    description:
      "Cadastro completo, histórico de atendimentos e prontuário eletrônico com anexos em um só lugar.",
  },
  {
    icon: Stethoscope,
    title: "Equipe e profissionais",
    description:
      "Controle de profissionais cadastrados, permissões avançadas por perfil e suporte a multi-unidades.",
  },
  {
    icon: Wallet,
    title: "Controle financeiro",
    description:
      "Receitas, despesas, automação de faturamento e emissão de NFS-e para simplificar a rotina administrativa.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e dashboards",
    description:
      "Relatórios essenciais ou personalizados, dashboard de ocupação da agenda e exportação de dados.",
  },
  {
    icon: Shield,
    title: "Integrações e segurança",
    description:
      "Integrações com laboratórios e convênios, alto padrão de desenvolvimento e dados organizados com segurança.",
  },
] as const;

const SUPPORT_EMAIL = "suporte@portalsismed.com.br";
const SUPPORT_WHATSAPP = "(11) 98765-4321";
const SUPPORT_WHATSAPP_LINK = "https://wa.me/5511987654321";

const LANDING_IMAGES = {
  hero: "/landing/landing-hero.png",
  about: "/landing/landing-about.png",
  features: "/landing/landing-features.png",
  support: "/landing/landing-support.png",
} as const;

type LandingImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  aspect?: "video" | "square" | "wide" | "compact" | "fill";
  className?: string;
};

function LandingImage({
  src,
  alt,
  priority = false,
  aspect = "video",
  className = "",
}: LandingImageProps) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "wide"
        ? "aspect-[21/9]"
        : aspect === "compact"
          ? "aspect-[2/1]"
          : aspect === "fill"
            ? "h-full min-h-[220px]"
            : "aspect-video";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-blue-950/40 ${aspectClass} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/35 via-transparent to-transparent" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div className={LANDING_PAGE_CLASS}>
      <LandingHeader />

      <main>
        <section id="home" className={LANDING_HERO_CLASS}>
          <div
            className={`${LANDING_GLOW_PRIMARY} -top-32 -left-32 h-96 w-96`}
          />
          <div
            className={`${LANDING_GLOW_SECONDARY} right-0 bottom-0 h-[420px] w-[420px]`}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-10 lg:py-24">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Gestão inteligente para o seu negócio de saúde
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-blue-100/90 sm:text-xl">
                Somos um software de clínicas médicas voltado para a gestão
                inteligente do seu negócio. Utilizamos alto padrão de
                desenvolvimento e funcionalidades para dar mais produtividade e
                agilidade no seu dia a dia.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Button asChild variant="default">
                  <Link href="#planos">
                    Conhecer planos
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                <Button asChild variant="default">
                  <Link href="/register">Cadastrar minha clínica</Link>
                </Button>
              </div>
            </div>

            <LandingImage
              src={LANDING_IMAGES.hero}
              alt="Painel de gestão de clínica médica com agenda, pacientes e indicadores"
              priority
              className="mx-auto w-[70%] lg:w-full lg:origin-center"
            />
          </div>
        </section>

        <div className={LANDING_SECTION_CLASS}>
          <section id="quem-somos" className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Quem somos
                </h2>
                <p className="mt-3 text-blue-100/80">
                  Conheça a proposta por trás da nossa plataforma
                </p>
              </div>

              <div className="mt-8 grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
                <LandingImage
                  src={LANDING_IMAGES.about}
                  alt="Equipe de saúde colaborando com tecnologia para gestão de clínicas"
                  aspect="compact"
                  className="mx-auto w-full max-w-[500px] lg:aspect-3/2 lg:max-w-none lg:w-full"
                />

                <div className="space-y-5 text-base leading-relaxed text-blue-50/90 sm:text-lg">
                  <p>
                    Nascemos com a missão de simplificar a rotina de clínicas e
                    consultórios médicos por meio de tecnologia acessível,
                    moderna e pensada para o dia a dia de quem cuida de pessoas.
                  </p>

                  <p>
                    Acreditamos que a gestão de uma clínica deve ser tão
                    eficiente quanto o atendimento prestado aos pacientes. Por
                    isso, desenvolvemos uma solução completa que reúne agenda,
                    prontuário, financeiro e indicadores em uma experiência
                    intuitiva — do profissional autônomo à rede com múltiplas
                    unidades.
                  </p>

                  <p>
                    Nossa equipe combina expertise em saúde e engenharia de
                    software para entregar um produto confiável, seguro e em
                    constante evolução, sempre alinhado às necessidades reais de
                    quem trabalha na linha de frente do cuidado.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="funcionalidades" className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Funcionalidades
                </h2>
                <p className="mt-3 text-blue-100/80">
                  Tudo o que sua clínica precisa para crescer com organização e
                  eficiência
                </p>
              </div>

              <LandingImage
                src={LANDING_IMAGES.features}
                alt="Funcionalidades do software: agenda, prontuário, financeiro e relatórios"
                aspect="compact"
                className="mx-auto mt-8 max-w-xl"
              />

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => (
                  <Card
                    key={feature.title}
                    className="border-white/15 bg-white/5 shadow-lg shadow-blue-950/20 backdrop-blur-sm"
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                        <feature.icon className="size-5" aria-hidden />
                      </div>

                      <CardTitle className="text-xl text-white">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm leading-relaxed text-blue-100/85">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section id="suporte" className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Suporte
                </h2>
                <p className="mt-3 text-blue-100/80">
                  Estamos prontos para ajudar você e sua equipe
                </p>
              </div>

              <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
                <LandingImage
                  src={LANDING_IMAGES.support}
                  alt="Equipe de suporte pronta para ajudar clínicas e consultórios"
                  aspect="fill"
                  className="sm:col-span-2 lg:col-span-1"
                />

                <Card className="h-full border-white/15 bg-white/5">
                  <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                      <Mail className="size-5" aria-hidden />
                    </div>

                    <div>
                      <p className="font-semibold text-white">E-mail</p>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="mt-1 block text-sm text-sky-200 transition hover:text-sky-100 hover:underline"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>

                    <p className="text-sm text-blue-100/75">
                      Atendimento em horário comercial, de segunda a sexta.
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full border-white/15 bg-white/5">
                  <CardContent className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                      <MessageCircle className="size-5" aria-hidden />
                    </div>

                    <div>
                      <p className="font-semibold text-white">WhatsApp</p>
                      <a
                        href={SUPPORT_WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm text-sky-200 transition hover:text-sky-100 hover:underline"
                      >
                        {SUPPORT_WHATSAPP}
                      </a>
                    </div>

                    <p className="text-sm text-blue-100/75">
                      Fale conosco para dúvidas rápidas sobre planos e
                      funcionalidades.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-2 text-sm text-blue-100/70">
                <Headphones className="size-4 shrink-0" aria-hidden />
                <span>
                  Planos Pro incluem suporte dedicado 24/7 para operações
                  críticas.
                </span>
              </div>
            </div>
          </section>

          <section id="planos" className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Planos
                </h2>

                <p className="mt-3 text-lg leading-relaxed text-blue-100/90">
                  Gostou de algum plano? Confira abaixo uma prévia das opções e{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-white underline-offset-4 hover:text-sky-200 hover:underline"
                  >
                    cadastre sua clínica agora
                  </Link>{" "}
                  — leva poucos minutos para começar.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {CLINIC_PLAN_OPTIONS.map((plan) => (
                  <Card
                    key={plan.id}
                    className="flex h-full flex-col border-white/20 bg-white/10 shadow-xl shadow-blue-950/30 backdrop-blur-2xl"
                  >
                    <CardHeader className="space-y-2 pb-2 text-center">
                      <CardTitle className="text-2xl font-bold capitalize text-white">
                        {plan.name}
                      </CardTitle>

                      <p className="text-lg font-semibold text-sky-200">
                        {plan.priceLabel}
                      </p>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col px-6 pb-6">
                      <ul className="mb-6 flex-1 space-y-2.5 text-left text-sm text-blue-50/90">
                        {plan.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex gap-2">
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-sky-300"
                              aria-hidden
                            />
                            <span>{feature}</span>
                          </li>
                        ))}

                        {plan.features.length > 4 ? (
                          <li className="text-xs text-blue-100/60">
                            + {plan.features.length - 4} funcionalidades
                          </li>
                        ) : null}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center gap-7 text-center">
                <p className="max-w-2xl text-base text-blue-100/85">
                  Escolha o plano ideal, preencha o cadastro da sua clínica e
                  comece a transformar a gestão do seu consultório hoje mesmo.
                </p>

                <Button asChild variant="default">
                  <Link href="/register">
                    Quero cadastrar minha clínica
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>

                <p className="text-sm text-blue-100/70">
                  Já possui conta?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-white underline-offset-4 hover:text-sky-200 hover:underline"
                  >
                    Faça login
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <footer className="py-6">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-sm text-blue-100/60 sm:flex-row sm:px-6">
              <p>
                © {new Date().getFullYear()} SisMed. Todos os direitos
                reservados.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
