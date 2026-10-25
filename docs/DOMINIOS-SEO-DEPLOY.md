# Domínios, Netlify e SEO local — LavaMed

Este documento separa a publicação em duas fases. Nenhum domínio é tratado como ativo apenas por constar no código.

## Configuração central

Os endereços planejados ficam em `src/site-config.js`:

- nome desejado do projeto Netlify: `lava-med-netlify`;
- URL provisória desejada: `https://lava-med-netlify.netlify.app`;
- URL comercial futura: `https://lavamed.com.br`;
- alternativa futura: `https://www.lavamed.com.br`;
- origem canônica ativa: variável de build `SITE_URL`;
- verificação opcional do Search Console: `GOOGLE_SITE_VERIFICATION`.

`SITE_URL` é a única fonte da origem pública no build. A variável automática `URL` da Netlify não é usada. Isso evita que Deploy Previews ou endereços ainda não confirmados publiquem canonical incorreto.

Com `SITE_URL` ausente, o build entra em modo local/preview:

- não gera canonical nem `og:url`;
- mantém imagens Open Graph relativas;
- inclui `noindex,nofollow` nas páginas;
- deixa o sitemap sem URLs;
- publica `robots.txt` com `Disallow: /`.

Com `SITE_URL` válido, o build exige HTTPS e uma origem sem caminho, query string ou fragmento. As páginas públicas recebem canonical, `og:url`, Open Graph absoluto, Twitter Card, JSON-LD, sitemap e `robots.txt` vinculados à origem ativa. A página 404 continua `noindex`.

## Diagnóstico público em 25/10/2026

- `lava-med-netlify.netlify.app` resolveu em DNS para a infraestrutura da Netlify, porém respondeu HTTP 404.
- A consulta pública da API da Netlify respondeu 401 sem autenticação.
- `lavamed.com.br` e `www.lavamed.com.br` não resolveram em DNS durante o teste.

Esses sinais não confirmam que o nome Netlify esteja disponível para reserva nem que o domínio comercial esteja livre para compra. A confirmação real acontece, respectivamente, ao criar/renomear o projeto autenticado na Netlify e ao consultar/comprar o domínio em um registrador.

## Fase 1 — subdomínio provisório da Netlify

1. Na Netlify, escolher **Add new project → Import an existing project** e conectar o repositório `LeonardoDevFS/LAVAMED-CAR`.
2. Selecionar a branch de produção aprovada.
3. Confirmar:
   - Build command: `npm run build`;
   - Publish directory: `dist`;
   - Node: `22.23.4` ou uma versão compatível com `>=22.12`.
4. Em **Project configuration → General**, tentar definir o nome `lava-med-netlify`. O nome do projeto é o que determina o subdomínio `netlify.app` e não pode ser reservado por `netlify.toml`.
5. Se o painel aceitar o nome e o primeiro deploy responder normalmente, abrir **Project configuration → Environment variables** e criar:
   - chave: `SITE_URL`;
   - valor: `https://lava-med-netlify.netlify.app`;
   - escopo: Builds;
   - contexto: Production somente.
6. Não definir `SITE_URL` para Deploy Previews ou Branch deploys. Eles permanecerão `noindex`.
7. Fazer novo deploy e conferir o código-fonte da home, `robots.txt` e `sitemap.xml`.

Se `lava-med-netlify` não estiver disponível, escolher o endereço real no painel antes de publicar. Depois, atualizar `provisionalUrl` em `src/site-config.js` e definir `SITE_URL` com o subdomínio efetivamente atribuído. Não manter canonical apontando para um nome desejado, mas inexistente.

