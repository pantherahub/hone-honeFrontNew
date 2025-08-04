import { pluralize } from "../utils/string-utils"

export const GLOBAL_ERROR_MESSAGES: { [key: string]: (error?: any) => string } = {
  // Angular errors
  required: () => 'Este campo es requerido.',
  email: () => 'Ingresa un correo válido.',
  minlength: (e) => `Mínimo ${e.requiredLength} ${pluralize('carácter', 'caracteres', e.requiredLength)}.`,
  maxlength: (e) => `Máximo ${e.requiredLength} ${pluralize('carácter', 'caracteres', e.requiredLength)}.`,
  pattern: () => 'Formato inválido.',

  // Custom errors
  minArrayLength: (e) => `Debe seleccionar al menos ${e.requiredLength}.`,
  maxArrayLength: (e) => `Puede seleccionar máximo ${e.requiredLength}.`,
  invalidNumber: () => `Solo se permiten números.`,
  invalidAlphanumeric: () => `Debe ser alfanumérico.`,
  invalidAlphanumWithSpaces: () => `Debe ser alfanumérico.`,
  invalidTelNumber: () => `Ingresa un número válido.`,
  invalidUrl: () => `Ingresa una url válida.`,
  invalidEmail: () => `Ingresa un correo válido.`,

  // Date range
  startDateRequired: () => `Este campo es requerido.`,
  endDateRequired: () => `Este campo es requerido.`,
  invalidStartDate: () => `La fecha no puede ser posterior a hoy.`,
  invalidEndDate: () => `La fecha no puede ser posterior a hoy.`,
  invalidDateRange: () => `La fecha de fin no puede ser menor a la fecha de inicio.`,
};
