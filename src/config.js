import { mediaById } from "./media-manifest.js";

/**
 * Fonte única para dados comerciais e conteúdo de serviços da LavaMed.
 * Campos vazios são intencionais: publique somente informações confirmadas.
 */
export const business = {
  name: "LavaMed Estética Automotiva",
  whatsapp: "5535984586615",
  phoneDisplay: "(35) 98458-6615",
  city: "Itajubá",
  state: "MG",
  neighborhood: "Medicina",
  address: "",
  openingHours: "",
  instagram: "https://www.instagram.com/lavamed.itajuba/",
  mapsUrl: "https://share.google/Vm2BAGotXmrrtKJi1"
};

export const siteCredits = Object.freeze({
  developer: "Leonardo Jonathan do Carmo",
  phone: "+5535988267259",
  phoneDisplay: "(35) 98826-7259"
});

export const serviceGroups = [
  { key: "carros", number: "01", name: "Lavagens de carros", note: "Manutenção, cuidado completo e estética premium." },
  { key: "tecnicos", number: "02", name: "Cuidados técnicos", note: "Tratamentos focados em motor, faróis e pintura." },
  { key: "motos", number: "03", name: "Motos", note: "Lavagem de manutenção ou detalhamento minucioso." },
  { key: "personalizados", number: "04", name: "Serviços adicionais", note: "Soluções avulsas, combinadas conforme avaliação." }
];

