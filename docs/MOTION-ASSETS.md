# Assets e evolução da narrativa

A experiência já usa o acervo recebido sem depender de placeholders na home ou nas páginas de serviço. O manifesto em `src/media-manifest.js` é gerado por `npm run media:process`; sua fonte editável é `media/catalog.json`.

## Storytelling — quatro atos

1. cupê preto da campanha conceitual, identificado como publicidade;
2. comparativo confirmado de polimento de farol;
3. cabine desmontada durante higienização;
4. Honda Civic G10 com exterior finalizado.

Cada ato mantém sua máscara, deslocamento, profundidade e movimento de câmera GSAP. Novas fotos podem substituir um ato sem reescrever a timeline: cadastre a mídia e altere `storyActs` em `src/config.js`.

## Serviços

Os 11 serviços possuem mídia associada. Quando uma fotografia mostra somente o estado final, a interface diz “exterior finalizado” ou “interior finalizado” e não atribui vitrificação, polimento ou outra técnica não comprovada. Descontaminação de pintura usa uma composição conceitual declarada até existir um registro específico.

## Portfólio e antes/depois

O portfólio publica sete itens fornecidos pela LavaMed, incluindo o Volkswagen do acervo. A home destaca farol e cabine, e a página completa mantém os três pares confirmados:

- cabine desmontada antes e depois da etapa de higienização;
- detalhe do trilho do banco, antes e depois;
- farol do mesmo veículo, antes e depois.

Não usar as fotografias de cabine desmontada e piso tratado como slider: embora pertençam ao mesmo tipo de processo, o enquadramento não é equivalente.

## Materiais que ainda agregariam valor

- vídeo horizontal curto de água, espuma ou acabamento para desktop;
- vídeo vertical correspondente para mobile;
- fotografia de execução de descontaminação de pintura;
- fotografia confirmada de polimento comercial em andamento;
- fotografias distintas que comprovem lavagem simples e detalhada de moto;
- imagem real da estrutura ou da equipe, caso haja autorização de uso.

Vídeos futuros precisam ter placa ocultada em todos os frames relevantes, poster estático e versões MP4/WebM antes de entrarem na página.
