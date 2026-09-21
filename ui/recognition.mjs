// Presentation-only artwork. No catalog, simulation, or save dependency.
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const relativePath = (value, extension) => typeof value === "string" && /^[\w/-]+\.[\w]+$/.test(value) && !value.split("/").includes("..") && extension.test(value);
export function recognitionIndex(registries) {
  const entries = new Map(), platforms = new Map();
  for (const registry of registries) {
    if (registry.format !== 1 || !Array.isArray(registry.entries)) throw Error("Unsupported recognition registry.");
    for (const entry of registry.entries) {
      if (!entry.id || entries.has(entry.id) || !["ship", "aircraft"].includes(entry.kind) ||
          !relativePath(entry.file, /\.(?:png|jpe?g|svg)$/) || !entry.file.startsWith("assets/recognition/") ||
          entry.review?.status !== "accepted" || !Array.isArray(entry.platforms))
        throw Error("Invalid or unreviewed recognition entry: " + entry.id);
      entries.set(entry.id, entry);
      const crop = entry.display?.crop;
      if (crop && (!["x", "y", "width", "height", "imageWidth", "imageHeight"].every(field => Number.isFinite(crop[field]) && crop[field] >= 0) || crop.width <= 0 || crop.height <= 0 || crop.x + crop.width > crop.imageWidth || crop.y + crop.height > crop.imageHeight))
        throw Error("Invalid recognition source panel: " + entry.id);
      for (const platform of entry.platforms) {
        if (platform.campaign !== undefined && !/^[\w-]+$/.test(platform.campaign)) throw Error("Invalid recognition campaign.");
        const key = (platform.campaign ? platform.campaign + ":" : "") + entry.kind + ":" + platform.id;
        if (!platform.id || platforms.has(key)) throw Error("Duplicate recognition mapping: " + key);
        platforms.set(key, { entry, note: platform.note || "" });
      }
    }
  }
  return { entries, platforms };
}
let current = null, pending = null, failure = "";
export async function loadRecognition({ refresh = false, fetcher = globalThis.fetch } = {}) {
  if (pending) return pending;
  if (current && !refresh) return current;
  pending = (async () => {
    const read = async (file) => {
      const response = await fetcher("/assets/recognition/" + file, { cache: "no-store" });
      if (!response.ok) throw Error("Recognition artwork is unavailable (" + response.status + ").");
      return response.json();
    };
    const index = await read("index.json");
    if (index.format !== 1 || !Array.isArray(index.registries) || !index.registries.length ||
        !index.registries.every(file => relativePath(file, /\.json$/)))
      throw Error("Unsupported recognition index.");
    current = recognitionIndex(await Promise.all(index.registries.map(read)));
    failure = "";
    return current;
  })().catch(error => {
    failure = error.message;
    throw error;
  }).finally(() => { pending = null; });
  return pending;
}
const sourceLink = (url, label) => /^https?:\/\//.test(url || "")
  ? `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(label)}</a>` : esc(label);
function artworkImage(entry, expanded = false, actualSize = false) {
  const crop = entry.display?.crop;
  const image = `<img src="/${esc(entry.file)}" alt="${esc(entry.title)} — ${esc(entry.configuration)}"${expanded ? "" : ' loading="lazy" decoding="async"'}${crop ? ` style="left:${-crop.x / crop.width * 100}%;top:${-crop.y / crop.height * 100}%;width:${crop.imageWidth / crop.width * 100}%;height:${crop.imageHeight / crop.height * 100}%"` : ""}>`;
  return crop ? `<div class="recognition-crop" style="aspect-ratio:${crop.width}/${crop.height};--recognition-ratio:${crop.width / crop.height};${actualSize ? `width:${crop.width}px;min-width:100%` : "width:100%"}">${image}</div>` : image;
}
function caption(entry, note = "", { toggle = true, context = "card" } = {}) {
  const source = entry.source || {};
  const information = `<strong>${esc(entry.title)}</strong><span>${esc((entry.views || []).join(" · "))} · ${entry.origin === "historical" ? "Historical reference" : "Original interpretation"}</span><span>${esc(entry.configuration)}</span>${note && note !== entry.configuration ? `<span>${esc(note)}</span>` : ""}<small>${esc(source.author)} · ${sourceLink(/^https?:\/\//.test(source.page || "") ? source.page : source.url, source.title)}${source.page && !/^https?:\/\//.test(source.page) ? " · " + esc(source.page) : ""}${source.credit ? " · " + esc(source.credit) : ""} · ${sourceLink(source.licenseUrl, source.license)}${source.modifications ? " · " + esc(source.modifications) : ""} · Displayed on tinted recognition paper; source file unchanged.</small>`;
  return `<figcaption>${toggle ? `<details class="recognition-info" data-detail-key="recognition-${esc(context)}-${esc(entry.id)}"><summary>Art info</summary><div class="recognition-info-body">${information}</div></details>` : information}</figcaption>`;
}
const platformDrawing = (kind, id, campaign) => current?.platforms.get(campaign + ":" + kind + ":" + id) || current?.platforms.get(kind + ":" + id);
export function recognitionCard(kind, id, { compact = false, campaign = "" } = {}) {
  if (!current) return `<p class="recognition-status">${esc(failure || "Loading recognition drawings…")}</p>`;
  const match = platformDrawing(kind, id, campaign);
  if (!match) return '<p class="recognition-status">No recognition drawing is assigned to this custom design.</p>';
  const { entry, note } = match;
  return `<figure class="recognition-card${compact ? " compact" : ""}${entry.display?.monochrome ? " monochrome" : ""}" data-recognition="${esc(entry.id)}"><button class="recognition-image" data-action="recognition" data-id="${esc(entry.id)}" aria-label="Expand recognition drawing: ${esc(entry.title)}">${artworkImage(entry)}</button>${caption(entry, note)}</figure>`;
}
export function recognitionThumbnail(kind, id, { campaign = "" } = {}) {
  const match = platformDrawing(kind, id, campaign);
  if (!match) return "";
  const { entry } = match;
  return `<figure class="recognition-card recognition-thumbnail${entry.display?.monochrome ? " monochrome" : ""}" data-recognition="${esc(entry.id)}"><div class="recognition-image">${artworkImage(entry)}</div></figure>`;
}
export function recognitionExpanded(id, { actualSize = false } = {}) {
  const entry = current?.entries.get(id);
  return entry ? `<h3 class="recognition-title">${esc(entry.title)}</h3><button data-action="recognition-zoom" data-id="${esc(entry.id)}">${actualSize ? "Fit drawing" : "Actual size"}</button><figure class="recognition-card expanded${entry.display?.monochrome ? " monochrome" : ""}" data-recognition="${esc(entry.id)}"><div class="recognition-sheet${actualSize ? " actual-size" : ""}" data-scroll-key="recognition-${esc(entry.id)}">${artworkImage(entry, true, actualSize)}</div>${caption(entry, "", { context: "expanded" })}</figure><p class="panel-note">Choose actual size to inspect fine details with the scrollbars. Artwork records the named configuration; campaign performance uses the catalog specifications.</p>` : '<p>Recognition drawing unavailable.</p>';
}
export function recognitionCredits() {
  if (!current) return `<p>${esc(failure || "Loading recognition credits…")}</p>`;
  return `<p>${current.entries.size} recognition drawings cover ${current.platforms.size} catalog platforms. Historical plates and original interpretations are identified individually.</p><div class="recognition-credits">${[...current.entries.values()].map(entry => `<figure>${caption(entry, "", { toggle: false })}</figure>`).join("")}</div>`;
}
