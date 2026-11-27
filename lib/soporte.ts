// El WhatsApp Business de soporte de Centra: «te responde una persona».
//
// En un módulo sin dependencias para que lo puedan usar el servidor (los correos
// del alta nueva) y las pantallas que no viven dentro del panel (/crear-estudio),
// sin arrastrar `components/layout/whatsapp-fab.tsx`, que es de cliente y carga
// el contexto del estudio. Ese fichero lo reexporta para quien ya lo importaba de
// ahí. El enlace con el mensaje escrito se monta con `enlaceWhatsApp`
// (lib/decision/mensajes-socia.ts).
// En Argentina es el de Centra (LEGAL.whatsappSoporte, lib/legal-info.ts), nunca el del software original.
import { LEGAL } from './legal-info.ts';

export const SOPORTE_WHATSAPP: string = LEGAL.whatsappSoporte;
