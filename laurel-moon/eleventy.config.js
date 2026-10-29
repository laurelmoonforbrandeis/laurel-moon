import markdownIt from "markdown-it";

// Cover colors and moon phases offered in the CMS. Keep these keys in sync
// with the select options in src/admin/config.yml.
const COVER_COLORS = {
  midnight: "#1B2440",
  slate: "#33475E",
  laurel: "#3E5A48",
  plum: "#5A3E4E",
  teal: "#2E4F57",
  olive: "#4A4F2E",
};
const MOON_PHASES = { crescent: 36, quarter: 55, gibbous: 78, full: 100 };
const GENRES = ["Poetry", "Prose", "Art"];

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "piece";
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/^\n+/, "")
    .replace(/\s+$/, "");
}

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

// "2026-10-20 19:00" (as saved by the CMS) -> parts, without time zone surprises.
function parseEventDate(value) {
  if (value instanceof Date) {
    return {
      y: value.getUTCFullYear(), m: value.getUTCMonth() + 1, d: value.getUTCDate(),
      h: value.getUTCHours(), min: value.getUTCMinutes(), hasTime: true,
    };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(value || ""));
  if (!match) return null;
  return {
    y: +match[1], m: +match[2], d: +match[3],
    h: match[4] ? +match[4] : 0, min: match[5] ? +match[5] : 0, hasTime: Boolean(match[4]),
  };
}

export default function (eleventyConfig) {
  const md = markdownIt({ html: false, linkify: true, typographer: true });

  // Files copied straight to the site without processing.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // ---- Collections -------------------------------------------------------

  // Every issue, newest first. The first one is the "current issue".
  eleventyConfig.addCollection("issuesNewest", (api) =>
    api.getFilteredByTag("issues").slice().sort((a, b) => b.date - a.date)
  );

  // Every piece from every issue, each with its own page URL.
  eleventyConfig.addCollection("pieces", (api) => {
    const all = [];
    const issues = api.getFilteredByTag("issues").slice().sort((a, b) => b.date - a.date);
    for (const issue of issues) {
      const raw = Array.isArray(issue.data.pieces) ? issue.data.pieces : [];
      const used = new Set();
      const items = raw
        .filter((p) => p && p.title)
        .map((p) => {
          const base = slugify(p.title);
          let slug = base;
          let n = 2;
          while (used.has(slug)) slug = `${base}-${n++}`;
          used.add(slug);
          return {
            title: String(p.title),
            author: p.author || "",
            school: p.school || "",
            genre: GENRES.includes(p.genre) ? p.genre : "Poetry",
            featured: Boolean(p.featured),
            text: normalizeText(p.text),
            image: p.image || "",
            image_alt: p.image_alt || "",
            bio: p.bio || "",
            slug,
            url: `${issue.url}${slug}/`,
            issueTitle: issue.data.title,
            issueUrl: issue.url,
          };
        });
      items.forEach((item, i) => {
        item.prev = items[i - 1] ? { title: items[i - 1].title, url: items[i - 1].url } : null;
        item.next = items[i + 1] ? { title: items[i + 1].title, url: items[i + 1].url } : null;
      });
      all.push(...items);
    }
    return all;
  });

  // ---- Filters -----------------------------------------------------------

  eleventyConfig.addFilter("md", (content) => md.render(String(content || "")));
  eleventyConfig.addFilter("coverHex", (name) => COVER_COLORS[name] || COVER_COLORS.slate);
  eleventyConfig.addFilter("moonPhase", (name) => MOON_PHASES[name] ?? MOON_PHASES.crescent);

  eleventyConfig.addFilter("piecesFor", (pieces, issueUrl) =>
    (pieces || []).filter((p) => p.issueUrl === issueUrl)
  );
  eleventyConfig.addFilter("featuredPiece", (pieces) => {
    const list = pieces || [];
    return list.find((p) => p.featured) || list.find((p) => p.genre === "Poetry") || list[0] || null;
  });
  eleventyConfig.addFilter("genresIn", (pieces) =>
    GENRES.map((name) => ({ name, count: (pieces || []).filter((p) => p.genre === name).length }))
      .filter((g) => g.count > 0)
  );
  eleventyConfig.addFilter("featureLabel", (genre) =>
    ({ Poetry: "Featured poem", Prose: "Featured prose", Art: "Featured artwork" })[genre] || "Featured"
  );
  eleventyConfig.addFilter("creatorNoun", (genre) =>
    ({ Poetry: "poet", Prose: "author", Art: "artist" })[genre] || "author"
  );

  // Poems keep every line break and leading space exactly as typed.
  eleventyConfig.addFilter("poemLines", (text, limit = 0) => {
    let lines = normalizeText(text).split("\n");
    if (limit > 0) {
      lines = lines.slice(0, limit);
      while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    }
    return lines;
  });
  eleventyConfig.addFilter("poemHasMore", (text, limit) => normalizeText(text).split("\n").length > limit);
  eleventyConfig.addFilter("paragraphs", (text) =>
    normalizeText(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  );
  eleventyConfig.addFilter("excerptWords", (text, count = 70) => {
    const first = normalizeText(text).split(/\n\s*\n/)[0] || "";
    const words = first.split(/\s+/).filter(Boolean);
    return words.length > count ? `${words.slice(0, count).join(" ")}…` : first;
  });

  eleventyConfig.addFilter("take", (list, count, offset = 0) => (list || []).slice(offset, offset + count));

  eleventyConfig.addFilter("monthYear", (date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(toDate(date))
  );
  eleventyConfig.addFilter("isoDate", (date) => toDate(date).toISOString().slice(0, 10));
  eleventyConfig.addFilter("decade", (date) => `${Math.floor(toDate(date).getUTCFullYear() / 10) * 10}s`);
  eleventyConfig.addFilter("decadesOf", (issues) => {
    const set = new Set((issues || []).map((i) => Math.floor(toDate(i.date).getUTCFullYear() / 10) * 10));
    return [...set].sort((a, b) => b - a).map((d) => `${d}s`);
  });

  eleventyConfig.addFilter("sortEvents", (events) =>
    (events || []).filter((e) => e && e.name).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))
  );
  eleventyConfig.addFilter("eventWhen", (value) => {
    const p = parseEventDate(value);
    if (!p) return "";
    const date = new Date(Date.UTC(p.y, p.m - 1, p.d, p.h, p.min));
    const day = new Intl.DateTimeFormat("en-US", {
      weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
    }).format(date);
    if (!p.hasTime) return day;
    const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(date);
    return `${day} at ${time}`;
  });
  eleventyConfig.addFilter("eventIso", (value) => {
    const p = parseEventDate(value);
    if (!p) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return p.hasTime
      ? `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.min)}`
      : `${p.y}-${pad(p.m)}-${pad(p.d)}`;
  });

  eleventyConfig.addFilter("stripSlash", (url) => String(url || "").replace(/\/+$/, ""));
  eleventyConfig.addFilter("isPageUrl", (url) => Boolean(url) && url.endsWith("/"));

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
}

export const config = {
  dir: {
    input: "src",
    includes: "_includes",
    data: "_data",
    output: "_site",
  },
  templateFormats: ["njk", "md"],
  markdownTemplateEngine: false,
  htmlTemplateEngine: "njk",
};
