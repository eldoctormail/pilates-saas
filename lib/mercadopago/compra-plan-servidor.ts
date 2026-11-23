// Compra de un PLAN con Mercado Pago (autoalojado, Etapa 2): qué se cobra y a
// quién, decidido en el servidor con las MISMAS piezas que la rama de plan de
// `/api/stripe/checkout`, en el mismo orden:
//
//   página cerrada → sesión de la alumna (obligatoria: Etapa 2 es la app) →
//   preguntas del alta → plan del estudio y activo → clase de prueba (sin
//   clase, no se vende) → cobro proporcional de la cuota → código de descuento
//   (sin códigos en una prueba; ignorado si deja la cuota prorrateada por
//   debajo del mínimo) → condiciones (casilla si el estudio las reescribió) y
//   su huella → importe mínimo → matrícula de la primera vez (con la plaza de
//   la promoción reservada lo más tarde posible).
//
// Lo que sale de aquí se guarda en `compras_mercadopago` y es lo que el webhook
// entrega: nada de lo que decide el importe viaja por Mercado Pago.
//
// Con `sesionId` es «pagar y reservar»: además se comprueba la clase con las
// MISMAS validaciones que la rama de clase de Stripe (viva, cubierta por el
// plan, apertura suave, ventana de reserva, sin precio especial, con plaza) y
// el pago caduca cuando se cierra la reserva de la clase.
//
// Sin cabecera Authorization y con `invitada` es la compra SIN cuenta (desde
// /reservar o el widget de la web): la ficha la crea la entrega con el email y el
// nombre del formulario, con las mismas reglas que Stripe (`compra_publica_modo`
// sin clase; con clase, siempre). Con cabecera, la identidad sale SIEMPRE del
// token: quien entra con su sesión nunca compra como invitada.

import 'server-only';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';
import { verificarUsuarioSupabase } from '../auth-server.ts';
import { cierreDeReserva, comprobarPlazaAntesDeCobrar, comprobarVentanaReserva, socioAutenticado } from '../db/supabase-data-admin.ts';
import { cierreAperturaSuave, MENSAJE_APERTURA_SUAVE } from '../opening/apertura-suave.ts';
import { planDeClaseSuelta } from '../reservas/clase-suelta.ts';
import { hidratarTiposDePlanes, mapPlanTarifa } from '../supabase-data.ts';
import { bloqueoPorPreguntasAlta } from '../db/preguntas-alta-admin.ts';
import { paginaCerradaParaPeticion } from '../publico/pagina-cerrada-peticion.ts';
import { rechazoCompraPrueba } from '../billing/clase-prueba.ts';
import { cobroCuotaOnline } from '../billing/cobro-cuota-online.ts';
import { resolverDescuentoCheckout } from '../billing/descuento-checkout.ts';
import { esSociaNueva } from '../billing/socia-nueva.ts';
import { codigosYaUsadosPorSocia } from '../billing/codigos-ya-usados.ts';
import { primeraVezConPlan, reservarMatricula, liberarCupoMatriculaUnaVez } from '../billing/matricula-online.ts';
import { mapCodigoDescuento } from '../supabase-data.ts';
import type { RowCodigosDescuento, RowPlanesTarifa } from '../db-types.ts';
import { leerDatosInvitada, type DatosInvitada } from './invitada.ts';
import { IMPORTE_MINIMO_EUR, tienePrecioEspecial } from '../reservar/opciones-de-clase.ts';

import { caducidadDeCompra } from './caducidad.ts';
export { caducidadDeCompra } from './caducidad.ts';

export type Rechazo = { status: number; error: string; codigo?: string; necesitaRegistro?: boolean; posicionEspera?: number };

