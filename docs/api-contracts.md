# Contratos da API — MVP Clínicas

> Referência completa de todos os recursos, endpoints, payloads, enums e formato de resposta da API NestJS.
> URL base da API: `NEXT_PUBLIC_API_URL` (ex.: `http://localhost:3000`)

---

## Envelope de resposta

Todas as respostas da API seguem este formato:

```typescript
// Sucesso
{ "ok": true, "data": T }

// Erro
{ "ok": false, "error": { "code": string, "message": string } }
```

Códigos HTTP:
| Situação | HTTP |
|----------|------|
| Criação bem-sucedida | 201 |
| Leitura/atualização bem-sucedida | 200 |
| Não autenticado | 401 |
| Sem permissão | 403 |
| Recurso não encontrado | 404 |
| Validação / regra de negócio | 400 |

---

## Enums

```typescript
// src/lib/api/types.ts

export enum AppRole {
  ClinicAdmin  = 'clinic_admin',
  Receptionist = 'receptionist',
  Doctor       = 'doctor',
}

export enum AppointmentStatus {
  Triage       = 'triage',
  DoctorOffice = 'doctor_office',
  ExamRoom     = 'exam_room',
  Reception    = 'reception',
}

export enum Sex {
  Male   = 'male',
  Female = 'female',
  Other  = 'other',
}

export enum Council {
  CRM  = 'CRM',
  CRO  = 'CRO',
  CREFITO = 'CREFITO',
  CFP  = 'CFP',
  COREN = 'COREN',
  // estender conforme necessário
}

export enum AppPermission {
  AppointmentsRead       = 'appointments.read',
  AppointmentsCreate     = 'appointments.create',
  AppointmentsUpdate     = 'appointments.update',
  AppointmentsChangeStatus = 'appointments.change_status',
  AppointmentsManageAll  = 'appointments.manage_all',
  PermissionsManage      = 'permissions.manage',
}

// Transições de status permitidas (máquina de estados)
export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.Triage]:       [AppointmentStatus.DoctorOffice, AppointmentStatus.Reception],
  [AppointmentStatus.DoctorOffice]: [AppointmentStatus.ExamRoom,     AppointmentStatus.Reception],
  [AppointmentStatus.ExamRoom]:     [AppointmentStatus.Reception],
  [AppointmentStatus.Reception]:    [],
};
```

---

## Tipos de entidades

```typescript
// src/lib/api/types.ts (continuação)

export interface Clinic {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
}

export interface User {
  id: string; // = auth.users.id (Supabase)
  clinicId: string;
  name: string;
  email: string;
  phone: string | null;
  sex: Sex | null;
  role: AppRole;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfile {
  userId: string;
  council: string;       // ex.: 'CRM'
  councilNumber: string;
  councilUf: string;     // ex.: 'SP'
  specialty: string;
  cpf: string | null;
}

export interface StaffMember extends User {
  profile: ProfessionalProfile | null; // null para receptionist
}

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clinicId: string;
  doctorUserId: string;
  patientId: string;
  name: string | null;
  confirmed: boolean;
  imageBase64: string | null;
  priority: string | null;
  nature: string | null;
  healthCare: string | null;
  status: AppointmentStatus;
  finished: boolean;
  appointmentTime: string;         // ISO 8601
  waitingRoomStart: string | null; // ISO 8601
  waitingRoomFinished: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EffectivePermissions {
  role: AppRole;
  permissions: AppPermission[];
  doctorAccess: string[]; // IDs dos médicos acessíveis (para role receptionist)
}
```

---

## Auth / Identity

### POST /auth/register-admin

Cria a clínica no onboarding inicial (cadastro de empresa).

**Request:**
```typescript
interface RegisterClinicDto {
  clinicName: string;       // mínimo 3 caracteres na UI
  taxId: string;            // apenas dígitos — 11 (CPF) ou 14 (CNPJ)
  taxIdType: 'cpf' | 'cnpj';
  stateUf: string;          // sigla IBGE, ex.: 'SP'
  city: string;             // nome do município
  cityIbgeId?: number;      // id do município (opcional)
  email: string;
  plan: 'basic' | 'assistant' | 'pro';
}
```

**Response (201):**
```typescript
{ ok: true, data: { clinicId: string } }
```

> O frontend consome este endpoint via `POST /api/auth/register` (Route Handler), sem gravar cookies nem expor token ao client.

---

### POST /auth/register-admin (legado — admin com senha)

> Contrato anterior para criação simultânea de admin + clínica. Mantido para referência de integrações legadas.

```typescript
interface RegisterAdminDto {
  clinicName: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  sex?: Sex;
  council?: string;
  councilNumber?: string;
  councilUf?: string;
  specialty?: string;
  cpf?: string;
}
```

**Response (201):**
```typescript
{ ok: true, data: { userId: string; clinicId: string; accessToken: string } }
```

---

