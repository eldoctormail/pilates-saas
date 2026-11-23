// Topes de lo que se paga al equipo. Los mismos que la base de datos
// (migr 20261123210000): pensados para pesos, donde una hora pasa de mil.

/** Tarifa por hora: hasta 9.999.999,99. */
export const TARIFA_HORA_MAX = 9_999_999.99;
/** Base mensual de una liquidación: hasta 9.999.999.999,99 (numeric(12,2)). */
export const BASE_MENSUAL_MAX = 9_999_999_999.99;