export const services = [
  {
    slug: "lavagem-simples",
    number: "01",
    group: "carros",
    name: "Lavagem Simples",
    seoName: "Lavagem de Carro",
    label: "Apenas exterior",
    price: 40,
    priceQualifier: "starting",
    summary: "Limpeza exclusivamente externa para manter lataria, rodas e pneus bem cuidados com agilidade.",
    detail: "Uma lavagem de manutenção dedicada à parte externa do carro. A sequência reduz a sujeira pesada antes do contato e finaliza rodas, pneus e lataria com atenção.",
    features: [
      ["Pré‑lavagem", "Remoção da sujeira pesada para minimizar o risco de marcas na pintura."],
      ["Lavagem externa", "Limpeza cuidadosa de toda a lataria."],
      ["Rodas e pneus", "Limpeza de caixas de roda, pneus e calotas."],
      ["Acabamento", "Pretinho aplicado somente nas laterais dos pneus."]
    ],
    benefits: ["Manutenção externa objetiva", "Cuidado adequado a cada área", "Acabamento visual renovado"],
    exclusions: ["Não inclui limpeza nem aspiração do interior do veículo."],
    image: mediaById("hyundai-hb20-finalizado"),
    featured: true
  },
  {
    slug: "lavagem-completa",
    number: "02",
    group: "carros",
    name: "Lavagem Completa",
    seoName: "Lavagem Completa de Carro",
    label: "Externa e interna",
    price: 80,
    priceQualifier: "starting",
    summary: "Limpeza externa e interna para renovar a apresentação e o conforto do veículo no mesmo pacote.",
    detail: "Combina o cuidado da carroceria com aspiração e limpeza das superfícies internas, respeitando os materiais encontrados na cabine.",
    features: [
      ["Pré‑lavagem", "Remoção inicial de sujeira pesada antes da lavagem externa."],
      ["Lavagem externa", "Lataria, caixas de roda, pneus e calotas."],
      ["Aspiração total", "Carpete, bancos e porta-malas."],
      ["Painel e portas", "Limpeza com produtos adequados a cada material."],
      ["Vidros", "Limpeza das faces internas e externas."],
      ["Acabamento", "Pretinho aplicado nas laterais dos pneus."]
    ],
    benefits: ["Interior e exterior no mesmo cuidado", "Mais conforto na cabine", "Manutenção visual do conjunto"],
    exclusions: [],
    image: mediaById("jeep-compass-interior-finalizado"),
    featured: true
  },
  {
    slug: "lavagem-detalhada",
    number: "03",
    group: "carros",
    name: "Lavagem Detalhada",
    seoName: "Lavagem Detalhada",
    label: "Estética premium",
    price: 160,
    priceQualifier: "starting",
    summary: "Procedimento minucioso para áreas de difícil acesso e detalhes internos e externos.",
    detail: "Um nível mais profundo de cuidado para quem busca conservação e leitura visual refinada, incluindo frestas, chassi quando apropriado e tratamento dedicado da cabine.",
    features: [
      ["Pré‑lavagem e exterior", "Remoção cuidadosa da sujeira pesada e limpeza detalhada da lataria."],
      ["Chassi", "Remoção de terra, graxa e resíduos quando tecnicamente apropriado."],
      ["Rodas", "Limpeza profunda de caixas de roda, pneus e calotas."],
      ["Cantos e frestas", "Dobradiças, vãos do porta-malas, grades e emblemas."],
      ["Aspiração profunda", "Carpete, bancos e porta-malas."],
      ["Bancos e teto", "Higienização adequada à condição e ao material."],
      ["Plásticos internos", "Limpeza e condicionamento com produtos específicos."],
      ["Vidros e acabamento", "Faces internas e externas e pretinho de alta fixação nas laterais dos pneus."]
    ],
    benefits: ["Acesso a áreas normalmente esquecidas", "Cuidado interno e externo ampliado", "Acabamento premium"],
    exclusions: [],
    image: mediaById("honda-civic-interior-finalizado"),
    featured: true
  },
  {
    slug: "higienizacao-avancada",
    number: "04",
    group: "carros",
    name: "Higienização e Estética Avançada",
    seoName: "Higienização Automotiva",
    label: "Limpeza intensiva",
    price: 350,
    priceQualifier: "starting",
    summary: "Limpeza interna intensiva combinada a cuidados técnicos adicionais, conforme avaliação do veículo.",
    detail: "O processo amplia o acesso à cabine e trata sujeiras, manchas tratáveis e resíduos com técnica adequada ao material, sem promessas absolutas de eliminação ou restauração.",
    features: [
      ["Bancos", "Remoção técnica quando aplicável e segura, seguida de limpeza ou extração conforme o material."],
      ["Carpete e assoalho", "Limpeza profunda e extração de sujeiras, manchas tratáveis e resíduos."],
      ["Motor", "Limpeza técnica de resíduos visíveis, respeitando componentes sensíveis."],
      ["Teto e plásticos", "Limpeza profunda e condicionamento compatível com cada superfície."],
      ["Cantos e frestas", "Dobradiças, porta-malas, grades, difusores de ar e emblemas."],
      ["Exterior", "Pré‑lavagem, lataria, chassi quando aplicável, caixas de roda, pneus e calotas."],
      ["Finalização", "Vidros e pretinho somente nas laterais dos pneus."]
    ],
    benefits: ["Limpeza interna intensiva", "Tratamento de áreas inferiores e frestas", "Escopo definido após avaliação técnica"],
    exclusions: ["A remoção dos bancos depende das condições de segurança e das particularidades do veículo.", "O serviço não promete eliminação absoluta de microrganismos, manchas ou odores."],
    image: mediaById("cabine-desmontada-depois"),
    featured: true
  },
  {
    slug: "lavagem-motor",
    number: "05",
    group: "tecnicos",
    name: "Lavagem Técnica do Motor",
    seoName: "Lavagem de Motor",
    label: "Duas modalidades",
    price: 60,
    priceQualifier: "starting",
    summary: "Limpeza detalhada do compartimento do motor, com opção de acabamento em verniz sob avaliação.",
    detail: "Produtos apropriados e pincéis de detalhamento ajudam a retirar sujeira, graxa e poeira dos componentes visíveis com atenção a conectores, mangueiras e partes elétricas.",
    modalities: [
      ["Tradicional", "Limpeza técnica dos componentes visíveis do compartimento do motor. A partir de R$ 60."],
      ["Com verniz de motor", "Inclui a limpeza tradicional e aplicação compatível para acabamento visual e proteção. Valor a confirmar após avaliação."]
    ],
    features: [
      ["Inspeção", "Leitura das superfícies, componentes sensíveis e condições de trabalho."],
      ["Limpeza técnica", "Produtos automotivos apropriados e detalhamento das partes visíveis."],
      ["Finalização", "Secagem e acabamento conforme a modalidade contratada."]
    ],
    benefits: ["Remoção de resíduos visíveis", "Acabamento visual renovado", "Manutenção posterior potencialmente mais simples nas superfícies tratadas"],
    exclusions: ["O valor da modalidade com verniz ainda não foi informado.", "A aplicação do verniz depende da compatibilidade com materiais e condições de uso."],
    image: mediaById("onix-joy-motor-finalizado"),
    featured: true
  },
  {
    slug: "polimento-farol",
    number: "06",
    group: "tecnicos",
    name: "Polimento de Farol com Proteção",
    seoName: "Polimento de Farol",
    label: "Grafeno + SiO₂",
    price: 80,
    priceQualifier: "starting",
    pricingUnit: "par",
    summary: "Tratamento de lentes com desgaste superficial, seguido de selante comercialmente descrito como Grafeno + SiO₂.",
    detail: "Indicado após diagnóstico para faróis com amarelamento, opacidade e desgaste superficial. Danos internos ou profundos podem não ser corrigíveis por polimento.",
    features: [
      ["Descontaminação", "Remoção de impurezas e resíduos da superfície."],
      ["Lixamento progressivo", "Etapas definidas de acordo com o estado e o material da lente."],
      ["Polimento", "Melhora da transparência e do acabamento dentro dos limites do material."],
      ["Proteção final", "Aplicação de selante descrito pelo fabricante como Grafeno + SiO₂."]
    ],
    benefits: ["Melhora potencial da transparência", "Efeito hidrofóbico conforme produto e aplicação", "Maior facilidade relativa de limpeza"],
    exclusions: ["Resultados, proteção UV e durabilidade dependem do estado da lente, do produto utilizado e da manutenção.", "Craquelamento interno ou danos profundos podem exigir outra solução; a segurança da iluminação vem primeiro."],
    image: mediaById("farol-depois"),
    featured: true
  },
  {
    slug: "descontaminacao-pintura",
    number: "07",
    group: "tecnicos",
    name: "Descontaminação de Pintura",
    seoName: "Descontaminação de Pintura",
    label: "Superfície e preparo",
    price: 75,
    priceQualifier: "starting",
    summary: "Remoção de contaminantes aderidos que uma lavagem comum não consegue retirar.",
    detail: "O diagnóstico identifica fuligem industrial, névoa de tinta, seiva, respingos de asfalto e partículas ferrosas antes da escolha da técnica, incluindo clay bar quando adequada ao verniz.",
    features: [
      ["Diagnóstico", "Identificação do contaminante e avaliação do estado do verniz."],
      ["Descontaminação", "Técnicas e produtos específicos, com clay bar quando apropriada."],
      ["Conferência", "Leitura do toque e da superfície antes de uma proteção posterior."]
    ],
    benefits: ["Toque potencialmente mais liso", "Melhora visual da pintura", "Preparo para proteção posterior", "Remoção de contaminantes aderidos", "Manutenção potencialmente mais simples"],
    exclusions: ["Nem todo contaminante pode ser removido da mesma forma; o resultado depende da condição da superfície."],
    image: mediaById("conceitual-detalhe-agua"),
    featured: false
  },
  {
    slug: "polimento-comercial",
    number: "08",
    group: "tecnicos",
    name: "Polimento Comercial",
    seoName: "Polimento Automotivo",
    label: "Brilho e marcas leves",
    price: 350,
    priceQualifier: "starting",
    summary: "Melhora do brilho e suavização de marcas superficiais com proposta mais objetiva que uma correção profunda.",
    detail: "Indicado para pintura opaca, marcas leves do uso e preparação estética para revenda, sempre respeitando a espessura e o estado real do verniz.",
    features: [
      ["Inspeção", "Leitura da pintura e definição segura do processo."],
      ["Polimento", "Trabalho voltado ao brilho e à suavização de imperfeições superficiais tratáveis."],
      ["Proteção", "Aplicação de camada protetora ao final, conforme produto utilizado."]
    ],
    benefits: ["Resgate visual de brilho e cor", "Suavização possível de marcas leves", "Apresentação estética para revenda", "Processo mais objetivo que uma correção profunda"],
    exclusions: ["Não há garantia de remoção de todos os riscos nem de valorização financeira do veículo."],
    image: mediaById("honda-civic-g10-tres-quartos"),
    featured: true
  },
  {
    slug: "lavagem-moto-simples",
    number: "09",
    group: "motos",
    name: "Lavagem Simples de Moto",
    seoName: "Lavagem de Moto",
    label: "Manutenção cotidiana",
    price: 40,
    priceQualifier: "fixed",
    summary: "Lavagem técnica de manutenção para carenagem, tanque e componentes mecânicos visíveis.",
    detail: "Uma opção prática para o cuidado estético cotidiano da moto, utilizando produtos automotivos adequados e acabamento seguro nos pneus.",
    features: [
      ["Lavagem técnica", "Cuidado com carenagem, tanque e partes mecânicas visíveis."],
      ["Acabamento", "Pretinho somente nas laterais dos pneus, sem contato com banda de rodagem ou freios."]
    ],
    benefits: ["Manutenção estética prática", "Produtos adequados ao uso automotivo", "Finalização cuidadosa"],
    exclusions: ["R$ 40 é o valor informado atualmente e deve ser confirmado caso haja variação por porte."],
    image: mediaById("yamaha-fz15-finalizada"),
    featured: false
  },
  {
    slug: "lavagem-moto-detalhada",
    number: "10",
    group: "motos",
    name: "Lavagem Detalhada de Moto",
    seoName: "Lavagem Detalhada de Moto",
    label: "Estética premium",
    price: 70,
    priceQualifier: "starting",
    summary: "Cuidado minucioso de áreas de difícil acesso, pintura, plásticos e componentes visíveis da moto.",
    detail: "O processo combina lavagem técnica, acabamento da pintura, revitalização compatível e aplicação controlada de produtos nas superfícies autorizadas.",
    features: [
      ["Lavagem minuciosa", "Carenagens, rodas, chassi, balança e cantos de difícil acesso."],
      ["Enceramento", "Cera nas partes pintadas e no tanque, conforme compatibilidade."],
      ["Plásticos", "Revitalização de áreas externas desbotadas quando aplicável."],
      ["Motor", "Verniz apenas em superfícies autorizadas e compatíveis com temperatura e material."],
      ["Pneus", "Pretinho nas laterais, preservando aderência, banda de rodagem e freios."]
    ],
    benefits: ["Atenção a áreas de difícil acesso", "Acabamento de pintura e plásticos", "Processo orientado pela compatibilidade dos materiais"],
    exclusions: ["Proteção e duração variam conforme os produtos, o uso e a manutenção da moto."],
    image: mediaById("yamaha-fz15-finalizada"),
    featured: true
  },
  {
    slug: "adicionais",
    number: "11",
    group: "personalizados",
    name: "Serviços Adicionais",
    seoName: "Serviços de Estética Automotiva",
    label: "Estética personalizada",
    price: null,
    priceQualifier: "consult",
    summary: "Dez cuidados avulsos para combinar com um pacote ou contratar separadamente, conforme avaliação.",
    detail: "Soluções pontuais permitem montar um cuidado coerente com a necessidade real do veículo. Disponibilidade, compatibilidade e orçamento são confirmados antes do serviço.",
    features: [
      ["Remoção de chuva ácida", "Tratamento de manchas minerais e outras marcas em vidros após diagnóstico."],
      ["Manchas na pintura", "Tratamento localizado conforme a origem e a condição do verniz."],
      ["Adesivos e colas", "Retirada cuidadosa de películas, adesivos antigos e resíduos."],
      ["Enceramento automotivo", "Aplicação de cera para acabamento e proteção temporária."],
      ["Revitalização de plásticos", "Cuidado de para-choques, frisos e outras peças externas."],
      ["Higienização de bancos", "Limpeza intensiva ou extração quando compatível com o estofado."],
      ["Limpeza de bancos", "Remoção de resíduos e sujeiras superficiais."],
      ["Limpeza do teto", "Tratamento delicado do forro interno conforme o material."],
      ["Raspagem de carpete", "Remoção técnica de pelos, areia e sujeiras aderidas."],
      ["Limpeza de carpetes", "Higienização da base interna e tratamento de sujeira ou odores quando aplicável."]
    ],
    benefits: ["Contratação avulsa ou combinada", "Escopo personalizado", "Orçamento definido após avaliação"],
    exclusions: ["O preço depende dos itens escolhidos, da condição e do material do veículo."],
    image: mediaById("piso-interno-tratado"),
    featured: false
  }
];

