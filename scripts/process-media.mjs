import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(root, "media", "catalog.json");
const manifestPath = path.join(root, "src", "media-manifest.js");
const inventoryPath = path.join(root, "docs", "MEDIA-INVENTORY.md");
const imagesRoot = path.join(root, "src", "assets", "images");
const thumbnailRoot = path.join(imagesRoot, "thumbnails");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const runFile = promisify(execFile);
const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
const generatedDirectories = new Set();
const manifest = {};
const inventory = [];

const slash = (value) => value.split(path.sep).join("/");
const bytes = (value) => value < 1024 * 1024
  ? `${(value / 1024).toFixed(1)} KB`
  : `${(value / 1024 / 1024).toFixed(2)} MB`;
const cell = (value = "") => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");

async function probeVideo(sourcePath) {
  const { stdout } = await runFile(ffprobePath, [
    "-v", "error",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    sourcePath
  ], { maxBuffer: 2 * 1024 * 1024 });
  return JSON.parse(stdout);
}

function videoFilter(entry) {
  const filters = [];
  let current = "0:v";
  for (const [index, mask] of (entry.privacyMasks || []).entries()) {
    const base = `mask-base-${index}`;
    const cropSource = `mask-source-${index}`;
    const blurred = `mask-blur-${index}`;
    const masked = `masked-${index}`;
    filters.push(`[${current}]split=2[${base}][${cropSource}]`);
    filters.push(`[${cropSource}]crop=${mask.width}:${mask.height}:${mask.x}:${mask.y},boxblur=12:2[${blurred}]`);
    filters.push(`[${base}][${blurred}]overlay=${mask.x}:${mask.y}:enable='between(t,${mask.start},${mask.end})'[${masked}]`);
    current = masked;
  }
  filters.push(entry.preserveVisuals
    ? `[${current}]null[processed]`
    : `[${current}]eq=contrast=1.035:saturation=1.025:gamma=0.995,unsharp=5:5:0.18:3:3:0[processed]`);
  return filters.join(";");
}

