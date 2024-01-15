import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  projectId: string;
}

export const getPreferences = (): Preferences => {
  return getPreferenceValues<Preferences>();
};