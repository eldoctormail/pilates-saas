"""Pasa la figura del logo de Centra (docs/marca-centra/figura-original.jpg) a
cinco trazados vectoriales, uno por color, encajados en la caja del isotipo
('7 11 106 98', la de components/marca/logo-tentare.tsx).

Uso (potracer no es dependencia del proyecto, se instala solo para esto):
    python3 -m venv /tmp/v && /tmp/v/bin/pip install potracer pillow numpy
    /tmp/v/bin/python scripts/marca/vectorizar-figura.py .
Escribe docs/marca-centra/figura.json; después, generar-logo-centra.mjs.

Cómo: cada píxel se asigna al color de la paleta más cercano (o al fondo), se
amplía la máscara de cada color, se suaviza con un desenfoque y se traza con
potrace. Los huecos blancos entre franjas son parte del dibujo: quedan vacíos.
"""
import json, re, sys
import numpy as np
from PIL import Image, ImageFilter
import potrace

REPO = sys.argv[1]
UP, DESENFOQUE, TOLERANCIA = 3, 4.5, 1.2
# Orden = orden de pintado y de las variables --marca-c1…c5.
PALETA = {
    'naranja': (230, 124, 54),
    'oliva': (88, 72, 28),
    'verde_agua': (128, 178, 158),
    'bordo': (136, 52, 38),
    'oliva_claro': (136, 134, 62),
}
CAJA = dict(x=7, y=11, w=106, h=98, aire=1.5)

img = Image.open(f'{REPO}/docs/marca-centra/figura-original.jpg').convert('RGB')
a = np.array(img).astype(float)
pal = np.array([(255, 255, 255), *PALETA.values()], float)
d = ((a[:, :, None, :] - pal[None, None]) ** 2).sum(-1)
lab = np.where(d.min(-1) < 55 ** 2, d.argmin(-1), 0)
lab = np.array(Image.fromarray(lab.astype(np.uint8)).filter(ImageFilter.ModeFilter(3)))

W, H = img.width * UP, img.height * UP


def traza(b):
    out = []
    for c in potrace.Bitmap(~b).trace(turdsize=100, alphamax=1.2, opticurve=True, opttolerance=TOLERANCIA):
        p = c.start_point
        out.append([('M', [(p.x / UP, p.y / UP)])])
        for g in c.segments:
            if g.is_corner:
                out[-1].append(('L', [(g.c.x / UP, g.c.y / UP)]))
                out[-1].append(('L', [(g.end_point.x / UP, g.end_point.y / UP)]))
            else:
                out[-1].append(('C', [(q.x / UP, q.y / UP) for q in (g.c1, g.c2, g.end_point)]))
    return out


trazos = {}
for i, nombre in enumerate(PALETA, start=1):
    m = Image.fromarray(((lab == i) * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)
    trazos[nombre] = traza(np.array(m.filter(ImageFilter.GaussianBlur(DESENFOQUE))) > 127)

pts = [p for t in trazos.values() for sub in t for _, ps in sub for p in ps]
x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
e = min((CAJA['w'] - 2 * CAJA['aire']) / (x1 - x0), (CAJA['h'] - 2 * CAJA['aire']) / (y1 - y0))
dx = CAJA['x'] + CAJA['w'] / 2 - e * (x0 + x1) / 2
dy = CAJA['y'] + CAJA['h'] / 2 - e * (y0 + y1) / 2


def d_de(t):
    s = []
    for sub in t:
        for cmd, ps in sub:
            s.append(cmd + ' '.join(f'{round(e * x + dx, 2):g} {round(e * y + dy, 2):g}' for x, y in ps))
        s.append('Z')
    return re.sub(r' -', '-', ''.join(s))


json.dump(
    {'FRANJAS': [d_de(t) for t in trazos.values()], 'COLORES': ['#%02X%02X%02X' % c for c in PALETA.values()]},
    open(f'{REPO}/docs/marca-centra/figura.json', 'w'),
)
print('docs/marca-centra/figura.json', [len(d_de(t)) for t in trazos.values()])
