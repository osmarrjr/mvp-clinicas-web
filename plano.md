# Plano: Refatoração da sidebar customizada (sem shadcn/radix sidebar)

## Contexto

A sidebar atual depende de `src/components/ui/sidebar.tsx` (~716 linhas), que encapsula Radix Slot, Sheet (mobile), Tooltip, cookies, contexto complexo e múltiplos subcomponentes. Isso gera re-renders excessivos, dificulta manutenção e torna o layout lento. A tarefa substitui essa implementação por uma sidebar customizada leve, preservando comportamento visual, navegação (`APP_NAV_ITEMS`), estados ativos, flyouts (hover desktop / click mobile), tokens semânticos (`bg-sidebar`, `text-sidebar-foreground`) e integração com `AppShell`, usando apenas React, Next.js, Tailwind, lucide-react, `Button` shadcn e `cn`.

## Validação arquitetural

- Feature: existente (layout em `src/components/layout/`)
- Reutiliza componente existente: sim (`AppSidebarHeader`, `MainNavigation`, `NavMenuItem`, `NavChildLink`, `NavLinkContent`, `config.ts`, `styles.ts`, `utils.ts`, `types.ts`)
- Reutiliza GlobalModal / Loading / DataTable: não aplicável
- Reutiliza hook existente: sim (`useIsMobile` em `src/hooks/use-mobile.ts`)
- Reutiliza service existente: não aplicável
- Reutiliza schema existente: não aplicável
- Reutiliza tipos existentes: sim (`AppNavItem` em `sidebar/types.ts`)
- Usa shadcn/ui ou componente existente: sim (`Button`); **não** usa `sidebar.tsx`
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não
- Exige teste unitário/componente: sim (atualizar `AppSidebar.spec.tsx`; spec para novos módulos de contexto/overlay)

## Decisões de design

### 1. Context próprio leve (`SidebarContext.tsx`)

Substituir `SidebarProvider` / `useSidebar` de shadcn por provider interno em `src/components/layout/sidebar/SidebarContext.tsx`:

| Estado | Tipo | Uso |
|--------|------|-----|
| `state` | `"expanded" \| "collapsed"` | Desktop: largura e layout compacto |
| `open` | `boolean` | Desktop expandido vs colapsado (icon mode) |
| `openMobile` | `boolean` | Drawer mobile visível |
| `isMobile` | `boolean` | Derivado de `useIsMobile()` |
| `toggleSidebar` | `() => void` | Alterna `open` (desktop) ou `openMobile` (mobile) |
| `setOpenMobile` | `(open: boolean) => void` | Fechar overlay ao navegar ou clicar backdrop |

- **Sem cookies** na primeira entrega (shadcn persistia em cookie); estado inicial desktop `expanded`. Cookie pode ser adicionado depois se necessário — evita side effects no client na montagem.
- **Sem atalho Ctrl/Cmd+B** (removido junto com shadcn); toggle apenas via botões existentes.
- Context value memoizado com `useMemo`; callbacks com `useCallback`.
- Exportar `SidebarProvider`, `useSidebar` e reutilizar em `utils.ts` (`useCompactNav`).

### 2. Layout desktop (`AppSidebarPanel.tsx`)

- Container fixo `fixed inset-y-0 left-0 z-10 hidden md:flex` com largura via CSS variable `--sidebar-width`.
- **Expandido:** `--sidebar-width: 16rem` (equivalente ao `SIDEBAR_WIDTH` do shadcn).
- **Colapsado (icon mode):** `--sidebar-width: 6rem` (`SIDEBAR_ICON_WIDTH` de `config.ts`).
- Transição `transition-[width] duration-200 ease-linear` na largura.
- Elemento **gap** sibling (ou `margin-left` no main) para empurrar conteúdo — espelhar comportamento do `sidebar-gap` atual.
- Atributos para Tailwind: `data-state="expanded|collapsed"` e `data-collapsed="true|false"` no wrapper interno; classe `group/sidebar` para substituir `group-data-[collapsible=icon]`.
- `bg-sidebar text-sidebar-foreground border-r`.
- **Rail opcional:** botão fino na borda (`SidebarRail` simplificado) com `toggleSidebar` e `aria-label` — preservar affordance de expandir/colapsar sem depender de shadcn.

### 3. Layout mobile (`MobileSidebarOverlay.tsx`)

