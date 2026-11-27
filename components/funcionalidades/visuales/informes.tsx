import { MUTED } from '@/components/landing/theme';
import { PanelClaro } from './comunes';
import { LOCALE_MONEDA, MONEDA, formatoMoneda, importeDeMuestra, muestra } from '@/lib/moneda';

// ── Dibujos propios de /funcionalidades/informes-y-rentabilidad ──────────────
// Fuente: lib/decision/margen-clase.ts. El cálculo es exactamente el que se
// pinta aquí:
//   ingresoAsistente → MENSUAL: precio / (frecuencia real × 4.33)
//                      BONO:    precio / sesiones
//                      PUNTUAL: precio del plan
//   costeInstructora → tarifa/hora × duración  (null si no hay tarifa fijada)
//   margen           → ingreso imputado − coste de instructora
//   breakEven        → ceil(coste / precio medio de sesión del estudio)
// Los importes del ejemplo son ilustrativos; la fórmula y las reglas de
// `null` no lo son. Si margen-clase.ts cambia, este dibujo miente.

// Los importes se escriben en euros y en pesos salen con su equivalente de muestra (lib/moneda.ts,
// importeDeMuestra): la fórmula es la misma, las cuentas se hacen con los importes ya convertidos.
const BONO_10 = importeDeMuestra(120);
const MENSUAL = importeDeMuestra(79);
const SUELTA = importeDeMuestra(22);
const BONO_20 = importeDeMuestra(200);
const n0 = (n: number) => n.toLocaleString(LOCALE_MONEDA, { maximumFractionDigits: 0 });
const enMoneda = (n: number) => formatoMoneda(n, MONEDA === 'EUR' ? 2 : 0);

const ASISTENTES = [
  { n: 'Nora', plan: `Bono de 10 · ${muestra(120)}`, regla: `${n0(BONO_10)} / 10`, imputado: BONO_10 / 10 },
  { n: 'Marta', plan: `Mensual ${muestra(79)} · viene 2×/semana`, regla: `${n0(MENSUAL)} / (2 × 4,33)`, imputado: MENSUAL / (2 * 4.33) },
  { n: 'Elena', plan: `Mensual ${muestra(79)} · viene 1×/semana`, regla: `${n0(MENSUAL)} / (1 × 4,33)`, imputado: MENSUAL / 4.33 },
  { n: 'Lucía', plan: `Clase suelta · ${muestra(22)}`, regla: 'precio del plan', imputado: SUELTA },
  { n: 'Ana', plan: `Bono de 20 · ${muestra(200)}`, regla: `${n0(BONO_20)} / 20`, imputado: BONO_20 / 20 },
  { n: 'Sara', plan: `Bono de 10 · ${muestra(120)}`, regla: `${n0(BONO_10)} / 10`, imputado: BONO_10 / 10 },
];

// Cada línea se redondea como se pinta, para que la suma cuadre con lo que se ve.
const redondo = (n: number) => (MONEDA === 'EUR' ? Math.round(n * 100) / 100 : Math.round(n));
const INGRESO = ASISTENTES.reduce((a, x) => a + redondo(x.imputado), 0);
const COSTE = importeDeMuestra(42);
const eur = (n: number) => enMoneda(redondo(n));

export function ComoSeCalculaElMargen() {
  return (
    <PanelClaro
      titulo="Reformer · martes 19:00 · 60 min"
      nota="Ninguna de las seis paga lo mismo por estar en esa clase, y ese es justo el dato que un ingreso mensual agregado esconde. El coste sale de la tarifa/hora real de quien la dio, no de una media."
    >
      <div style={{ display: 'grid', gap: 9, marginBottom: 18 }}>
        {ASISTENTES.map((a) => (
          <div key={a.n} style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', background: '#F4F9F6', border: '1px solid #E3EEE8', borderRadius: 11, padding: '11px 14px' }}>
            <span style={{ fontSize: 14, fontWeight: 700, minWidth: 52 }}>{a.n}</span>
            <span style={{ fontSize: 13, color: MUTED, flex: 1, minWidth: 190 }}>{a.plan}</span>
            <span className="lp-mono" style={{ fontSize: 11.5, color: '#62736A' }}>{a.regla}</span>
            <span className="lp-mono" style={{ fontSize: 13, fontWeight: 500, color: '#214E36', minWidth: 62, textAlign: 'right' }}>{eur(a.imputado)}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#0A2014', borderRadius: 14, padding: '18px 20px', color: '#E1EBE6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#A9BDB0', marginBottom: 7 }}>
          <span>Ingreso imputado · 6 asistentes</span>
          <span className="lp-mono" style={{ color: '#fff' }}>{eur(INGRESO)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#A9BDB0', marginBottom: 12 }}>
          <span>Coste de instructora · {muestra(42)}/h × 1 h</span>
          <span className="lp-mono" style={{ color: '#E0785F' }}>−{eur(COSTE)}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: '#A9BDB0' }}>Margen sobre coste de instructora</span>
          <span style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.03em', color: '#8FB8A0' }}>{eur(INGRESO - COSTE)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,.55)', gap: 12 }}>
          {/* El punto de equilibrio NO se calcula con los seis de arriba: usa el
              precio medio por sesión del ESTUDIO, para que sea comparable entre
              clases con mezclas de plan distintas. Se dice en la etiqueta para
              que nadie intente cuadrarlo con las cifras de la tabla. */}
          <span>Punto de equilibrio · al precio medio por sesión del estudio</span>
          <span className="lp-mono" style={{ whiteSpace: 'nowrap' }}>3 asistentes</span>
        </div>
      </div>
    </PanelClaro>
  );
}

export function LoQueNoEntraEnElMargen() {
  const filas = [
    { t: 'Coste de sala', d: 'El esquema no tiene alquiler ni coste/hora de sala. Se omite en vez de aproximarlo a ojo — por eso la cifra se llama «margen sobre coste de instructora» y nunca «margen total».' },
    { t: 'Instructora sin tarifa fijada', d: 'El coste y el margen salen «—», no cero. Un cero falsearía el margen al alza y haría parecer rentable una clase que no se ha medido.' },
    { t: 'Quien no se presentó', d: 'Un no-show no cuenta como ingreso de esa clase. El informe lo trata como señal de retención, que es otra pregunta.' },
  ];
  return (
    <PanelClaro
      titulo="Lo que el margen NO incluye"
      nota="Un informe de rentabilidad que redondea los huecos hacia arriba es peor que no tenerlo: te hace subir precios donde no toca. Estos tres límites están escritos en el propio cálculo."
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {filas.map((f) => (
          <div key={f.t} style={{ display: 'flex', gap: 12, background: '#FBF6F4', border: '1px solid #F0DED8', borderRadius: 12, padding: '13px 15px' }}>
            <span style={{ flexShrink: 0, color: '#C2503A', fontWeight: 800, fontSize: 14, marginTop: 1 }}>−</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#7A2E1F', marginBottom: 3 }}>{f.t}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#6A4238' }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </PanelClaro>
  );
}
