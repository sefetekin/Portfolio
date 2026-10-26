# Generates public/fabric.jpg, the woven burgundy fabric tile behind the boards.
# Usage: python3 scripts/fabric.py public/fabric.jpg  (needs numpy and Pillow)
import numpy as np, sys
from PIL import Image
rng = np.random.default_rng(7)
N = 960          # tile size (shown at 480 css px)
P = 12           # thread pitch in px -> 80 threads per tile
T = N // P

def pnoise(shape, falloff):
    # periodic noise: random phases, power-law spectrum, so the tile wraps
    fy = np.fft.fftfreq(shape[0])[:, None]
    fx = np.fft.fftfreq(shape[1])[None, :] if len(shape) > 1 else None
    f = np.sqrt(fy**2 + (fx**2 if fx is not None else 0))
    f[0, 0] = 1
    spec = (rng.normal(size=shape) + 1j * rng.normal(size=shape)) / f**falloff
    spec[0, 0] = 0
    n = np.real(np.fft.ifft2(spec))
    return (n - n.mean()) / n.std()

def pnoise1(n, falloff):
    f = np.abs(np.fft.fftfreq(n)); f[0] = 1
    spec = (rng.normal(size=n) + 1j * rng.normal(size=n)) / f**falloff
    spec[0] = 0
    v = np.real(np.fft.ifft(spec))
    return (v - v.mean()) / v.std()

y, x = np.mgrid[0:N, 0:N].astype(float)

# Per-thread properties: slubs along each thread, thickness and tone jitter.
warp_tone = rng.normal(0, 1, T); weft_tone = rng.normal(0, 1, T)
warp_slub = np.stack([pnoise1(N, 1.2) for _ in range(T)])   # along y
weft_slub = np.stack([pnoise1(N, 1.2) for _ in range(T)])   # along x
# Threads wander slightly so the grid isn't ruler-straight.
warp_wob = np.stack([pnoise1(N, 2.0) for _ in range(T)]) * 0.9
weft_wob = np.stack([pnoise1(N, 2.0) for _ in range(T)]) * 0.9

xi = (x // P).astype(int) % T; yi = (y // P).astype(int) % T
yy = y.astype(int); xx = x.astype(int)
u = ((x + warp_wob[xi, yy]) % P) / P   # position across a warp thread 0..1
v = ((y + weft_wob[yi, xx]) % P) / P   # position across a weft thread 0..1

# Rounded thread profile with a dark gap between threads.
def profile(t, width):
    d = np.abs(t - 0.5) / (width / 2)
    return 0.25 + 0.75 * np.clip(1 - d**2, 0, 1) ** 0.5

warp_w = 0.86 + 0.06 * warp_slub[xi, yy]
weft_w = 0.86 + 0.06 * weft_slub[yi, xx]
pw = profile(u, warp_w); pf = profile(v, weft_w)

# Plain weave: which thread is on top alternates cell by cell. Shade the
# top thread brighter at its crest and darker where it dives under.
over = ((xi + yi) % 2 == 0)
dive_warp = np.sin(np.pi * v) ** 0.5      # warp is highest mid-cell along y
dive_weft = np.sin(np.pi * u) ** 0.5
warp_lum = pw * (0.72 + 0.28 * dive_warp) + 0.05 * warp_tone[xi] + 0.05 * warp_slub[xi, yy]
weft_lum = pf * (0.72 + 0.28 * dive_weft) + 0.05 * weft_tone[yi] + 0.05 * weft_slub[yi, xx]
top = np.where(over, warp_lum, weft_lum)
bottom = np.where(over, weft_lum, warp_lum) * 0.7
lum = np.where(np.where(over, pw, pf) > 0.3, top, bottom)

# Fibre fuzz, gentle mottling and a few darker flecks.
fuzz = rng.normal(0, 1, (N, N))
mottle = pnoise((N, N), 1.6)
from PIL import ImageFilter
lum = lum + 0.09 * fuzz + 0.035 * mottle
lum = np.array(Image.fromarray(((lum.clip(0,1.3)/1.3)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float)/255*1.3
flecks = (pnoise((N, N), 0.7) > 3.1) * -0.25
lum = lum + flecks
lum = np.clip(lum, 0, 1.3)

# Burgundy wool-linen, darker in the gaps.
base = np.array([116, 24, 40]) / 255
shadow = np.array([36, 5, 12]) / 255
t = np.clip(lum, 0, 1)[..., None]
rgb = shadow + (base - shadow) * t
rgb = rgb * (1 + 0.08 * (lum[..., None] - 1).clip(0, None) * 3)
rgb += 0.012 * np.stack([warp_tone[xi], np.zeros_like(lum), weft_tone[yi]], -1) * 0.5
img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
img.save(sys.argv[1], quality=82, optimize=True, progressive=True)
