import sanitizeHtml from "sanitize-html";

export function sanitizeBlogContent(content: unknown) {
  return sanitizeHtml(typeof content === "string" ? content : "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "button",
      "details",
      "summary",
      "mark",
      "kbd",
      "figure",
      "figcaption",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["class", "id", "style", "data-*", "title", "role", "aria-*"],
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          return { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } };
        }
        return { tagName, attribs };
      },
    },
  });
}
