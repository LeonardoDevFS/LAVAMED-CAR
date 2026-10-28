# Auditoria — LavaMed Dual Motion Experience

## Escopo

Esta pasta documenta os dois arquivos reais usados na experiência de antes/depois do Volkswagen Up. Os originais são preservados em `media-originals/2026-10-27/videos/`; nenhuma versão original é publicada no build.

| Estado | Duração do contêiner | Vídeo | Áudio original | SHA-256 |
|---|---:|---|---|---|
| Antes | 10,815979 s | H.264 Main, 720 × 1280, ~30 fps | AAC LC estéreo, 48 kHz | `0376e48fe19f64cabe922a2f72f90b40b21d2f8bb714046df4e11f99b8a69268` |
| Depois | 16,362646 s | H.264 Main, 720 × 1280, ~30 fps | AAC LC estéreo, 48 kHz | `f282fa7f436b1a050aabd2e768b837e5c9de8c910bb0151a6dbd2287913be350` |

## Leitura visual e comparabilidade

Os dois registros mostram o mesmo Volkswagen Up. Há correspondência editorial entre a traseira, a soleira/assoalho e partes da cabine, porém câmera, velocidade, duração e enquadramentos não estão alinhados quadro a quadro. Por esse motivo, a interface mantém reprodução independente e não oferece sincronização ou morph artificial.

- Antes: traseira suja, soleira/assoalho e área interna traseira antes dos cuidados.
- Depois: traseira limpa, soleira, cabine, bancos, console e exterior após os cuidados.
- Procedimento: não é possível identificar pelo vídeo qual pacote específico foi executado.

## Privacidade e integridade

Os contact sheets foram inspecionados visualmente. Nenhuma placa legível aparece nos enquadramentos úteis. O estado Depois contém reflexos do ambiente e da pessoa que filmou na tampa preta; eles foram preservados porque não expõem placa legível e fazem parte do registro original.

Não foram aplicados blur, reconstrução, geração de imagem, alteração cromática nem retoque do veículo. As versões completas públicas preservam o bitstream H.264 por remux e removem somente a faixa de áudio. Os previews são recortes editoriais codificados para a web.

## Derivados públicos

| Estado | Completo MP4 | Preview MP4 | Preview WebM |
|---|---:|---:|---:|
| Antes | 3.401.379 bytes / 10,730333 s | 1.974.114 bytes / 6 s | 1.158.408 bytes / 6 s |
| Depois | 4.995.302 bytes / 16,356 s | 1.806.594 bytes / 6 s | 985.567 bytes / 6 s |

Todos os derivados acima contêm somente stream de vídeo. Os detalhes completos de FFprobe estão nos arquivos `volkswagen-up-antes-metadata.json` e `volkswagen-up-depois-metadata.json`.

## Reprodução web

- previews com `preload="none"` e fontes em `data-src`;
- somente o estado ativo é carregado e reproduzido automaticamente quando permitido;
- troca de estado e saída da viewport pausam o player anterior;
- `prefers-reduced-motion` e economia de dados impedem autoplay e download antecipado;
- ação explícita continua disponível por mouse, teclado ou toque;
- vídeos completos são carregados sob demanda em diálogo e forçados a `muted`, `volume = 0`.
