import { DollarSign, Euro } from 'lucide-react';
import { MONEDA } from '@/lib/moneda';

/**
 * El ícono de «dinero» con la moneda del estudio: «€» en euros y «$» en pesos
 * (y en el resto de monedas con signo $). Mismas props que un ícono de lucide.
 */
export const IconoMoneda = MONEDA === 'EUR' ? Euro : DollarSign;