export interface CompraDecidida {
  /** null = invitada: la ficha la crea la entrega (`esInvitada`). */
  socioId: string | null;
  email: string | null;
  /** Compra sin cuenta: lo que escribió en el formulario. */
  invitada: DatosInvitada | null;
  planId: string;
  planNombre: string;
  /** Lo que se cobra por el plan (con código y prorrateo), sin la matrícula. */
  importePlan: number;
  /** Matrícula que se cobra en el mismo pago (0 si no hay o la cubre la promoción). */
  matricula: number;
  /** Se reservó una plaza de matrícula gratis: si la compra caduca, se devuelve. */
  cupoMatriculaReservado: boolean;
  codigoDescuentoId: string | null;
  codigoAplicado: boolean;
  descuento: number;
  terminosHash: string | null;
  cicloFin: string | null;
  cuotaTexto: string | null;
  cuotaFrase: string | null;
  /** La clase que se paga y reserva con la compra (null = solo el plan). */
  sesionId: string | null;
  spotId: string | null;
  /** Cuándo se cierra la reserva de esa clase (null sin clase). */
  cierreClase: Date | null;
}

export interface PeticionCompra {
  studioId: string;
  planId: string;
  codigoDescuento?: string | null;
  aceptaCondiciones?: boolean;
  /** «Pagar y reservar»: la clase y, si la sala tiene mapa, el sitio. */
  sesionId?: string | null;
  spotId?: string | null;
  /** Compra sin cuenta: el cuerpo de la petición, para `leerDatosInvitada`. Solo cuenta sin cabecera Authorization. */
  invitada?: Record<string, unknown> | null;
}

