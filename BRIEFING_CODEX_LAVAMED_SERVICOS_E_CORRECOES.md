# BRIEFING OFICIAL — LAVAMED ESTÉTICA AUTOMOTIVA
## Conteúdo comercial completo + integração ao site existente + auditoria de bugs

**Destinatário:** Codex (atuar como engenheiro front-end sênior, diretor de arte digital, especialista em animações GSAP e revisor de UX/SEO).

**Repositório:** https://github.com/LeonardoDevFS/LAVAMED-CAR  
**Base inspecionada:** branch `main`, commit `51d61f46c9b3ad3b8687b0f92b6445732a2ce627` (24/10/2026).  
**Objetivo:** incorporar integralmente o conteúdo comercial abaixo, substituir o catálogo provisório, corrigir problemas já observados e preservar/evoluir o visual cinematográfico, autoral e inspirado no Awwwards. **O presente arquivo é um briefing, não uma confirmação de que os bugs foram corrigidos.**

---

# 1. INSTRUÇÃO PRINCIPAL AO CODEX

**Analise o repositório de verdade antes de editar. Não gere um site novo e genérico.** A base atual tem HTML gerado por `scripts/build.mjs`, Vite, GSAP/ScrollTrigger, CSS autoral, galeria horizontal, comparador e páginas estáticas. Mantenha o que funciona e faça as alterações necessárias para que a LavaMed passe a divulgar seus serviços reais, preços e sua localização em Itajubá (bairro Medicina), sem perder o efeito premium.

- **Não substituir a estética existente por cards repetidos, layout SaaS, gradientes genéricos ou uma landing page com aparência de IA.** O movimento e o ritmo visual devem continuar protagonistas.
- **Todas as informações comerciais deste briefing devem ser consideradas como fornecidas pelo proprietário**, mas NÃO invente dados faltantes: rua, número, CEP, CNPJ, telefone, WhatsApp, horários, avaliações, certificados, resultados fotográficos ou domínio.
- **Incorporar todos os serviços, detalhes, preços e diferenciais abaixo**, de maneira escaneável para o público: resumo editorial na home, páginas detalhadas, grupos/categorias claros e chamadas para agendamento.
- **Preservar o conteúdo, mas melhorar a redação quando necessário:** tirar repetições, evitar promessas técnicas absolutas não demonstradas, corrigir ortografia e excesso de linguagem promocional; **não omitir itens reais nem alterar preços** sem justificativa e aprovação.
- As fotos do repositório são artes de campanha, não trabalhos reais. Não apresentá-las como prova de resultado da LavaMed.
- Enviar mudanças via fluxo seguro de branch/PR, não sobrescrever a base sem necessidade. Na entrega, descrever os testes efetivamente executados.

---

# 2. DADOS COMERCIAIS CONHECIDOS

| Campo | Informação |
|---|---|
| Marca | LavaMed Estética Automotiva |
| Cidade | Itajubá, Minas Gerais (MG) |
| Bairro | Medicina |
| Área de atuação | Itajubá e região; confirmar antes de ampliar localidades específicas |
| Endereço completo | **NÃO INFORMADO — não inventar rua/número** |
| WhatsApp | **NÃO INFORMADO — manter configurável, sem URL falsa** |
| Horários | **NÃO INFORMADOS — não inventar** |
| Instagram / Maps | **NÃO INFORMADOS — manter configuráveis** |
| Domínio definitivo | **NÃO INFORMADO — não usar `lavamed.example` em produção** |
| Moeda | BRL (real brasileiro) |

O nome deve ser grafado de forma consistente: **LavaMed** (ou **LAVAMED** em títulos de marca).

---

# 3. TEXTO INSTITUCIONAL — HOME E SOBRE

## 3.1. Texto completo fornecido pelo proprietário

