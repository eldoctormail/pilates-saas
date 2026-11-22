// SOAP mínimo para WSAA y WSFEv1: armar el sobre y leer la respuesta.
//
// Las respuestas de ARCA son XML simple y predecible; leerlas con un parser
// completo sería una dependencia más para tres etiquetas. Se ignoran los
// prefijos de espacio de nombres (`<soap:Body>`, `<CAE>`, `<ns1:token>`).

export function escaparXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function desescaparXml(s: string): string {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&');
}

const nombreRe = (nombre: string) => `<(?:[\\w-]+:)?${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[\\w-]+:)?${nombre}>`;

/** El contenido de la primera etiqueta con ese nombre, o null. */
export function etiqueta(xml: string, nombre: string): string | null {
  const m = new RegExp(nombreRe(nombre)).exec(xml);
  return m ? m[1] : null;
}

/** El contenido de todas las etiquetas con ese nombre. */
export function etiquetas(xml: string, nombre: string): string[] {
  return [...xml.matchAll(new RegExp(nombreRe(nombre), 'g'))].map(m => m[1]);
}

/** Texto de una etiqueta, sin espacios alrededor y desescapado. */
export function texto(xml: string, nombre: string): string | null {
  const v = etiqueta(xml, nombre);
  return v === null ? null : desescaparXml(v.trim());
}

/** Un objeto plano → XML (`{ A: 1, B: { C: 2 } }` → `<A>1</A><B><C>2</C></B>`). Los arrays repiten la etiqueta. */
export function aXml(obj: Record<string, unknown>, prefijo = 'ar'): string {
  return Object.entries(obj).map(([k, v]) => {
    if (v === undefined || v === null) return '';
    if (Array.isArray(v)) return v.map(x => `<${prefijo}:${k}>${typeof x === 'object' ? aXml(x as Record<string, unknown>, prefijo) : escaparXml(String(x))}</${prefijo}:${k}>`).join('');
    if (typeof v === 'object') return `<${prefijo}:${k}>${aXml(v as Record<string, unknown>, prefijo)}</${prefijo}:${k}>`;
    return `<${prefijo}:${k}>${escaparXml(String(v))}</${prefijo}:${k}>`;
  }).join('');
}

export type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

export class ArcaSinRespuesta extends Error {
  readonly causa: string;
  constructor(causa: string) {
    super(`ARCA no contestó: ${causa}`);
    this.causa = causa;
  }
}

/** Manda un sobre SOAP 1.1. Sin respuesta (red, timeout) lanza ArcaSinRespuesta; un Fault se devuelve como texto. */
export async function llamarSoap(f: Fetch, url: string, accion: string, sobre: string, timeoutMs = 30_000): Promise<{ status: number; xml: string }> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await f(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"${accion}"` },
      body: sobre,
      signal: ctl.signal,
    });
    return { status: res.status, xml: await res.text() };
  } catch (err) {
    throw new ArcaSinRespuesta(err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(t);
  }
}

/** El mensaje de un SOAP Fault, si lo hay. */
export function fault(xml: string): string | null {
  if (!etiqueta(xml, 'Fault')) return null;
  return texto(xml, 'faultstring') ?? 'Error de ARCA';
}