/** Decide la compra o la rechaza. NO reserva la plaza de matrícula (ver `reservarMatriculaDeCompra`). */
export async function decidirCompraDePlan(
  admin: SupabaseClient, req: NextRequest, p: PeticionCompra,
): Promise<{ ok: true; compra: Omit<CompraDecidida, 'matricula' | 'cupoMatriculaReservado'>; matriculaCatalogo: number } | { ok: false; rechazo: Rechazo }> {
  const cerrada = await paginaCerradaParaPeticion(req, p.studioId);
  if (cerrada) {
    const cuerpo = await cerrada.json().catch(() => ({})) as { error?: string };
    return { ok: false, rechazo: { status: cerrada.status, error: cuerpo.error ?? 'El estudio no acepta compras ahora.' } };
  }

  // La identidad sale del JWT, nunca del cuerpo (mismo criterio que Stripe).
  let socioId: string | null = null;
  let emailSesion: string | null = null;
  let invitada: DatosInvitada | null = null;
  // Sin sesión y sin datos con los que crear la ficha (comprar un plan en /reservar sin haber entrado):
  // Stripe pide el email en su página; aquí se pide entrar antes.
  if (!req.headers.get('authorization') && !p.invitada) {
    return { ok: false, rechazo: { status: 409, error: 'Entra con tu email para comprar. No te hemos cobrado nada.', necesitaRegistro: true } };
  }
  if (req.headers.get('authorization')) {
    const usuario = await verificarUsuarioSupabase(req);
    if (!usuario) return { ok: false, rechazo: { status: 401, error: 'Tu sesión ha caducado. Vuelve a entrar: no se te ha cobrado nada.' } };
    socioId = await socioAutenticado(usuario.userId, p.studioId);
    if (!socioId) return { ok: false, rechazo: { status: 403, error: 'No autorizado' } };
    emailSesion = usuario.email ?? null;

    const sinPreguntas = await bloqueoPorPreguntasAlta(p.studioId, socioId, 'comprar');
    if (sinPreguntas) {
      const cuerpo = await sinPreguntas.json().catch(() => ({})) as { error?: string; codigo?: string };
      return { ok: false, rechazo: { status: sinPreguntas.status, error: cuerpo.error ?? 'Antes de comprar, contesta las preguntas del estudio.', codigo: cuerpo.codigo } };
    }
  } else {
    const leida = leerDatosInvitada(p.invitada ?? {});
    if (!leida.ok) return { ok: false, rechazo: { status: 400, error: leida.error } };
    invitada = leida.datos;
    // Comprar un plan sin ficha lo decide el estudio; pagar y reservar UNA clase, siempre (como Stripe).
    if (!p.sesionId) {
      const { data: cfg } = await admin.from('studios').select('compra_publica_modo').eq('id', p.studioId).maybeSingle();
      if ((cfg?.compra_publica_modo ?? 'EXIGIR_REGISTRO') === 'EXIGIR_REGISTRO') {
        return { ok: false, rechazo: { status: 409, error: 'Regístrate antes de comprar: te pedimos el email y aceptar las condiciones.', necesitaRegistro: true } };
      }
    }
  }

  const { data: plan, error } = await admin
    .from('planes_tarifa')
    .select('nombre, precio, studio_id, activo, matricula, tipo, es_prueba, periodicidad_meses')
    .eq('id', p.planId)
    .maybeSingle();
  if (error) return { ok: false, rechazo: { status: 503, error: 'No hemos podido leer el plan. Inténtalo en un momento.' } };
  if (!plan) return { ok: false, rechazo: { status: 404, error: 'Plan no encontrado' } };
  if (plan.studio_id !== p.studioId) return { ok: false, rechazo: { status: 403, error: 'Ese plan no pertenece a este estudio' } };
  if (!plan.activo) return { ok: false, rechazo: { status: 409, error: 'Ese plan ya no está disponible' } };

  let email: string | null = invitada?.email ?? null;
  if (socioId) {
    const { data: socio } = await admin.from('socios').select('email').eq('id', socioId).eq('studio_id', p.studioId).maybeSingle();
    email = ((socio?.email as string | null) ?? emailSesion ?? '').trim().toLowerCase() || null;
  }

  const sesionId = p.sesionId || null;
  const spotId = sesionId ? (p.spotId || null) : null;
  let cierreClase: Date | null = null;
  if (sesionId) {
    const clase = await comprobarClase(admin, { studioId: p.studioId, planId: p.planId, socioId, email, sesionId, spotId });
    if (!clase.ok) return { ok: false, rechazo: clase.rechazo };
    cierreClase = clase.cierre;
  }

  // Clase de prueba: sin clase concreta no se vende (es la regla de los dos checkouts).
  const rechazoPrueba = await rechazoCompraPrueba(admin, {
    studioId: p.studioId, plan: { es_prueba: plan.es_prueba, precio: plan.precio }, socioId, email, sesionId,
  });
  if (rechazoPrueba) return { ok: false, rechazo: { status: rechazoPrueba.status, error: rechazoPrueba.error, codigo: rechazoPrueba.codigo } };

  let importe = Number(plan.precio);
  let cicloFin: string | null = null;
  let cuotaTexto: string | null = null;
  let cuotaFrase: string | null = null;
  let prorrateada = false;
  const cobroCuota = await cobroCuotaOnline(admin, {
    studioId: p.studioId, planId: p.planId,
    plan: { tipo: plan.tipo as string, precio: Number(plan.precio), periodicidad_meses: plan.periodicidad_meses as number | null },
    socioId, conSesion: sesionId !== null, conRecibo: false,
  });
  if (cobroCuota.tipo === 'rechazo') return { ok: false, rechazo: { status: cobroCuota.status, error: cobroCuota.error, codigo: cobroCuota.codigo } };
  if (cobroCuota.tipo === 'prorrateo') {
    importe = cobroCuota.importe;
    cicloFin = cobroCuota.pr.fechaFin;
    cuotaTexto = cobroCuota.pr.texto;
    cuotaFrase = cobroCuota.pr.frase;
    prorrateada = true;
  }

  let codigoDescuentoId: string | null = null;
  let descuento = 0;
  if (p.codigoDescuento && plan.es_prueba !== true) {
    const { data: codigosRaw } = await admin.from('codigos_descuento').select('*').eq('studio_id', p.studioId);
    const codigos = (codigosRaw ?? []).map(r => mapCodigoDescuento(r as RowCodigosDescuento));
    const resultado = resolverDescuentoCheckout(codigos, p.codigoDescuento, {
      hoyISO: new Date().toISOString(),
      subtotal: importe,
      esNueva: await esSociaNueva(admin, p.studioId, socioId, email),
      codigosYaUsados: await codigosYaUsadosPorSocia(admin, socioId),
    });
    const dejaMuyBajo = prorrateada && Math.round((importe - (resultado.ok ? resultado.descuento : 0)) * 100) < 50;
    if (resultado.ok && !dejaMuyBajo) {
      const antes = importe;
      importe = Math.max(0, Math.round((importe - resultado.descuento) * 100) / 100);
      descuento = Math.round((antes - importe) * 100) / 100;
      const aplicado = codigos.find(c => c.codigo.trim().toUpperCase() === p.codigoDescuento!.trim().toUpperCase());
      codigoDescuentoId = aplicado?.id ?? null;
    }
  }

  const { sellarCondicionesVigentes } = await import('../legal-sellado.ts');
  const { exigeAceptacionExplicita } = await import('../legal-aceptacion.ts');
  if (await exigeAceptacionExplicita(admin, p.studioId) && p.aceptaCondiciones !== true) {
    return { ok: false, rechazo: { status: 409, error: 'Debes aceptar las condiciones del servicio y la política de privacidad.', codigo: 'condiciones' } };
  }
  const sello = await sellarCondicionesVigentes(admin, p.studioId);

  if (!(importe > 0)) return { ok: false, rechazo: { status: 409, error: 'Ese código deja la compra sin importe. Pide a tu estudio que te dé el plan directamente.' } };
  if (importe < IMPORTE_MINIMO_EUR) {
    return { ok: false, rechazo: { status: 409, error: 'Ese importe es demasiado bajo para pagarlo online. Pide a tu estudio que te lo dé directamente.', codigo: 'importe-minimo' } };
  }

  return {
    ok: true,
    matriculaCatalogo: Number(plan.matricula) || 0,
    compra: {
      socioId, email, invitada, planId: p.planId, planNombre: plan.nombre as string,
      importePlan: importe, codigoDescuentoId, codigoAplicado: codigoDescuentoId !== null, descuento,
      terminosHash: sello?.hash ?? null, cicloFin, cuotaTexto, cuotaFrase,
      sesionId, spotId, cierreClase,
    },
  };
}

