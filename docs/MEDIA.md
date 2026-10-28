# Pipeline e política de mídia

## Fluxo dos arquivos

Os arquivos-fonte ficam em `media-originals/`, fora de `src/`, para não serem copiados ao build. As pastas datadas preservam os nomes e os binários recebidos; `legacy-conceptual/` preserva as duas artes da campanha original.

`media/catalog.json` é a fonte de verdade para classificação, confiança, etapa, uso, texto alternativo e regras de largura. Execute:

```bash
npm run media:process
```

O script calcula os hashes dos originais, documenta duplicatas, remove metadados dos derivados, gera WebP/AVIF responsivos, cria thumbnails e atualiza `src/media-manifest.js` e `docs/MEDIA-INVENTORY.md`. Entradas com `pipeline: "video"` também geram o preview, a versão completa silenciosa, poster, thumbnail e contact sheet.

O processamento de vídeo requer FFmpeg e FFprobe no `PATH`. Também é possível informar os executáveis explicitamente com `FFMPEG_PATH` e `FFPROBE_PATH`.

Nunca edite `src/media-manifest.js` manualmente. Para incluir material novo, preserve o original em `media-originals/`, cadastre-o em `media/catalog.json` e execute o pipeline.

## Integração atual

| Área | Mídia |
|---|---|
| Hero e cena final | cupê preto da campanha conceitual original, claramente identificado |
| Storytelling | campanha conceitual, farol real, cabine em processo e Civic finalizado |
| Processo | dois vídeos reais e independentes do Volkswagen Up: estado anterior e resultado final |
| Serviços | oito serviços prioritários na home e onze rotas individuais |
| Portfólio | Civic, HB20, Compass, Volkswagen, interior, motor e Yamaha Fazer |
| Antes/depois | cabine desmontada, trilho do banco e farol |

## Integridade visual

As placas visíveis nos arquivos de exterior já chegaram cobertas pela marca LavaMed. O processamento conserva essa cobertura e não reconstrói a região. Nenhuma alteração generativa foi feita nos veículos, rodas, pintura, faróis ou condição de limpeza. Os originais permanecem disponíveis para auditoria.

## Experiência silenciosa

Esta versão não usa música, efeitos sintetizados, arquivos sonoros ou controles de som. A decisão é intencional e preserva toda a linguagem visual e as animações.

## LavaMed Dual Motion Experience

Os dois originais ficam preservados em `media-originals/2026-10-27/videos/`, fora do build público:

- `volkswagen-up-antes.mp4`: 10,82 s, 720 × 1280, H.264 Main, aproximadamente 30 fps;
- `volkswagen-up-depois.mp4`: 16,36 s, 720 × 1280, H.264 Main, aproximadamente 30 fps.

Ambos chegaram com faixa AAC, removida integralmente dos derivados públicos. O vídeo H.264 das versões completas é preservado por remux, sem correção cromática ou alteração do veículo. A inspeção dos contact sheets não encontrou placa legível; por isso esses dois registros não recebem máscara. Os reflexos e a luz variável do material original permanecem intactos.

O conteúdo comprova a condição anterior e o resultado final do mesmo Volkswagen Up. Os ângulos e as durações não são idênticos e o material não comprova qual pacote específico foi executado. A interface apresenta uma comparação editorial com reprodução independente, sem scrub sincronizado ou falsa equivalência quadro a quadro.

Para cada estado, o pipeline gera:

- preview editorial de 6 segundos em MP4 H.264 e WebM VP9;
- MP4 H.264 completo com `faststart`, sem áudio;
- poster WebP/AVIF e thumbnail WebP;
- contact sheet e metadados FFprobe em `docs/video-audit/dual-motion/`.

Os previews usam `preload="none"`. Apenas o estado ativo recebe as fontes quando a experiência se aproxima da viewport; a troca pausa o anterior e a saída da tela pausa ambos. Redução de movimento e economia de dados mantêm os pôsteres até uma ação explícita. Cada vídeo completo é carregado somente no diálogo solicitado e permanece permanentemente silencioso.

O vídeo combinado de 2026-10-26 continua arquivado e auditável como material legado, mas não é mais a fonte primária da experiência na home.
