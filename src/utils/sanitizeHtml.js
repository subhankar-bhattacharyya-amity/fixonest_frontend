// Makes HTML written in the admin panel's editor safe to put on the page.
// Only the formatting that editor can produce survives; everything else is
// either unwrapped (its text is kept) or, for anything that can run code or
// load content, dropped completely.
const ALLOWED_TAGS = new Set([
  "P", "BR", "HR", "H2", "H3", "H4",
  "STRONG", "B", "EM", "I", "U", "S",
  "UL", "OL", "LI", "BLOCKQUOTE", "A",
]);
const DROPPED_TAGS = new Set([
  "SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META",
  "FORM", "INPUT", "BUTTON", "TEXTAREA", "SELECT", "SVG", "MATH", "TEMPLATE", "NOSCRIPT",
]);
const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i;
const TEXT_ALIGNMENTS = new Set(["left", "center", "right", "justify"]);

function cleanAttributes(element) {
  const href = element.getAttribute("href");
  const textAlign = element.style?.textAlign;

  [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));

  if (element.tagName === "A" && href && SAFE_HREF.test(href.trim())) {
    element.setAttribute("href", href.trim());
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener noreferrer");
  }
  if (TEXT_ALIGNMENTS.has(textAlign)) element.style.textAlign = textAlign;
}

function cleanChildren(parent) {
  [...parent.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE || DROPPED_TAGS.has(node.tagName)) {
      node.remove();
      return;
    }

    cleanChildren(node);
    if (ALLOWED_TAGS.has(node.tagName)) {
      cleanAttributes(node);
    } else {
      // Not a tag we render: keep what's inside it, lose the tag itself.
      node.replaceWith(...node.childNodes);
    }
  });
}

export function sanitizeHtml(html = "") {
  const parsed = new DOMParser().parseFromString(String(html), "text/html");
  cleanChildren(parsed.body);
  return parsed.body.innerHTML;
}
