# Testes React

## Ferramentas

Utilizar:

- Vitest;
- React Testing Library.

---

## Local dos testes

Manter teste próximo ao arquivo testado.

Exemplo:

```txt
PatientForm.tsx
PatientForm.spec.tsx
```

ou:

```txt
PatientForm.tsx
PatientForm.test.tsx
```

Usar o padrão já existente no projeto.

---

## O que testar

Priorizar comportamento visível ao usuário.

Testar:

- renderização inicial;
- estados de loading, erro e vazio;
- mensagens de validação;
- envio de formulário;
- botões e eventos principais;
- renderização condicional;
- feedback de sucesso ou erro.

---

## O que evitar

Evitar testar:

- implementação interna;
- nome de funções internas;
- estado interno sem reflexo na UI;
- detalhes de CSS sem relevância funcional.

---

## Mock

Mockar apenas dependências externas.

Exemplos:

- chamadas de API;
- hooks externos;
- router;
- cookies;
- serviços de terceiros.

---

## Formulários

Para formulários, testar:

- campos obrigatórios;
- mensagens de erro;
- preenchimento válido;
- submit;
- estado de loading;
- callback ou mutation chamada com payload esperado.

---

## Componentes com TanStack Query

Quando testar componentes que usam TanStack Query:

- envolver com QueryClientProvider;
- usar QueryClient isolado por teste;
- limpar cache entre testes quando necessário.

---

## Estados obrigatórios

Todo componente que carrega dados deve ter teste, quando aplicável, para:

- loading;
- error;
- empty;
- success.

---

## Referências de spec no projeto

```txt
src/features/auth/schemas/loginSchema.spec.ts   → validação Zod
src/features/auth/components/LoginForm.spec.tsx → formulário + mock de hook/service
```

Padrão do `LoginForm.spec.tsx`:

- mock de hook de domínio (`useLogin`);
- mock de componentes compartilhados pesados (`Loading`);
- testes por comportamento visível (labels, botão desabilitado, mensagens de erro, submit).

---

Ao seguir plano de implementação:

1. criar ou ajustar spec primeiro;
2. rodar teste;
3. implementar;
4. rodar teste novamente.

---

## Checklist de testes

- [ ] Teste próximo ao arquivo testado.
- [ ] Testa comportamento visível.
- [ ] Não testa implementação interna.
- [ ] Mocka apenas dependências externas.
- [ ] Cobre loading quando aplicável.
- [ ] Cobre erro quando aplicável.
- [ ] Cobre vazio quando aplicável.
- [ ] Cobre sucesso quando aplicável.
- [ ] Formulário cobre validação e submit.
