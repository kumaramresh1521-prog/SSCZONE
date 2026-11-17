import sanitizeHtml from "sanitize-html";

export function sanitizeBlogContent(content: unknown) {
  const clean = sanitizeHtml(typeof content === "string" ? content : "", {
    allowVulnerableTags: true,
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
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
      "style",
      // SVG support for scientific & educational diagrams
      "svg",
      "g",
      "path",
      "circle",
      "ellipse",
      "rect",
      "line",
      "polyline",
      "polygon",
      "text",
      "tspan",
      "defs",
      "linearGradient",
      "lineargradient",
      "radialGradient",
      "radialgradient",
      "stop",
      "marker",
      "use",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      svg: ["viewbox", "viewBox", "preserveaspectratio", "preserveAspectRatio", "width", "height", "xmlns", "role", "aria-label", "class", "style", "fill"],
      g: ["id", "class", "style", "fill", "stroke", "stroke-width", "transform", "opacity"],
      path: ["d", "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "opacity", "transform", "id", "class", "style", "marker-end"],
      circle: ["cx", "cy", "r", "fill", "stroke", "stroke-width", "opacity", "id", "class", "style"],
      ellipse: ["cx", "cy", "rx", "ry", "fill", "stroke", "stroke-width", "opacity", "id", "class", "style", "transform"],
      rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke", "stroke-width", "opacity", "id", "class", "style", "transform"],
      line: ["x1", "y1", "x2", "y2", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap", "opacity", "id", "class", "style", "marker-end"],
      polyline: ["points", "fill", "stroke", "stroke-width", "opacity", "id", "class", "style"],
      polygon: ["points", "fill", "stroke", "stroke-width", "opacity", "id", "class", "style"],
      text: ["x", "y", "dx", "dy", "text-anchor", "dominant-baseline", "font-family", "font-size", "font-weight", "fill", "opacity", "id", "class", "style", "transform"],
      tspan: ["x", "y", "dx", "dy", "text-anchor", "font-family", "font-size", "font-weight", "fill", "id", "class", "style"],
      defs: ["id", "class"],
      linearGradient: ["id", "x1", "x2", "y1", "y2", "gradientunits", "gradientUnits", "gradienttransform", "gradientTransform"],
      lineargradient: ["id", "x1", "x2", "y1", "y2", "gradientunits", "gradientUnits", "gradienttransform", "gradientTransform"],
      radialGradient: ["id", "cx", "cy", "r", "fx", "fy", "gradientunits", "gradientUnits", "gradienttransform", "gradientTransform"],
      radialgradient: ["id", "cx", "cy", "r", "fx", "fy", "gradientunits", "gradientUnits", "gradienttransform", "gradientTransform"],
      stop: ["offset", "stop-color", "stop-opacity", "style"],
      marker: ["id", "viewbox", "viewBox", "refx", "refX", "refy", "refY", "markerwidth", "markerWidth", "markerheight", "markerHeight", "orient"],
      button: ["type"],
      "*": ["class", "id", "style", "data-*", "title", "role", "aria-*", "tabindex"],
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

  // Restore strict SVG XML camelCase standards so browser SVG parser renders perfectly
  return clean
    .replace(/<lineargradient\b/gi, "<linearGradient")
    .replace(/<\/lineargradient>/gi, "</linearGradient>")
    .replace(/<radialgradient\b/gi, "<radialGradient")
    .replace(/<\/radialgradient>/gi, "</radialGradient>")
    .replace(/\bviewbox=/gi, "viewBox=")
    .replace(/\bpreserveaspectratio=/gi, "preserveAspectRatio=")
    .replace(/\bgradientunits=/gi, "gradientUnits=")
    .replace(/\bgradienttransform=/gi, "gradientTransform=");
}
