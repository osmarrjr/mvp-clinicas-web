#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

const PLANO = "plano.md";
const QA_RESULT = ".cursor/qa-result.json";

function run(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function noop() {
  process.stdout.write("{}");
  process.exit(0);
}

function readQaResult() {
  if (!fs.existsSync(QA_RESULT)) return null;

  try {
    return JSON.parse(fs.readFileSync(QA_RESULT, "utf8"));
  } catch {
    return null;
  }
}

// 1. plano.md deve existir
if (!fs.existsSync(PLANO)) noop();

const conteudo = fs.readFileSync(PLANO, "utf8");

// 2. Checklist do plano deve estar completo
if (conteudo.includes("- [ ]")) noop();

// 3. QA deve ter aprovado explicitamente
const qaResult = readQaResult();
if (!qaResult || qaResult.approved !== true) noop();

// 4. Verifica se já existe PR aberto para a branch atual
const branch = run("git branch --show-current");
if (branch) {
  const prCount = run(
    `gh pr list --head "${branch}" --json number --jq "length"`,
  );
  if (parseInt(prCount, 10) > 0) noop();
}

// 5. Extrai seções do plano.md para montar a mensagem de followup
const titulo =
  (conteudo.match(/^# Plano:\s*(.+)$/m) || [])[1] || "implementação";

const secao = (cabecalho) => {
  const regex = new RegExp(`## ${cabecalho}[\\s\\S]*?(?=\\n## |$)`);
  const match = conteudo.match(regex);
  return match ? match[0].replace(`## ${cabecalho}`, "").trim() : "";
};

const contexto = secao("Contexto");
const paginas = secao("Páginas\/componentes afetados");
const contrato = secao("Contrato de API utilizado");
const passos = secao("Passos de implementação");
const riscos = secao("Riscos / atenções");

const qaSummary = qaResult.summary || "QA aprovado.";

// 6. Body completo do PR
const prBody = [
  `## Contexto`,
  contexto,
  `## Páginas/componentes afetados`,
  paginas,
  contrato ? `## Contrato de API utilizado\n${contrato}` : "",
  `## O que foi implementado`,
  passos,
  riscos ? `## Riscos / atenções\n${riscos}` : "",
  `## QA`,
  qaSummary,
]
  .filter(Boolean)
  .join("\n\n");

// 7. Instrução de followup — aguardar confirmação manual antes de git/PR
const followup = `\
✅ O QA aprovou a implementação — testes e checklist do plano.md completo.

**Revise a implementação antes de commitar.** O commit e o PR **não serão executados automaticamente**.

Deseja que eu faça commit, push e abra o PR? Responda explicitamente (ex.: "pode commitar e criar o PR").

Quando confirmar, o fluxo será:

**1. Commit das alterações:**
\`\`\`
git add -A
git commit -m "feat: ${titulo}"
\`\`\`

**2. Push para o repositório:**
\`\`\`
git push -u origin HEAD
\`\`\`

**3. Criar o PR para revisão:**
\`\`\`
gh pr create \\
  --title "feat: ${titulo}" \\
  --body ${JSON.stringify(prBody)} \\
  --draft
\`\`\`

Até sua confirmação, nenhum comando git ou gh será executado.`;

process.stdout.write(JSON.stringify({ followup_message: followup }));
process.exit(0);
