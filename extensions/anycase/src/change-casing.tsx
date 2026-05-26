import { List, ActionPanel, Action, getSelectedText, Clipboard, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { CONVERTERS } from "./utils";

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
    if (!selectedText.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "No text selected" });
      return;
    }
    await Clipboard.paste(convert(selectedText));
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter casing..." onSearchTextChange={setSearchText}>
      {visible.map((c) => {
        const preview = selectedText.trim() ? c.convert(selectedText) : "";
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
