import { Clipboard, getPreferenceValues, popToRoot, showHUD, showToast, Toast } from "@raycast/api";
import { CaseType, modifyCasesWrapper } from "./cases.js";
import { NoTextError, readContent } from "./utils.js";

export async function applyCase(caseType: CaseType): Promise<void> {
  const preferences = getPreferenceValues<Preferences>();

  let content: string;
  try {
    content = await readContent(preferences.source);
  } catch (error) {
    if (error instanceof NoTextError) {
      await showToast({
        style: Toast.Style.Failure,
        title: "No text available",
        message: "Please ensure that text is either selected or copied",
      });
    }
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
