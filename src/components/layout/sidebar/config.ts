import {
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  FilePlus2,
  Handshake,
  KeyRound,
  List as ListIcon,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";

import type { AppNavItem } from "./types";

export const SIDEBAR_EXPANDED_WIDTH = "16rem";
export const SIDEBAR_ICON_WIDTH = "6rem";
export const SIDEBAR_MOBILE_WIDTH = "5.5rem";

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: "Agenda",
    path: "/agenda/lista",
    icon: CalendarDays,
    children: [
      { label: "Lista", path: "/agenda/lista", icon: ListIcon },
      { label: "Agendamentos", path: "/agenda/agendamentos", icon: CalendarCheck },
      { label: "Cadastrar", path: "/agenda/cadastrar", icon: CalendarPlus },
      { label: "Médicos", path: "/agenda/medicos", icon: Stethoscope },
    ],
  },
  {
    label: "Convênios",
    path: "/convenios/listar",
    icon: Handshake,
    children: [
      { label: "Listar", path: "/convenios/listar", icon: ListIcon },
      { label: "Cadastrar", path: "/convenios/cadastrar", icon: FilePlus2 },
    ],
  },
  {
    label: "Usuários",
    path: "/usuarios/listar",
    icon: Users,
    children: [
      { label: "Listar", path: "/usuarios/listar", icon: UserCog },
      { label: "Configurações", path: "/usuarios/configuracoes", icon: Settings },
      { label: "Grupos", path: "/usuarios/grupos", icon: UsersRound },
      { label: "Permissões", path: "/usuarios/permissoes", icon: ShieldCheck },
      { label: "Alterar senha", path: "/usuarios/alterar-senha", icon: KeyRound },
    ],
  },
];
