---
name: playwright
description: Índice e regras essenciais de Playwright para testes E2E do MVP Clínicas Web.
disable-model-invocation: true
---

# Playwright — Skill

## Objetivo

Esta skill centraliza os padrões de testes E2E do MVP Clínicas Web com Playwright.

Use quando a tarefa envolver:

- criação ou alteração de testes E2E;
- configuração do Playwright;
- fluxos autenticados;
- rotas públicas ou protegidas;
- Page Object Model;
- exploração com MCP Playwright.

Este arquivo é apenas um índice. Os detalhes ficam nos arquivos complementares desta pasta.

---

## Stack oficial

- Playwright
- Chromium como browser padrão
- `@playwright/test`
- `dotenv` para carregar `.env.local`
- Testes em `e2e/`
- Artefatos em `.playwright/`
- Autenticação reutilizável com `storageState`
- Sessão baseada em cookies HTTP-only

---

## Arquivos desta skill

```txt
.cursor/skills/playwright/
  SKILL.md
  setup.md
  auth.md
  writing-tests.md
  mcp.md
```

---

## Leitura obrigatória mínima

Antes de criar, revisar ou depurar E2E, leia:

```txt
.cursor/skills/playwright/SKILL.md
.cursor/skills/playwright/writing-tests.md
```

---

## Leitura condicional

Leia também:

```txt
.cursor/skills/playwright/setup.md
```

Quando a tarefa envolver instalação, scripts, `playwright.config.ts`, estrutura `e2e/`, `.gitignore` ou porta/baseURL.

Leia também:

```txt
.cursor/skills/playwright/auth.md
```

Quando a tarefa envolver login, fluxo autenticado, rotas protegidas, `storageState`, `QA_EMAIL` ou `QA_PASSWORD`.

Leia também:

```txt
.cursor/skills/playwright/mcp.md
```

Quando a tarefa envolver exploração interativa com MCP Playwright.

---

## Regras essenciais

- Testes E2E ficam em `e2e/`.
- Testar comportamento visível ao usuário, não implementação interna.
- Priorizar seletores acessíveis.
- Evitar seletores CSS frágeis e XPath.
- Usar `data-testid` somente quando não houver seletor acessível confiável.
- Fluxos autenticados devem usar autenticação reutilizável via `storageState`.
- Não manipular token diretamente no client.
- Não usar `localStorage`, `sessionStorage`, Context API ou store para autenticação.
- A cobertura exata deve seguir o `plano.md`.
- Não criar E2E fora do escopo do plano.

---

## Comandos principais

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:debug
```

Ou diretamente:

```bash
npx playwright test
npx playwright test --headed
npx playwright test --debug
```

---

## Checklist rápido

- [ ] Teste criado em `e2e/`.
- [ ] Segue o escopo do `plano.md`.
- [ ] Usa seletores acessíveis.
- [ ] Não depende de CSS frágil ou XPath.
- [ ] Não manipula token no client.
- [ ] Fluxo autenticado usa `storageState` quando aplicável.
- [ ] `npm run test:e2e` passa.
