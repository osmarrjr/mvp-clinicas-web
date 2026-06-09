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
  `---`,
  `> PR gerado automaticamente após aprovação do agente \`qa\`.`,
  `> Implementação conforme [\`plano.md\`](plano.md). Revisão humana necessária antes do merge.`,
]
  .filter(Boolean)
  .join("\n\n");

// 7. Instrução de followup para o agente principal executar o fluxo git + PR
const followup = `\
✅ O QA aprovou a implementação — testes e checklist do plano.md completo.

Execute o fluxo abaixo para abrir o PR de revisão:

**1. Commit das alterações:**
\`\`\`
git add -A
git commit -m "feat: ${titulo}"
\`\`\`

**2. Push para o repositório:**
\`\`\`
git push -u origin HEAD
\`\`\`

**3. Criar o PR como draft para revisão:**
\`\`\`
gh pr create \\
  --title "feat: ${titulo}" \\
  --body ${JSON.stringify(prBody)} \\
  --draft
\`\`\`

O PR será aberto como **draft**. Revise e aprove antes do merge.`;

process.stdout.write(JSON.stringify({ followup_message: followup }));
process.exit(0);
