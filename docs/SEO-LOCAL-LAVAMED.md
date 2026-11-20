# SEO local — LavaMed

Auditoria e implementação local em 20/11/2026. Origem oficial: `https://lavamed.com.br/`. Nenhum push, publicação, alteração de DNS ou edição do Perfil da Empresa foi realizado.

## A. Diagnóstico inicial

### Arquitetura verificada

`scripts/build.mjs` empacota JavaScript/CSS com Vite, lê `src/index.html` e gera as páginas internas a partir de `src/config.js`. O resultado contém 19 rotas e uma página 404, sem necessidade de hidratação para ler o catálogo. GSAP/ScrollTrigger, vídeos silenciosos, comparadores, galeria, preferências de movimento e formulário já existiam. Nenhum framework ou dependência foi acrescentado.

Já estavam corretos: títulos e descrições únicos, um H1 por página, catálogo com inclusões/ressalvas/preços, links HTML para os serviços, imagens WebP/AVIF responsivas, dimensões de imagens, prioridade da imagem principal, fontes locais, bundles com hash, cache da Netlify, indicação de mídia conceitual, três pares reais de antes/depois, `AutoWash`, `WebSite`, `WebPage`, `BreadcrumbList` e `Service`.

### Problemas encontrados e prioridade

| Prioridade | Evidência anterior | Correção |
|---|---|---|
| Alta | H1 da home continha somente o slogan; pouca explicação das modalidades na home | H1 local visível, slogan preservado e introdução editorial com links úteis |
| Alta | Qualquer `SITE_URL` HTTPS habilitava indexação, incluindo o domínio secundário; previews dependiam exclusivamente de variável vazia | Somente a origem oficial permite indexação; contexto de preview prevalece sobre variáveis herdadas |
| Alta | `Disallow: /` impedia o robô de ler o `noindex` de previews | Rastreamento permitido, meta noindex e header HTTP noindex fora de produção, sitemap vazio |
| Média | `Service.offers.price` tratava valores iniciais como fixos; `priceRange` sugeria teto de R$ 350 não confirmado | `PriceSpecification.minPrice` para valores iniciais, preço fixo apenas quando cadastrado e retirada do teto |
| Média | Fotos internas WebP de tamanhos variados eram anunciadas em Open Graph como JPEG 1200 × 630 | Arte social real de 1200 × 630 em OG/Twitter; fotos específicas continuam na página e em seu schema |
| Média | Diversos CTAs apontavam a `/contato/` até o JavaScript montar o link de WhatsApp | Links contextualizados já no HTML entregue, incluindo serviço e preço oficial |
| Média | Navegação entre serviços seguia somente a ordem do catálogo | Um ou dois links relacionados por serviço, com motivo da comparação |
| Média | Descrições de serviços eram concatenações automáticas de resumo, preço e localização | Descrições editoriais próprias para os 11 serviços; intenção da home distinta da página de catálogo |
| Média | Imagem do seletor de serviços era carregada antecipadamente, embora abaixo da primeira tela | Lazy loading e decodificação assíncrona; hero permanece eager/high priority |
| Baixa | Aliases `/index.html` entregavam cópia HTTP 200 | Redirects 301 explícitos por rota existente |
| Baixa | Testes de domínio consideravam o endereço secundário indexável e não validavam coerência de preços/schema | Testes de artefato, contexto, links, dados confirmados, preços e navegador sem JS |
| Baixa | Referências visuais de menu e rodapé não refletiam o código inicial | Comparação visual e atualização das referências; nenhum controle foi removido |
| Média | Inspeção de largura do texto revelou corte em “Descontaminação” e no FAQ; nomes do catálogo excediam a coluna em 320 px | Escala responsiva para títulos longos e nome do serviço ocupando a linha disponível no catálogo mobile |

Não foram encontrados títulos duplicados, links de páginas quebrados ou páginas órfãs no artefato inicial. Os conteúdos de serviços já tinham detalhes específicos; foram preservados. Não há justificativa para criar páginas adicionais de “lava jato”, “lava rápido” ou de bairros repetindo a home.

