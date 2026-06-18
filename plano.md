# Plano: Gradiente escuro do login no sidebar e header

## Contexto

A área autenticada usa sidebar e header com fundo claro (`bg-sidebar`) e itens de navegação com gradiente horizontal azul claro. O objetivo é alinhar o visual ao fundo das telas de login (base `#0b1748` + overlay radial escuro), mantendo legibilidade de textos, ícones e estados ativo/hover. Escopo restrito a sidebar, header e controles visíveis neles (toggle mobile, UserMenu trigger); conteúdo principal, cards e dropdowns permanecem inalterados.

## Validação arquitetural

- Feature: existente (layout autenticado)
- Reutiliza componente existente: sim (`Sidebar`, `AppShell`, `AppSidebar`, `styles.ts`, `UserMenu`)
- Reutiliza GlobalModal / Loading / DataTable: não aplicável
- Reutiliza hook existente: não aplicável
- Reutiliza service existente: não aplicável
- Reutiliza schema existente: não aplicável
- Reutiliza tipos existentes: não aplicável
- Usa shadcn/ui ou componente existente: sim (`Sidebar`, `Button`, `Sheet`, `DropdownMenu`)
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não
- Exige teste unitário/componente: não (usuário pediu para não se preocupar com testes por agora)

## Páginas/componentes afetados

- `src/lib/theme/auth-shell-gradient.ts` (novo — tokens/classes compartilhados)
- `src/components/layout/ShellGradientSurface.tsx` (novo — wrapper de fundo reutilizável)
- `src/components/layout/ShellGradientSurface.spec.tsx` (novo — spec SDD; implementação de testes adiada)
- `src/components/layout/AppSidebar.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/sidebar/styles.ts`
- `src/components/layout/sidebar/AppSidebarHeader.tsx`
- `src/features/auth/components/UserMenu/UserMenu.tsx` (apenas trigger/avatar no header; dropdown permanece claro)

Opcional (DRY, fora do escopo funcional mínimo):

- `src/app/(auth)/layout.tsx` — reutilizar os mesmos tokens do novo módulo

**Não alterar:**

- `src/app/globals.css` tokens `--sidebar` (impactam `Card` e outros usos de `bg-sidebar`)
- Conteúdo de páginas, flyouts brancos (`FLYOUT_PANEL_CLASS`), dropdown do `UserMenu`

## Contrato de API utilizado

Nenhum.

## Dependências/configurações necessárias

Nenhuma.

## Checklist final

- [x] Spec `ShellGradientSurface.spec.tsx` criada (SDD); testes executáveis adiados conforme pedido
- [x] Tokens centralizados em `auth-shell-gradient.ts`
- [x] Sidebar e header usam o mesmo gradiente do login
- [x] Itens de menu legíveis (inativo, hover, ativo) no fundo escuro
- [x] Flyouts brancos preservam estilo claro atual
- [x] UserMenu dropdown inalterado; trigger legível no header escuro
- [x] Tokens globais `--sidebar` não alterados
- [x] Componente sem lógica de negócio: wrapper apenas visual
- [x] Client Components não acessam token
- [x] Acessibilidade: foco visível em botões ghost, ícones com `aria-label`
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem duplicação desnecessária de constantes de gradiente
- [ ] `npm run lint` sem erros (falhas pré-existentes em arquivos fora do escopo)
- [x] `npm run build` sem erros
