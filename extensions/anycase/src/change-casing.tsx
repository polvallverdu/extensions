import { List, ActionPanel, Action, getSelectedText, Clipboard, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .filter(Boolean);
}

const CONVERTERS: { key: string; name: string; convert: (t: string) => string }[] = [
  {
    key: "uppercase",
    name: "UPPERCASE",
    convert: (t) => t.toUpperCase(),
  },
  {
    key: "lowercase",
    name: "lowercase",
    convert: (t) => t.toLowerCase(),
  },
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

export default function Command() {
  const [selectedText, setSelectedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getSelectedText()
      .then((text) => {
        if (!text?.trim()) {
          showToast({ style: Toast.Style.Failure, title: "No text selected" });
        }
        setSelectedText(text ?? "");
      })
      .catch(() => {
        showToast({ style: Toast.Style.Failure, title: "Could not read selected text" });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const visible = CONVERTERS.filter((c) => c.name.toLowerCase().includes(searchText.toLowerCase()));

  async function apply(convert: (t: string) => string) {
    if (!selectedText) {
      await showToast({ style: Toast.Style.Failure, title: "No text selected" });
      return;
    }
    await Clipboard.paste(convert(selectedText));
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter casing..." onSearchTextChange={setSearchText}>
      {visible.map((c) => {
        const preview = selectedText ? c.convert(selectedText) : "";
        return (
          <List.Item
            key={c.key}
            title={c.name}
            subtitle={preview}
            actions={
              <ActionPanel>
                <Action title={`Apply - ${c.name}`} onAction={() => apply(c.convert)} />
                {preview && (
                  <Action.CopyToClipboard
                    title="Copy Without Pasting"
                    content={preview}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                )}
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