### Conferência HTTP de produção, antes das mudanças

Consultas somente de leitura, feitas por HTTP direto porque a ferramenta de navegação não conseguiu abrir a home:

| URL / situação | Resposta observada |
|---|---|
| Home, robots e sitemap no domínio principal | 200; robots permite `/`; sitemap contém 19 URLs oficiais |
| `/servicos/lavagem-completa/` | 200 |
| Mesma rota sem barra final | 301 para a versão com barra |
| `www.lavamed.com.br/servicos/lavagem-completa/` | 301 para o domínio principal, mantendo o caminho |
| `lavamed.netlify.app/servicos/lavagem-completa/` | 301 para o domínio principal, mantendo o caminho |
| `http://lavamed.com.br/` | 301 para HTTPS |
| `/seo-audit-inexistente/` | 404 real, com página de erro |
| `/servicos/lavagem-completa/index.html` | 200 duplicado; canonical já apontava para a rota limpa |

Não foi feita uma varredura HTTP de todas as URLs de produção. As 19 rotas e seus links foram validados no artefato e no servidor local. O funcionamento dos novos redirects e headers na CDN precisa de conferência após publicação autorizada.

## B. Melhorias implementadas e arquivos

| Arquivo | Alteração e finalidade |
|---|---|
| `src/index.html` | H1 “Estética Automotiva e Lava Rápido em Itajubá” no espaço editorial do hero; slogan preservado como destaque visual; localização no apoio; introdução local e lazy loading da imagem de serviços |
| `src/assets/site.css` | Estilos discretos para H1, introdução e relacionados; mesma escala/animação do slogan; legibilidade de títulos longos, FAQ/privacidade e catálogo em telas estreitas |
| `src/config.js` | `seoDescription`, nomes SEO mais específicos e relações contextualizadas dos 11 serviços; contatos, preços, inclusões e ressalvas comerciais preservados |
| `src/site-config.js` | Origem indexável restrita a `lavamed.com.br`; previews ignoram origem herdada; produção incorreta falha antes de gerar o artefato |
| `scripts/build.mjs` | Metadados da home e catálogo, headings internos, conteúdo local, CTAs estáticos, imagem social consistente, preços mínimos no schema e IDs estáveis de serviços; geração de `_headers` e `_redirects` |
| `netlify.toml` | Remoção da regra redundante de barra final de `/servicos`; documentação de Pretty URLs e arquivos gerados; redirects de domínio e slugs antigos mantidos |
| `scripts/check-seo.mjs` | Validação do HTML publicado, metadados, imagens, links/fragmentos, alcance a partir da home, JSON-LD, preços e configuração de indexação |
| `scripts/check.mjs` | Integração da auditoria SEO às verificações existentes |
| `scripts/check-domains.mjs` | Sete cenários completos de build e rejeição de produção mal configurada |
| `scripts/serve.mjs` | Propaga falhas de build, normaliza diretórios/aliases preservando query string e mantém erros 404 reais |
| `scripts/visual-audit.mjs` | Seleciona o slogan por classe após a mudança semântica |
| `tests/e2e/seo-local.spec.mjs` | Cinco testes: home sem JS em três larguras, 11 serviços sem JS e respostas HTTP das rotas/aliases/erros |
| `tests/e2e/lavamed.spec.mjs`, `tests/e2e/visual-regression.spec.mjs` | Expectativas semânticas atualizadas; verificações visuais do slogan mantidas |
| `tests/e2e/visual-regression.spec.mjs-snapshots/` | Quatro capturas da home com H1 visível, duas de menu e uma de rodapé preexistentes desatualizadas; captura do processo em 360 px ajustada após diferença de 1 pixel na altura |
| `README.md`, `docs/DOMINIOS-SEO-DEPLOY.md` | Configuração comercial/canônica e procedimento de validação atualizados |
| `docs/SEO-LOCAL-LAVAMED.md` | Diagnóstico, implementação, validação e acompanhamento |

