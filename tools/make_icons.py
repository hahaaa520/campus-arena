"""Generate HarmonyOS layered-icon assets for Campus Arena (校园赛程编排器).

Produces:
  AppScope/resources/base/media/{app_icon,foreground,background}.png + layered_image.json
  entry/src/main/resources/base/media/{icon,startIcon,foreground,background}.png + layered_image.json
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw

ROOT = r"D:\开源作业\CampusArena"
APP_MEDIA = os.path.join(ROOT, "AppScope", "resources", "base", "media")
ENTRY_MEDIA = os.path.join(ROOT, "entry", "src", "main", "resources", "base", "media")

BRAND_TOP = (0x3B, 0x8B, 0xF0)
BRAND_BOTTOM = (0x0B, 0x3F, 0x94)
WHITE = (255, 255, 255, 255)

S = 1024  # master canvas


def diagonal_gradient(size, c1, c2):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w]
    t = np.clip(xx / float(w) * 0.35 + yy / float(h) * 0.65, 0.0, 1.0)[..., None]
    a = np.array(c1, dtype=float)[None, None, :]
    b = np.array(c2, dtype=float)[None, None, :]
    return Image.fromarray(((a * (1 - t) + b * t)).astype(np.uint8), "RGB")


def rounded_mask(size, radius, supersample=4):
    w, h = size
    big = Image.new("L", (w * supersample, h * supersample), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        [0, 0, w * supersample - 1, h * supersample - 1],
        radius=radius * supersample,
        fill=255,
    )
    return big.resize((w, h), Image.LANCZOS)


def draw_bracket(draw, box, color, lw):
    """Draw a 4-entrant single-elimination bracket converging to the right."""
    x0, y0, x1, y1 = box
    bw = x1 - x0
    bh = y1 - y0
    r = lw / 2.0

    # Four entrant stubs on the left, evenly spaced.
    ys = [y0 + bh * f for f in (0.06, 0.365, 0.635, 0.94)]
    stub_x0 = x0
    stub_x1 = x0 + bw * 0.20

    # Round 1 connectors
    join1_x = x0 + bw * 0.40
    mid1 = [y0 + bh * f for f in (0.2125, 0.7875)]

    # Round 2 connector
    join2_x = x0 + bw * 0.60
    mid2 = y0 + bh * 0.50

    # Final stub to the champion node
    champ_x = x0 + bw * 0.80

    for i, y in enumerate(ys):
        draw.line([stub_x0, y, stub_x1, y], fill=color, width=lw)
        target = mid1[0] if i < 2 else mid1[1]
        draw.line([stub_x1, y, join1_x, y], fill=color, width=lw)
        draw.line([join1_x, y, join1_x, target], fill=color, width=lw)

    for y in mid1:
        draw.line([join1_x, y, join2_x, y], fill=color, width=lw)
        draw.line([join2_x, y, join2_x, mid2], fill=color, width=lw)

    draw.line([join2_x, mid2, champ_x, mid2], fill=color, width=lw)

    # Champion node
    nr = bw * 0.075
    draw.ellipse([champ_x, mid2 - nr, champ_x + nr * 2, mid2 + nr], fill=color)

    # Round the entrant stub caps
    for y in ys:
        draw.ellipse([stub_x0 - r, y - r, stub_x0 + r, y + r], fill=color)


def foreground_layer(scale=0.62):
    """Transparent PNG with the bracket inside the layered-icon safe area."""
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    box_size = S * scale
    ox = (S - box_size) / 2.0
    oy = (S - box_size) / 2.0
    draw_bracket(d, (ox, oy, ox + box_size, oy + box_size), WHITE, lw=int(S * 0.030))
    return img


def flat_icon(size, radius_ratio=0.225):
    """Rounded-square brand icon with the bracket centred."""
    bg = diagonal_gradient((S, S), BRAND_TOP, BRAND_BOTTOM).convert("RGBA")
    bg.putalpha(rounded_mask((S, S), S * radius_ratio))

    fg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(fg)
    box_size = S * 0.60
    ox = (S - box_size) / 2.0
    oy = (S - box_size) / 2.0
    draw_bracket(d, (ox, oy, ox + box_size, oy + box_size), WHITE, lw=int(S * 0.032))

    out = Image.alpha_composite(bg, fg)
    if size != S:
        out = out.resize((size, size), Image.LANCZOS)
    return out


def main():
    for d in (APP_MEDIA, ENTRY_MEDIA):
        os.makedirs(d, exist_ok=True)

    # Layered-icon parts (shared by app scope and entry module).
    gradient = diagonal_gradient((S, S), BRAND_TOP, BRAND_BOTTOM).convert("RGBA")
    fg = foreground_layer()

    for d in (APP_MEDIA, ENTRY_MEDIA):
        gradient.save(os.path.join(d, "background.png"))
        fg.save(os.path.join(d, "foreground.png"))
        with open(os.path.join(d, "layered_image.json"), "w", encoding="utf-8") as fh:
            json.dump(
                {"layered-image": {"background": "$media:background", "foreground": "$media:foreground"}},
                fh,
                indent=2,
            )
            fh.write("\n")

    icon = flat_icon(S)
    icon.save(os.path.join(APP_MEDIA, "app_icon.png"))
    icon.save(os.path.join(ENTRY_MEDIA, "icon.png"))
    icon.save(os.path.join(ENTRY_MEDIA, "startIcon.png"))

    for d, names in ((APP_MEDIA, ("app_icon.png", "background.png", "foreground.png", "layered_image.json")),
                     (ENTRY_MEDIA, ("icon.png", "startIcon.png", "background.png", "foreground.png",
                                    "layered_image.json"))):
        for n in names:
            p = os.path.join(d, n)
            print("%9d  %s" % (os.path.getsize(p), p))


if __name__ == "__main__":
    main()
