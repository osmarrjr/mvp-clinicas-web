import {
  Bell,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Shield,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const APP_NAVIGATION: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pacientes", href: "/patients", icon: Users },
  { label: "Agendamentos", href: "/appointments", icon: Calendar },
  { label: "Equipe", href: "/staff", icon: UserCog },
  { label: "Relatórios", href: "/reports", icon: LayoutDashboard },
  { label: "Permissões", href: "/permissions", icon: Shield },
  { label: "Perfil", href: "/profile", icon: User },
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Notificações", href: "/notifications", icon: Bell },
  { label: "Ajuda", href: "/help", icon: HelpCircle },
];
