// La pasarela con la que el estudio cobra online, para los textos y enlaces del
// producto: Mercado Pago con el formato de Argentina, Stripe con el de España
// (y en los tests, que corren en es-ES). Sirve para no escribir «Stripe» a mano
// en lo que ve el estudio o la alumna.

import { pasarelaEsMercadoPago } from './mercadopago/config.ts';

export const CON_MERCADOPAGO: boolean = pasarelaEsMercadoPago();

/** «Mercado Pago» o «Stripe». */
export const NOMBRE_PASARELA: string = CON_MERCADOPAGO ? 'Mercado Pago' : 'Stripe';

/** Dónde se conecta la cuenta de cobro online desde el panel. */
export const HREF_CONECTAR_PASARELA: string = CON_MERCADOPAGO
  ? '/apps/integraciones?pestana=mercadopago'
  : '/configuracion?tab=conexiones#integracion-stripe';