async function processVideo(entry, sourcePath, metadata, probe) {
  const outputDir = path.join(imagesRoot, entry.publicationDir);
  const auditDir = path.join(root, entry.auditDir || path.join("docs", "video-audit"));
  await mkdir(outputDir, { recursive: true });
  await mkdir(thumbnailRoot, { recursive: true });
  await mkdir(auditDir, { recursive: true });

  const fullName = `${entry.publicationBase}-completo.mp4`;
  const previewName = `${entry.publicationBase}-preview.mp4`;
  const previewWebmName = `${entry.publicationBase}-preview.webm`;
  const posterWebpName = `${entry.publicationBase}-poster.webp`;
  const posterAvifName = `${entry.publicationBase}-poster.avif`;
  const thumbnailName = `${entry.publicationBase}-thumb.webp`;
  const fullPath = path.join(outputDir, fullName);
  const previewPath = path.join(outputDir, previewName);
  const previewWebmPath = path.join(outputDir, previewWebmName);
  const posterJpegPath = path.join(outputDir, `${entry.publicationBase}-poster-source.jpg`);

  if (entry.preserveVisuals && !(entry.privacyMasks || []).length) {
    await runFile(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", sourcePath,
      "-map", "0:v:0", "-an",
      "-c:v", "copy",
      "-movflags", "+faststart",
      fullPath
    ], { maxBuffer: 4 * 1024 * 1024 });
  } else {
    await runFile(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", sourcePath,
      "-filter_complex", videoFilter(entry),
      "-map", "[processed]",
      "-an",
      "-c:v", "libx264", "-preset", "slow", "-crf", "22",
      "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      fullPath
    ], { maxBuffer: 4 * 1024 * 1024 });
  }

  const segments = entry.previewSegments || [];
  const previewDuration = segments.reduce((total, segment) => total + segment.end - segment.start, 0);
  const segmentFilters = segments.map((segment, index) =>
    `[0:v]trim=start=${segment.start}:end=${segment.end},setpts=PTS-STARTPTS[segment-${index}]`
  );
  const segmentInputs = segments.map((_, index) => `[segment-${index}]`).join("");
  segmentFilters.push(`${segmentInputs}concat=n=${segments.length}:v=1:a=0,fade=t=in:st=0:duration=0.22,fade=t=out:st=${Math.max(0, previewDuration - .28).toFixed(2)}:duration=0.28[preview]`);
  await runFile(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", fullPath,
    "-filter_complex", segmentFilters.join(";"),
    "-map", "[preview]", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "21",
    "-profile:v", "high", "-level", "4.0", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    previewPath
  ], { maxBuffer: 4 * 1024 * 1024 });

  await runFile(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", previewPath, "-an",
    "-c:v", "libvpx-vp9", "-crf", "33", "-b:v", "0",
    "-deadline", "good", "-cpu-used", "2", "-row-mt", "1",
    previewWebmPath
  ], { maxBuffer: 4 * 1024 * 1024 });

  await runFile(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", String(entry.posterTime), "-i", fullPath,
    "-frames:v", "1", "-q:v", "1", "-update", "1",
    posterJpegPath
  ]);
  await sharp(posterJpegPath).webp({ quality: 84, effort: 5 }).toFile(path.join(outputDir, posterWebpName));
  await sharp(posterJpegPath).avif({ quality: 62, effort: 5, chromaSubsampling: "4:4:4" }).toFile(path.join(outputDir, posterAvifName));
  await sharp(posterJpegPath)
    .resize({ width: 360, height: 480, fit: "cover", position: "attention", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(path.join(thumbnailRoot, thumbnailName));
  await rm(posterJpegPath, { force: true });

  const contactSheetFrames = entry.contactSheetFrames || 12;
  const contactSheetColumns = 4;
  const contactSheetRows = Math.ceil(contactSheetFrames / contactSheetColumns);
  await runFile(ffmpegPath, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", sourcePath,
    "-vf", `fps=${contactSheetFrames}/${Number(probe.format.duration).toFixed(6)},scale=320:-2:flags=lanczos,tile=${contactSheetColumns}x${contactSheetRows}:padding=8:margin=8:color=0x050b12`,
    "-frames:v", "1", "-q:v", "2", "-update", "1",
    path.join(auditDir, `${entry.publicationBase}-contact-sheet.jpg`)
  ]);

  const derivativeFiles = [fullPath, previewPath, previewWebmPath];
  const derivativeProbes = await Promise.all(derivativeFiles.map((file) => probeVideo(file)));
  for (const [index, derivativeProbe] of derivativeProbes.entries()) {
    if (derivativeProbe.streams.some((stream) => stream.codec_type === "audio")) {
      throw new Error(`Derivado de vídeo contém áudio: ${derivativeFiles[index]}`);
    }
  }
  const fullDuration = Number(derivativeProbes[0].format.duration);
  const previewMp4Duration = Number(derivativeProbes[1].format.duration);
  const previewWebmDuration = Number(derivativeProbes[2].format.duration);
  if (Math.abs(fullDuration - Number(probe.streams.find((stream) => stream.codec_type === "video")?.duration || probe.format.duration)) > .25) {
    throw new Error(`A duração visual do vídeo completo foi alterada além da tolerância: ${fullDuration}s`);
  }
  if (Math.abs(previewMp4Duration - previewDuration) > .1 || Math.abs(previewWebmDuration - previewDuration) > .1) {
    throw new Error(`Preview de vídeo com duração inesperada: MP4 ${previewMp4Duration}s / WebM ${previewWebmDuration}s`);
  }

  const derivativeStats = await Promise.all(derivativeFiles.map((file) => stat(file)));
  await writeFile(path.join(auditDir, `${entry.publicationBase}-metadata.json`), JSON.stringify({
    source: {
      path: slash(entry.source),
      sha256: createHash("sha256").update(await readFile(sourcePath)).digest("hex"),
      duration: Number(probe.format.duration),
      size: Number(probe.format.size),
      bitrate: Number(probe.format.bit_rate),
      streams: probe.streams.map((stream) => ({
        codecType: stream.codec_type,
        codec: stream.codec_name,
        profile: stream.profile,
        width: stream.width,
        height: stream.height,
        fps: stream.avg_frame_rate,
        duration: Number(stream.duration || 0),
        bitrate: Number(stream.bit_rate || 0)
      }))
    },
    privacyMasks: entry.privacyMasks,
    previewSegments: entry.previewSegments,
    preserveVisuals: Boolean(entry.preserveVisuals),
    derivatives: derivativeFiles.map((file, index) => ({
      file: slash(path.relative(root, file)),
      duration: Number(derivativeProbes[index].format.duration),
      size: derivativeStats[index].size,
      streams: derivativeProbes[index].streams.map((stream) => ({ codecType: stream.codec_type, codec: stream.codec_name }))
    }))
  }, null, 2), "utf8");

  const videoStream = probe.streams.find((stream) => stream.codec_type === "video");
  const originalAudio = probe.streams.find((stream) => stream.codec_type === "audio");
  const fpsParts = String(videoStream.avg_frame_rate || "0/1").split("/").map(Number);
  const fps = fpsParts[1] ? fpsParts[0] / fpsParts[1] : 0;
  const publicRoot = `/assets/images/${slash(entry.publicationDir)}`;
  return {
    id: entry.id,
    type: "video",
    classification: entry.classification,
    confidence: entry.confidence,
    stage: entry.stage,
    stateLabel: entry.stateLabel || entry.stage,
    alt: entry.alt,
    truthLabel: entry.classification,
    illustrative: false,
    width: metadata.width,
    height: metadata.height,
    aspectRatio: Number((metadata.width / metadata.height).toFixed(4)),
    duration: Number(Number(probe.format.duration).toFixed(3)),
    fps: Number(fps.toFixed(3)),
    codec: videoStream.codec_name,
    originalBitrate: Number(probe.format.bit_rate || 0),
    originalHadAudio: Boolean(originalAudio),
    hasAudio: false,
    src: `${publicRoot}/${previewName}`,
    mp4: `${publicRoot}/${previewName}`,
    webm: `${publicRoot}/${previewWebmName}`,
    fullSrc: `${publicRoot}/${fullName}`,
    poster: `${publicRoot}/${posterWebpName}`,
    posterAvif: `${publicRoot}/${posterAvifName}`,
    thumbnail: `/assets/images/thumbnails/${thumbnailName}`,
    preload: "none",
    plateStatus: entry.plateStatus,
    previewDuration: Number(previewDuration.toFixed(3))
  };
}

