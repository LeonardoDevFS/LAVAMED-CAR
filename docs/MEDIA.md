# Pipeline e política de mídia

## Fluxo dos arquivos

Os arquivos-fonte ficam em `media-originals/`, fora de `src/`, para não serem copiados ao build. A pasta `2026-10-25/` preserva os nomes recebidos; `legacy-conceptual/` preserva as duas artes da campanha original.

`media/catalog.json` é a fonte de verdade para classificação, confiança, etapa, uso, texto alternativo e regras de largura. Execute:

```bash
npm run media:process
```

O script calcula os hashes dos originais, documenta duplicatas, remove metadados dos derivados, gera WebP/AVIF responsivos, cria thumbnails e atualiza `src/media-manifest.js` e `docs/MEDIA-INVENTORY.md`.

Nunca edite `src/media-manifest.js` manualmente. Para incluir material novo, preserve o original em `media-originals/`, cadastre-o em `media/catalog.json` e execute o pipeline.

## Integração atual

| Área | Mídia |
|---|---|
| Hero e cena final | cupê preto da campanha conceitual original, claramente identificado |
| Storytelling | campanha conceitual, farol real, cabine em processo e Civic finalizado |
| Processo | cabine desmontada, piso interno tratado e farol do acervo real |
| Serviços | oito serviços prioritários na home e onze rotas individuais |
| Portfólio | Civic, HB20, Compass, Volkswagen, interior, motor e Yamaha Fazer |
| Antes/depois | cabine desmontada, trilho do banco e farol |

## Integridade visual

As placas visíveis nos arquivos de exterior já chegaram cobertas pela marca LavaMed. O processamento conserva essa cobertura e não reconstrói a região. Nenhuma alteração generativa foi feita nos veículos, rodas, pintura, faróis ou condição de limpeza. Os originais permanecem disponíveis para auditoria.

## Experiência silenciosa

Esta versão não usa música, efeitos sintetizados, arquivos sonoros ou controles de som. A decisão é intencional e preserva toda a linguagem visual e as animações.

## Vídeo

A busca recursiva não encontrou MP4, MOV ou WebM. Por isso não há cortes, posters, controles ou autoplay. A home reserva uma seção editorial para o processo e usa fotografias reais como fallback.

Para a futura integração, fornecer:

- plano horizontal curto de lavagem, espuma ou acabamento para desktop;
- plano vertical equivalente para mobile;
- execução real de higienização, motor ou farol;
- arquivos sem trilha, ou autorizados para publicação sem áudio;
- contexto suficiente para ocultar placas em todos os frames relevantes;
- autorização de imagem caso apareçam profissionais.

Antes de publicar, cada vídeo deverá receber inspeção por FFprobe, corte curto, poster estático, versões MP4/WebM, carregamento adiado e validação mobile.
