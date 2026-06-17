import { Clipboard, getPreferenceValues, getSelectedText, popToRoot, showHUD, showToast, Toast } from "@raycast/api";
import { CaseType, modifyCasesWrapper } from "./cases.js";

async function readContent(preferredSource: string): Promise<string> {
  let selected = "";
  try {
    selected = await getSelectedText();
  } catch {
    // ignore
  }
  const clipboard = (await Clipboard.readText()) ?? "";

  if (preferredSource === "clipboard") {
    if (clipboard) return clipboard;
    if (selected) return selected;
  } else {
    if (selected) return selected;
    if (clipboard) return clipboard;
  }

  throw new Error("No text available");
}

export async function applyCase(caseType: CaseType): Promise<void> {
  const preferences = getPreferenceValues<Preferences>();

  let content: string;
  try {
    content = await readContent(preferences.source);
  } catch {
    await showToast({
      style: Toast.Style.Failure,
      title: "No text available",
      message: "Please ensure that text is either selected or copied",
    });
    return;
  }

  const modified = modifyCasesWrapper(content, caseType).rawText;

  if (preferences.action === "paste") {
    await Clipboard.paste(modified);
  } else {
    await Clipboard.copy(modified);
  }

  if (!preferences.hideHUD) {
    await showHUD(`Converted to ${caseType}`);
  }

  if (preferences.popToRoot) {
    await popToRoot();
  }
}