A Netlify permite valores de ambiente diferentes por contexto; a variável precisa estar disponível ao escopo de build. Consulte a documentação oficial de [variáveis de ambiente](https://docs.netlify.com/build/environment-variables/overview/) e [deploy contexts](https://docs.netlify.com/deploy/deploy-overview/).

## Fase 2 — domínio comercial

Executar somente depois de comprar `lavamed.com.br` e ter acesso ao DNS:

1. Em **Domain management**, adicionar `lavamed.com.br` ao projeto.
2. Configurar o DNS exatamente como indicado pela Netlify, usando Netlify DNS ou o provedor externo escolhido.
3. Tornar `lavamed.com.br` o domínio principal, sem `www`. Ao usar o domínio apex como principal, a Netlify cria a alternativa `www` e a redireciona para o principal; confirmar o comportamento no painel.
4. Aguardar a validação DNS e a emissão do certificado HTTPS. Não avançar enquanto o certificado não estiver ativo.
5. Alterar a variável Production para `SITE_URL=https://lavamed.com.br`.
6. Fazer novo deploy e validar todas as rotas, canonical, Open Graph, JSON-LD, sitemap e HTTPS.
7. Somente depois dessa validação, ativar o redirecionamento permanente do subdomínio Netlify para o domínio comercial. O trecho preparado em `docs/netlify-domain-migration.toml.example` não está ativo e deve ser incorporado ao `netlify.toml` apenas nessa fase.
8. Preservar todos os caminhos. Exemplo: `/servicos/polimento-farol/` deve chegar ao mesmo caminho no novo domínio.

As instruções oficiais ficam em [custom domains](https://docs.netlify.com/domains-https/custom-domains/), [múltiplos domínios e primário](https://docs.netlify.com/domains/manage-domains/manage-multiple-domains/) e [HTTPS/DNS](https://docs.netlify.com/manage/domains/troubleshooting-tips/).

## Google Search Console

### Enquanto o endereço provisório estiver ativo

1. Adicionar uma propriedade do tipo **URL-prefix** para `https://lava-med-netlify.netlify.app/`.
2. Escolher a verificação por tag HTML.
3. Copiar apenas o valor de `content` fornecido pelo Google e cadastrá-lo na Netlify como `GOOGLE_SITE_VERIFICATION`, com escopo Builds e contexto Production.
4. Fazer novo deploy, verificar a tag no código-fonte e concluir a validação no Search Console.
5. Enviar `https://lava-med-netlify.netlify.app/sitemap.xml`.

### Depois da migração comercial

1. Adicionar uma propriedade de domínio para `lavamed.com.br` e verificar via registro DNS TXT. A propriedade de domínio cobre protocolos e subdomínios.
2. Manter também uma propriedade URL-prefix de `https://lavamed.com.br/` se for útil para inspeções específicas.
3. Enviar `https://lavamed.com.br/sitemap.xml`.
4. Inspecionar a home e as páginas prioritárias de serviços e solicitar indexação quando apropriado.
5. Manter as duas propriedades durante a migração e acompanhar indexação, erros e tráfego. Usar a ferramenta de mudança de endereço apenas se ela estiver disponível para as propriedades verificadas e se todos os redirecionamentos 301 já tiverem sido validados.

A tag HTML serve para propriedades URL-prefix; propriedades de domínio exigem verificação DNS. Consulte [verificação de propriedade](https://support.google.com/webmasters/answer/9008080) e [tarefas principais do Search Console](https://support.google.com/webmasters/answer/10351509).

## Perfil da Empresa no Google

1. Reivindicar e verificar o Perfil da Empresa com a conta oficial, caso isso ainda não tenha sido feito.
2. Usar somente nome, telefone, categoria, endereço e horários confirmados. Não completar os campos pendentes por inferência.
3. No campo **Website**, publicar primeiro a URL provisória que estiver realmente acessível.
4. Depois da migração e dos redirecionamentos, trocar o website para `https://lavamed.com.br/`.
5. Manter o mesmo telefone, nome LavaMed e localização usados no site.
6. Adicionar logo e fotos reais autorizadas quando disponíveis.

O Perfil da Empresa e o Search Console não precisam de uma associação técnica direta para funcionar; o vínculo prático é a propriedade verificada, a URL oficial e os dados comerciais consistentes. Consulte a orientação oficial para [adicionar ou reivindicar o perfil](https://support.google.com/business/answer/2911778) e o [Learning Center do Perfil da Empresa](https://support.google.com/business/answer/15697615).

## SEO local implementado

- títulos e descrições únicos;
- termos de busca usados apenas onde são naturais ao serviço;
- páginas rastreáveis para os 11 serviços;
- breadcrumbs visíveis e `BreadcrumbList` em JSON-LD;
- `AutoWash`, `Service` e `FAQPage` em dados estruturados;
- telefone, Instagram, Maps, cidade e bairro nos dados reais;
- links internos entre catálogo, serviços relacionados, FAQ e contato;
- sitemap e canonical controlados pela mesma origem;
- 404 fora do índice;
- previews e builds locais protegidos contra indexação acidental.

SEO melhora a elegibilidade e a compreensão do site, mas não garante posições específicas. Resultados dependem também de concorrência, autoridade, avaliações, Perfil da Empresa, conteúdo real e consistência dos dados locais.

## Comandos de validação

```powershell
npm run build
npm run check
npm run test:domains
npm run test:e2e
```

O teste de domínios recompila e valida três cenários: local sem origem, Netlify provisório e domínio comercial futuro. Ao terminar, restaura `dist/` ao modo local `noindex`.

Para inspecionar manualmente uma origem sem publicá-la:

```powershell
$env:SITE_URL = 'https://lava-med-netlify.netlify.app'
npm run build
Remove-Item Env:SITE_URL
```

Não commitar `.env` com tokens de verificação ou credenciais.