As URLs existentes permanecem. O sitemap de produção continua com as mesmas 19 rotas. Não foram criados serviços, avaliações, depoimentos, coordenadas ou certificações. A faixa de preço comercial visível não foi alterada; apenas sua representação estruturada foi corrigida.

### Política de domínio e deploy

- `SITE_URL=https://lavamed.com.br`, fora de contexto de preview: canonical oficial, index/follow e sitemap completo.
- `CONTEXT=production`: exige essa origem; valor ausente ou diferente interrompe o build, evitando publicação acidental de produção em noindex.
- `CONTEXT=deploy-preview`, `branch-deploy` ou `dev`: noindex mesmo com origem oficial herdada.
- Builds locais sem origem oficial, domínio secundário e origem personalizada: noindex, sem canonical/URLs de sitemap.
- O robô pode acessar previews para ler noindex. Isso não torna o ambiente privado nem substitui proteção de acesso na Netlify.
- `_headers` em produção aplica noindex somente a `404.html`; fora de produção, a todas as rotas.
- `_redirects` contém apenas os 19 aliases conhecidos `.../index.html → .../`. Não existe fallback SPA `/* → /index.html 200`.
- Pretty URLs normaliza a barra final. Forçar redirects entre variantes de barra pode causar loops; a regra redundante foi removida. Os redirecionamentos antigos e de domínio foram mantidos.

## C. Mapa de intenções de pesquisa

| Intenção / consulta | Página prioritária | Distinção |
|---|---|---|
| LavaMed; estética automotiva Itajubá; lava rápido Itajubá; lava jato Itajubá; estética automotiva bairro Medicina | `/` | Negócio, localização e escolha inicial |
| Serviços, preços e comparação de lavagens | `/servicos/` | Catálogo e comparação; título diferente da home |
| Lavagem de carro Itajubá; lavagem simples | `/servicos/lavagem-simples/` | Exclusivamente externa, sem aspiração interna |
| Lavagem completa Itajubá | `/servicos/lavagem-completa/` | Exterior, aspiração e superfícies internas |
| Lavagem detalhada Itajubá | `/servicos/lavagem-detalhada/` | Frestas e cuidado ampliado conforme catálogo |
| Higienização automotiva Itajubá | `/servicos/higienizacao-avancada/` | Limpeza interna intensiva, com condições de segurança |
| Lavagem de motor Itajubá | `/servicos/lavagem-motor/` | Tradicional e opção com verniz sob avaliação |
| Polimento de farol Itajubá | `/servicos/polimento-farol/` | Avaliação da lente, proteção e preço por par |
| Polimento automotivo Itajubá | `/servicos/polimento-comercial/` | Brilho e marcas leves, sem promessa de correção total |
| Descontaminação de pintura | `/servicos/descontaminacao-pintura/` | Contaminantes aderidos, distinto do polimento |
| Lavagem de moto | `/servicos/lavagem-moto-simples/` | Manutenção cotidiana |
| Lavagem detalhada de moto | `/servicos/lavagem-moto-detalhada/` | Áreas de difícil acesso e acabamento compatível |
| Limpeza de bancos, teto, carpetes; cuidados avulsos | `/servicos/adicionais/` | Itens sob consulta, sem páginas artificiais por item |
| Trabalhos reais / resultados documentados | `/portfolio/`, `/antes-e-depois/` | Acervo e comparações confirmadas |
| Localização, contato e agendamento | `/contato/`, `/sobre/` | Informações confirmadas e canais oficiais |

“Perto de mim” é uma intenção de proximidade; não foi repetida como palavra-chave no texto. No Search Console, observar consulta **e página** para identificar alternância entre home, catálogo e serviços. Ajustar conteúdo/links conforme evidência suficiente antes de consolidar ou redirecionar uma página.