### POST /auth/login

Login com email e senha.

**Request:**
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{ ok: true, data: { accessToken: string; refreshToken: string; user: User } }
```

**Erros:**
- `INVALID_CREDENTIALS` (400) — email ou senha inválidos.

---

### GET /auth/oauth/google/url

Retorna a URL de redirecionamento para OAuth Google (Supabase).

**Response (200):**
```typescript
{ ok: true, data: { url: string } }
```

---

### GET /auth/oauth/google/callback

Callback do OAuth Google. Redireciona para o frontend com tokens na query string ou cookie.

---

### POST /auth/password-recovery/request

Solicita recuperação de senha por email ou SMS/WhatsApp.

**Request:**
```typescript
interface PasswordRecoveryRequestDto {
  channel: 'email' | 'sms' | 'whatsapp';
  email?: string;   // obrigatório se channel = 'email'
  phone?: string;   // obrigatório se channel = 'sms' | 'whatsapp'
}
```

**Response (200):**
```typescript
{ ok: true, data: { message: 'Recovery token sent' } }
```

---

### POST /auth/password-recovery/confirm

Confirma o token de recuperação e redefine a senha.

**Request:**
```typescript
interface PasswordRecoveryConfirmDto {
  token: string;        // token de 6 dígitos ou UUID recebido por email/SMS
  newPassword: string;  // mínimo 8 caracteres
}
```

**Response (200):**
```typescript
{ ok: true, data: { message: 'Password updated' } }
```

**Erros:**
- `RECOVERY_TOKEN_INVALID` (400) — token inválido ou expirado.

---

## Staff (membros da clínica)

> Todas as rotas de Staff requerem `Authorization: Bearer <token>` e role `clinic_admin`.

### GET /staff

Lista médicos e secretárias da clínica.

**Query params:**
```
?role=doctor | receptionist   (opcional, filtra por role)
```

**Response (200):**
```typescript
{ ok: true, data: StaffMember[] }
```

---

### POST /staff/doctors

Cria e vincula um médico à clínica.

**Request:**
```typescript
interface CreateDoctorDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  sex?: Sex;
  // Dados profissionais (obrigatórios para doctor)
  council: string;         // ex.: 'CRM'
  councilNumber: string;
  councilUf: string;       // ex.: 'SP'
  specialty: string;
  cpf?: string;
}
```

**Response (201):**
```typescript
{ ok: true, data: StaffMember }
```

---

### POST /staff/receptionists

Cria e vincula uma secretária/recepcionista à clínica.

**Request:**
```typescript
interface CreateReceptionistDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  sex?: Sex;
}
```

**Response (201):**
```typescript
{ ok: true, data: StaffMember }
```

---

## Patients (pacientes)

> Rotas requerem `Authorization: Bearer <token>`.

### POST /patients

Cria um paciente na clínica.

**Request:**
```typescript
interface CreatePatientDto {
  name: string;
  email?: string;
  phone?: string;
}
```

**Response (201):**
```typescript
{ ok: true, data: Patient }
```

---

### GET /patients

Lista pacientes da clínica (RLS aplica isolamento automático).

**Query params:**
```
?search=string   (opcional, busca por nome ou email)
```

**Response (200):**
```typescript
{ ok: true, data: Patient[] }
```

---

### GET /patients/:id

Detalhe de um paciente.

**Response (200):**
```typescript
{ ok: true, data: Patient }
```

**Erros:**
- `PATIENT_NOT_FOUND` (404) — paciente não encontrado ou fora da clínica.

---

### PATCH /patients/:id

Atualiza campos de um paciente.

**Request:**
```typescript
interface UpdatePatientDto {
  name?: string;
  email?: string;
  phone?: string;
}
```

**Response (200):**
```typescript
{ ok: true, data: Patient }
```

---

## Appointments (agenda)

> Rotas requerem `Authorization: Bearer <token>`.

### POST /appointments

Cria um agendamento. Status inicial é sempre `triage`.

**Request:**
```typescript
interface CreateAppointmentDto {
  doctorUserId: string;       // UUID do médico
  patientId: string;          // UUID do paciente
  appointmentTime: string;    // ISO 8601 (ex.: "2026-06-01T10:00:00Z")
  name?: string;              // nome alternativo (sobrescreve nome do paciente na exibição)
  priority?: string;
  nature?: string;
  healthCare?: string;
  imageBase64?: string;
}
```

**Response (201):**
```typescript
{ ok: true, data: Appointment }
```

---

### GET /appointments

Lista agendamentos da clínica.

**Query params:**
```
?status=triage|doctor_office|exam_room|reception   (opcional)
?confirmed=true|false                               (opcional)
?finished=true|false                                (opcional)
?dateFrom=ISO8601                                   (opcional, início do intervalo)
?dateTo=ISO8601                                     (opcional, fim do intervalo)
?doctorUserId=uuid                                  (opcional, filtra por médico)
```

**Response (200):**
```typescript
{ ok: true, data: Appointment[] }
```

---

### GET /appointments/:id

Detalhe de um agendamento.

**Response (200):**
```typescript
{ ok: true, data: Appointment }
```

**Erros:**
- `APPOINTMENT_NOT_FOUND` (404)

---

### PATCH /appointments/:id

Atualiza campos editáveis de um agendamento.

**Request:**
```typescript
interface UpdateAppointmentDto {
  confirmed?: boolean;
  name?: string;
  priority?: string;
  nature?: string;
  healthCare?: string;
  imageBase64?: string;
  appointmentTime?: string; // ISO 8601
}
```

**Response (200):**
```typescript
{ ok: true, data: Appointment }
```

---

### PATCH /appointments/:id/status

Aplica uma transição de status. Timestamps são gerenciados automaticamente pelo backend.

**Request:**
```typescript
interface ChangeAppointmentStatusDto {
  status: AppointmentStatus;
}
```

**Response (200):**
```typescript
{ ok: true, data: Appointment }
```

**Erros:**
- `INVALID_STATUS_TRANSITION` (400) — transição não permitida pela máquina de estados.
- `APPOINTMENT_NOT_FOUND` (404)

---

## Permissions (RBAC)

> Rotas de gestão requerem role `clinic_admin`.

### GET /permissions/me

Retorna permissões efetivas do usuário autenticado.

**Response (200):**
```typescript
{ ok: true, data: EffectivePermissions }
```

---

### POST /permissions/roles/:role/permissions

Define as permissões de um role (substitui as existentes).

**Request:**
```typescript
interface SetRolePermissionsDto {
  permissions: AppPermission[];
}
```

**Response (200):**
```typescript
{ ok: true, data: { role: AppRole; permissions: AppPermission[] } }
```

---

### POST /permissions/users/:userId/overrides

Cria ou atualiza overrides de permissão de um usuário específico.

**Request:**
```typescript
interface UserPermissionOverrideDto {
  permission: AppPermission;
  effect: 'allow' | 'deny';
}[]
```

**Response (200):**
```typescript
{ ok: true, data: { userId: string; overrides: UserPermissionOverrideDto[] } }
```

---

### POST /permissions/secretary-access

Vincula uma secretária a médicos específicos (define quais médicos ela pode visualizar/gerenciar).

**Request:**
```typescript
interface SecretaryAccessDto {
  secretaryUserId: string;
  doctorUserIds: string[]; // um ou mais médicos
}
```

**Response (201):**
```typescript
{ ok: true, data: { secretaryUserId: string; doctorUserIds: string[] } }
```

---

## Clinic (gestão de membros pelo admin)

> Rotas requerem role `clinic_admin`.

### GET /clinic/users

Lista todos os membros da clínica.

**Response (200):**
```typescript
{ ok: true, data: StaffMember[] }
```

---

### POST /clinic/users

Cria um usuário e vincula diretamente à clínica.

**Request:**
```typescript
interface CreateClinicUserDto {
  email: string;
  password: string;
  name: string;
  role: AppRole.Doctor | AppRole.Receptionist;
  phone?: string;
  sex?: Sex;
  // Obrigatório se role = doctor
  council?: string;
  councilNumber?: string;
  councilUf?: string;
  specialty?: string;
}
```

**Response (201):**
```typescript
{ ok: true, data: StaffMember }
```

---

### POST /clinic/users/invite

Convida um usuário por email/telefone (envia link ou código de convite).

**Request:**
```typescript
interface InviteUserDto {
  email?: string;
  phone?: string;
  role: AppRole.Doctor | AppRole.Receptionist;
}
```

**Response (201):**
```typescript
{ ok: true, data: { inviteId: string; message: 'Invite sent' } }
```

---

## Códigos de erro semânticos

```typescript
// src/lib/api/error-messages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS:        'Email ou senha incorretos.',
  RECOVERY_TOKEN_INVALID:     'Token de recuperação inválido ou expirado.',
  // Staff / Users
  USER_NOT_FOUND:             'Usuário não encontrado.',
  USER_ALREADY_EXISTS:        'Já existe um usuário com este email.',
  // Patients
  PATIENT_NOT_FOUND:          'Paciente não encontrado.',
  // Appointments
  APPOINTMENT_NOT_FOUND:      'Agendamento não encontrado.',
  INVALID_STATUS_TRANSITION:  'Transição de status inválida.',
  // Clinic
  CLINIC_NOT_FOUND:           'Clínica não encontrada.',
  // Permissions
  FORBIDDEN:                  'Você não tem permissão para esta ação.',
  // Genéricos
  VALIDATION_ERROR:           'Dados inválidos. Verifique os campos e tente novamente.',
  INTERNAL_ERROR:             'Ocorreu um erro inesperado. Tente novamente.',
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}
```
