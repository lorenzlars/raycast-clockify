import { LocalStorage } from "@raycast/api";

const STORAGE_KEY = "extraDaysOff";

export async function getExtraDaysOff(): Promise<number> {
  const value = await LocalStorage.getItem<number>(STORAGE_KEY);
  return value ?? 0;
}

export async function setExtraDaysOff(value: number): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, value);
}