## D. Validação

### Referência inicial

- `npm run build`: aprovado, 19 rotas e 404.
- `npm run check`: aprovado, 20 HTMLs.
- `npm run test:domains`: aprovado nos três cenários antigos; o cenário secundário ainda permitia indexação.
- `npm run audit:performance`: aprovado; métricas abaixo.
- Primeiro `npm run test:e2e`: 3 passaram e 33 falharam após indisponibilidade do servidor durante um vídeo. O teste isolado do vídeo passou com servidor acompanhado separadamente.
- Repetição completa antes de reconstruir o artefato alterado: **34 passaram, 2 falharam**, ambos por referências visuais antigas. O menu de referência não incluía o seletor de movimento existente; o rodapé ainda mostrava crédito de desenvolvimento no lugar do link de privacidade já presente no código.

### Resultado da implementação

| Comando | Resultado executado |
|---|---|
| `npm run build` | Aprovado; 19 rotas + 404, bundles e arquivos Netlify gerados |
| `npm run check` | Aprovado; 20 HTMLs, metadados, conteúdo, mídia, links e validação SEO ampliada |
| `npm run test:domains` | Aprovado; sete cenários completos, incluindo produção e previews com origem herdada, além da rejeição de produção incorreta |
| `npm run audit:performance` | Aprovado; LCP 388 ms, CLS 0 e transferência inicial 871 KB na última execução |
| `npm run test:e2e` | Última rodada completa: 40 aprovados e 1 diferença visual, em aproximadamente 3 minutos |
| `npm run test:e2e -- tests/e2e/visual-regression.spec.mjs -g 'approved editorial sections'` | Após revisão e ajuste da referência: 1/1 aprovado; inclui todas as capturas editoriais e o hero interno desse cenário |
| `git diff --check` | Aprovado, sem erros de whitespace |

Os **41 cenários ficaram validados, considerando a rodada completa e a reexecução do cenário visual afetado**. A última falha era exclusivamente a altura da captura `process-360`: 1824 px na referência e 1825 px no resultado. A comparação visual foi inspecionada, a referência foi atualizada e o cenário passou novamente. A suíte inteira não foi repetida depois desse último ajuste de PNG. As referências de manifesto e das demais larguras do processo foram preservadas.

Nenhuma falha funcional ficou pendente. A última rodada completa usou o servidor iniciado pelo próprio Playwright e não reproduziu a indisponibilidade transitória do servidor vista na primeira execução. Os avisos `NO_COLOR`/`FORCE_COLOR` do terminal não impediram os testes. O artefato final em `dist/` permanece no modo local noindex; o build da Netlify usa o contexto e a origem de produção configurados.

Os testes verificam unicidade e presença de metadados, um H1 por página, canonical oficial, sitemap correspondente às rotas, política de robots/headers por contexto, ausência de páginas órfãs, links e fragmentos válidos, dimensões/alt das imagens e metadados sociais coerentes com o JPEG real. Validam também JSON-LD sintático e sua correspondência com contatos, cidade, endereço/horários confirmados e qualificadores de preço de `src/config.js`.

A suíte de navegador cobre comportamento de menu, formulário, links de WhatsApp, vídeos e fallback, comparadores, cursor, narrativa de scroll, movimento reduzido, responsividade e capturas visuais. Os novos testes exercitam a home sem JavaScript em 1440, 390 e 320 px, os 11 serviços sem JavaScript e o status HTTP das 19 rotas, aliases e caminhos inexistentes. A verificação de tipografia foi ampliada para 1440, 820, 390 e 320 px, incluindo a largura intrínseca do texto do H1, que antes não era medida.

### Performance de laboratório

Mesma auditoria existente, Chromium local, viewport 1440 × 900, sem limitação artificial de rede/CPU. Valores individuais, sujeitos a variação de execução:

