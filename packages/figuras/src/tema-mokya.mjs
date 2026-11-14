// Paleta Mokya para las figuras: sustituye los grises neutros del kit por tintas cálidas (aceituna)
// y el verde por el amarillo banana del logo. Se inserta tras el CSS del kit y gana por orden.
export const TEMA_MOKYA = `
.iso{
  --anatomy-page:#12100a;--anatomy-card:#1a170c;--anatomy-text:#b8b39a;--anatomy-strong:#f3eed8;--anatomy-muted:#8a8566;
  --anatomy-paper:#1a170c;--anatomy-face:#221f10;--anatomy-top:#242110;
  --anatomy-shade-0:#14120a;--anatomy-shade-1:#181509;--anatomy-shade-2:#1c190c;--anatomy-shade-3:#201d0f;
  --anatomy-lit-top:#302b14;--anatomy-lit-shade:#27230f;
  --anatomy-hi:#d9d4b8;--anatomy-mid:#76714f;--anatomy-lo:#47431f;--anatomy-faint:#2f2b17;--anatomy-lit:#fff6cf;
  --anatomy-halo:#0a0905;--anatomy-dot:#f3eed8;
  --anatomy-green:#f3ca47;
}
.iso[data-theme="light"]{
  --anatomy-page:#f6f3e8;--anatomy-card:#fbf9f1;--anatomy-text:#5a5638;--anatomy-strong:#2a2612;--anatomy-muted:#8f8963;
  --anatomy-paper:#fbf9f1;--anatomy-face:#ffffff;--anatomy-top:#ffffff;
  --anatomy-shade-0:#e1dcc3;--anatomy-shade-1:#e9e5d0;--anatomy-shade-2:#f0ecdb;--anatomy-shade-3:#f6f3e6;
  --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#f1edd9;
  --anatomy-hi:#2f2b14;--anatomy-mid:#8f8963;--anatomy-lo:#bab38f;--anatomy-faint:#d9d3b7;--anatomy-lit:#000000;
  --anatomy-halo:#8a8460;--anatomy-dot:#3a3618;
  --anatomy-green:#c79a00;
}
.iso[data-theme="light"] .hx-hole{fill:#c4be9f}
`;