- **Sem Radix Sheet:** overlay `fixed inset-0 z-40` (backdrop `bg-black/20`) + panel `fixed inset-y-0 left-0 z-50` com largura `SIDEBAR_MOBILE_WIDTH` (5.5rem).
- Entrada/saída com `transition-transform` + `translate-x` (ou `opacity` no backdrop); condicional `openMobile`.
- `pointer-events-none` quando fechado; `aria-hidden` no panel quando fechado.
- Fechar: clique no backdrop, `setOpenMobile(false)`; opcional `Escape` via `useEffect`.
- `body overflow-hidden` enquanto aberto (lock scroll leve).
- Conteúdo da sidebar (header + nav) renderizado **dentro** do panel mobile; desktop usa `AppSidebarPanel` sem overlay.
- Alternativa validada: um único `AppSidebar` que delega mobile vs desktop a subcomponentes — evita duplicar nav.

### 4. Primitivos de menu (substituir shadcn)

Remover `SidebarMenuItem`, `SidebarMenuButton`, `SidebarContent`, `SidebarFooter`, `SidebarHeader`, `SidebarGroup`, etc.

| Antes (shadcn) | Depois (custom) |
|----------------|-----------------|
| `SidebarMenuItem` | `<li className="relative overflow-visible">` |
| `SidebarMenuButton` | `<button>` ou `Link` com `getMenuItemClass` |
| `SidebarHeader` | `<div data-slot="sidebar-header">` |
| `SidebarContent` | `<nav aria-label="Principal">` + `<ul>` |
| `SidebarFooter` | `<div data-slot="sidebar-footer">` |

- **Sem Tooltip** em icon mode: labels compactos já visíveis (`NavLinkContent`); remover dependência de `TooltipProvider` nos testes.
- Flyouts (`NavMenuItem`): manter lógica atual (hover desktop / click mobile); apenas trocar wrappers.

### 5. Migração de classes Tailwind (`styles.ts`, `NavLinkContent.tsx`, `MainNavigation.tsx`, `AppSidebarHeader.tsx`)

Substituir seletores `group-data-[collapsible=icon]:*` por equivalentes no novo grupo:

- `group/sidebar` no panel + `data-collapsed="true"` quando `state === "collapsed"` **ou** `isMobile`.
- Exemplo: `group-data-[collapsed=true]:hidden` em vez de `group-data-[collapsible=icon]:hidden`.
- Atualizar `getMenuItemClass`, `getNavLabelClass`, `NavLinkContent` (chevron), `MainNavigation` (padding footer), `AppSidebarHeader` (grid logo).

### 6. `AppShell.tsx`

- Remover `SidebarInset`; layout flex simples:
  - `SidebarProvider` (wrapper `flex min-h-svh w-full`)
  - `AppSidebar`
  - `<div className="flex flex-1 flex-col min-w-0">` com header + main
- Margin/width do main acompanha sidebar via gap sibling ou `pl-[var(--sidebar-width)]` no desktop (alinhar com gap do panel).
- Header mobile toggle continua usando `useSidebar().openMobile` e `toggleSidebar`.

### 7. `config.ts`

Adicionar constante explícita:

```ts
export const SIDEBAR_EXPANDED_WIDTH = "16rem";
```

Manter `SIDEBAR_ICON_WIDTH` e `SIDEBAR_MOBILE_WIDTH`.

### 8. Remoção de `src/components/ui/sidebar.tsx`

- Verificar que nenhum import restante no projeto (grep `ui/sidebar`).
- Deletar arquivo após migração.
- **Manter** `src/components/ui/sheet.tsx` (usado em `LandingHeader.tsx`).

## Páginas/componentes afetados

- `src/components/layout/AppSidebar.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/AppSidebar.spec.tsx`
- `src/components/layout/sidebar/SidebarContext.tsx` (novo)
- `src/components/layout/sidebar/SidebarContext.spec.tsx` (novo)
- `src/components/layout/sidebar/AppSidebarPanel.tsx` (novo)
- `src/components/layout/sidebar/MobileSidebarOverlay.tsx` (novo)
- `src/components/layout/sidebar/MainNavigation.tsx`
- `src/components/layout/sidebar/NavMenuItem.tsx`
- `src/components/layout/sidebar/AppSidebarHeader.tsx`
- `src/components/layout/sidebar/NavLinkContent.tsx`
- `src/components/layout/sidebar/styles.ts`
- `src/components/layout/sidebar/utils.ts`
- `src/components/ui/sidebar.tsx` (remover)

Nenhuma página em `src/app/` alterada (layout `(app)` já usa `AppShell`).

## Contrato de API utilizado

Nenhum.

## Dependências/configurações necessárias

Nenhuma nova dependência npm.

Branch de feature a partir de `main` antes da implementação (fluxo git do projeto).

## Estratégia de performance