| Métrica | Antes | Depois |
|---|---:|---:|
| LCP | 572 ms | 388 ms |
| CLS observado | 0 | 0 |
| Transferência inicial de recursos | 997 KB | 871 KB |
| DOMContentLoaded | 583 ms | 193 ms |
| Recursos iniciais | 13 | 11 |

A redução observada foi de aproximadamente 12,6% na transferência inicial. O cálculo do script soma recursos e não inclui o documento HTML nem representa bytes comprimidos da CDN. A imagem LCP continua AVIF/WebP, com preload responsivo e prioridade alta. As fontes locais, vídeos sob demanda, GSAP e ScrollTrigger foram preservados. Não foram reprocessadas fotografias nem reduzida a qualidade visual.

Não foi medido INP de campo, nem feita uma medição Lighthouse mobile com rede/CPU limitadas. Os testes de interação verificam comportamento, não certificam INP. Confirmar LCP, INP e CLS no relatório de experiência/Core Web Vitals do Search Console ou em dados reais, quando houver volume suficiente. Não tratar esses números locais como promessa de pontuação ou de ranking.

## E. Pendências externas, limites e riscos

### Proprietário e Perfil da Empresa no Google

1. Confirmar horários de funcionamento/feriados. Endereço e CEP foram informados pelo proprietário após a auditoria: Rua Orminda Ribeiro Dias, R. Comendador João Carneiro, 468, Itajubá - MG, 37502-140. Os dois nomes de rua foram preservados como enviados, sem presumir esquina, entrada ou complemento.
2. Confirmar o valor da modalidade de motor com verniz, que continua sob avaliação, sem preço inventado.
3. Revisar a propriedade e a ficha ligada ao Maps, a categoria principal e categorias adicionais disponíveis que descrevam serviços realmente prestados.
4. Manter nome, site, telefone e endereço coerentes no Perfil da Empresa e no site; cadastrar os serviços reais e suas condições, sem categorias artificiais.
5. Publicar fotos reais com contexto e solicitar avaliações espontâneas a clientes reais. Não gerar avaliações, não oferecer incentivos e não selecionar apenas clientes satisfeitos para avaliar.

### Search Console e publicação autorizada

1. Revisar o diff e autorizar o deploy separadamente. Esta tarefa não realizou push ou publicação.
2. Após o deploy, conferir home, uma rota por grupo, `robots.txt`, `sitemap.xml`, canonicals e headers. Conferir 301 de HTTP/www/Netlify, barra final e aliases `index.html`, preservando query strings, sem loops.
3. Inspecionar uma URL desconhecida: deve continuar 404 real, não a home com status 200. Conferir um preview real: noindex e sitemap vazio.
4. Enviar/conferir `https://lavamed.com.br/sitemap.xml` na propriedade correta e inspecionar a home e os serviços prioritários. Solicitar nova indexação quando apropriado, sem envios repetitivos.
5. Conferir canonical declarada versus selecionada pelo Google, páginas excluídas, rastreamento e consultas que acionam mais de uma página.
6. Validar amostras publicadas no Schema Markup Validator e no Rich Results Test. A validação local cobre sintaxe/coerência, mas não substitui o processamento do Google.

`AutoWash` é um subtipo adequado de `LocalBusiness`. O endereço e o CEP confirmados pelo proprietário agora aparecem em `PostalAddress.streetAddress` e `PostalAddress.postalCode`. Horários continuam pendentes. Nenhuma estrela, exibição enriquecida, escolha de meta description ou posição é garantida. O Google pode reescrever títulos e descrições.

Os redirects de `index.html` foram verificados no artefato e no servidor local; a normalização real da Netlify deve ser confirmada após publicação. Links antigos genéricos de serviços foram mantidos para preservar comportamento; avaliar eventuais soft 404s desses destinos no Search Console antes de mudar regras sem dados de tráfego.

As consultas ao Maps, Search Console e conta Netlify exigem acesso do proprietário. A ficha, categorias, avaliações e métricas não foram editadas. O briefing contém uma amostra pequena e não permite atribuir causalidade ou prever crescimento.