/** Arte conceitual da campanha original. Não representa um atendimento real. */
export const homeMedia = mediaById("conceitual-coupe-escuro");

export const campaignMedia = {
  detail: mediaById("conceitual-detalhe-agua"),
  silhouette: mediaById("conceitual-coupe-escuro")
};

/** Cada ato usa uma mídia classificada no inventário. */
export const storyActs = [
  { key: "veiculo", image: mediaById("conceitual-coupe-escuro"), illustrative: true },
  { key: "detalhes", image: mediaById("farol-comparativo-pronto"), illustrative: false },
  { key: "transformacao", image: mediaById("cabine-desmontada"), illustrative: false },
  { key: "resultado", image: mediaById("honda-civic-g10-tres-quartos"), illustrative: false }
];

/** Vídeo real do Volkswagen Up, publicado sem áudio e com privacidade tratada. */
export const processVideo = mediaById("volkswagen-up-antes-depois");

/** Fotografias reais preservadas como fallback editorial sem JavaScript ou vídeo. */
export const processMedia = [
  {
    number: "01",
    title: "Cabine em processo",
    note: "Desmontagem documentada durante a higienização.",
    media: mediaById("cabine-desmontada")
  },
  {
    number: "02",
    title: "Tratamento interno",
    note: "Piso interno documentado durante o processo.",
    media: mediaById("piso-interno-tratado")
  },
  {
    number: "03",
    title: "Precisão no detalhe",
    note: "Farol real do acervo LavaMed em comparação confirmada.",
    media: mediaById("farol-comparativo-pronto")
  }
];

