# Playwright — MCP

## Objetivo

Usar o MCP `@playwright/mcp` para exploração interativa da UI antes ou durante a escrita de testes E2E.

O MCP é opcional. Os testes finais devem continuar registrados em arquivos Playwright quando o plano exigir cobertura E2E.

---

## Quando usar

Use MCP Playwright para:

- abrir páginas;
- capturar snapshot de acessibilidade;
- identificar roles, names e seletores;
- testar cliques e preenchimentos;
- capturar screenshot;
- validar visualmente um fluxo;
- entender falhas funcionais antes de escrever ou corrigir specs.

---

## Configuração no Cursor

Adicionar ao `settings.json` do Cursor:

```json
{
  "mcp_servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## Workflow recomendado

```txt
1. Navegar até a página.
2. Capturar snapshot de acessibilidade.
3. Identificar role/name dos elementos.
4. Executar cliques/preenchimentos.
5. Capturar screenshot quando necessário.
6. Escrever o spec definitivo com seletores acessíveis.
7. Executar `npm run test:e2e`.
```

---

## Ferramentas esperadas

A disponibilidade exata depende da configuração do MCP no Cursor.

Ferramentas comuns:

```txt
playwright_navigate
playwright_snapshot
playwright_screenshot
playwright_click
playwright_fill
playwright_select_option
playwright_press_key
playwright_evaluate
playwright_wait_for_load_state
```

---

## Regras

- Usar MCP apenas como apoio exploratório.
- Não substituir o spec Playwright definitivo por exploração manual.
- Preferir snapshot de acessibilidade para escolher seletores.
- Não usar MCP para manipular token no client.
- Não alterar código de produção durante exploração.
- Registrar cobertura em `e2e/` quando o `plano.md` exigir teste E2E.

---

## Checklist MCP

- [ ] MCP usado apenas para exploração.
- [ ] Seletores escolhidos por acessibilidade quando possível.
- [ ] Fluxo final virou spec Playwright quando necessário.
- [ ] Nenhuma manipulação de token foi feita no client.
