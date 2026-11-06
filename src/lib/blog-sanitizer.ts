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
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
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
