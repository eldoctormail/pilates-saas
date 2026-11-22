import { conMoneda } from './moneda.ts';
import { LOCALE } from './locale.ts';
import { pasarelaEsMercadoPago } from './mercadopago/config.ts';
import { EDAD_MINIMA_CONSENTIMIENTO_SALUD } from './datos-salud/edad.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Los textos legales que firma la clienta, con los datos REALES del estudio.
//
// El texto por defecto decía "El responsable del tratamiento de sus datos es el
// estudio de pilates (en adelante, «el Estudio»)" — sin nombre, sin NIF y sin
// dirección, aunque el estudio los tuviera rellenos en Configuración. El RGPD
// (art. 13.1.a) exige identificar al responsable: sin eso, lo que firma la
// clienta no informa de nada y no protege a nadie.
//
// La cláusula de cancelación también estaba clavada a "12 horas" mientras
// `studios.cancelacion_ventana_horas` es configurable — el contrato decía una
// cosa y el software hacía otra.
//
// Puro y sin dependencias: es lo que se enseña en el alta, en el portal y en
// Configuración, y lo que se guarda como evidencia de lo aceptado.
// ─────────────────────────────────────────────────────────────────────────────

/** Lo que hace falta para redactar. Todo opcional: un estudio recién creado aún
 *  no tiene los datos fiscales y el texto debe seguir siendo válido. */
export interface DatosEstudioLegal {
  nombre?: string | null;
  razonSocial?: string | null;
  nif?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  codigoPostal?: string | null;
  email?: string | null;
  cancelacionVentanaHoras?: number | null;
  // Fase 3: importe fijo en € de la penalización por cancelación tardía/no-show.
  // NULL/0 = el estudio no tiene la regla activa, no se añade la cláusula.
  penalizacionImporteEur?: number | null;
  // El estudio cobra online (tiene su cuenta de Stripe conectada): solo entonces
  // existe un método de pago guardado con el que cobrar, y solo entonces sale la
  // cláusula de cobros con método guardado. Mismo nombre que en `Studio` y en el
  // payload público, para que el panel y el portal compongan el MISMO texto que se sella.
  stripeAccountId?: string | null;
}

const vacio = (s?: string | null) => !s || s.trim() === '';

// Autoalojado en Argentina (`NEXT_PUBLIC_LOCALE` es-AR): los textos por defecto citan la ley argentina
// (Ley 25.326 de datos personales, Ley 24.240 de defensa del consumidor) en vez de la española. Los de
// España no cambian. ⚠️ BORRADOR: revisión legal necesaria antes de usarlo con clientas reales.
const esArgentina = (locale: string) => /^es-AR\b/i.test(locale);

/**
 * Identifica al responsable del tratamiento. Usa la razón social si existe (es
 * la que factura) y cae al nombre comercial. Si no hay NINGÚN dato fiscal
 * devuelve null: entonces el texto lo dice abiertamente en vez de fingir.
 */
