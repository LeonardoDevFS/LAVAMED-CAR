import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "media", "catalog.json");
const manifestPath = path.join(root, "src", "media-manifest.js");
const inventoryPath = path.join(root, "docs", "MEDIA-INVENTORY.md");
const imagesRoot = path.join(root, "src", "assets", "images");
const thumbnailRoot = path.join(imagesRoot, "thumbnails");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const generatedDirectories = new Set();
const manifest = {};
const inventory = [];

const slash = (value) => value.split(path.sep).join("/");
const bytes = (value) => value < 1024 * 1024
  ? `${(value / 1024).toFixed(1)} KB`
  : `${(value / 1024 / 1024).toFixed(2)} MB`;
const cell = (value = "") => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");

for (const entry of catalog) {
  const sourcePath = path.join(root, entry.source);
  const sourceStat = await stat(sourcePath);
  const sourceBuffer = await readFile(sourcePath);
  const hash = createHash("sha256").update(sourceBuffer).digest("hex");
  let metadata = {};

  if (entry.pipeline !== "existing" || path.extname(sourcePath).toLowerCase() !== ".svg") {
    metadata = await sharp(sourcePath).metadata();
  } else {
    const svg = sourceBuffer.toString("utf8");
    const viewBox = svg.match(/viewBox=["']([\d.\s-]+)["']/i)?.[1]?.trim().split(/\s+/).map(Number);
    metadata.width = viewBox?.[2] || null;
    metadata.height = viewBox?.[3] || null;
  }

  let finalPath = entry.publication || "—";

  if (entry.pipeline === "optimize") {
    const outputDir = path.join(imagesRoot, entry.publicationDir);
    generatedDirectories.add(outputDir);
    await mkdir(outputDir, { recursive: true });
    await mkdir(thumbnailRoot, { recursive: true });

    const widths = [...new Set(entry.widths)]
      .filter((width) => width <= metadata.width)
      .sort((a, b) => a - b);
    if (!widths.length || widths.at(-1) !== metadata.width) {
      widths.push(metadata.width);
    }

    const webp = [];
    const avif = [];
    for (const width of widths) {
      const webpName = `${entry.publicationBase}-${width}.webp`;
      const avifName = `${entry.publicationBase}-${width}.avif`;
      const webpPath = path.join(outputDir, webpName);
      const avifPath = path.join(outputDir, avifName);
      const pipeline = sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });
      await pipeline.clone().webp({ quality: 80, effort: 5, smartSubsample: true }).toFile(webpPath);
      await pipeline.clone().avif({ quality: 58, effort: 5, chromaSubsampling: "4:4:4" }).toFile(avifPath);
      webp.push({ src: `/assets/images/${slash(path.join(entry.publicationDir, webpName))}`, width });
      avif.push({ src: `/assets/images/${slash(path.join(entry.publicationDir, avifName))}`, width });
    }

    const thumbnailName = `${entry.publicationBase}-thumb.webp`;
    await sharp(sourcePath)
      .rotate()
      .resize({ width: Math.min(420, metadata.width), height: 280, fit: "cover", position: "attention", withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(path.join(thumbnailRoot, thumbnailName));

    if (entry.id === "honda-civic-g10-frente") {
      await sharp(sourcePath)
        .rotate()
        .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
        .jpeg({ quality: 86, progressive: true, mozjpeg: true })
        .toFile(path.join(imagesRoot, "hero", "lavamed-social.jpg"));
    }

    const largestWebp = webp.at(-1);
    finalPath = largestWebp.src;
    manifest[entry.id] = {
      id: entry.id,
      type: "photo",
      classification: entry.classification,
      confidence: entry.confidence,
      stage: entry.stage,
      alt: entry.alt,
      truthLabel: entry.illustrative ? "Composição conceitual" : entry.classification,
      illustrative: Boolean(entry.illustrative),
      width: metadata.width,
      height: metadata.height,
      aspectRatio: Number((metadata.width / metadata.height).toFixed(4)),
      src: largestWebp.src,
      webpSrcSet: webp.map((item) => `${item.src} ${item.width}w`).join(", "),
      avifSrcSet: avif.map((item) => `${item.src} ${item.width}w`).join(", "),
      sizes: entry.sizes,
      thumbnail: `/assets/images/thumbnails/${thumbnailName}`,
      plateStatus: entry.plateStatus
    };
  }

  if (entry.pipeline === "existing") {
    manifest[entry.id] = {
      id: entry.id,
      type: path.extname(sourcePath).toLowerCase() === ".svg" ? "vector" : "photo",
      classification: entry.classification,
      confidence: entry.confidence,
      stage: entry.stage,
      alt: entry.alt,
      truthLabel: entry.classification,
      illustrative: Boolean(entry.illustrative),
      width: metadata.width,
      height: metadata.height,
      aspectRatio: metadata.width && metadata.height ? Number((metadata.width / metadata.height).toFixed(4)) : null,
      src: entry.publication,
      webpSrcSet: "",
      avifSrcSet: "",
      sizes: entry.sizes || "100vw",
      thumbnail: entry.publication,
      plateStatus: entry.plateStatus
    };
  }

  if (entry.pipeline === "reference") {
    const original = catalog.find((item) => item.id === entry.duplicateOf);
    finalPath = original ? `/assets/images/${original.publicationDir}/${original.publicationBase}-${Math.max(...original.widths)}.webp` : "—";
  }

  inventory.push({
    original: slash(entry.source),
    publication: entry.pipeline === "reference" ? `duplicata de ${entry.duplicateOf}` : entry.publicationBase || path.basename(entry.publication || "—"),
    classification: entry.classification,
    confidence: entry.confidence,
    resolution: metadata.width && metadata.height ? `${metadata.width} × ${metadata.height}` : "vetorial",
    size: bytes(sourceStat.size),
    type: path.extname(sourcePath).toLowerCase() === ".svg" ? "vetor" : "fotografia",
    stage: entry.stage,
    quality: entry.quality,
    edit: entry.edit,
    usage: entry.usage,
    plateStatus: entry.plateStatus,
    destination: finalPath,
    sha256: hash
  });
}

const manifestSource = `/**\n * Gerado por scripts/process-media.mjs a partir de media/catalog.json.\n * Não editar manualmente.\n */\nexport const mediaCatalog = ${JSON.stringify(manifest, null, 2)};\n\nexport function mediaById(id) {\n  const media = mediaCatalog[id];\n  if (!media) throw new Error(\`Mídia não encontrada: \${id}\`);\n  return media;\n}\n`;
await writeFile(manifestPath, manifestSource, "utf8");

const markdown = `# Inventário de mídias da LavaMed\n\n` +
  `Gerado em 25/10/2026 por \`npm run media:process\`. Os originais ficam fora de \`src/\` para não entrarem no build. Nenhum original foi excluído ou sobrescrito.\n\n` +
  `## Resumo\n\n` +
  `- ${inventory.filter((item) => item.type === "fotografia").length} fotografias raster encontradas.\n` +
  `- ${inventory.filter((item) => item.type === "vetor").length} arquivo vetorial encontrado.\n` +
  `- 0 vídeos encontrados.\n` +
  `- 2 duplicatas binárias preservadas, mas não replicadas no build.\n` +
  `- Derivados publicados em WebP e AVIF; thumbnails em WebP.\n` +
  `- Os arquivos com veículos externos já chegaram com a placa coberta pela marca LavaMed; os derivados preservam essa proteção.\n\n` +
  `## Inventário detalhado\n\n` +
  `| Original | Publicação | Procedimento / conteúdo | Confiança | Resolução | Tamanho | Tipo | Etapa | Qualidade | Edição | Melhor uso | Placa | Caminho final | SHA-256 |\n` +
  `|---|---|---|---|---:|---:|---|---|---|---|---|---|---|---|\n` +
  inventory.map((item) => `| ${cell(item.original)} | ${cell(item.publication)} | ${cell(item.classification)} | ${cell(item.confidence)} | ${cell(item.resolution)} | ${cell(item.size)} | ${cell(item.type)} | ${cell(item.stage)} | ${cell(item.quality)} | ${cell(item.edit)} | ${cell(item.usage)} | ${cell(item.plateStatus)} | ${cell(item.destination)} | \`${item.sha256.slice(0, 12)}…\` |`).join("\n") +
  `\n\n## Critérios de verdade visual\n\n` +
  `- “Exterior finalizado” descreve somente o que a fotografia comprova; não implica polimento, vitrificação ou outro tratamento específico.\n` +
  `- Os pares do trilho do banco e do farol têm o mesmo veículo e enquadramento compatível e podem ser usados em comparadores.\n` +
  `- Os dois assets em \`generated/\` são composições conceituais e nunca são apresentados como atendimento real.\n` +
  `- Não há material de vídeo ou áudio licenciado no acervo atual. O som do site é sintetizado no navegador e permanece opcional.\n`;
await writeFile(inventoryPath, markdown, "utf8");

console.log(`Processadas ${catalog.length} entradas; ${Object.keys(manifest).length} mídias publicáveis e ${inventory.length} registros inventariados.`);
