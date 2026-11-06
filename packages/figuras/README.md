# @niltontaco/figuras

Figuras isométricas interactivas para el diario, hechas con el kit **anatomy** (`kit/iso-kit.mjs`).

Cada figura es un módulo en `src/` que exporta `render()`: devuelve un fragmento HTML con sus estilos,
el SVG y su script, listo para insertarse en una página. `pnpm build` los escribe en `dist/`.

- Todo el CSS va bajo `.iso`, así que no afecta al resto del sitio.
- El script de cada figura busca solo dentro de su propio `id`, así que puede haber varias por página.
- El tema (claro u oscuro) lo decide la página, con `data-theme` en el contenedor `.iso`.
- Los hashes que muestran las figuras se calculan con SHA-1 real; `donde-guarda-git` se niega a
  generarse si su resultado no coincide con el de Git.