## F. Métricas e acompanhamento

Atualização de localização em 20/11/2026: endereço/CEP centralizados em `src/config.js`, exibidos no rodapé de todas as páginas, na página de contato (inclusive sem JavaScript) e no FAQ. `hasMap` e todos os links de localização usam o [Maps informado pelo proprietário](https://www.google.com/maps/place/Lava+Med+-+Est%C3%A9tica+Automotiva/@-22.4349528,-45.4589267,17z/data=!4m6!3m5!1s0x94cb7de89d7530d1:0x19ffb7cbb6e2adf6!8m2!3d-22.4349528!4d-45.4589267!16s%2Fg%2F11njqg77ff), sem parâmetros de rastreamento. Nenhuma coordenada ou horário foi acrescentado ao schema.

Validação desta atualização: `npm run build`, `npm run check` e `npm run test:domains` aprovados. Sete cenários E2E afetados passaram, com atualização das três referências visuais de contato/rodapé. Depois da inspeção das capturas, os dois cenários visuais foram repetidos sem atualização de snapshots e passaram. A suíte completa e a auditoria de performance não foram repetidas para essa alteração de dados comerciais. Sem push ou deploy.

Dados fornecidos no briefing: últimos três meses, com atividade apresentada desde **28/10/2026**. **248 impressões, 10 cliques, CTR de 4%, posição média geral de 4,3**. Não confundir a média geral com posição de cada consulta.

| Consulta | Impressões | Cliques | Posição média |
|---|---:|---:|---:|
| lavamed | 15 | 2 | 1,7 |
| lava rapido itajuba | 10 | 1 | 6,4 |
| estética automotiva itajubá | 8 | 0 | 7,5 |
| lava jato itajuba | 5 | 0 | 1,4 |
| lava jato perto de mim | 5 | 0 | 6,0 |

Usar como D0 a data efetiva do deploy autorizado, não a data desta implementação local. Exportar a referência do Search Console com os mesmos filtros antes da publicação.

| Revisão | Acompanhar | Decisão baseada em evidência |
|---|---|---|
| D+28 | Indexação das rotas, canonical escolhida, impressões/cliques/CTR/posição por consulta e página; separar marca e termos comerciais | Corrigir problemas de rastreamento e confirmar que as páginas corretas recebem impressões |
| D+60 | Evolução por consulta, dispositivo e página; alternância entre home/catálogo/serviço; contatos recebidos e serviço procurado | Refinar títulos, descrições e relações internas quando a amostra sustentar a mudança |
| D+90 | Comparação de períodos equivalentes, sazonalidade, contatos qualificados e agendamentos; CWV quando disponíveis | Priorizar os serviços com demanda comprovada e revisar o plano |

Em cada revisão, registrar impressões, cliques, CTR e posição média das cinco consultas iniciais e das intenções secundárias relevantes. Comparar janelas de 28 dias equivalentes, além do acumulado desde o deploy. Sem agenda ou automação criada.

Cliques em WhatsApp não equivalem a agendamentos. Não foi adicionada coleta de dados ou analytics nesta tarefa. Para avaliar conversão, o proprietário pode registrar de forma agregada a origem dos contatos e serviços solicitados; instrumentação futura deve ter finalidade e tratamento de privacidade definidos.

## Referências técnicas consultadas

- [Schema.org: AutoWash](https://schema.org/AutoWash) — subtipo de empresa automotiva/lavagem utilizado.
- [Schema.org: minPrice](https://schema.org/minPrice) — preço mínimo em `PriceSpecification`.
- [Google: Local Business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business) — requisitos e limites de resultados enriquecidos.
- [Google: bloquear indexação com noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) — o rastreador precisa acessar a página para ler a diretiva.
- [Netlify: opções de redirecionamento](https://docs.netlify.com/manage/routing/redirects/redirect-options/) — 301, arquivos existentes, normalização de barra e Pretty URLs.
