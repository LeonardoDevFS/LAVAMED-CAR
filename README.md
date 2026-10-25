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

Edite `src/config.js` para manter apenas dados confirmados. Já estão cadastrados:

- WhatsApp oficial com código do país e DDD;
- Instagram oficial;
- localização compartilhada no Google Maps;
- cidade de Itajubá e bairro Medicina.

Ainda faltam rua/número, horário de funcionamento e domínio canônico. Enquanto esses campos estiverem vazios, o site não publica informações presumidas. Os botões de agendamento e o formulário abrem o WhatsApp oficial com uma mensagem contextualizada.

Os 11 grupos de serviços, preços, qualificadores (`a partir de`, valor informado ou `sob consulta`), inclusões e ressalvas também ficam em `src/config.js`. A mesma fonte alimenta catálogo, páginas individuais, formulário, dados estruturados e seleção editorial da home.

## Conteúdo real

As imagens atuais são artes de campanha geradas para definir a direção visual. Elas não são apresentadas como trabalhos executados ou provas de resultado. Antes de publicar o portfólio e o comparador de antes/depois, inclua fotografias autorizadas, correspondentes e reais.

O logotipo oficial está em `src/assets/images/hero/LavaMed_logo_vetorial_HD.svg` e aparece no cabeçalho, no rodapé e como favicon. O arquivo legado `src/assets/logo-mark.svg` permanece apenas como histórico da assinatura provisória.

## Arquitetura

- `src/index.html`: home cinematográfica;
- `src/assets/site.css`: direção visual e layouts responsivos;
- `src/assets/site.js`: menu, scroll storytelling, comparação, galeria, cursor e microinterações;
- `src/config.js`: dados comerciais e catálogo de serviços;
- `scripts/build.mjs`: bundling Vite, rotas estáticas, metadados, sitemap e robots;
- `scripts/check.mjs`: validação estrutural do build;
- `tests/e2e`: testes reais de navegador com Playwright;
- `netlify.toml`: publicação e cabeçalhos de segurança/cache.

As rotas geradas incluem home, catálogo e 11 páginas de serviços, portfólio, antes/depois, sobre, contato, FAQ, privacidade e página 404.

## Acessibilidade e movimento

O menu retém foco e fecha com `Esc`; o comparador funciona com ponteiro, toque e setas; há link de salto, foco visível e conteúdo semântico. `prefers-reduced-motion` remove a narrativa presa ao scroll e as animações contínuas.

## Motion design

O hero utiliza uma composição 2.5D com fundo, carro recortado, camada especular, luz e profundidade. O storytelling possui quatro atos sincronizados ao scroll por ScrollTrigger, com pinning no desktop e versão sticky mais leve no mobile. A terceira cena combina filtro SVG de deslocamento, máscara orgânica e canvas de cáusticas.

Serviços sem fotografia exibem composições gráficas identificadas como placeholders. Para adicionar imagens específicas, preencha o campo `image` de cada serviço em `src/config.js`. Os quatro atos da narrativa usam `storyActs`, e pares reais de antes/depois são cadastrados em `comparisonPairs`.

## Publicação

O `netlify.toml` já aponta para `dist/`, inclui os redirecionamentos 301 dos slugs antigos e mantém os cabeçalhos de cache. Na Netlify, use o comando `npm run build` e publique a pasta `dist`.

Defina `SITE_URL` somente no contexto Production com a origem pública que estiver realmente ativa. O build não usa automaticamente a variável `URL` da Netlify. Sem `SITE_URL`, canonical e `og:url` são omitidos, as páginas recebem `noindex`, o sitemap não publica URLs e `robots.txt` bloqueia rastreamento.

O planejamento completo para `lava-med-netlify.netlify.app`, a futura migração para `lavamed.com.br`, Search Console e Perfil da Empresa está em [docs/DOMINIOS-SEO-DEPLOY.md](docs/DOMINIOS-SEO-DEPLOY.md).

Use `npm run test:domains` para validar automaticamente os cenários local, provisório e comercial.

## Capturas verificadas

- [Home desktop 1440 × 900](docs/screenshots/home-desktop.png)
- [Home mobile 390 × 844](docs/screenshots/home-mobile.png)
- [Catálogo desktop](docs/screenshots/catalog-desktop.png)
- [Catálogo mobile](docs/screenshots/catalog-mobile.png)
- [Detalhe de serviço com placeholder](docs/screenshots/service-detail.png)