> Bem-vindo à LavaMed, a sua estética automotiva de confiança em Itajubá! Localizada estrategicamente no coração do bairro Medicina, nossa missão é cuidar do seu veículo com a máxima excelência, unindo técnica profissional, produtos de alta qualidade e um atendimento humanizado.
>
> Sabemos que o seu carro é mais do que um meio de transporte: é um investimento e uma paixão. Por isso, a LavaMed oferece soluções completas de limpeza, proteção e embelezamento automotivo, garantindo que seu veículo saia daqui com o brilho e o aspecto de um verdadeiro zero quilômetro. Do cuidado minucioso com os detalhes internos à proteção de alto nível para a pintura, nossa equipe está preparada para superar suas expectativas.
>
> Se você mora ou trabalha em Itajubá, venha nos fazer uma visita no bairro Medicina e descubra o que a verdadeira estética automotiva pode fazer pelo seu carro. Agende o seu horário e proporcione ao seu veículo o cuidado que ele merece!

### Como aplicar

- Na **home**, resumir em blocos editoriais com ótima hierarquia visual. Mostrar «LavaMed em Itajubá • Bairro Medicina», uma proposta de valor direta e CTA para serviços/agendamento.
- Em **/sobre/**, publicar um texto completo e bem diagramado, preservando: confiança, bairro Medicina, cuidado profissional, produtos adequados, atendimento humanizado, limpeza/proteção/embelezamento, valorização do veículo e convite à visita.
- Manter o texto de marca «Não é só lavar. É transformar.» na experiência principal, se visualmente apropriado.
- **Não transformar «aspecto de zero quilômetro» em garantia de restauração**: é linguagem descritiva de resultado estético, dependente do estado do veículo.

---

# 4. CATÁLOGO OFICIAL DE SERVIÇOS E PREÇOS

**Regra de exibição:** sempre mostrar o preço com «a partir de» quando indicado abaixo. Valores por veículo/serviço sujeitos à avaliação e confirmação do estabelecimento; não estimar adicionais.

## Tabela-resumo para home e catálogo

| Categoria | Serviço | Preço informado | Como anunciar |
|---|---|---:|---|
| Carros — Lavagem | Lavagem Simples (apenas exterior) | R$ 40 | **A partir de R$ 40** |
| Carros — Lavagem | Lavagem Completa (externa e interna) | R$ 80 | **A partir de R$ 80** |
| Carros — Lavagem | Lavagem Detalhada (estética premium) | R$ 160 | **A partir de R$ 160** |
| Carros — Higienização | Higienização e Estética Avançada | R$ 350 | **A partir de R$ 350** |
| Avulsos — Motor | Lavagem Técnica do Motor (tradicional e opção com verniz) | R$ 60 | **A partir de R$ 60**; valor da opção com verniz a confirmar |
| Avulsos — Faróis | Polimento de Farol com Proteção | R$ 80 / par | **A partir de R$ 80 o par** |
| Avulsos — Pintura | Descontaminação de Pintura | R$ 75 | **A partir de R$ 75** |
| Avulsos — Pintura | Polimento Comercial | R$ 350 | **A partir de R$ 350** |
| Motos — Lavagem | Lavagem Simples de Moto | R$ 40 | **R$ 40** (informado como valor fechado, confirmar se varia por porte) |
| Motos — Lavagem | Lavagem Detalhada de Moto | R$ 70 | **A partir de R$ 70** |
| Personalizados | Serviços Adicionais e Estética Personalizada | Não informado | **Sob consulta / solicitar orçamento** |

## 4.1. Lavagem Simples (Apenas Exterior)

**Preço:** a partir de **R$ 40**.  
**Categoria:** carros / lavagem.  
**Escopo:** limpeza exclusivamente externa, para manter lataria e rodas bem cuidadas com rapidez e eficiência.

**Inclui:**

1. **Pré-lavagem:** remoção da sujeira pesada para minimizar o risco de riscos na pintura.
2. **Lavagem:** limpeza cuidadosa de toda a lataria externa.
3. **Caixas de roda, pneus e calotas:** remoção de sujeira e resíduos nessas regiões.
4. **Acabamento:** aplicação de pretinho nas laterais dos pneus, para aspecto renovado.

**Atenção expressa:** **NÃO inclui limpeza ou aspiração do interior do veículo.** Essa exclusão deve estar clara na página e no comparador de pacotes.

## 4.2. Lavagem Completa (Externa e Interna)

**Preço:** a partir de **R$ 80**.  
**Categoria:** carros / lavagem.  
**Escopo:** limpeza externa e interna para renovação do aspecto e conforto do veículo.

**Inclui:**

1. **Pré-lavagem:** remoção inicial de sujeira pesada para reduzir o risco de marcas na pintura.
2. **Lavagem externa:** limpeza cuidadosa de toda a lataria.
3. **Caixas de roda, pneus e calotas:** remoção de resíduos e sujeira.
4. **Aspiração total:** carpete, bancos e porta-malas.
5. **Limpeza de painel e portas:** limpeza de superfícies internas com produtos adequados ao material.
6. **Limpeza dos vidros:** faces internas e externas.
7. **Acabamento:** pretinho nas laterais dos pneus.

**Posicionamento:** opção para quem quer cuidados internos e externos no mesmo pacote.

## 4.3. Lavagem Detalhada (Estética Premium)

**Preço:** a partir de **R$ 160**.  
**Categoria:** carros / lavagem premium.  
**Escopo:** procedimento minucioso, cobrindo locais de difícil acesso e detalhes internos e externos.

**Inclui:**

1. **Pré-lavagem:** remoção cuidadosa de sujeira pesada.
2. **Lavagem externa:** limpeza detalhada da lataria.
3. **Lavagem do chassi:** remoção de terra, graxa e resíduos na parte inferior quando tecnicamente apropriado.
4. **Caixas de roda, pneus e calotas:** limpeza profunda.
5. **Cantos e frestas:** dobradiças, vãos do porta-malas, grades e emblemas.
6. **Aspiração profunda:** carpete, bancos e porta-malas.
7. **Limpeza de bancos e teto:** higienização dedicada, de acordo com a condição e o material, visando reduzir sujeiras e manchas tratáveis.
8. **Tratamento dos plásticos internos:** limpeza e condicionamento com produtos específicos.
9. **Limpeza dos vidros:** faces internas e externas.
10. **Acabamento:** pretinho de alta fixação nas laterais dos pneus.

**Posicionamento:** nível de cuidado premium para conservação, aparência e detalhamento do carro.

## 4.4. Higienização e Estética Avançada

**Preço:** a partir de **R$ 350**.  
**Categoria:** carros / higienização avançada.  
**Escopo:** limpeza interna intensiva e cuidados técnicos adicionais, conforme avaliação.

**Inclui:**

1. **Remoção técnica dos bancos:** retirada cuidadosa quando aplicável para alcançar estofados e áreas inferiores. Verificar condições de segurança e particularidades do veículo antes do serviço.
2. **Carpete e assoalho:** limpeza profunda e extração de sujeiras, manchas e resíduos.
3. **Limpeza técnica do motor:** cuidado específico para remover graxa, poeira e resíduos visíveis, respeitando componentes sensíveis.
4. **Bancos e teto:** lavagem/extração adequada ao material e à condição.
5. **Plásticos internos:** limpeza profunda e condicionamento contra ressecamento, de acordo com o produto aplicado.
6. **Cantos e frestas:** dobradiças, porta-malas, grades, difusores de ar e emblemas.
7. **Pré-lavagem e lavagem externa:** limpeza de lataria com técnica apropriada.
8. **Lavagem do chassi:** remoção de terra e resíduos da parte inferior quando aplicável.
9. **Caixas de roda, pneus e calotas:** limpeza profunda.
10. **Vidros e acabamento:** limpeza dos vidros e pretinho nas laterais dos pneus.

**Importante para revisão editorial:** o texto original menciona eliminar *completamente* ácaros, bactérias, odores e microrganismos. **Não publicar garantias absolutas de eliminação ou benefícios de saúde sem comprovação verificável, produto/processo validado e revisão técnica.** Preferir «limpeza profunda, remoção de sujeiras e tratamento de odores, de acordo com a avaliação». Também evitar «restauração extrema garantida».

## 4.5. Lavagem Técnica do Motor

**Preço:** a partir de **R$ 60**.  
**Categoria:** avulsos / motor.  
**Há duas modalidades — manter ambas visíveis:**

### Modalidade A — Tradicional

Limpeza detalhada dos componentes visíveis do compartimento do motor, utilizando produtos apropriados (descritos pelo proprietário como biodegradáveis) e pincéis de detalhamento. O objetivo é retirar sujeira, graxa e poeira com atenção aos componentes elétricos, mangueiras e conectores.

### Modalidade B — Com Aplicação de Verniz de Motor

Inclui a limpeza tradicional e uma aplicação de verniz de motor para acabamento visual e proteção, conforme compatibilidade do produto com os materiais e condições de uso.

**Benefícios indicados no material comercial original:**

- Ajuda a formar película protetora em superfícies adequadas.
- Pode contribuir para conservação de peças plásticas, borrachas e certos metais, conforme formulação.
- Confere acabamento visual renovado.
- Pode facilitar limpezas posteriores em superfícies tratadas.

**Não inventar preço individual do verniz.** Confirmar materiais nos quais a aplicação é permitida. Evitar prometer que verniz impede oxidação, elimina desgaste, resiste a todas as temperaturas ou protege indiscriminadamente todas as peças.

## 4.6. Polimento de Farol com Proteção de Alta Tecnologia

**Preço:** a partir de **R$ 80 o par**.  
**Categoria:** avulsos / faróis.  
**Problema tratado:** faróis com amarelamento, opacidade e sinais de desgaste superficial, conforme diagnóstico da lente.

**Etapas:**

1. **Descontaminação da superfície:** remoção de impurezas e resíduos.
2. **Lixamento técnico progressivo:** uso de etapas adequadas ao estado e à lente.
3. **Polimento:** recuperação da transparência e do acabamento, dentro dos limites do material.
4. **Proteção final:** selante comercialmente descrito como **Grafeno + SiO₂** (confirmar produto e especificação do fabricante antes de publicar alegações técnicas).

**Benefícios informados para a proteção:**

- Contribuição para proteção contra efeitos da exposição solar/UV, conforme especificação do produto.
- Efeito hidrofóbico e facilidade relativa de limpeza, conforme produto e aplicação.
- Maior durabilidade em comparação com uma superfície sem proteção, dependente de condições de uso e manutenção.

**Revisão técnica necessária:** não prometer «bloqueio UV extremo», «super-hidrofobidade garantida», «durabilidade muito superior» ou «restauração completa» de qualquer lente sem evidência. Craquelamento interno ou danos profundos podem não ser corrigíveis por polimento; segurança da iluminação é prioridade.

## 4.7. Descontaminação de Pintura

**Preço:** a partir de **R$ 75**.  
**Categoria:** avulsos / pintura.  
**Escopo:** remoção de contaminantes aderidos que a lavagem comum não elimina.

**Contaminantes exemplificados:** fuligem industrial, névoa de tinta, seiva de árvores, respingos de asfalto e partículas ferrosas provenientes do uso diário.

**Processo:** descontaminação por técnicas e produtos específicos, incluindo clay bar quando adequada à superfície, com avaliação do estado do verniz.

**Benefícios:**

1. **Toque mais liso:** redução da aspereza causada por partículas aderidas.
2. **Aspecto e brilho:** melhora potencial da leitura visual da pintura.
3. **Preparação:** superfície mais adequada para aplicação posterior de proteção.
4. **Conservação:** remoção de contaminantes que poderiam permanecer aderidos.
5. **Facilidade de manutenção:** em alguns casos, superfície mais simples de limpar após tratamento e proteção adequada.

**Observação de edição:** o conteúdo foi enviado duas vezes, com repetição integral. **Publicar apenas uma versão**, sem perder os exemplos ou os benefícios. Não prometer «risco zero», «pintura vitrificada» ou remoção de todos os tipos de contaminação sem avaliação.

## 4.8. Polimento Comercial

**Preço:** a partir de **R$ 350**.  
**Categoria:** avulsos / pintura.  
**Escopo:** melhora do brilho e suavização de marcas superficiais visíveis com foco em custo-benefício e tempo de serviço menor que uma correção técnica profunda.

**Indicações:** pintura opaca, marcas leves do uso cotidiano e preparação estética para revenda, respeitando o estado do verniz.

**Benefícios informados:**

1. **Resgate de brilho:** melhora visual da cor e dos reflexos.
2. **Marcas leves:** suavização e possível correção de imperfeições superficiais, conforme diagnóstico.
3. **Valorização estética para revenda:** apresentação mais atraente do veículo, sem garantia de aumento de preço.
4. **Agilidade:** serviço com proposta mais objetiva que polimentos profundos.
5. **Proteção inclusa:** aplicação de camada de proteção ao final, conforme produto utilizado.

**Revisão editorial:** não garantir eliminação de todos os riscos, retirada padronizada de camada oxidada de verniz ou durabilidade específica sem inspeção.

## 4.9. Lavagem Simples de Moto

**Preço informado:** **R$ 40** (sem expressão «a partir de» no texto do proprietário; confirmar se é preço fixo).  
**Categoria:** motos / lavagem.

**Inclui:**

1. **Lavagem técnica:** cuidado com carenagem, tanque e partes mecânicas visíveis, com produtos automotivos adequados.
2. **Acabamento:** pretinho nas **laterais** dos pneus, respeitando as restrições de uso e segurança.

**Posicionamento:** praticidade e cuidado estético de manutenção cotidiana.

## 4.10. Lavagem Detalhada de Moto (Estética Premium)

**Preço:** a partir de **R$ 70**.  
**Categoria:** motos / lavagem premium.

**Inclui:**

1. **Lavagem técnica minuciosa:** cantos de difícil acesso, carenagens, rodas, chassi, balança e componentes visíveis, conforme procedimento adequado.
2. **Enceramento de alta performance:** cera nas partes pintadas e tanque, conforme compatibilidade e produto.
3. **Revitalização dos plásticos:** tratamento de áreas plásticas externas desbotadas quando aplicável.
4. **Aplicação de verniz de motor:** somente em superfícies autorizadas, com produto compatível com temperaturas e materiais.
5. **Acabamento:** pretinho nas laterais dos pneus, preservando a aderência e evitando contato com banda de rodagem e componentes de freio.

**Revisão editorial:** os benefícios de proteção e duração devem corresponder às especificações reais dos produtos usados. Não prometer efeito «moto zero quilômetro» como resultado garantido.

## 4.11. Serviços Adicionais e Estética Personalizada

**Preço:** **sob consulta**.  
**Categoria:** serviços avulsos / personalizados.

Permitir contratar separadamente ou adicionar a um pacote, conforme disponibilidade, avaliação e orçamento.

**Todos os itens mencionados pelo proprietário devem constar no catálogo:**

1. **Remoção de chuva ácida:** tratamento de manchas minerais e outras marcas em vidros, segundo diagnóstico; nem toda marca tem a mesma origem.
2. **Remoção de manchas na pintura:** tratamento localizado conforme tipo de mancha e condição do verniz.
3. **Remoção de adesivos e colas:** retirada cuidadosa de películas, adesivos antigos e resíduos de cola.
4. **Enceramento automotivo:** aplicação de cera para acabamento e proteção temporária.
5. **Revitalização de plásticos:** cuidados para para-choques, frisos e outras peças plásticas externas.
6. **Higienização de bancos:** limpeza intensiva/extratora quando compatível com o estofado.
7. **Limpeza de bancos:** remoção de resíduos e sujeiras superficiais.
8. **Limpeza do teto:** limpeza delicada do forro interno, conforme material.
9. **Raspagem de carpete:** remoção de pelos de animais, areia e sujeiras aderidas com técnica apropriada.
10. **Limpeza de carpetes:** higienização focada na base interna e tratamento de sujeira/odores quando aplicável.

**CTA:** «Solicitar orçamento personalizado pelo WhatsApp». Se o número ainda estiver vazio, abrir a página de contato com explicação honesta, nunca um link quebrado.

---

# 5. COMO ORGANIZAR E PUBLICAR O CONTEÚDO

## 5.1. Navegação e agrupamento

**Menu Serviços:** apresentar categorias claramente distinguíveis:

- **Lavagens de Carros:** simples, completa, detalhada, higienização avançada.
- **Cuidados Técnicos:** lavagem de motor (duas modalidades), polimento de faróis, descontaminação de pintura e polimento comercial.
- **Motos:** lavagem simples e lavagem detalhada.
- **Serviços Adicionais:** dez itens avulsos e CTA para orçamento.

Na home, criar uma seleção editorial dos serviços com preço visível; a página de catálogo deve reunir a lista completa e permitir comparar escopos. Nada de esconder preços que o proprietário informou.

## 5.2. Modelo de dados

Centralizar serviços e preços em dados estruturados (`src/config.js` ou módulos próprios), por exemplo:

```js
{
  slug: "lavagem-simples",
  category: "carros",
  name: "Lavagem Simples (Apenas Exterior)",
  startingPrice: 40,
  currency: "BRL",
  priceQualifier: "a-partir-de", // ou "fixo" ou "sob-consulta"
  pricingUnit: "veiculo", // ou "par"
  summary: "...",
  features: ["..."],
  exclusions: ["Não inclui limpeza ou aspiração interna."],
  image: "", // arquivo real confirmado; usar placeholder se ausente
  featured: true
}
```

Formato monetário `pt-BR` (`Intl.NumberFormat`). Não duplicar preço manualmente em componentes. Descrições longas nas páginas individuais; resumos curtos na home. Compatibilidade com SEO e JSON-LD quando os dados forem suficientes.

## 5.3. URLs e SEO local

- Criar slugs amigáveis, como `/servicos/lavagem-simples/`, `/servicos/lavagem-completa/`, `/servicos/lavagem-detalhada/`, `/servicos/higienizacao-avancada/`, `/servicos/lavagem-motor/`, `/servicos/polimento-farol/`, `/servicos/descontaminacao-pintura/`, `/servicos/polimento-comercial/`, `/servicos/lavagem-moto-simples/`, `/servicos/lavagem-moto-detalhada/`, `/servicos/adicionais/`.
- Preservar ou redirecionar com **301** as rotas antigas (`lavagem-tecnica`, `higienizacao-interna`, `polimento-automotivo`, `vitrificacao`, `detalhamento`, `revitalizacao`), caso sejam removidas. Não redirecionar automaticamente para serviço conceitualmente diferente; quando não houver correspondência, redirecionar ao catálogo geral.
- Foco SEO: **estética automotiva em Itajubá**, **lavagem de carro em Itajubá**, **lavagem detalhada em Itajubá**, **polimento de farol em Itajubá**, **bairro Medicina** e termos correspondentes a serviços reais.
- Usar localização conhecida sem inventar endereço físico completo. Schema.org `AutoWash`/`LocalBusiness` com apenas campos corretos, título/descrição, canonical, sitemap e conteúdo indexável.
- Se não houver domínio real, preparar uma configuração para publicação; não publicar canonical em domínio `.example`.

## 5.4. UX e animações

- Manter a assinatura visual preta, azul-ciano e amarela e a proposta **Awwwards-level**, evitando aparência genérica/IA.
- Serviços em listagem editorial com transições refinadas de imagens/textos, **mas a informação de preço, conteúdo e CTA deve ser legível sem animação e acessível em mobile/teclado**.
- Página de serviço detalhada: título, foto (ou placeholder honesto), introdução, preço, inclusões, exclusões, perguntas, CTA e recomendações relevantes.
- Comparador antes/depois **somente com pares reais e correspondentes**. Demonstração de arte visual da home não pode ser anunciada como resultado de cliente.
- Comparação de pacotes (simples × completa × detalhada × higienização avançada) deve deixar a exclusão da lavagem simples explícita.

---

# 6. BUGS E PONTOS DE ATENÇÃO IDENTIFICADOS NO REPOSITÓRIO

Abaixo, **[CONFIRMADO]** indica evidência direta no código/configuração ou captura; **[TESTAR]** indica risco baseado no código que precisa ser reproduzido. Não confundir hipóteses com defeitos já comprovados.

## B01 — [CONFIRMADO] Título cortado no hero desktop — PRIORIDADE CRÍTICA DE UX

A captura `docs/screenshots/lavamed-desktop.jpg` (1440×900) mostra **«É TRANSFORMAR.» ultrapassando o limite direito**. A composição CSS usa título muito grande, recuo e `white-space: nowrap`.

**Ação:** corrigir o layout para a frase caber visualmente em 1440×900, 1366×768, 1920×1080 e outras larguras, sem perder a tipografia impactante. Validar visibilidade integral do título e ausência de overflow horizontal indevido.

## B02 — [CONFIRMADO] Logotipo não é o oficial

`src/assets/logo-mark.svg` ainda é uma assinatura tipográfica provisória, e o README confirma isso. A identidade oficial compartilhada pelo cliente é um logotipo ilustrado azul/amarelo com carro e água.

**Ação:** pedir/reutilizar o asset oficial disponível no projeto/contexto; não fabricar uma versão falsa. Criar uso apropriado do logo original no cabeçalho e rodapé; se for JPEG/PNG com fundo, não fingir transparência. Não remover o branding atual antes de disponibilizar substituto válido.

## B03 — [CONFIRMADO] Dados comerciais essenciais vazios

`src/config.js`: `whatsapp`, `city`, `address`, `openingHours`, `instagram`, `mapsUrl` vazios; `domain` definido como `https://lavamed.example`.

**Ação:** preencher **city = Itajubá**, permitir **neighborhood = Medicina** no modelo de dados e usar isso no site. Manter rua, número, contatos e horários pendentes até serem fornecidos. Avisar em diagnóstico de produção sobre domínio canônico provisório. Não exibir informações falsas ao visitante.

## B04 — [CONFIRMADO] Hero 2.5D reaproveita o mesmo JPG em múltiplas camadas

`src/index.html`: `.hero-backdrop`, `.hero-car-layer img` e `.hero-specular img` usam `lavamed-hero.jpg`. É uma composição 2.5D, **não um modelo 3D**.

**Ação:** melhorar máscara/recorte, profundidade e comportamento responsivo quando houver assets próprios; não declarar 3D real. Inspecionar deformação/cortes durante as transições.

## B05 — [CONFIRMADO] Quatro cenas narrativas utilizam somente dois arquivos

`camera-story` usa `lavamed-hero.jpg` e `lavamed-detail.jpg` repetidos nos quatro atos. As timelines GSAP foram implementadas, porém a diversidade cinematográfica continua dependente de mais fotografias.

**Ação:** permitir imagem própria por ato e manter fallback explícito. Não confundir transições de imagem com mudança real de câmera.

## B06 — [CONFIRMADO] Catálogo atual desatualizado e incompleto

`src/config.js` tem seis serviços genéricos: lavagem técnica, higienização interna, polimento automotivo, vitrificação, detalhamento, revitalização. **Não representa o novo catálogo de 11 grupos e preços fornecido neste briefing.**

**Ação:** migrar o catálogo, atualizar links e todos os templates, corrigir SEO e manter redirecionamentos de URLs antigas.

## B07 — [CONFIRMADO] Serviços principais ainda sem fotos próprias

Os `image` dos serviços atuais estão vazios. O CSS/JS apresenta placeholders em vez de fotografias de cada serviço.

**Ação:** preservar placeholders honestos e preparar cadastro sem repetir imagem de serviço não correspondente. Deixar o layout editorial bonito mesmo sem os arquivos finais.

## B08 — [CONFIRMADO] Antes/depois verdadeiro ainda não está alimentado

`comparisonPairs = []`; o comparador visual da home usa duas artes de campanha diferentes, não fotografias correspondentes de antes/depois.

**Ação:** rotular claramente a demonstração da home, não colocá-la como prova de serviço. Adicionar pares autorizados apenas quando fornecidos.

## B09 — [TESTAR] Transição GSAP entre serviços pode disputar estado com `hidden`

Em `site.js`, `initServiceVisual()` anima ao mesmo tempo a `<img>` e o placeholder, alternando o atributo `hidden` dentro de `onComplete`; o CSS define `[hidden] { display: none!important; }`. Isso pode causar flicker ou estado invisível em interações rápidas.

**Ação:** testar mouse hover repetido, teclado e troca de imagem/não imagem; coordenar animação e estado visível usando `gsap.killTweensOf`/timeline controlada quando preciso. Verificar que a animação funciona em desktop e mobile.

## B10 — [TESTAR] Clique em links da galeria pode ser bloqueado após arrastar

Em `initGallery()`, a flag `moved` persiste após `pointerup` até novo `pointerdown`; o handler de `click` verifica `suppressClick || moved`. Um clique por teclado pode ser bloqueado depois do arraste, mesmo quando `suppressClick` volta a `false`.

**Ação:** distinguir gesto de arrastar de clique/ativação por teclado; limpar flags no momento correto; testar links com mouse, touch, Enter e Space quando cabível.

## B11 — [TESTAR] Outras condições de rolagem/foco responsivo

- ScrollTrigger usa pinning desktop e versão adaptada no mobile; testar ida e volta, resize, orientação, rolagem rápida e preferências de redução de movimento.
- Garantir que menu aberto não permita tabulação indevida fora do overlay e que o foco volte corretamente ao botão.
- Verificar que animações e imagens continuam legíveis em 360–390 px, tablet e 1366–1440 px.
- O teste existente verifica estado de cena, mas não mede se todo o texto permanece visível nem a performance real.

## B12 — [CONFIRMADO] Testes automatizados existem, mas a cobertura é parcial

`tests/e2e/lavamed.spec.mjs` contém testes de menu, narrativa, comparador, galeria e redução de movimento. Eles são avanço importante; porém não validam todas as páginas novas, preços, redirects, SEO e layout de todas as larguras.

**Ação:** adicionar testes para preços, rotas dos 11 serviços, «a partir de», exclusões, CTAs, links 301, imagens ausentes e exibição de preço em `pt-BR`; revisar overflow desktop visualmente. Executar `npm run build`, `npm run check`, `npm run test:e2e` e informar resultados. **Não assumir que testes passaram só porque os arquivos foram criados.**

---

# 7. CRITÉRIOS DE ACEITAÇÃO — CHECKLIST FINAL

- [ ] A home anuncia **LavaMed, Itajubá, bairro Medicina** sem inventar endereço.
- [ ] Página Sobre contém todos os conceitos centrais do texto institucional fornecido.
- [ ] Os **11 grupos de serviços** constam no catálogo; os dez adicionais estão listados dentro do grupo correspondente.
- [ ] Os valores estão corretos: **R$ 40, R$ 80, R$ 160, R$ 350, R$ 60, R$ 80/par, R$ 75, R$ 350, R$ 40, R$ 70** e **sob consulta**.
- [ ] «A partir de» aparece exatamente nos serviços indicados; preço da moto simples tratado como R$ 40 até confirmação.
- [ ] Lavagem simples declara de forma inequívoca **apenas exterior — não inclui limpeza/aspiração interna**.
- [ ] Lavagem de motor mostra modalidade tradicional e modalidade com verniz, sem inventar preço da segunda.
- [ ] Farol descreve a proteção Grafeno + SiO₂ como informação do produto, com linguagem tecnicamente responsável.
- [ ] Não há texto duplicado de descontaminação de pintura.
- [ ] Páginas detalhadas têm escopo completo, benefícios e CTA funcionais.
- [ ] Página de serviços é responsiva, navegável por teclado e com informações indexáveis.
- [ ] As animações cinematográficas existentes são preservadas e refinadas; não há visual genérico de IA.
- [ ] Hero desktop não corta «É TRANSFORMAR.».
- [ ] Slugs antigos foram mantidos ou redirecionados apropriadamente.
- [ ] A marca oficial será utilizada quando o arquivo correto estiver disponível.
- [ ] Fotos de campanha e placeholders não são apresentados como trabalhos reais.
- [ ] Não existem promessas absolutas de eliminação de microrganismos, restauração, durabilidade ou proteção que não tenham comprovação.
- [ ] Todos os CTAs possuem fallback correto enquanto o WhatsApp não estiver configurado.
- [ ] Canonical e sitemap não apontam para `.example` na publicação definitiva.
- [ ] `build`, `check` e testes E2E executados, com relatório honesto e screenshots desktop/mobile revisadas.

---

# 8. ENTREGÁVEIS EXIGIDOS AO CODEX

1. Implementação do novo catálogo comercial nas estruturas reais do projeto.
2. Home, Sobre, Serviços, páginas individuais e CTAs atualizados.
3. Correções dos bugs confirmados e resultado dos testes dos bugs potenciais.
4. Testes automatizados ampliados e executados quando o ambiente permitir.
5. Descrição dos arquivos modificados, novas rotas, redirecionamentos e procedimentos de deploy Netlify.
6. Lista objetiva de informações que ainda dependem do proprietário (WhatsApp, endereço completo, domínio, fotos reais, logo em arquivo, horários e preço do verniz de motor).

**Regra final:** não entregar só uma análise textual, um mockup ou uma lista de recomendações. **Implementar o conteúdo e corrigir o projeto, preservando a direção artística e as animações Awwwards.**
