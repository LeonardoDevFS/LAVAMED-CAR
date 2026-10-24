# LavaMed — Reflexo em movimento

Experiência digital estática para a LavaMed Estética Automotiva. O projeto combina direção editorial, fotografia automotiva, narrativa controlada por scroll e interações acessíveis, sem depender de framework ou biblioteca de animação no cliente.

## Executar

Requer Node.js 22 ou mais recente.

```bash
npm run build
npm run check
npm run dev
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
- `scripts/build.mjs`: geração das rotas estáticas, metadados, sitemap e robots;
- `scripts/check.mjs`: validação estrutural do build;
- `netlify.toml`: publicação e cabeçalhos de segurança/cache.

As rotas geradas incluem home, índice e seis páginas de serviços, portfólio, antes/depois, sobre, contato, FAQ, privacidade e página 404.

## Acessibilidade e movimento

O menu retém foco e fecha com `Esc`; o comparador funciona com ponteiro, toque e setas; há link de salto, foco visível e conteúdo semântico. `prefers-reduced-motion` remove a narrativa presa ao scroll e as animações contínuas.

## Publicação

O `netlify.toml` já aponta para `dist/`. Na Netlify, use o comando `npm run build` e publique a pasta `dist`.