/**
 * La clase de «pagar y reservar», con las mismas comprobaciones y en el mismo
 * orden que la rama de clase de `/api/stripe/checkout`: cobrar por una clase
 * que ya no se puede reservar sería cobrar sin poder entregar nada.
 */
async function comprobarClase(
  admin: SupabaseClient,
  p: { studioId: string; planId: string; socioId: string | null; email: string | null; sesionId: string; spotId: string | null },
): Promise<{ ok: true; cierre: Date } | { ok: false; rechazo: Rechazo }> {
  const no = (status: number, error: string, codigo?: string) => ({ ok: false as const, rechazo: { status, error, ...(codigo ? { codigo } : {}) } });
  const { data: sesion, error } = await admin
    .from('sesiones').select('inicio, cancelada, tipo_clase_id, precio_puntual')
    .eq('id', p.sesionId).eq('studio_id', p.studioId).maybeSingle();
  if (error) return no(503, 'No hemos podido leer la clase. Inténtalo en un momento.');
  if (!sesion) return no(404, 'Clase no encontrada');
  if (sesion.cancelada) return no(409, 'Esta clase está cancelada');
  const inicio = sesion.inicio as string;
  if (new Date(inicio).getTime() <= Date.now()) return no(409, 'Esta clase ya ha empezado');
  const tipoClaseId = (sesion.tipo_clase_id as string | null) ?? null;

  const { data: tiposDelPlan } = await admin.from('plan_tipos_clase').select('tipo_clase_id').eq('plan_id', p.planId);
  if (tiposDelPlan && tiposDelPlan.length > 0 && !tiposDelPlan.some(t => t.tipo_clase_id === tipoClaseId)) {
    return no(400, 'Este plan no cubre el tipo de esta clase');
  }

  const cierreSuave = await cierreAperturaSuave(admin, p.studioId, p.socioId, inicio, { planQueCompra: p.planId });
  if (cierreSuave) return no(409, MENSAJE_APERTURA_SUAVE(cierreSuave), 'apertura-suave');

  const ventana = await comprobarVentanaReserva(admin, { studioId: p.studioId, tipoClaseId, inicioISO: inicio });
  if (ventana) return no(409, ventana.error, ventana.codigo);

  const precioPuntual = sesion.precio_puntual as number | null;
  if (typeof precioPuntual === 'number' && precioPuntual > 0) {
    const { data: planRows } = await admin.from('planes_tarifa').select('*').eq('studio_id', p.studioId);
    const planesEstudio = await hidratarTiposDePlanes(admin as never, p.studioId, ((planRows ?? []) as RowPlanesTarifa[]).map(mapPlanTarifa));
    if (tienePrecioEspecial(precioPuntual, planDeClaseSuelta(planesEstudio, tipoClaseId))) {
      return no(409, 'Esta clase tiene un precio especial: resérvala en el estudio. No te hemos cobrado nada.', 'precio-especial');
    }
  }

  const plaza = await comprobarPlazaAntesDeCobrar(admin, {
    studioId: p.studioId, sesionId: p.sesionId, socioId: p.socioId, email: p.email, spotId: p.spotId,
  });
  if (!plaza.ok) {
    return {
      ok: false,
      rechazo: {
        status: plaza.codigo === 'error' ? 503 : 409, error: plaza.error, codigo: plaza.codigo,
        ...(plaza.posicionEspera != null ? { posicionEspera: plaza.posicionEspera } : {}),
      },
    };
  }

  const cierre = await cierreDeReserva(admin, { studioId: p.studioId, tipoClaseId, inicioISO: inicio });
  const caducidad = caducidadDeCompra(cierre, Date.now());
  if (!caducidad.ok) return no(409, caducidad.error, caducidad.codigo);
  return { ok: true, cierre };
}