/**
 * Pares reais e correspondentes para o comparador antes/depois.
 * Formato: { title, before, after, altBefore, altAfter }.
 */
export const comparisonPairs = [
  {
    title: "Cabine desmontada",
    service: "Higienização e estética avançada",
    before: mediaById("cabine-desmontada-antes"),
    after: mediaById("cabine-desmontada-depois")
  },
  {
    title: "Detalhe do trilho do banco",
    service: "Higienização e estética avançada",
    before: mediaById("trilho-banco-antes"),
    after: mediaById("trilho-banco-depois")
  },
  {
    title: "Polimento de farol",
    service: "Polimento de farol",
    before: mediaById("farol-antes"),
    after: mediaById("farol-depois")
  }
];

export const portfolioItems = [
  { number: "01", title: "Honda Civic G10", note: "Exterior finalizado", media: mediaById("honda-civic-g10-frente"), shape: "wide" },
  { number: "02", title: "Hyundai HB20", note: "Exterior finalizado", media: mediaById("hyundai-hb20-finalizado"), shape: "tall" },
  { number: "03", title: "Jeep Compass", note: "Exterior finalizado", media: mediaById("jeep-compass-finalizado"), shape: "wide" },
  { number: "04", title: "Volkswagen Taos", note: "Exterior finalizado", media: mediaById("volkswagen-taos-finalizado"), shape: "tall" },
  { number: "05", title: "Interior Honda Civic", note: "Interior finalizado", media: mediaById("honda-civic-interior-finalizado"), shape: "tall" },
  { number: "06", title: "Motor Onix Joy", note: "Cofre finalizado", media: mediaById("onix-joy-motor-finalizado"), shape: "close" },
  { number: "07", title: "Yamaha Fazer FZ15", note: "Moto finalizada", media: mediaById("yamaha-fz15-finalizada"), shape: "tall" }
];

export function servicePriceLabel(service) {
  if (service.priceQualifier === "consult") return "Sob consulta";
  const value = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(service.price).replace(/\u00a0/g, " ");
  const unit = service.pricingUnit === "par" ? " o par" : "";
  return service.priceQualifier === "starting" ? `A partir de ${value}${unit}` : `${value}${unit}`;
}

export function whatsappUrl(service = "") {
  if (!business.whatsapp) return "/contato/";
  const clean = business.whatsapp.replace(/\D/g, "");
  const serviceName = typeof service === "string" ? service : service?.name || "";
  const priceContext = typeof service === "object" && service?.price != null
    ? ` Consultei o valor inicial de ${servicePriceLabel(service)}, sujeito à avaliação do veículo.`
    : "";
  const text = serviceName
    ? `Olá, LavaMed! Tenho interesse em uma avaliação para ${serviceName}.${priceContext}`
    : "Olá, LavaMed! Gostaria de agendar uma avaliação.";
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}
