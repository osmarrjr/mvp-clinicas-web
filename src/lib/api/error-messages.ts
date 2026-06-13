export const ERROR_MESSAGES: Record<string, string> = {
  // Auth — login e sessão
  LOGIN_FAILED: "E-mail ou senha incorretos.",
  EMAIL_NOT_VERIFIED:
    "E-mail não verificado. Confirme o código enviado para seu e-mail.",
  CLINIC_NOT_VERIFIED:
    "Clínica não verificada. Confirme o código enviado para seu e-mail.",
  PASSWORD_CHANGE_REQUIRED:
    "É necessário alterar a senha antes de continuar.",
  AUTH_MISSING: "Sessão inválida. Faça login novamente.",
  AUTH_INVALID: "Sessão inválida ou expirada. Faça login novamente.",
  AUTH_CREATE_FAILED:
    "Não foi possível criar a conta. Verifique os dados e tente novamente.",
  PASSWORD_POLICY_VIOLATION:
    "A senha não atende aos requisitos de segurança.",
  PASSWORD_CHANGE_FAILED:
    "Não foi possível alterar a senha. Tente novamente.",
  OAUTH_URL_FAILED:
    "Não foi possível iniciar o login com Google. Tente novamente.",

  // Auth — verificação de e-mail
  VERIFICATION_TOKEN_INVALID: "Código de verificação inválido.",
  VERIFICATION_TOKEN_EXPIRED:
    "O código de verificação expirou. Solicite um novo.",
  VERIFICATION_TOKEN_LOCKED:
    "Muitas tentativas incorretas. Solicite um novo código.",
  VERIFICATION_PROFILE_NOT_FOUND: "Perfil do usuário não encontrado.",
  VERIFICATION_CONFIRM_FAILED:
    "Não foi possível confirmar o e-mail. Tente novamente.",
  VERIFICATION_CLINIC_UPDATE_FAILED:
    "Não foi possível ativar a clínica. Tente novamente.",
  VERIFICATION_LOOKUP_FAILED:
    "Não foi possível verificar o código. Tente novamente.",
  VERIFICATION_TOKEN_PERSIST_FAILED:
    "Não foi possível enviar o código de verificação. Tente novamente.",

  // Auth — recuperação de senha
  RECOVERY_TARGET_MISSING:
    "Informe o e-mail ou telefone conforme o canal escolhido.",
  RECOVERY_EMAIL_REQUIRED:
    "O e-mail é obrigatório para identificar sua conta.",
  RECOVERY_LOOKUP_FAILED:
    "Não foi possível processar a recuperação de senha. Tente novamente.",
  RECOVERY_TOKEN_PERSIST_FAILED:
    "Não foi possível enviar o link de recuperação. Tente novamente.",
  RECOVERY_TOKEN_INVALID: "Token de recuperação inválido.",
  RECOVERY_TOKEN_USED: "Este token de recuperação já foi utilizado.",
  RECOVERY_TOKEN_EXPIRED:
    "O token de recuperação expirou. Solicite um novo.",
  RECOVERY_RESET_FAILED:
    "Não foi possível redefinir a senha. Tente novamente.",

  // Onboarding / clínica
  INVALID_TAX_ID:
    "Informe o tipo do documento (CPF ou CNPJ) quando o número não tiver 11 ou 14 dígitos.",
  CLINIC_CREATE_FAILED: "Não foi possível criar a clínica. Tente novamente.",
  CLINIC_NOT_FOUND:
    "Não foi possível identificar a clínica. Faça login novamente.",
  MEMBERSHIP_CREATE_FAILED:
    "Não foi possível vincular o usuário à clínica. Tente novamente.",
  PROFILE_CREATE_FAILED:
    "Não foi possível criar o perfil do usuário. Tente novamente.",
  RBAC_ASSIGN_FAILED:
    "Não foi possível definir as permissões do usuário. Tente novamente.",

  // Staff
  STAFF_FORBIDDEN:
    "Apenas administradores da clínica podem gerenciar a equipe.",
  STAFF_LIST_FAILED: "Não foi possível listar a equipe. Tente novamente.",
  INVALID_CPF: "CPF inválido.",
  PROFESSIONAL_PROFILE_CREATE_FAILED:
    "Não foi possível criar o perfil profissional. Tente novamente.",

  // Patients
  PATIENT_CREATE_FAILED:
    "Não foi possível cadastrar o paciente. Tente novamente.",
  PATIENTS_LIST_FAILED: "Não foi possível listar os pacientes. Tente novamente.",
  PATIENT_GET_FAILED: "Não foi possível buscar o paciente. Tente novamente.",
  PATIENT_NOT_FOUND: "Paciente não encontrado.",
  PATIENT_UPDATE_FAILED:
    "Não foi possível atualizar o paciente. Tente novamente.",

  // Appointments
  APPOINTMENT_CREATE_FAILED:
    "Não foi possível criar o agendamento. Tente novamente.",
  APPOINTMENTS_LIST_FAILED:
    "Não foi possível listar os agendamentos. Tente novamente.",
  APPOINTMENT_GET_FAILED:
    "Não foi possível buscar o agendamento. Tente novamente.",
  APPOINTMENT_NOT_FOUND: "Agendamento não encontrado.",
  APPOINTMENT_UPDATE_FAILED:
    "Não foi possível atualizar o agendamento. Tente novamente.",
  APPOINTMENT_STATUS_UPDATE_FAILED:
    "Não foi possível atualizar o status do agendamento. Tente novamente.",
  INVALID_STATUS_TRANSITION: "Esta mudança de status não é permitida.",

  // Infraestrutura / frontend
  VALIDATION_ERROR:
    "Dados inválidos. Verifique os campos e tente novamente.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
  NETWORK_ERROR: "Erro de conexão com o servidor.",
  ENV_ERROR: "Serviço temporariamente indisponível.",
  REGISTER_ERROR: "Não foi possível concluir o cadastro.",
  LOGIN_ERROR: "Não foi possível realizar o login.",
  INVALID_JSON: "Corpo da requisição inválido.",
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? ERROR_MESSAGES.INTERNAL_ERROR;
}
