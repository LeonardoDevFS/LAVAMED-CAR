# Domínios, SEO e publicação

Endereços confirmados em 28/10/2026:

- Principal: `https://lavamed.com.br`.
- Secundário: `https://lavamed.netlify.app`.
- Variante: `https://www.lavamed.com.br`.

O `netlify.toml` define `SITE_URL=https://lavamed.com.br` somente no contexto Production. O build usa essa origem para canonical, Open Graph, Twitter Card, JSON-LD, sitemap e robots.txt. A página 404 permanece `noindex`.

O endereço secundário e a variante www têm redirecionamentos 301 para o domínio principal, preservando o caminho. As regras estão antes dos redirecionamentos de serviços antigos. O endereço secundário continua sendo uma entrada para o site; o conteúdo tem uma única origem canônica.

Deploy Previews, Branch Deploys e Netlify Dev recebem `SITE_URL` vazio. O build também verifica `CONTEXT`, impedindo a indexação mesmo quando uma variável herdada contém a origem principal. Builds locais sem a origem principal explícita e builds destinados ao domínio secundário ou a outra origem permanecem sem indexação. `CONTEXT=production` exige `SITE_URL=https://lavamed.com.br`; outra configuração interrompe o build. A variável automática `URL` da Netlify não é usada como origem pública.

Fora de produção, o HTML contém `noindex,nofollow`, o sitemap fica vazio e o arquivo gerado `dist/_headers` aplica `X-Robots-Tag` a todas as rotas. O robots permite rastreamento para que o robô consiga ler o noindex. Isso não é controle de acesso: previews confidenciais precisam de proteção na hospedagem. Em produção, o noindex do arquivo de headers vale apenas para `404.html`.

As 19 rotas conservam seus slugs e a barra final. Pretty URLs da Netlify cuida da normalização da barra; não se deve forçar redirects entre duas variantes equivalentes. `dist/_redirects` contém apenas aliases explícitos de `index.html` para as respectivas rotas, com 301, sem captura de caminhos inexistentes. Confira essas regras na CDN após o deploy autorizado; o servidor local cobre o comportamento esperado, mas não emula integralmente a Netlify.

## Validação local

```powershell
npm run test:domains
$env:SITE_URL = 'https://lavamed.com.br'
npm run build
npm run check
Remove-Item Env:SITE_URL
```

O teste de domínios verifica as 20 páginas HTML, metadados, dados estruturados, links, sitemap, robots e headers em sete cenários: local, secundário, produção, deploy-preview, branch-deploy, dev e origem de preview personalizada. Também rejeita produção com origem incorreta. Ao terminar, restaura o build local sem indexação.

## Netlify e descoberta

O repositório configura o build e os redirecionamentos. A associação dos domínios, o domínio principal no painel, o DNS e os certificados HTTPS pertencem à conta da Netlify e ao provedor de DNS. Nenhuma dessas configurações externas é alterada pelo build.

Após o próximo deploy de produção, conferir:

- `https://lavamed.com.br/` abre em HTTPS.
- O endereço secundário e www chegam ao principal, inclusive em páginas internas.
- `https://lavamed.com.br/sitemap.xml` contém somente URLs do domínio principal.
- `https://lavamed.com.br/robots.txt` permite rastreamento e aponta para esse sitemap.
- As páginas têm canonical no domínio principal.

No Google Search Console, usar a propriedade de `lavamed.com.br` e enviar `https://lavamed.com.br/sitemap.xml`. Se for usada a verificação por meta tag, definir o token real em `GOOGLE_SITE_VERIFICATION` na Netlify. A configuração não inclui um token inventado. No Perfil da Empresa, usar `https://lavamed.com.br/` como website.

Estas alterações locais não publicam o site automaticamente.
