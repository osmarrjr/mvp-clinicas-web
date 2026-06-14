# Contratos da API — SisMed

> Referência de endpoints, payloads, enums e formato de resposta da API NestJS.
>
> **URL base:** `NEXT_PUBLIC_API_URL` (local: `http://localhost:3000` · produção: `https://api.portalsismed.com.br`)
>
> **Swagger (fonte de verdade):** [https://api.portalsismed.com.br/docs](https://api.portalsismed.com.br/docs) · OpenAPI JSON: [`/docs-json`](https://api.portalsismed.com.br/docs-json)
>
> **Versão documentada:** `0.1.0`

---

## Convenções

| Aspecto         | Detalhe                                                              |
| --------------- | -------------------------------------------------------------------- |
| Autenticação    | `Authorization: Bearer <accessToken>` (JWT) nos endpoints protegidos |
| Request body    | Campos em **camelCase** (`birthDate`, `doctorUserId`, …)             |
| Response `data` | Campos em **snake_case** (`birth_date`, `doctor_user_id`, …)         |
| Datas           | ISO 8601 (`2026-06-20T13:30:00.000Z`)                                |
| Envelope        | Sempre `{ ok, data? \| error? }`                                     |

---

## Envelope de resposta

Todas as respostas seguem este formato:

```typescript
// Sucesso
{ "ok": true, "data": T }

// Erro
{
  "ok": false,
  "error": {
    "code": string,
    "message": string,
    "verificationCodeResent"?: boolean  // presente em alguns erros de verificação de e-mail
  }
}
```

### Códigos HTTP

| Situação                         | HTTP |
| -------------------------------- | ---- |
| Criação bem-sucedida             | 201  |
| Leitura/atualização bem-sucedida | 200  |
| Validação / regra de negócio     | 400  |
| Não autenticado                  | 401  |
| Recurso não encontrado           | 404  |

> Alguns endpoints de auth retornam **201** em operações de escrita (login, recuperação de senha, etc.), conforme o Swagger.

---

## Enums

```typescript
export enum AppRole {
  ClinicAdmin = "clinic_admin",
  Receptionist = "receptionist",
  Doctor = "doctor",
}

export enum AppointmentStatus {
  Triage = "triage",
  DoctorOffice = "doctor_office",
  ExamRoom = "exam_room",
  Reception = "reception",
}

export enum Sex {
  Male = "male",
  Female = "female",
  Other = "other",
}

export enum Council {
  CRM = "CRM",
  CRO = "CRO",
  CRP = "CRP",
  COREN = "COREN",
  CREFITO = "CREFITO",
  Other = "OTHER",
}

export enum Specialty {
  General = "general",
  Cardiology = "cardiology",
  Orthopedics = "orthopedics",
  Dermatology = "dermatology",
  Dentistry = "dentistry",
  Psychology = "psychology",
  Nursing = "nursing",
}

export enum Plan {
  Basic = "basic",
  Medium = "medium",
  Pro = "pro",
}

export enum RecoveryChannel {
  Email = "email",
  Sms = "sms",
  Whatsapp = "whatsapp",
}

export enum TaxIdType {
  Cpf = "cpf",
  Cnpj = "cnpj",
}

// Transições de status permitidas (máquina de estados — validada em PATCH /appointments/:id/status)
export const STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  [AppointmentStatus.Triage]: [
    AppointmentStatus.DoctorOffice,
    AppointmentStatus.Reception,
  ],
  [AppointmentStatus.DoctorOffice]: [
    AppointmentStatus.ExamRoom,
    AppointmentStatus.Reception,
  ],
  [AppointmentStatus.ExamRoom]: [AppointmentStatus.Reception],
  [AppointmentStatus.Reception]: [],
};
```

---

## Tipos de entidades (responses)

> Campos abaixo refletem o **formato retornado pela API** (`snake_case`).

```typescript
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  document: string | null;
  birth_date: string | null; // ISO date, ex.: "1990-12-31"
  sex: Sex | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_user_id: string;
  appointment_time: string; // ISO 8601
  name: string | null;
  image_base64: string | null;
  confirmed: boolean;
  status: AppointmentStatus;
  priority: string | null;
  finished: boolean;
  nature: string | null;
  health_care: string | null;
  waiting_room_start: string | null; // ISO 8601
  waiting_room_finished: string | null; // ISO 8601
  created_at: string;
  updated_at: string;
}

export interface LoginUser {
  id: string;
  email: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string; // ex.: "bearer"
  user: LoginUser;
}

export interface StaffCreated {
  userId: string;
  clinicId: string;
  role: AppRole;
}
```

---

## Auth / Identity

### POST /auth/register-admin

Cadastra clínica e administrador no onboarding. A clínica fica **não verificada** até confirmar o código enviado por e-mail; o login permanece bloqueado até a verificação.

**Request:**

```typescript
interface RegisterAdminDto {
  companyName: string; // nome da clínica ou empresa
  taxId: string; // CPF ou CNPJ (apenas dígitos)
  taxIdType?: TaxIdType; // obrigatório quando taxId não tem 11 ou 14 dígitos
  uf: string; // sigla IBGE, ex.: "SP"
  city: string;
  email: string;
  phone: string; // ex.: "+5511999999999"
  password: string; // mín. 8 caracteres
  confirmPassword: string;
  plan: Plan;
}
```

**Response (201):**

```typescript
{ ok: true, data: { status: number; message: string } }
```

**Erros (400):** `VALIDATION_ERROR`, `INVALID_TAX_ID`, `AUTH_CREATE_FAILED`, `CLINIC_CREATE_FAILED`, `MEMBERSHIP_CREATE_FAILED`, `PROFILE_CREATE_FAILED`, `RBAC_ASSIGN_FAILED`, `VERIFICATION_TOKEN_PERSIST_FAILED`

> O frontend pode expor este endpoint via Route Handler (`POST /api/auth/register`), sem gravar cookies nem expor token ao client.

---

### POST /auth/login

Login com e-mail e senha.

**Request:**

```typescript
interface LoginDto {
  email: string;
  password: string; // aceita senha inicial de 6 dígitos derivada do CPF (equipe)
}
```

**Response (201):**

```typescript
{ ok: true, data: LoginResult }
```

**Erros (400):**
| Código | Descrição |
|--------|-----------|
| `LOGIN_FAILED` | E-mail ou senha incorretos |
| `EMAIL_NOT_VERIFIED` | E-mail não verificado (`verificationCodeResent` opcional) |
| `CLINIC_NOT_VERIFIED` | Clínica não verificada (`verificationCodeResent` opcional) |
| `PASSWORD_CHANGE_REQUIRED` | Troca de senha obrigatória no primeiro acesso |

---

### POST /auth/change-password

Altera a senha do usuário autenticado. Obrigatório no primeiro login da equipe.

**Auth:** Bearer JWT

**Request:**

```typescript
interface ChangePasswordDto {
  newPassword: string; // mín. 8 caracteres
}
```

**Response (201):**

```typescript
{ ok: true, data: { changed: boolean } }
```

**Erros:** `VALIDATION_ERROR`, `PASSWORD_POLICY_VIOLATION`, `PASSWORD_CHANGE_FAILED`, `AUTH_MISSING`, `AUTH_INVALID`

---

### POST /auth/confirm-email-verification

Confirma o código de verificação de e-mail enviado no cadastro.

**Request:**

```typescript
interface ConfirmEmailVerificationDto {
  email: string;
  code: string; // código numérico de 6 dígitos
}
```

**Response (201):**

```typescript
{ ok: true, data: { verified: boolean } }
```

**Erros (400):** `VALIDATION_ERROR`, `VERIFICATION_TOKEN_INVALID`, `VERIFICATION_TOKEN_EXPIRED`, `VERIFICATION_TOKEN_LOCKED`, `VERIFICATION_PROFILE_NOT_FOUND`, `VERIFICATION_CONFIRM_FAILED`, `VERIFICATION_CLINIC_UPDATE_FAILED`

---

### POST /auth/resend-email-verification

Reenvia o código de verificação de e-mail.

**Request:**

```typescript
interface ResendEmailVerificationDto {
  email: string;
}
```

**Response (201):**

```typescript
{ ok: true, data: { sent: boolean } }
```

**Erros (400):** `VALIDATION_ERROR`, `VERIFICATION_LOOKUP_FAILED`, `VERIFICATION_TOKEN_PERSIST_FAILED`

---

### GET /auth/oauth/google/url

Retorna a URL de redirecionamento para login com Google (PKCE tratado no aplicativo).

**Query params:**

```
redirectTo=string   (obrigatório — URL de retorno após OAuth)
```

**Response (200):**

```typescript
{ ok: true, data: { url: string } }
```

**Erros (400):** `OAUTH_URL_FAILED`

---

### GET /auth/oauth/google/callback

Retorno do OAuth Google. O fluxo PKCE deve ser tratado no aplicativo.

**Response (200):**

```typescript
{ ok: true, data: { message: string } }
```

---

### POST /auth/password-recovery/request

Solicita recuperação de senha. Token válido por **30 minutos**.

**Request:**

```typescript
interface PasswordRecoveryRequestDto {
  channel: RecoveryChannel;
  email?: string; // obrigatório para identificar conta quando channel = email
  phone?: string; // obrigatório quando channel = sms | whatsapp
}
```

**Response (201):**

```typescript
{ ok: true, data: { sent: boolean } }
```

**Erros (400):** `VALIDATION_ERROR`, `RECOVERY_TARGET_MISSING`, `RECOVERY_EMAIL_REQUIRED`, `RECOVERY_LOOKUP_FAILED`, `RECOVERY_TOKEN_PERSIST_FAILED`

---

### POST /auth/password-recovery/confirm

Confirma o token de recuperação e redefine a senha.

**Request:**

```typescript
interface PasswordRecoveryConfirmDto {
  token: string; // token recebido por e-mail, SMS ou WhatsApp
  newPassword: string; // mín. 8 caracteres
}
```

**Response (201):**

```typescript
{ ok: true, data: { reset: boolean } }
```

**Erros (400):** `VALIDATION_ERROR`, `RECOVERY_TOKEN_INVALID`, `RECOVERY_TOKEN_USED`, `RECOVERY_TOKEN_EXPIRED`, `RECOVERY_RESET_FAILED`

---

## Staff (equipe da clínica)

> Rotas requerem `Authorization: Bearer <token>` e role `clinic_admin`.

### GET /staff

Lista membros da equipe da clínica.

**Query params:**

```
role=doctor | receptionist | clinic_admin   (obrigatório no OpenAPI)
```

**Response (200):**

```typescript
{ ok: true, data: StaffMember[] }
```

**Erros:** `CLINIC_NOT_FOUND`, `STAFF_FORBIDDEN`, `STAFF_LIST_FAILED`, `AUTH_MISSING`, `AUTH_INVALID`

---

### POST /staff/doctors

Cadastra médico na clínica atual. A senha inicial é derivada dos **6 primeiros dígitos do CPF** (não enviada no payload).

**Request:**

```typescript
interface CreateDoctorDto {
  email: string;
  name: string;
  phone?: string;
  cpf: string;
  council: Council;
  councilNumber: string;
  councilUf?: string; // ex.: "SP"
  specialty: Specialty;
}
```

**Response (201):**

```typescript
{ ok: true, data: StaffCreated }
```

**Erros (400):** `VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `STAFF_FORBIDDEN`, `INVALID_CPF`, `AUTH_CREATE_FAILED`, `MEMBERSHIP_CREATE_FAILED`, `PROFILE_CREATE_FAILED`, `RBAC_ASSIGN_FAILED`, `PROFESSIONAL_PROFILE_CREATE_FAILED`

---

### POST /staff/receptionists

Cadastra recepcionista na clínica atual. Senha inicial derivada do CPF (mesma regra do médico).

**Request:**

```typescript
interface CreateReceptionistDto {
  email: string;
  name: string;
  phone?: string;
  cpf: string;
}
```

**Response (201):**

```typescript
{ ok: true, data: StaffCreated }
```

**Erros (400):** `VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `STAFF_FORBIDDEN`, `INVALID_CPF`, `AUTH_CREATE_FAILED`, `MEMBERSHIP_CREATE_FAILED`, `PROFILE_CREATE_FAILED`, `RBAC_ASSIGN_FAILED`

---

## Patients (pacientes)

> Rotas requerem `Authorization: Bearer <token>`.

### POST /patients

Cadastra paciente na clínica.

**Request:**

```typescript
interface CreatePatientDto {
  name: string;
  document?: string; // CPF ou documento
  birthDate?: string; // ISO date
  sex?: Sex;
  email?: string;
  phone?: string;
}
```

**Response (201):**

```typescript
{ ok: true, data: Patient }
```

**Erros (400):** `VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `PATIENT_CREATE_FAILED`

---

### GET /patients

Lista pacientes da clínica (isolamento multi-tenant no backend).

**Response (200):**

```typescript
{ ok: true, data: Patient[] }
```

**Erros (400):** `CLINIC_NOT_FOUND`, `PATIENTS_LIST_FAILED`

---

### GET /patients/:id

Consulta detalhes de um paciente.

**Response (200):**

```typescript
{ ok: true, data: Patient }
```

**Erros:** `CLINIC_NOT_FOUND`, `PATIENT_GET_FAILED` (400), `PATIENT_NOT_FOUND` (404)

---

### PATCH /patients/:id

Atualiza dados do paciente.

**Request:**

```typescript
interface UpdatePatientDto {
  name?: string;
  document?: string;
  birthDate?: string;
  sex?: Sex;
  email?: string;
  phone?: string;
}
```

**Response (200):**

```typescript
{ ok: true, data: Patient }
```

**Erros:** `VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `PATIENT_UPDATE_FAILED` (400), `PATIENT_NOT_FOUND` (404)

---

## Appointments (agenda)

> Rotas requerem `Authorization: Bearer <token>`.

### POST /appointments

Cria agendamento. Status inicial: `triage`.

**Request:**

```typescript
interface CreateAppointmentDto {
  patientId: string;
  doctorUserId: string;
  appointmentTime: string; // ISO 8601
  name?: string;
  imageBase64?: string;
  confirmed?: boolean;
  priority?: string;
  nature?: string;
  healthCare?: string;
}
```

**Response (201):**

```typescript
{ ok: true, data: Appointment }
```

**Erros (400):** `VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `APPOINTMENT_CREATE_FAILED`

---

### GET /appointments

Lista agendamentos com filtros.

**Query params** (nomes conforme a API; o OpenAPI publicado marca todos como `required` — validar comportamento real):

```
?patientId=uuid
?status=triage|doctor_office|exam_room|reception
?confirmed=true|false
?finished=true|false
?from=ISO8601          // início do intervalo (não usar dateFrom)
?to=ISO8601            // fim do intervalo (não usar dateTo)
```

**Response (200):**

```typescript
{ ok: true, data: Appointment[] }
```

**Erros (400):** `APPOINTMENTS_LIST_FAILED`

---

### GET /appointments/:id

Consulta detalhes de um agendamento.

**Response (200):**

```typescript
{ ok: true, data: Appointment }
```

**Erros:** `APPOINTMENT_GET_FAILED` (400), `APPOINTMENT_NOT_FOUND` (404)

---

### PATCH /appointments/:id

Atualiza campos editáveis (não altera status nem horário).

**Request:**

```typescript
interface UpdateAppointmentDto {
  name?: string;
  imageBase64?: string;
  confirmed?: boolean;
  priority?: string;
  nature?: string;
  healthCare?: string;
}
```

**Response (200):**

```typescript
{ ok: true, data: Appointment }
```

**Erros:** `VALIDATION_ERROR`, `APPOINTMENT_UPDATE_FAILED` (400), `APPOINTMENT_NOT_FOUND` (404)

---

### PATCH /appointments/:id/status

Altera o status do agendamento (máquina de estados em `STATUS_TRANSITIONS`).

**Request:**

```typescript
interface ChangeStatusDto {
  status: AppointmentStatus;
}
```

**Response (200):**

```typescript
{ ok: true, data: Appointment }
```

**Erros (400):** `VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`, `APPOINTMENT_GET_FAILED`, `APPOINTMENT_STATUS_UPDATE_FAILED`

**Erros (404):** `APPOINTMENT_NOT_FOUND`

---

## Convênios

> **Provisório:** o endpoint abaixo **não consta** no Swagger v0.1.0. Contrato alinhado ao formulário de cadastro do frontend; revisar quando o backend publicar o recurso em [`/docs-json`](https://api.portalsismed.com.br/docs-json).

### POST /clinic-convenio-register

Cadastra um convênio (ou plano particular) vinculado à clínica autenticada.

**Autenticação:** `Authorization: Bearer <accessToken>`

**Request (camelCase):**

```typescript
interface CreateConvenioDto {
  name: string; // 5–60 chars, sem @ # !
  acronym: string; // 5–30 chars, sem @ # !
  category: "particular" | "convenio";
  ansRegistration?: string; // 6 dígitos numéricos, opcional
  cardNumberMask?: string; // até 30 chars, apenas 0 - . /
}
```

**Response (201):**

```typescript
{
  ok: true,
  data: {
    id: string;
    clinic_id: string;
    name: string;
    acronym: string;
    category: "particular" | "convenio";
    ans_registration: string | null;
    card_number_mask: string | null;
    created_at: string;
    updated_at: string;
  }
}
```

**Erros esperados:**

| Código                   | HTTP | Descrição                        |
| ------------------------ | ---- | -------------------------------- |
| `VALIDATION_ERROR`       | 400  | Payload inválido                 |
| `CLINIC_NOT_FOUND`       | 400  | Clínica da sessão não encontrada |
| `CONVENIO_CREATE_FAILED` | 400  | Falha ao persistir convênio      |
| `AUTH_MISSING`           | 401  | Token ausente                    |
| `AUTH_INVALID`           | 401  | Token inválido ou expirado       |

---

## Códigos de erro semânticos

A API retorna erros no formato `{ ok: false, error: { code, message } }`. A `message` já vem em português e é a fonte de verdade exibida ao usuário.

O frontend usa `getErrorMessage(error.message)` em `src/lib/api/error-messages.ts` — repassa a mensagem da API ou aplica fallback genérico quando ausente:

```typescript
export const GENERIC_ERROR_MESSAGE =
  "Ocorreu um erro inesperado. Tente novamente.";

export function getErrorMessage(message?: string | null): string {
  const trimmed = message?.trim();
  return trimmed || GENERIC_ERROR_MESSAGE;
}
```

Consulte o Swagger para a lista completa de códigos (`/docs-json`). Não duplicar mensagens no frontend.

---

## Endpoints não expostos na v0.1.0

Os grupos abaixo **não constam** no Swagger de produção atual e foram removidos desta referência até existirem na API:

- `GET/POST /permissions/*` (RBAC granular)
- `GET/POST /clinic/users*` (gestão alternativa de membros)

Quando forem publicados no backend, atualizar este documento a partir de [`/docs-json`](https://api.portalsismed.com.br/docs-json).
