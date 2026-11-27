// «12 €» o «12,50 €» («$ 63.000» en pesos): enteros sin decimales y con separador de miles. Una sola copia para los textos de clientas y de
// cuotas (había tres idénticas). Las pantallas de la alumna tienen su propio formato en lib/student/formato.ts.
import { formatoMoneda } from '../moneda.ts';
export const euros = (n: number) => formatoMoneda(n, 'auto');
