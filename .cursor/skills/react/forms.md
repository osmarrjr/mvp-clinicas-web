# Formulários, React Hook Form e Zod

## Regra principal

Todo formulário deve usar:

- React Hook Form;
- Zod;
- schema separado;
- tipos inferidos do schema quando aplicável.

---

## Estrutura recomendada

```txt
features/
  patients/
    schemas/
      patientSchema.ts
    components/
      PatientForm.tsx
```

---

## Schema como fonte de verdade

Validação deve ficar no schema.

Não duplicar validação no componente.

Correto:

```ts
import { z } from 'zod';

export const patientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
```

---

## React Hook Form

Exemplo:

```tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { patientSchema, type PatientFormValues } from '../schemas/patientSchema';

export function PatientForm() {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  function onSubmit(values: PatientFormValues) {
    // mutation ou callback
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* campos */}
    </form>
  );
}
```

---

## Client Component

Formulários são Client Components.

Todo componente com React Hook Form deve ter:

```tsx
'use client';
```

---

## Default values

Sempre definir `defaultValues`.

Evitar campos não controlados ou valores `undefined`.

---

## Mensagens de erro

Mensagens devem ser:

- claras;
- específicas;
- visíveis próximas ao campo;
- em português.

Mensagens de erro devem usar `role="alert"` quando aplicável.

---

## Submit

Durante envio:

- bloquear botão quando necessário;
- exibir estado de loading;
- impedir envio duplicado;
- exibir erro amigável em caso de falha.

---

## O que evitar

- validação manual duplicada no componente;
- `any` para valores do formulário;
- schema dentro do componente;
- formulário sem defaultValues;
- submit sem loading;
- erro técnico exposto ao usuário;
- duplicar schema de create/edit sem necessidade.

---

## Checklist de formulários

- [ ] Usa React Hook Form.
- [ ] Usa Zod.
- [ ] Schema está separado.
- [ ] Tipo é inferido do schema quando possível.
- [ ] Possui defaultValues.
- [ ] Mensagens de erro são amigáveis.
- [ ] Submit trata loading.
- [ ] Submit trata erro.
- [ ] Não há validação duplicada no componente.
- [ ] Não usa `any`.
