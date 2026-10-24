/**
 * Dados comerciais da LavaMed.
 * Preencha apenas com informações confirmadas. Valores vazios não aparecem no site.
 */
export const business = {
  whatsapp: "",
  city: "",
  address: "",
  openingHours: "",
  instagram: "",
  mapsUrl: "",
  domain: "https://lavamed.example"
};

export const services = [
  {
    slug: "lavagem-tecnica",
    number: "01",
    name: "Lavagem técnica",
    eyebrow: "Método / superfície",
    summary: "Uma sequência criteriosa para remover contaminantes com atenção a emblemas, frestas, rodas e pintura.",
    detail: "O processo é organizado por áreas e materiais. A avaliação inicial define os produtos, a ordem de trabalho e os cuidados adequados para cada superfície.",
    image: ""
  },
  {
    slug: "higienizacao-interna",
    number: "02",
    name: "Higienização interna",
    eyebrow: "Cabine / conforto",
    summary: "Limpeza cuidadosa de tecidos, plásticos, couro e áreas de contato para devolver frescor à cabine.",
    detail: "A técnica e os produtos variam conforme o material e a condição encontrada. O objetivo é limpar com precisão e preservar acabamento, textura e toque.",
    image: ""
  },
  {
    slug: "polimento-automotivo",
    number: "03",
    name: "Polimento automotivo",
    eyebrow: "Pintura / correção",
    summary: "Leitura da pintura, correção controlada e acabamento para recuperar clareza, reflexão e profundidade.",
    detail: "A inspeção sob luz dirigida orienta cada etapa. A indicação depende do verniz e do estado real da pintura, sempre após avaliação técnica.",
    image: ""
  },
  {
    slug: "vitrificacao",
    number: "04",
    name: "Vitrificação",
    eyebrow: "Proteção / brilho",
    summary: "Preparação minuciosa da superfície antes da aplicação de proteção, respeitando cura e manutenção.",
    detail: "A durabilidade e o comportamento da proteção dependem do produto indicado, da preparação e da rotina de uso do veículo. Consulte a equipe para avaliação.",
    image: ""
  },
  {
    slug: "detalhamento",
    number: "05",
    name: "Detalhamento",
    eyebrow: "Precisão / matéria",
    summary: "Atenção concentrada nas áreas que transformam a percepção do conjunto: recortes, texturas e acabamentos.",
    detail: "O escopo é definido conforme o veículo. A proposta reúne processos de limpeza e acabamento em uma sequência coerente para o resultado desejado.",
    image: ""
  },
  {
    slug: "revitalizacao",
    number: "06",
    name: "Revitalização",
    eyebrow: "Renovação / cuidado",
    summary: "Tratamentos específicos para recuperar a leitura visual de materiais internos e externos.",
    detail: "Cada material pede uma abordagem própria. A possibilidade de recuperação é avaliada antes do serviço, sem promessas genéricas de resultado.",
    image: ""
  }
];

/**
 * Pares reais e correspondentes para o comparador de antes/depois.
 * Cada item deve usar o mesmo veículo, ângulo e enquadramento. O array vazio
 * mantém a página pública em estado honesto até o acervo ser fornecido.
 * Formato: { title, before, after, altBefore, altAfter }.
 */
export const comparisonPairs = [];

export function whatsappUrl(service = "") {
  if (!business.whatsapp) return "/contato/";
  const clean = business.whatsapp.replace(/\D/g, "");
  const text = service
    ? `Olá, LavaMed! Gostaria de agendar uma avaliação para ${service}.`
    : "Olá, LavaMed! Gostaria de agendar uma avaliação.";
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}