export function identificacionResponsable(e: DatosEstudioLegal, locale: string = LOCALE): string | null {
  const titular = !vacio(e.razonSocial) ? e.razonSocial!.trim() : (!vacio(e.nombre) ? e.nombre!.trim() : '');
  if (!titular) return null;

  const lineas = [titular];
  if (!vacio(e.nif)) lineas.push(`${esArgentina(locale) ? 'CUIT' : 'NIF/CIF'}: ${e.nif!.trim()}`);

  const domicilio = [
    !vacio(e.direccion) ? e.direccion!.trim() : '',
    [!vacio(e.codigoPostal) ? e.codigoPostal!.trim() : '', !vacio(e.ciudad) ? e.ciudad!.trim() : ''].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');
  if (domicilio) lineas.push(`Domicilio: ${domicilio}`);
  if (!vacio(e.email)) lineas.push(`Contacto: ${e.email!.trim()}`);

  return lineas.join('\n');
}

/** Aviso honesto cuando faltan los datos: mejor decirlo que dar por bueno un
 *  documento que no identifica a nadie. Se ve en el propio texto que firma la
 *  clienta, así que la propietaria lo descubre la primera vez que da un alta. */
const SIN_DATOS_FISCALES =
  '⚠️ El estudio todavía no ha completado sus datos fiscales (razón social, NIF y domicilio).\n' +
  'Complétalos en Configuración → Mi estudio: sin ellos este documento no identifica al responsable\n' +
  'del tratamiento y no cumple el artículo 13 del RGPD.';

const SIN_DATOS_FISCALES_AR =
  '⚠️ El estudio todavía no completó sus datos fiscales (razón social, CUIT y domicilio).\n' +
  'Complételos en Configuración → Mi estudio: sin ellos este documento no identifica al responsable\n' +
  'de la base de datos, como exige el artículo 6 de la Ley 25.326.';

/**
 * Lo que la AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA pide que figure, tal cual, donde se recogen datos
 * (Resolución AAIP 14/2018, que sustituyó a la Disposición DNPDP 10/2008).
 */
export const LEYENDA_AAIP =
  'El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. ' +
  'LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.';

function politicaPrivacidadArgentina(e: DatosEstudioLegal): string {
  const responsable = identificacionResponsable(e, 'es-AR');
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  const paraEjercer = !vacio(e.email)
    ? `escribiendo a ${e.email!.trim()} o en el propio estudio`
    : 'en el propio estudio';

  return `POLÍTICA DE PRIVACIDAD

En cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales y su Decreto Reglamentario N° 1558/2001, le informamos cómo trata ${nombreEstudio} sus datos personales.

RESPONSABLE DE LA BASE DE DATOS
${responsable ?? SIN_DATOS_FISCALES_AR}

QUÉ DATOS Y PARA QUÉ
Sus datos se usan para gestionar su inscripción, sus reservas y planes, los cobros y los avisos relacionados con los servicios que contrató (recordatorios de clases, cambios de horario, vencimientos). Son obligatorios el nombre, el email y el teléfono, sin los cuales no podemos darle de alta ni avisarle; el resto es facultativo. Los datos que nos dé deben ser verdaderos y estar actualizados.

DATOS DE SALUD
Los datos sobre su salud (lesiones, embarazo u otras condiciones que influyan en el ejercicio) son datos sensibles: nadie puede obligarle a darlos. Solo se registran si usted los aporta y da su consentimiento expreso, con la única finalidad de adaptar sus clases con seguridad.

QUIÉN MÁS INTERVIENE
Los datos se guardan en el sistema de gestión del estudio. Para prestar el servicio intervienen proveedores que los tratan por cuenta del estudio, como el procesador de pagos${pasarelaEsMercadoPago() ? ' (Mercado Pago)' : ''} y el servicio de envío de correos, algunos de los cuales pueden estar fuera de la Argentina. No vendemos ni cedemos sus datos a terceros para otros fines.

CONSERVACIÓN
Sus datos se conservan mientras dure la relación con el estudio y, después, durante los plazos que exijan las normas vigentes (por ejemplo, las fiscales). Cuando dejen de ser necesarios, se eliminan.

SUS DERECHOS
Puede pedir acceso a sus datos, su rectificación, actualización o supresión ${paraEjercer}. ${LEYENDA_AAIP}

COMUNICACIONES COMERCIALES
Las novedades y promociones solo se envían si usted lo acepta aparte, y puede darse de baja en cualquier momento desde el enlace de cada correo o pidiéndolo en el estudio.`;
}

export function politicaPrivacidadPorDefecto(e: DatosEstudioLegal = {}, locale: string = LOCALE): string {
  if (esArgentina(locale)) return politicaPrivacidadArgentina(e);
  const responsable = identificacionResponsable(e, locale);
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  const paraEjercer = !vacio(e.email)
    ? `enviando un escrito a ${e.email!.trim()}`
    : 'enviando un escrito a la dirección del estudio';

  return `POLÍTICA DE PRIVACIDAD

En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo (RGPD), le informamos que sus datos personales serán incorporados a nuestros ficheros con la finalidad de gestionar su inscripción y la prestación de los servicios contratados.

RESPONSABLE DEL TRATAMIENTO
${responsable ?? SIN_DATOS_FISCALES}

FINALIDAD Y LEGITIMACIÓN
Sus datos serán tratados para la gestión de membresías, facturación y comunicaciones relacionadas con los servicios contratados por usted en ${nombreEstudio}. La base legal es la ejecución del contrato y el cumplimiento de obligaciones legales.

CONSERVACIÓN
Sus datos se conservarán durante la vigencia de la relación contractual y, una vez finalizada, durante los plazos legalmente establecidos.

DERECHOS
Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición ${paraEjercer}. También puede reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).`;
}

/** ¿El estudio ha reescrito este documento a mano? Vacío es "no", igual que en `configLegalDe`. */
export function tieneTextoPropio(guardado?: string | null): boolean {
  return !vacio(guardado);
}

/**
 * Las horas de cancelación que dice el contrato por defecto. Una sola fuente:
 * el guardia de penalizaciones comprueba contra ESTE número, no contra el que
 * use la detección, que puede venir del tipo de clase.
 */
export function horasCancelacionContrato(e: Pick<DatosEstudioLegal, 'cancelacionVentanaHoras'>): number {
  // La ventana real configurada en el estudio, no un 12 clavado en el texto.
  return typeof e.cancelacionVentanaHoras === 'number' && e.cancelacionVentanaHoras > 0
    ? e.cancelacionVentanaHoras
    : 12;
}

/**
 * La cláusula de cobros con el método de pago guardado, o '' si el estudio no cobra
 * online. Exportada para poder anclarla en un test.
 */
export function clausulaCobrosConMetodoGuardado(e: Pick<DatosEstudioLegal, 'stripeAccountId'>): string {
  if (vacio(e.stripeAccountId)) return '';
  // Cada frase, con lo que la hace verdad (revisión de tentare-stripe, 6-oct):
  //  · «tiene guardada», sin decir por dónde: también el enlace que manda el panel.
  //  · «quitar la tarjeta» desde la app (tarjeta y Link se quitan; su SEPA, no).
  //  · domiciliación: solo la de la pasarela, elegida para sus cuotas, manda sobre la
  //    tarjeta (`elegirMetodoCobro`); con la remesa del banco, una tarjeta guardada se
  //    cobra igual (el cron la arma y la remesa la deja fuera), así que no se promete.
  return ' Si el socio tiene guardada una tarjeta u otro método de pago, autoriza al Estudio a cobrar en él sus cuotas y renovaciones y los importes que tenga pendientes, sin necesidad de pagarlos a mano. Puede quitar la tarjeta en cualquier momento desde la app o pedírselo al Estudio. Si ha elegido para sus cuotas la domiciliación bancaria a través de la pasarela de pago, se cobrarán por domiciliación.';
}

export function terminosServicioPorDefecto(e: DatosEstudioLegal = {}, locale: string = LOCALE): string {
  if (esArgentina(locale)) return terminosServicioArgentina(e);
  const responsable = identificacionResponsable(e, locale);
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  const horas = horasCancelacionContrato(e);
  // Fase 3: solo aparece si el estudio tiene la regla activa (importe > 0) —
  // un estudio sin ella no debe mostrar (ni pedir aceptar) una cláusula que
  // no le aplica. Condicionar el TEXTO es también lo que hace que el guard de
  // consentimiento (comparar versionTexto contra el actual) se dispare solo
  // para quien de verdad necesita re-aceptar.
  const clausulaPenalizacion = typeof e.penalizacionImporteEur === 'number' && e.penalizacionImporteEur > 0
    ? ` Adicionalmente, las cancelaciones dentro de dicha ventana y las inasistencias sin cancelación previa ("no-show") podrán conllevar un cargo de ${conMoneda(e.penalizacionImporteEur.toFixed(2))} a la tarjeta u otro método de pago guardado, siempre que exista uno asociado a la cuenta. Este cargo se notificará por correo electrónico en el momento en que se produzca.`
    : '';
  // Cobros con el método de pago guardado (6-oct-2026, decisión del fundador: esto
  // va en los términos, no a la vista en la app). Solo en los estudios que cobran
  // online: sin cuenta de Stripe no hay método guardado con el que cobrar. Verdad
  // de lo que hace el producto: las renovaciones se cobran solas (dunning) y el cron
  // adopta la que esté pendiente; desde el mostrador se puede cobrar lo pendiente; la
  // alumna lo quita en Perfil → Método de pago; y con la domiciliación lista y
  // preferida, se cobra por el banco (`elegirMetodoCobro`).
  const clausulaMetodoGuardado = clausulaCobrosConMetodoGuardado(e);

  return `TÉRMINOS Y CONDICIONES DE SERVICIO

PRESTADOR DEL SERVICIO
${responsable ?? SIN_DATOS_FISCALES}

1. OBJETO
El presente contrato regula las condiciones de acceso y uso de los servicios ofrecidos por ${nombreEstudio} (en adelante, "el Estudio").

2. PLANES Y TARIFAS
El socio abona la tarifa correspondiente al plan seleccionado. Los precios incluyen IVA. El Estudio se reserva el derecho de modificar tarifas con un preaviso mínimo de 30 días.${clausulaMetodoGuardado}

3. RESERVAS Y CANCELACIONES
Las reservas deben realizarse con antelación a través de los canales habilitados. Las cancelaciones efectuadas con menos de ${horas} ${horas === 1 ? 'hora' : 'horas'} de antelación serán descontadas del bono.${clausulaPenalizacion}

4. RESPONSABILIDAD
El socio declara estar en condiciones físicas adecuadas para la práctica de la actividad. El Estudio no se responsabiliza de lesiones derivadas del incumplimiento de las indicaciones del instructor.

5. VIGENCIA
El contrato estará vigente mientras se mantenga la suscripción activa. Cualquiera de las partes podrá resolver el contrato con un preaviso de 15 días.

6. ACEPTACIÓN
La firma de este documento supone la aceptación íntegra de las presentes condiciones.`;
}

/**
 * Términos para Argentina. Lo distinto de los de España: precios finales (sin «IVA incluido»), y el
 * derecho de revocación y la baja que da la ley de defensa del consumidor a lo que se contrata a
 * distancia (Ley 24.240, arts. 10 ter y 34; Código Civil y Comercial, art. 1110).
 */
function terminosServicioArgentina(e: DatosEstudioLegal): string {
  const responsable = identificacionResponsable(e, 'es-AR');
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  const horas = horasCancelacionContrato(e);
  const clausulaPenalizacion = typeof e.penalizacionImporteEur === 'number' && e.penalizacionImporteEur > 0
    ? ` Además, las cancelaciones dentro de ese plazo y las inasistencias sin aviso podrán generar un cargo de ${conMoneda(e.penalizacionImporteEur.toFixed(2))} al medio de pago guardado, si existe uno asociado a la cuenta. El cargo se avisa por correo electrónico en el momento en que se produce.`
    : '';
  const clausulaMetodoGuardado = clausulaCobrosConMetodoGuardado(e);
  const contacto = !vacio(e.email) ? `escribiendo a ${e.email!.trim()}, ` : '';

  return `TÉRMINOS Y CONDICIONES DEL SERVICIO

PRESTADOR DEL SERVICIO
${responsable ?? SIN_DATOS_FISCALES_AR}

1. OBJETO
Estas condiciones regulan el acceso y el uso de los servicios que ofrece ${nombreEstudio} (en adelante, "el Estudio").

2. PLANES Y PRECIOS
El socio abona el precio del plan elegido. Los precios informados son finales. El Estudio puede modificar sus precios avisándolo con al menos 30 días de anticipación; el cambio no afecta a los planes ya pagados.${clausulaMetodoGuardado}

3. RESERVAS Y CANCELACIONES
Las reservas se hacen con anticipación por los canales habilitados. Las cancelaciones hechas con menos de ${horas} ${horas === 1 ? 'hora' : 'horas'} de anticipación se descuentan del plan.${clausulaPenalizacion}

4. REVOCACIÓN DE LA COMPRA
Si contrató a distancia (por la app, la web o por teléfono), puede revocar la compra dentro de los 10 días corridos desde que la contrató, sin costo ni responsabilidad, conforme al artículo 34 de la Ley 24.240 y al artículo 1110 del Código Civil y Comercial de la Nación. Puede pedirlo con el «Botón de arrepentimiento» de la página del estudio, sin registrarse, ${contacto}o en el propio estudio; al pedirlo recibe un código de constancia.

5. BAJA DEL SERVICIO
Puede dar de baja su plan o suscripción en cualquier momento, sin más trámites, con el «Botón de baja de servicio» de la página del estudio, ${contacto}o en el estudio; al pedirlo recibe un código de constancia. La baja rige para los períodos siguientes.

6. RESPONSABILIDAD
El socio declara estar en condiciones físicas adecuadas para la actividad y se compromete a informar cualquier condición de salud que pueda afectarla. El Estudio no se responsabiliza por lesiones derivadas de no seguir las indicaciones del instructor.

7. VIGENCIA
El contrato está vigente mientras se mantenga un plan activo.

8. ACEPTACIÓN
La aceptación de este documento implica la aceptación de estas condiciones.`;
}

/** ¿Se puede firmar un documento que identifique al responsable? Se usa para
 *  avisar a la propietaria ANTES de que su primera clienta firme algo inservible. */
export function faltanDatosFiscales(e: DatosEstudioLegal): boolean {
  return identificacionResponsable(e) === null;
}

const SEPARADOR_LEGAL = '\n\n─────────────────────────────────────\n\n';

/**
 * Los dos documentos que acepta la clienta, en un solo texto.
 *
 * Sirve para lo que se ENSEÑA y para lo que se GUARDA como evidencia, y por eso
 * vive aquí: el panel y el portal lo componían por su cuenta y habían divergido.
 * El portal llegó a mostrar solo los términos mientras su casilla decía "y la
 * política de privacidad", y guardaba la cadena fija 'v1.1' como versión
 * aceptada — con eso no se puede saber qué aceptó nadie.
 */
export function textoLegalCompleto(c: { politicaPrivacidad: string; terminosServicio: string }): string {
  return [c.politicaPrivacidad, c.terminosServicio].join(SEPARADOR_LEGAL);
}

/**
 * Consentimiento de marketing por email — DELIBERADAMENTE aparte de
 * `textoLegalCompleto` (política de privacidad + términos). El RGPD (art. 7.4
 * y considerando 43) exige que el consentimiento para marketing sea
 * específico y no vaya empaquetado con la aceptación del contrato general —
 * mezclarlo sería inválido aunque la clienta lo marque. Ver
 * docs/marketing-integrations-arquitectura.md §7.
 *
 * Igual que `terminosServicioPorDefecto`, el texto SÍ es la clave de vigencia
 * (`Socio.consentimientoMarketing.texto` se compara contra el texto actual —
 * mismo patrón que `AceptacionContrato.versionTexto`): si este texto cambia,
 * toda socia con un consentimiento anterior deja de contar como consentida
 * hasta que vuelva a decir que sí.
 */
export function textoConsentimientoMarketing(e: DatosEstudioLegal = {}): string {
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  return `Acepto recibir por email novedades, promociones y ofertas de ${nombreEstudio}. Puedo retirar este consentimiento en cualquier momento, sin coste ni justificación, desde el enlace de baja de cualquier email o pidiéndolo directamente al estudio. Esta comunicación es independiente de los avisos necesarios para la prestación del servicio (reservas, pagos, cambios de horario), que seguiré recibiendo aunque retire este consentimiento.`;
}

/**
 * Consentimiento de datos de salud (art. 9 RGPD) que se registra DESDE EL PANEL,
 * con la socia delante. Es el texto que se guarda como prueba en
 * `socios.consentimiento_salud_texto` y en `consentimientos_salud_eventos`.
 *
 * ⚠️ Lo deriva SIEMPRE el servidor (`/api/socios/[id]/consentimiento-salud`);
 * el panel lo llama con el mismo `nombre` solo para enseñarlo antes de firmar.
 * Nunca se acepta un texto que mande el navegador.
 *
 * Solo usa `nombre` a propósito: así lo que ve la pantalla y lo que guarda el
 * servidor salen de la misma entrada y no pueden divergir.
 *
 * ⚠️ REVISIÓN LEGAL NECESARIA sobre la redacción. No promete lo que el producto
 * no cumple: dice quién lo ve de verdad (propietaria e instructoras que le dan
 * clase), que hay proveedores tecnológicos por medio y que revocar BLOQUEA los
 * datos, no los borra (borrarlos es una petición aparte).
 */
export function textoConsentimientoSaludPanel(
  e: DatosEstudioLegal = {},
  firmante: 'SOCIA' | 'TUTOR_LEGAL' = 'SOCIA',
  locale: string = LOCALE,
): string {
  const nombreEstudio = !vacio(e.nombre) ? e.nombre!.trim() : 'el Estudio';
  // Argentina: son datos sensibles (Ley 25.326, art. 7): nadie está obligado a darlos, y el texto lo dice.
  const voluntario = esArgentina(locale)
    ? ['Darlos es voluntario: nadie está obligado a proporcionar datos sobre su salud (artículo 7 de la Ley 25.326), y no darlos no impide tomar clases.']
    : [];
  // Menor de 14 (o persona con tutela): firma su padre, madre o tutor legal, y
  // el texto guardado como prueba lo dice. ⚠️ REVISIÓN LEGAL NECESARIA.
  if (firmante === 'TUTOR_LEGAL') {
    return [
      `Como padre, madre o tutor legal de la alumna (menor de ${EDAD_MINIMA_CONSENTIMIENTO_SALUD} años o bajo mi tutela), autorizo expresamente a ${nombreEstudio} a tratar los datos sobre su salud que le comunique (lesiones u otras condiciones que influyan en el ejercicio) con la única finalidad de adaptar sus clases con seguridad.`,
      `Los verán la dirección del estudio y las instructoras que le den clase. El estudio los gestiona con su programa de gestión, cuyos proveedores tecnológicos los tratan por cuenta del estudio.`,
      `Puedo retirar esta autorización cuando quiera, pidiéndolo en el propio estudio. Desde ese momento dejarán de estar visibles para el personal, y puedo pedir además que se eliminen.`,
      ...voluntario,
    ].join('\n\n');
  }
  return [
    `Autorizo expresamente a ${nombreEstudio} a tratar los datos sobre mi salud que le comunique (lesiones, embarazo u otras condiciones que influyan en el ejercicio) con la única finalidad de adaptar mis clases con seguridad.`,
    `Los verán la dirección del estudio y las instructoras que me den clase. El estudio los gestiona con su programa de gestión, cuyos proveedores tecnológicos los tratan por cuenta del estudio.`,
    `Puedo retirar esta autorización cuando quiera, desde la app del estudio o pidiéndolo en el propio estudio. Desde ese momento dejarán de estar visibles para el personal, y puedo pedir además que se eliminen.`,
    ...voluntario,
  ].join('\n\n');
}

// ─── Textos legales efectivos de un estudio ─────────────────────────────────
//
// Vivían en `lib/studio-context.tsx`, que es `'use client'`. Se mueven aquí
// para que el SERVIDOR pueda componer el mismo texto que firma la clienta —lo
// necesita el sellado de la aceptación por compra— sin arrastrar React ni
// mantener dos versiones de la misma regla.

export interface StudioConfig {
  politicaPrivacidad: string;
  terminosServicio: string;
}

/**
 * Textos legales efectivos de un estudio: los suyos si los ha reescrito a mano,
 * y si no, los de por defecto REDACTADOS CON SUS DATOS fiscales.
 *
 * Antes el fallback era un texto fijo que decía "el responsable es el estudio de
 * pilates" — sin nombre ni NIF, aunque el estudio los tuviera rellenos. Lo que
 * firmaba la clienta no identificaba a nadie.
 */
/**
 * Traduce la fila de `studios` (snake_case) a `DatosEstudioLegal` (camelCase).
 *
 * Exportada A PROPÓSITO para poder anclarla en un test: como todos los campos
 * de `DatosEstudioLegal` son opcionales, pasar la fila cruda COMPILA y se traga
 * media identidad fiscal en silencio. Lo que hay que probar es la FORMA, no que
 * servidor y portal llamen a la misma función — eso ya se cumplía cuando el
 * sello certificaba un texto que la compradora nunca vio.
 */
export function datosLegalesDeFila(fila: Record<string, unknown>): DatosEstudioLegal {
  const t = (k: string) => (fila[k] as string | null) ?? null;
  const n = (k: string) => (fila[k] === null || fila[k] === undefined ? null : Number(fila[k]));
  return {
    nombre: t('nombre'),
    razonSocial: t('razon_social'),
    nif: t('nif'),
    direccion: t('direccion'),
    ciudad: t('ciudad'),
    codigoPostal: t('codigo_postal'),
    email: t('email'),
    cancelacionVentanaHoras: n('cancelacion_ventana_horas'),
    penalizacionImporteEur: n('penalizacion_importe_eur'),
    stripeAccountId: t('stripe_account_id'),
  };
}

export function configLegalDe(
  studio: DatosEstudioLegal | null | undefined,
  guardados: { politicaPrivacidad?: string | null; terminosServicio?: string | null } | null | undefined,
): StudioConfig {
  const e = studio ?? {};
  // `??` dejaba pasar la cadena vacía: un estudio que borrara el contenido del
  // editor y guardara '' sellaba —y enseñaba— un documento EN BLANCO en vez del
  // de por defecto. Vacío es "no lo he reescrito", no "mis condiciones son
  // ninguna".
  return {
    politicaPrivacidad: vacio(guardados?.politicaPrivacidad) ? politicaPrivacidadPorDefecto(e) : guardados!.politicaPrivacidad!,
    terminosServicio: vacio(guardados?.terminosServicio) ? terminosServicioPorDefecto(e) : guardados!.terminosServicio!,
  };
}

/**
 * Los dos documentos efectivos de un estudio a partir de su fila de `studios`
 * (snake_case, con `politica_privacidad` y `terminos_servicio`). Único dueño de
 * esa composición: de aquí salen lo que se ENSEÑA a la alumna (`studioPublico`,
 * que alimenta portal, `/reservar` y el widget) y lo que se SELLA y se compara
 * antes de cobrar (`textoLegalVigenteDeFila`).
 *
 * ⚠️ `studioPublico` componía a mano sin `cancelacion_ventana_horas` ni
 * `penalizacion_importe_eur`: la alumna que se daba de alta sola leía 12 h y
 * ninguna cláusula de cargo, y el servidor sellaba como aceptado el texto CON
 * cláusula y con la ventana real.
 */
export function configLegalDeFila(fila: Record<string, unknown>): StudioConfig {
  return configLegalDe(datosLegalesDeFila(fila), {
    politicaPrivacidad: (fila.politica_privacidad as string | null | undefined) ?? null,
    terminosServicio: (fila.terminos_servicio as string | null | undefined) ?? null,
  });
}

/**
 * El texto completo vigente de un estudio a partir de su fila de `studios`. Es
 * lo que se sella al aceptar y lo que se compara con lo que aceptó la socia
 * antes de cobrarle una penalización. Pasa por `configLegalDe` a propósito: el
 * cron componía el texto con `??`, y unos términos guardados como '' daban un
 * texto distinto del que se enseña.
 */
export function textoLegalVigenteDeFila(fila: Record<string, unknown>): string {
  return textoLegalCompleto(configLegalDeFila(fila));
}

/**
 * Solo como estado inicial, antes de saber de qué estudio hablamos. En cuanto
 * carga, `configLegalDe` lo sustituye por el texto con los datos reales; si
 * alguien llegara a firmar esto, el propio documento avisa de que faltan.
 */
export const defaultStudioConfig: StudioConfig = {
  politicaPrivacidad: politicaPrivacidadPorDefecto(),
  terminosServicio: terminosServicioPorDefecto(),
};
