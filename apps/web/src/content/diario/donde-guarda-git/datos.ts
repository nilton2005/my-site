// Contenido de los paneles opcionales <Dato /> de este artículo. Cada renglón admite HTML en línea.
// Todos los datos están verificados: los hashes con `git hash-object`, la historia con la documentación y las
// notas de versión de Git (technical/hash-function-transition, RelNotes 2.13) y con el anuncio del CWI sobre SHAttered.

export const historia = [
  `<strong>1995.</strong> El NIST de Estados Unidos publica SHA-1 como estándar federal (FIPS 180-1). Lo diseñó la NSA.`,
  `<strong>2005.</strong> Nace Git, y usa SHA-1 para darle un nombre a cada objeto.`,
  `<strong>2017.</strong> El 23 de febrero, el CWI (Países Bajos) y Google presentan <em>SHAttered</em>: dos PDF distintos con el mismo SHA-1, tras unos 2<sup>63</sup> cálculos. Era la primera colisión de SHA-1 completo.`,
  `<strong>2017, Git 2.13.</strong> Git adopta por defecto una variante de SHA-1 que detecta ese tipo de ataques, hecha por Marc Stevens (CWI) y Dan Shumow (Microsoft).`,
  `<strong>Hoy.</strong> Git ya puede usar SHA-256 con <code>git init --object-format=sha256</code>, pero SHA-1 sigue siendo el predeterminado y los dos tipos de repositorio no se pueden mezclar.`,
];

export const curiosos = [
  `El archivo vacío tiene hash propio: <code>e69de29bb2d1d6434b8b29ae775ad8c2e48c5391</code>. Cualquier repositorio del mundo lo calcula igual.`,
  `Un <em>tree</em> vacío (una carpeta sin nada) también tiene el suyo: <code>4b825dc642cb6eb9a060e54bf8d69288fbee4904</code>.`,
  `Hay 2<sup>160</sup> hashes posibles, unos 1,46 × 10<sup>48</sup>. Para que sea probable que dos objetos choquen por casualidad harían falta del orden de 2<sup>80</sup> objetos, cerca de 10<sup>24</sup>.`,
  `Git muestra solo 7 caracteres del hash por defecto (como <code>b0ab984</code>). Se puede cambiar con <code>core.abbrev</code>.`,
];

export const usos = [
  `<strong>pnpm</strong> guarda cada archivo de tus dependencias una sola vez, en 256 carpetas de dos caracteres, igual que Git. El nombre es el hash (SHA-512) del contenido, y si dos proyectos usan el mismo archivo, lo comparten.`,
  `<strong>package-lock.json y pnpm-lock.yaml</strong> guardan un campo <code>integrity: sha512-…</code> con el hash de cada paquete. Si lo que descargas no coincide, la instalación se detiene.`,
  `<strong>Docker</strong> identifica cada imagen y cada capa por su <em>digest</em>, un hash <code>sha256:…</code>.`,
  `<strong>Express</strong> usa el paquete <code>etag</code>, que resume el cuerpo de cada respuesta con SHA-1 para que el navegador sepa si cambió.`,
  `<strong>Este sitio.</strong> Los archivos de <code>/_astro/</code> llevan un hash del contenido en el nombre (<code>imagen.BPAdz6L0_ZiTh3H.jpg</code>), así el navegador puede guardarlos un año sin riesgo de mostrar una versión vieja.`,
  `<strong>BitTorrent e IPFS</strong> piden el contenido por su hash: «dame lo que tiene esta huella», sin importar quién lo tenga.`,
];
