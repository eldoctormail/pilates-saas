// Botón de arrepentimiento y Botón de baja de servicio (Argentina, Disposición 954/2025).
//
// Quien compró o contrató a distancia lo pide desde /reservar/<slug>/arrepentimiento o /baja,
// SIN registrarse ni ningún otro trámite (lo exige la norma). Se guarda en `pedidos_consumidor`,
// se avisa al mostrador y se contesta con el código de constancia, que la página enseña en el acto.
//
// Orden: límites por IP → trampa → validar → estudio → página oculta → topes por estudio y buzón →
// GUARDAR → avisar. Sin captcha a propósito: la norma no deja poner trabas, y los límites y la
// trampa bastan para un formulario que no manda nada a direcciones de terceros.
//
// Lo que NO hace:
// - No da de baja ni devuelve nada sola: eso lo decide y lo hace el estudio (el pedido es la prueba).
// - No manda correo a la dirección escrita salvo que sea la de una ficha del estudio: mandar a una
//   dirección cualquiera es el vector de abuso que ya cerró /api/public/contacto.
// - No registra el cuerpo en los logs (datos de terceros).

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { Resend } from 'resend';
import { enforceRateLimit, rateLimit } from '@/lib/rate-limit';
import { getSupabaseAdmin } from '@/lib/db/supabase-admin';
import { resolverStudioPorSlug } from '@/lib/db/supabase-data-admin';
import { CAMPO_TRAMPA, cayoEnLaTrampa } from '@/lib/auth/trampa-bots';
import { paginaCerradaParaPeticion } from '@/lib/publico/pagina-cerrada-peticion';
import { buzonCanonico } from '@/lib/recursos/descargas';
import { emitirPedidoConsumidor } from '@/lib/notifications/emit';
import { botonesConsumidorActivos, leerPedido, NOMBRE_BOTON, nuevoCodigo, textoConstancia, type TipoPedido } from '@/lib/consumidor/pedidos';
import { remitentePorMarca } from '@/lib/emails/remitente';
import { escaparLike } from '@/lib/escapar-like';
import { escaparHtml } from '@/lib/emails/html';
import { esDominioReservado } from '@/lib/emails/dominios-reservados';

const SIN_SERVICIO = 'No pudimos registrar tu pedido ahora mismo. Probá de nuevo en un rato o pedilo directamente en el estudio.';
const TOPE_ESTUDIO_DIARIO = 50;
const TOPE_BUZON_DIARIO = 5;

