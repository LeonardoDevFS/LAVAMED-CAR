# Pipeline de mídia e sound design

## Fluxo dos arquivos

Os arquivos-fonte ficam em `media-originals/`, fora de `src/`, para não serem copiados ao build. A pasta `2026-10-25/` preserva os nomes recebidos; `legacy-conceptual/` preserva as duas artes usadas na versão anterior do site.

`media/catalog.json` é a fonte de verdade para classificação, confiança, etapa, uso, texto alternativo e regras de largura. Execute:

```bash
npm run media:process
```

O script:

- calcula SHA-256 dos originais;
- detecta e documenta duplicatas;
- remove metadados dos derivados;
- gera WebP e AVIF responsivos sem ampliar o arquivo;
- cria thumbnails WebP;
- cria a imagem social JPEG de 1200 × 630;
- atualiza `src/media-manifest.js` e `docs/MEDIA-INVENTORY.md`.

Nunca edite `src/media-manifest.js` manualmente. Para incluir material novo, preserve o original em `media-originals/`, cadastre-o em `media/catalog.json` e execute o pipeline.

## Integração atual

| Área | Mídia |
|---|---|
| Hero e cena final | Honda Civic G10, exterior finalizado |
| Storytelling | cabine desmontada antes da higienização, farol, motor e Civic finalizado |
| Serviços | exterior, interiores, motor, farol, moto e duas composições contextuais |
| Portfólio | Civic, HB20, Compass, interior do Civic, motor do Onix e Yamaha FZ15 |
| Antes/depois | cabine desmontada, trilho do banco e farol |
| Open Graph | recorte social do Civic em JPEG |

## Segurança visual

As placas visíveis nos arquivos de exterior já chegaram cobertas pela marca LavaMed. O processamento conserva essa cobertura e não reconstrói a região. Nenhuma alteração generativa foi feita nos veículos, rodas, pintura, faróis ou condição de limpeza. Os originais permanecem disponíveis para auditoria.

## Sound design

O som é sintetizado no navegador com Web Audio API; não há música nem sample de terceiros. O sistema implementa:

- impacto tonal discreto ao ativar a experiência;
- whoosh nas transições de serviço e menu;
- textura líquida na terceira cena do storytelling;
- assinatura curta nas mudanças de cena;
- clique premium em CTAs e controles importantes;
- revelação sutil nos comparadores.

O áudio começa desligado. O `AudioContext` só é criado depois do clique no botão “Som”. A preferência é registrada em `localStorage`, mas uma nova página não reproduz áudio antes de nova autorização/interação. Debounces individuais limitam sobreposição e repetição durante o scroll.

## Vídeo

Nenhum MP4, MOV ou WebM foi encontrado. Por isso não há cortes, posters ou autoplay implementados. A arquitetura continua leve e pronta para receber vídeo quando existir material real e autorizado.