- **Context estável:** `useMemo` no value do provider; `useCallback` em `toggleSidebar` e `setOpenMobile`.
- **Evitar pathname no context:** `usePathname` permanece em `AppSidebar` / `MainNavigation` — toggle da sidebar não re-renderiza por mudança de rota além do necessário na nav.
- **Memoização seletiva:** `React.memo` em `NavMenuItem` se profiling indicar; prioridade baixa na primeira entrega.
- **Mobile overlay:** montar backdrop/panel apenas quando `isMobile`; evitar listeners globais duplicados (um `pointerdown` por flyout aberto já existente em `NavMenuItem`).
- **CSS over JS:** largura e transições via Tailwind/CSS variables; sem `requestAnimationFrame` para cookies.
- **Sem Radix portals** na sidebar (exceto se portal manual no overlay mobile for necessário para z-index — preferir `fixed` no mesmo tree).
- **useIsMobile:** manter `useSyncExternalStore` (já evita hydration mismatch).

## Estratégia de testes

### Unitário/componente

| Arquivo | Foco |
|---------|------|
| `src/components/layout/sidebar/SidebarContext.spec.tsx` | Provider: `toggleSidebar` desktop/mobile, `state`, `openMobile` |
| `src/components/layout/AppSidebar.spec.tsx` | Labels/links, `data-active`, sem `TooltipProvider`/`SidebarProvider` shadcn |

### Cenários principais

- Desktop (`useIsMobile` → false): renderiza links de `APP_NAV_ITEMS` com `href` correto.
- Pathname ativo: `data-active="true"` no item Agenda quando rota filha ativa.
- Desktop colapsado: footer "Versão 1.0" oculto; labels compactos visíveis (smoke via classes ou presença de texto).
- Mobile (`useIsMobile` → true): sidebar não visível até `toggleSidebar`; após toggle, overlay/panel visível; backdrop fecha menu.
- `useCompactNav`: `compact === true` quando mobile ou `state === "collapsed"`.
- Acessibilidade: botões toggle com `aria-label`; flyout mobile com `aria-expanded`.

## Passos de implementação

### 0. Branch e baseline

- Arquivo: repositório
- O que fazer: `git checkout main && git pull && git checkout -b feature/custom-sidebar`
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 1. Spec do contexto da sidebar

- Arquivo: `src/components/layout/sidebar/SidebarContext.spec.tsx`
- O que fazer: Testar `SidebarProvider` + `useSidebar` com wrapper de teste — toggle desktop altera `state`; com mock mobile, toggle altera `openMobile`.
- Spec primeiro: este arquivo (SDD)
- Depende de: Passo 0

### 2. Implementar `SidebarContext.tsx`

- Arquivo: `src/components/layout/sidebar/SidebarContext.tsx`
- O que fazer: Provider leve com estados descritos em Decisões de design; export `useSidebar`, `SidebarProvider`; integrar `useIsMobile`.
- Spec primeiro: `SidebarContext.spec.tsx` (passo 1)
- Depende de: Passo 1

### 3. Spec do overlay mobile (opcional consolidado com passo 7)

- Arquivo: `src/components/layout/sidebar/MobileSidebarOverlay.spec.tsx` ou cenários em `AppSidebar.spec.tsx`
- O que fazer: Com `useIsMobile` mock true, assert visibilidade do overlay ao abrir/fechar.
- Spec primeiro: preferir cenários em `AppSidebar.spec.tsx` para evitar arquivo extra
- Depende de: Passo 2

### 4. Implementar `MobileSidebarOverlay.tsx`

- Arquivo: `src/components/layout/sidebar/MobileSidebarOverlay.tsx`
- O que fazer: Backdrop + panel fixed, transições CSS, `role="dialog"` + `aria-modal="true"` no container mobile, children slot para conteúdo da sidebar.
- Spec primeiro: Não aplicável (coberto em AppSidebar.spec)
- Depende de: Passo 2

### 5. Implementar `AppSidebarPanel.tsx`

- Arquivo: `src/components/layout/sidebar/AppSidebarPanel.tsx`
- O que fazer: Container desktop fixo, gap sibling, CSS vars `--sidebar-width`, `data-state`/`data-collapsed`, rail opcional, `group/sidebar`.
- Spec primeiro: Não aplicável
- Depende de: Passo 2

### 6. Atualizar `config.ts`

- Arquivo: `src/components/layout/sidebar/config.ts`
- O que fazer: Adicionar `SIDEBAR_EXPANDED_WIDTH = "16rem"`.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 7. Migrar `styles.ts` e `NavLinkContent.tsx`

- Arquivo: `src/components/layout/sidebar/styles.ts`, `src/components/layout/sidebar/NavLinkContent.tsx`
- O que fazer: Trocar `group-data-[collapsible=icon]` por `group-data-[collapsed=true]` (ou equivalente acordado no panel).
- Spec primeiro: Não aplicável
- Depende de: Passo 5

### 8. Refatorar `utils.ts`

