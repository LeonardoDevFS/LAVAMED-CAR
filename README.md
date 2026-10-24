# LavaMed — Reflexo em movimento

Experiência digital estática para a LavaMed Estética Automotiva. O projeto combina direção editorial, fotografia automotiva, narrativa controlada por scroll, GSAP/ScrollTrigger e interações acessíveis. O JavaScript e o CSS são empacotados pelo Vite com nomes versionados.

## Executar

Requer Node.js 22 ou mais recente.

```bash
npm install
npm run build
npm run check
npm run dev
npm run test:e2e
```

O servidor local abre em `http://127.0.0.1:4173`. A saída de produção fica em `dist/`.

## Configuração comercial

Edite `src/config.js` para cadastrar apenas dados confirmados:

- WhatsApp com código do país e DDD;
- cidade e endereço;
- horário de funcionamento;
- Instagram e Google Maps;
- domínio canônico.

Enquanto esses campos estiverem vazios, o site não publica informações presumidas. Os botões de agendamento levam à página de contato e o formulário informa que o canal oficial está em atualização.

## Conteúdo real

As imagens atuais são artes de campanha geradas para definir a direção visual. Elas não são apresentadas como trabalhos executados ou provas de resultado. Antes de publicar o portfólio e o comparador de antes/depois, inclua fotografias autorizadas, correspondentes e reais.

O logotipo em `src/assets/logo-mark.svg` é uma assinatura tipográfica provisória. Substitua-o pelo arquivo oficial quando ele for fornecido, preservando o mesmo nome ou atualizando as referências.

## Arquitetura

- `src/index.html`: home cinematográfica;
- `src/assets/site.css`: direção visual e layouts responsivos;
- `src/assets/site.js`: menu, scroll storytelling, comparação, galeria, cursor e microinterações;
- `src/config.js`: dados comerciais e catálogo de serviços;
- `scripts/build.mjs`: bundling Vite, rotas estáticas, metadados, sitemap e robots;
- `scripts/check.mjs`: validação estrutural do build;
- `tests/e2e`: testes reais de navegador com Playwright;
- `netlify.toml`: publicação e cabeçalhos de segurança/cache.

As rotas geradas incluem home, índice e seis páginas de serviços, portfólio, antes/depois, sobre, contato, FAQ, privacidade e página 404.

## Acessibilidade e movimento

O menu retém foco e fecha com `Esc`; o comparador funciona com ponteiro, toque e setas; há link de salto, foco visível e conteúdo semântico. `prefers-reduced-motion` remove a narrativa presa ao scroll e as animações contínuas.

## Motion design

O hero utiliza uma composição 2.5D com fundo, carro recortado, camada especular, luz e profundidade. O storytelling possui quatro atos sincronizados ao scroll por ScrollTrigger, com pinning no desktop e versão sticky mais leve no mobile. A terceira cena combina filtro SVG de deslocamento, máscara orgânica e canvas de cáusticas.

Serviços sem fotografia exibem composições gráficas identificadas como placeholders. Para adicionar imagens específicas, preencha o campo `image` de cada serviço em `src/config.js`. Pares reais de antes/depois são cadastrados em `comparisonPairs`.

## Publicação

O `netlify.toml` já aponta para `dist/`. Na Netlify, use o comando `npm run build` e publique a pasta `dist`.

## Capturas verificadas

- [Desktop 1440 × 900](docs/screenshots/lavamed-desktop.jpg)
- [Mobile 390 × 844](docs/screenshots/lavamed-mobile.jpg)
