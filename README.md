# Filaxy™ Vault — Website

Landing page for **Filaxy™ Vault**, a local-first, zero-cloud password manager for macOS.
Your encrypted vault never leaves your device.

**Live:** https://vault.filaxy.net

## Stack

Static site — vanilla HTML / CSS / JS with [GSAP](https://gsap.com/) + ScrollTrigger.
No build step. Fully responsive, light/dark themes, English/Spanish.

## Highlights

- Realistic MacBook Pro hero with the app composited into the screen
- Site-wide living-cipher canvas + cursor spotlight
- Bento feature grid with animated beam borders and 3D tilt
- Animated trust bar and security shield
- Screenshot coverflow with full-size lightbox
- Donations (PayPal + USDT TRC20)

## Develop

```bash
cd public
python3 -m http.server 4500
# open http://localhost:4500
```

Append `?inspect` to the URL to open the hero alignment inspector.

## Deploy

Cloudflare Pages — output directory: `public`.

## Related

App source: https://github.com/othmarodev/filaxy-vault
