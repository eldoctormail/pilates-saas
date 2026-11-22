// El «pago con el móvil» del mostrador según la región.
//
// En España es Bizum; en Argentina, Mercado Pago (QR, link o transferencia desde
// la app). Con la pasarela de Mercado Pago encendida o la moneda en pesos, las
// pantallas de cobro a mano ofrecen «Mercado Pago» en el hueco de Bizum. Los dos
// métodos siguen siendo válidos en el servidor (METODOS_COBRO_MANUAL): cambia lo
// que se ofrece, no lo que se acepta.

import { MONEDA } from '../moneda.ts';
import { pasarelaEsMercadoPago } from '../mercadopago/config.ts';

export type MetodoMovil = 'BIZUM' | 'MERCADOPAGO';

export const METODO_MOVIL: { metodo: MetodoMovil; etiqueta: string; frase: string } =
  pasarelaEsMercadoPago() || MONEDA === 'ARS'
    ? { metodo: 'MERCADOPAGO', etiqueta: 'Mercado Pago', frase: 'por Mercado Pago' }
    : { metodo: 'BIZUM', etiqueta: 'Bizum', frase: 'por Bizum' };