for (const entry of catalog) {
  const sourcePath = path.join(root, entry.source);
  const sourceStat = await stat(sourcePath);
  const sourceBuffer = await readFile(sourcePath);
  const hash = createHash("sha256").update(sourceBuffer).digest("hex");
  let metadata = {};

  let videoProbe = null;
  if (entry.pipeline === "video") {
    videoProbe = await probeVideo(sourcePath);
    const videoStream = videoProbe.streams.find((stream) => stream.codec_type === "video");
    metadata.width = videoStream.width;
    metadata.height = videoStream.height;
    metadata.duration = Number(videoProbe.format.duration);
  } else if (entry.pipeline !== "existing" || path.extname(sourcePath).toLowerCase() !== ".svg") {
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

  if (entry.pipeline === "video") {
    manifest[entry.id] = await processVideo(entry, sourcePath, metadata, videoProbe);
    finalPath = manifest[entry.id].src;
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
    type: entry.pipeline === "video" ? "vídeo" : path.extname(sourcePath).toLowerCase() === ".svg" ? "vetor" : "fotografia",
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

const inventoryDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
const videoCount = inventory.filter((item) => item.type === "vídeo").length;
const markdown = `# Inventário de mídias da LavaMed\n\n` +
  `Gerado em ${inventoryDate} por \`npm run media:process\`. Os originais ficam fora de \`src/\` para não entrarem no build. Nenhum original foi excluído ou sobrescrito.\n\n` +
  `## Resumo\n\n` +
  `- ${inventory.filter((item) => item.type === "fotografia").length} fotografias raster encontradas.\n` +
  `- ${inventory.filter((item) => item.type === "vetor").length} arquivo vetorial encontrado.\n` +
  `- ${videoCount} ${videoCount === 1 ? "vídeo real encontrado e processado" : "vídeos reais encontrados e processados"}.\n` +
  `- 2 duplicatas binárias preservadas, mas não replicadas no build.\n` +
  `- Fotografias publicadas em WebP/AVIF; vídeos publicados em MP4 H.264 e previews adicionais em WebM VP9; thumbnails em WebP.\n` +
  `- Os arquivos com placas visíveis recebem máscara nos derivados; os dois registros Dual Motion não exibem placa legível nos enquadramentos inspecionados.\n\n` +
  `## Inventário detalhado\n\n` +
  `| Original | Publicação | Procedimento / conteúdo | Confiança | Resolução | Tamanho | Tipo | Etapa | Qualidade | Edição | Melhor uso | Placa | Caminho final | SHA-256 |\n` +
  `|---|---|---|---|---:|---:|---|---|---|---|---|---|---|---|\n` +
  inventory.map((item) => `| ${cell(item.original)} | ${cell(item.publication)} | ${cell(item.classification)} | ${cell(item.confidence)} | ${cell(item.resolution)} | ${cell(item.size)} | ${cell(item.type)} | ${cell(item.stage)} | ${cell(item.quality)} | ${cell(item.edit)} | ${cell(item.usage)} | ${cell(item.plateStatus)} | ${cell(item.destination)} | \`${item.sha256.slice(0, 12)}…\` |`).join("\n") +
  `\n\n## Critérios de verdade visual\n\n` +
  `- “Exterior finalizado” descreve somente o que a fotografia comprova; não implica polimento, vitrificação ou outro tratamento específico.\n` +
  `- Os pares do trilho do banco e do farol têm o mesmo veículo e enquadramento compatível e podem ser usados em comparadores.\n` +
  `- Os dois assets em \`generated/\` são composições conceituais e nunca são apresentados como atendimento real.\n` +
  `- Os dois vídeos Dual Motion documentam o estado anterior e o resultado final do mesmo Volkswagen Up, mas não permitem afirmar qual pacote específico foi executado.\n` +
  `- Os ângulos e as durações dos dois estados não são idênticos; a comparação é editorial e não sincroniza artificialmente os quadros.\n` +
  `- Todo áudio presente nos originais foi removido integralmente dos derivados públicos; a experiência permanece silenciosa.\n`;
await writeFile(inventoryPath, markdown, "utf8");

console.log(`Processadas ${catalog.length} entradas; ${Object.keys(manifest).length} mídias publicáveis e ${inventory.length} registros inventariados.`);
