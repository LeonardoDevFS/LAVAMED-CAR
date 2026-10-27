# Pipeline e política de mídia

## Fluxo dos arquivos

Os arquivos-fonte ficam em `media-originals/`, fora de `src/`, para não serem copiados ao build. A pasta `2026-10-25/` preserva os nomes recebidos; `legacy-conceptual/` preserva as duas artes da campanha original.

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
| Processo | vídeo real do Volkswagen Up, com fotografias classificadas preservadas como fallback editorial |
| Serviços | oito serviços prioritários na home e onze rotas individuais |
| Portfólio | Civic, HB20, Compass, Volkswagen, interior, motor e Yamaha Fazer |
| Antes/depois | cabine desmontada, trilho do banco e farol |

## Integridade visual

As placas visíveis nos arquivos de exterior já chegaram cobertas pela marca LavaMed. O processamento conserva essa cobertura e não reconstrói a região. Nenhuma alteração generativa foi feita nos veículos, rodas, pintura, faróis ou condição de limpeza. Os originais permanecem disponíveis para auditoria.

## Experiência silenciosa

Esta versão não usa música, efeitos sintetizados, arquivos sonoros ou controles de som. A decisão é intencional e preserva toda a linguagem visual e as animações.

## Vídeo do Volkswagen Up

O original de 27,77 segundos fica preservado em `media-originals/2026-10-26/videos/`, fora do build público. Ele é vertical, tem resolução de 720 × 1280, 30 fps, vídeo H.264 High e uma faixa AAC que não é publicada.

O conteúdo comprova o antes e o depois do mesmo Volkswagen Up, mostrando exterior traseiro e interior. O material não comprova qual pacote ou procedimento específico foi executado; por isso os textos permanecem neutros.

Derivados gerados:

- preview de 8 segundos com quatro trechos correspondentes de antes e depois;
- MP4 H.264 completo com `faststart`, sem áudio;
- preview WebM VP9, menor que o MP4 e utilizado quando suportado;
- poster WebP/AVIF e thumbnail WebP;
- contact sheet em `docs/video-audit/`;
- máscara preventiva acompanhando a aparição parcial da placa traseira entre aproximadamente 2,1 s e 3,5 s.

O preview usa `preload="none"`, só recebe as fontes quando a seção se aproxima da viewport, pausa ao sair da tela e permanece no poster com redução de movimento ou economia de dados. O vídeo completo é carregado apenas quando o visitante abre o diálogo e continua permanentemente silencioso.
