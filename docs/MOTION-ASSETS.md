# Assets necessários para a versão final

A arquitetura já aceita os materiais abaixo sem reprogramar as timelines. Enquanto não forem fornecidos, o site usa artes de campanha ou placeholders declarados.

## Identidade oficial

- Logotipo oficial em SVG, com versão clara para fundo escuro.
- Símbolo isolado, se existir.
- Área de proteção e cores oficiais.

Substituir `src/assets/logo-mark.svg`. O arquivo atual continua provisório porque o asset oficial não acompanhou o briefing.

## Storytelling — quatro atos

Preferência por arquivos JPEG ou AVIF entre 2000 e 3000 px de largura, com autorização de uso:

1. veículo completo em estúdio escuro, enquadramento três quartos;
2. detalhe real de roda, farol ou pintura;
3. macro de superfície molhada compatível com deslocamento de água;
4. veículo finalizado em enquadramento amplo.

Os atos aceitam fotografias diferentes. A timeline atual usa as duas artes disponíveis e não apresenta essa duplicação como geometria 3D.

## Serviços

Uma fotografia horizontal por serviço, preferencialmente 3:2:

- lavagem técnica;
- higienização interna;
- polimento automotivo;
- vitrificação;
- detalhamento;
- revitalização.

Definir o caminho no campo `image` do serviço em `src/config.js`. Sem imagem, permanece o placeholder gráfico com a mensagem de acervo pendente.

## Portfólio

Fornecer de seis a dez trabalhos reais, com autorização, nome do serviço e contexto mínimo. Alternar enquadramentos horizontais e verticais. As duas imagens atuais são direção de campanha, não serviços realizados.

## Antes e depois

Cada par deve registrar o mesmo veículo, ângulo, distância focal, corte e iluminação comparável. Cadastrar em `comparisonPairs`, dentro de `src/config.js`, no formato:

```js
{
  title: "Descrição confirmada do trabalho",
  before: "/assets/images/trabalho-antes.jpg",
  after: "/assets/images/trabalho-depois.jpg",
  altBefore: "Descrição acessível da imagem anterior",
  altAfter: "Descrição acessível da imagem posterior"
}
```

Nenhum par é publicado enquanto o array permanecer vazio.
