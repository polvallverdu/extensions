import { getSelectedText, Clipboard, showToast, Toast } from "@raycast/api";

export function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .filter(Boolean);
}

export const CONVERTERS: { key: string; name: string; convert: (t: string) => string }[] = [
  { key: "uppercase", name: "UPPERCASE", convert: (t) => t.toUpperCase() },
  { key: "lowercase", name: "lowercase", convert: (t) => t.toLowerCase() },
  {
    key: "title",
    name: "Title Case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
  },
  {
    key: "sentence",
    name: "Sentence case",
    convert: (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
  },
  {
    key: "camel",
    name: "camelCase",
    convert: (t) => {
      const words = splitWords(t);
      if (words.length === 0) return t;
      return (
        words[0].toLowerCase() +
        words
          .slice(1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("")
      );
    },
  },
  {
    key: "pascal",
    name: "PascalCase",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(""),
  },
  {
    key: "snake",
    name: "snake_case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toLowerCase())
        .join("_"),
  },
  {
    key: "kebab",
    name: "kebab-case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toLowerCase())
        .join("-"),
  },
  {
    key: "screaming",
    name: "SCREAMING_SNAKE_CASE",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toUpperCase())
        .join("_"),
  },
  {
    key: "dot",
    name: "dot.case",
    convert: (t) =>
      splitWords(t)
        .map((w) => w.toLowerCase())
        .join("."),
  },
];

export async function applyCase(key: string): Promise<void> {
  const converter = CONVERTERS.find((c) => c.key === key);
  if (!converter) return;

  let text: string;
  try {
    text = await getSelectedText();
  } catch {
    await showToast({ style: Toast.Style.Failure, title: "Could not read selected text" });
    return;
  }

  if (!text?.trim()) {
    await showToast({ style: Toast.Style.Failure, title: "No text selected" });
    return;
  }

  await Clipboard.paste(converter.convert(text));
}
