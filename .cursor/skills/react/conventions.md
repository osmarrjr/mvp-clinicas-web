# Convenções React 19 / Next.js 16

## Imports

Usar política híbrida de imports.

### Arquivos próximos

Para arquivos dentro da mesma feature, mesma pasta ou área imediata, usar caminhos relativos.

Correto:

```ts
import { patientSchema } from '../schemas/patientSchema';
import { useCreatePatient } from '../hooks/useCreatePatient';
import { PatientForm } from './PatientForm';
```

### Arquivos fora da área imediata

Usar alias `@/` somente quando o import cruzar módulos, features ou áreas distantes do projeto.

Correto:

```ts
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { routes } from '@/config/routes';
```

### Evitar

Evitar alias para arquivos vizinhos:

```ts
import { patientSchema } from '@/features/patients/schemas/patientSchema';
```

Evitar caminho relativo profundo:

```ts
import { Button } from '../../../../components/ui/button';
```

### Regra prática

- Mesmo diretório: `./`
- Pasta próxima dentro da mesma feature: `../`
- Outra feature, `components`, `lib` ou `config`: `@/`

---

## Nomeação

Componentes:

```tsx
export function PatientForm() {}
```

Hooks:

```ts
export function usePatients() {}
```

Funções:

```ts
export function getPatients() {}
```

Schemas:

```ts
export const patientSchema = z.object({});
```

Tipos:

```ts
export type Patient = {};
export type CreatePatientInput = {};
```

---

## Evitar nomes genéricos

Evitar:

```txt
service.ts
data.ts
component.tsx
form.tsx
hook.ts
types2.ts
utils2.ts
```

Preferir nomes explícitos:

```txt
patientsServerService.ts
patientsClientService.ts
PatientForm.tsx
useCreatePatient.ts
patientSchema.ts
```

---

## Tipagem

Prioridade:

1. Reutilizar tipos existentes.
2. Usar tipos globais em `lib/api/types.ts`.
3. Criar tipos específicos em `features/<feature>/types.ts`.

Nunca duplicar DTOs.

Nunca redefinir tipo já existente.

Não usar:

```ts
any
```

Exceto quando houver justificativa clara e localizada.

---

## Checklist antes de finalizar

- [ ] Não há `any` injustificado.
- [ ] Imports próximos usam caminho relativo.
- [ ] Imports entre módulos usam alias `@/`.
- [ ] Não há import relativo profundo.
- [ ] Não há componente de domínio em `components/`.
- [ ] Não há regra de negócio em `src/app`.
- [ ] Não há chamada HTTP direta para API NestJS em componente.
- [ ] Não há token no client.
- [ ] Não há DTO duplicado.
- [ ] Não há schema duplicado.
- [ ] Não há hook duplicado.
- [ ] Não há service duplicado.
- [ ] Estados loading/error/empty/success foram tratados quando aplicável.
- [ ] Testes foram criados ou atualizados.
- [ ] `npm run test` passou quando aplicável.
- [ ] `npm run lint` passou.
- [ ] `npm run build` passou.