- Arquivo: `src/components/layout/sidebar/utils.ts`
- O que fazer: Import `useSidebar` de `./SidebarContext` em vez de `@/components/ui/sidebar`.
- Spec primeiro: Não aplicável
- Depende de: Passo 2

### 9. Refatorar `NavMenuItem.tsx`

- Arquivo: `src/components/layout/sidebar/NavMenuItem.tsx`
- O que fazer: Substituir `SidebarMenuItem`/`SidebarMenuButton` por `<li>` + `button`/`Link`; remover `tooltip` prop; manter flyouts e acessibilidade.
- Spec primeiro: Não aplicável
- Depende de: Passos 7, 8

### 10. Refatorar `MainNavigation.tsx` e `AppSidebarHeader.tsx`

- Arquivo: `src/components/layout/sidebar/MainNavigation.tsx`, `src/components/layout/sidebar/AppSidebarHeader.tsx`
- O que fazer: Remover primitivos shadcn; usar elementos semânticos; `useSidebar` do novo context; classes `group-data-[collapsed=true]`.
- Spec primeiro: Não aplicável
- Depende de: Passos 7, 8

### 11. Refatorar `AppSidebar.tsx`

- Arquivo: `src/components/layout/AppSidebar.tsx`
- O que fazer: Compor `AppSidebarPanel` (desktop) + `MobileSidebarOverlay` (mobile) com header + `MainNavigation`; export `AppSidebarProvider` reexportando `SidebarProvider` com style `--sidebar-width-icon`; remover `Sidebar`, `SidebarRail` shadcn.
- Spec primeiro: Não aplicável
- Depende de: Passos 4, 5, 9, 10

### 12. Refatorar `AppShell.tsx`

- Arquivo: `src/components/layout/AppShell.tsx`
- O que fazer: Layout flex sem `SidebarInset`; `useSidebar` do novo context; main content ao lado da sidebar.
- Spec primeiro: Não aplicável
- Depende de: Passo 11

### 13. Atualizar `AppSidebar.spec.tsx`

- Arquivo: `src/components/layout/AppSidebar.spec.tsx`
- O que fazer: Remover `SidebarProvider`/`TooltipProvider` shadcn; usar `SidebarProvider` custom; manter/estender testes de links e active state; adicionar teste mobile se viável.
- Spec primeiro: este arquivo
- Depende de: Passos 11, 12

### 14. Remover `src/components/ui/sidebar.tsx`

- Arquivo: `src/components/ui/sidebar.tsx`
- O que fazer: Deletar após grep confirmar zero imports; não remover `sheet.tsx`.
- Spec primeiro: Não aplicável
- Depende de: Passos 11–13

### 15. Verificação final

- Arquivo: projeto
- O que fazer: `npm run test`, `npm run lint`, `npm run build`; smoke manual desktop (expand/collapse, flyout hover), mobile (drawer, flyout click), navegação e active states.
- Spec primeiro: Não aplicável
- Depende de: Passo 14

## Riscos / atenções

- **Regressão visual:** migração de `group-data-[collapsible=icon]` exige auditoria em todos os arquivos de `sidebar/`; um seletor esquecido quebra layout colapsado ou footer.
- **Largura do conteúdo:** gap sibling vs `margin-left` no main deve espelhar largura real (16rem / 6rem); testar resize e transição.
- **Z-index:** flyouts (`z-50`) devem ficar acima do panel mas abaixo de modais globais (`GlobalModal`); validar empilhamento.
- **Hydration:** `useIsMobile` retorna `false` no server; overlay mobile não deve flash no SSR.
- **Acessibilidade mobile:** dialog sem focus trap completo (sem Radix) — mínimo: `aria-modal`, foco no primeiro elemento ao abrir (nice-to-have), `Escape` para fechar.
- **Persistência:** sem cookie, sidebar volta expandida em cada sessão — aceitar ou documentar.
- **Testes:** remover `TooltipProvider` pode expor dependências ocultas em outros testes que importavam sidebar shadcn — rodar suite completa.
- **Não remover `sheet.tsx`** — usado em landing.

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [ ] Componente sem lógica de negócio: delega a hooks/services
- [ ] Tipos derivados dos contratos em `src/lib/api/types.ts`
- [ ] Estados de loading, erro e vazio tratados na UI
- [ ] Client Components não acessam token
- [ ] Route Handler usado para chamadas autenticadas do client
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [ ] GlobalModal, Loading ou DataTable reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longo
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável
- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
- [x] Zero imports de `@/components/ui/sidebar`
- [x] `src/components/ui/sidebar.tsx` removido
- [x] Comportamentos preservados: desktop expandido/colapsado, mobile drawer, flyouts, active state, footer versão, tokens semânticos