export async function POST(req: NextRequest) {
  if (!botonesConsumidorActivos()) return NextResponse.json({ error: 'No disponible' }, { status: 404 });

  const limitado =
    (await enforceRateLimit(req, 'public-pedido-consumidor', { max: 5, windowSeconds: 600 })) ??
    (await enforceRateLimit(req, 'public-pedido-consumidor-dia', { max: 20, windowSeconds: 86_400 }));
  if (limitado) return limitado;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Petición no válida' }, { status: 400 });
  // Un bot que rellena el campo invisible recibe un código falso y no se guarda nada.
  if (cayoEnLaTrampa(body[CAMPO_TRAMPA])) {
    const tipo: TipoPedido = body.tipo === 'BAJA' ? 'BAJA' : 'ARREPENTIMIENTO';
    return NextResponse.json({ codigo: nuevoCodigo(tipo), creadoEn: new Date().toISOString() }, { status: 201 });
  }

  const v = leerPedido(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const p = v.pedido;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: SIN_SERVICIO }, { status: 503 });
  const estudio = await resolverStudioPorSlug(db, p.slug);
  if (!estudio) return NextResponse.json({ error: 'Estudio no encontrado' }, { status: 404 });
  const studioId = estudio.row.id as string;
  const nombreEstudio = (estudio.row.nombre as string | null) || 'el estudio';
  const cerrada = await paginaCerradaParaPeticion(req, studioId);
  if (cerrada) return cerrada;

  const porBuzon = await rateLimit(`pedido-consumidor-buzon:${studioId}:${buzonCanonico(p.email)}`, { max: TOPE_BUZON_DIARIO, windowSeconds: 86_400 });
  if (!porBuzon.allowed) {
    return NextResponse.json({ error: 'Ya registraste varios pedidos hoy. El estudio te va a responder; si necesitás, pedilo en el estudio.' }, { status: 429 });
  }
  const porEstudio = await rateLimit(`pedido-consumidor-estudio:${studioId}`, { max: TOPE_ESTUDIO_DIARIO, windowSeconds: 86_400 });
  if (!porEstudio.allowed) {
    Sentry.captureMessage('[public:pedido-consumidor] tope diario alcanzado en un estudio: posible abuso', {
      level: 'warning', tags: { modulo: 'consumidor' }, extra: { studioId },
    });
    return NextResponse.json({ error: SIN_SERVICIO }, { status: 503 });
  }

  // ¿Es de una ficha del estudio? Solo para enlazarlo y para saber si se le puede escribir.
  const { data: socia } = await db.from('socios').select('id, email')
    .eq('studio_id', studioId).ilike('email', escaparLike(p.email)).is('borrado_en', null).limit(1).maybeSingle();

  // El código es único en toda la tabla: en el rarísimo choque, otro.
  type Fila = { id: string; codigo: string; creado_en: string };
  let fila = null as Fila | null;
  for (let intento = 0; intento < 3 && !fila; intento++) {
    const { data, error } = await db.from('pedidos_consumidor').insert({
      codigo: nuevoCodigo(p.tipo), studio_id: studioId, tipo: p.tipo, nombre: p.nombre, email: p.email,
      telefono: p.telefono, documento: p.documento, detalle: p.detalle, socio_id: (socia?.id as string | undefined) ?? null,
    }).select('id, codigo, creado_en').single();
    if (data) fila = data as Fila;
    else if ((error as { code?: string } | null)?.code !== '23505') {
      console.error('[public:pedido-consumidor] no se pudo guardar', (error as { code?: string } | null)?.code);
      return NextResponse.json({ error: SIN_SERVICIO }, { status: 503 });
    }
  }
  if (!fila) return NextResponse.json({ error: SIN_SERVICIO }, { status: 503 });

  await emitirPedidoConsumidor({ studioId, pedidoId: fila.id, codigo: fila.codigo, tipo: p.tipo });
  if (socia?.email) {
    await enviarConstancia({
      to: socia.email as string, nombre: p.nombre, nombreEstudio,
      emailEstudio: (estudio.row.email as string | null) ?? null, tipo: p.tipo, codigo: fila.codigo, creadoEn: fila.creado_en,
    });
  }

  return NextResponse.json({ codigo: fila.codigo, creadoEn: fila.creado_en }, { status: 201 });
}

/** La constancia por correo, además de en pantalla: solo a la dirección de la ficha. Best-effort. */
async function enviarConstancia(d: {
  to: string; nombre: string; nombreEstudio: string; emailEstudio: string | null; tipo: TipoPedido; codigo: string; creadoEn: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_XXXX') || esDominioReservado(d.to)) return;
  const cuando = new Date(d.creadoEn).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'long', timeStyle: 'short' });
  const html = `<p>Hola ${escaparHtml(d.nombre)}:</p>
<p>${escaparHtml(textoConstancia(d.tipo, d.codigo, d.nombreEstudio))}</p>
<p><strong>${escaparHtml(NOMBRE_BOTON[d.tipo])}</strong> · código <strong>${escaparHtml(d.codigo)}</strong> · ${escaparHtml(cuando)}</p>
<p>El estudio te va a responder por este medio.</p>`;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: remitentePorMarca(d.nombreEstudio),
      to: [d.to],
      ...(d.emailEstudio ? { replyTo: d.emailEstudio } : {}),
      subject: `Constancia de tu pedido ${d.codigo}`,
      html,
    }, { idempotencyKey: `pedido-consumidor:${d.codigo}` });
    if (error) console.error('[public:pedido-consumidor] la constancia por correo no salió', error.name);
  } catch (e) {
    console.error('[public:pedido-consumidor] la constancia por correo no salió', e instanceof Error ? e.name : 'error');
  }
}
