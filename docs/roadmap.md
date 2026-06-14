# Roadmap — SisMed Web

## MVP inicial (a implementar)

- [ ] **Auth**: tela de login, onboarding admin (criação de clínica + admin), recuperação de senha.
- [ ] **Dashboard**: visão geral do dia (appointments por status, contadores).
- [ ] **Patients**: lista com busca, detalhe e formulário de criação/edição.
- [ ] **Appointments**: lista com filtros de status/data, detalhe, criação e controle de status (kanban ou lista com ações).
- [ ] **Staff**: lista de médicos e secretárias, formulário de criação por role.
- [ ] **Perfil**: visualização e edição do próprio perfil.

## Próximas funcionalidades

- **Permissões**: tela de gestão de RBAC (roles/permissões) e vínculo secretária→médicos.
- **Convites**: fluxo de convite por email/link para novos membros.
- **Multi-clínica**: seleção de clínica ativa quando usuário pertence a mais de uma.
- **Notificações**: alertas de agendamentos (via Supabase Realtime ou polling).
- **Relatórios**: tempo de espera médio, atendimentos por médico, funil por status.
- **Upload de imagem**: substituir `imageBase64` por upload para Supabase Storage.
- **PWA**: aplicação instalável para uso em tablet na recepção.
- **Tema escuro**: dark mode via variáveis CSS + Tailwind.
