/**
 * Estilo padrão de campos desabilitados.
 * Referência visual: SearchableSelect desabilitado (ex.: campo Cidade).
 */
export const disabledFieldClassName =
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Controles nativos (input, textarea) também bloqueiam interação.
 */
export const disabledFormControlClassName = `${disabledFieldClassName}`;