/**
 * Matrícula de la primera vez: cuánto se cobra y si se gastó una plaza gratis.
 * Se llama en el ÚLTIMO momento antes de crear el pago (como Stripe): una
 * plaza reservada antes de una validación que falla se perdería.
 */
export async function reservarMatriculaDeCompra(
  admin: SupabaseClient, p: { studioId: string; planId: string; socioId: string | null; email: string | null; matriculaCatalogo: number },
): Promise<{ matricula: number; cupoReservado: boolean }> {
  if (!(p.matriculaCatalogo > 0)) return { matricula: 0, cupoReservado: false };
  if (!(await primeraVezConPlan(admin, p.studioId, p.socioId, p.email))) return { matricula: 0, cupoReservado: false };
  const aCobrar = await reservarMatricula(admin, p.planId, p.studioId, p.matriculaCatalogo);
  return { matricula: Math.round(aCobrar * 100) / 100, cupoReservado: aCobrar === 0 };
}

/**
 * Compras abiertas que ya caducaron sin pagarse: se marcan caducadas y, si se
 * llevaron una plaza de matrícula gratis, se devuelve (una sola vez por compra).
 * Best-effort: se llama antes de abrir una compra nueva del mismo estudio.
 */
export async function barrerComprasCaducadas(admin: SupabaseClient, studioId: string): Promise<void> {
  const { data, error } = await admin.from('compras_mercadopago')
    .select('id, plan_id, cupo_matricula_reservado')
    .eq('studio_id', studioId).eq('estado', 'abierta').lt('expira_en', new Date().toISOString()).limit(50);
  if (error || !data) return;
  for (const c of data as { id: string; plan_id: string; cupo_matricula_reservado: boolean }[]) {
    // compare-and-set: solo la pasa a caducada quien la encuentra abierta.
    const { data: marcada } = await admin.from('compras_mercadopago')
      .update({ estado: 'caducada', actualizado_en: new Date().toISOString() })
      .eq('id', c.id).eq('estado', 'abierta').select('id').maybeSingle();
    if (!marcada || !c.cupo_matricula_reservado) continue;
    try {
      await liberarCupoMatriculaUnaVez(admin, c.id, c.plan_id, studioId);
    } catch (e) {
      Sentry.captureMessage('[mercadopago] no se pudo devolver el lugar de matrícula de una compra caducada', {
        level: 'warning', tags: { area: 'cobros', pasarela: 'mercadopago' }, extra: { compraId: c.id, studioId, error: String(e) },
      });
    }
  }
}
