/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Clockify API Key - Your Clockify API key */
  "apiKey": string,
  /** Hours per Day - Expected working hours per day */
  "hoursPerDay": string,
  /** Bundesland - Bundesland für Feiertagsberechnung */
  "federalState"?: "" | "BW" | "BY" | "BE" | "BB" | "HB" | "HH" | "HE" | "MV" | "NI" | "NW" | "RP" | "SL" | "SN" | "ST" | "SH" | "TH"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `report` command */
  export type Report = ExtensionPreferences & {}
  /** Preferences accessible in the `add-days-off` command */
  export type AddDaysOff = ExtensionPreferences & {}
  /** Preferences accessible in the `remove-days-off` command */
  export type RemoveDaysOff = ExtensionPreferences & {}
  /** Preferences accessible in the `reset-days-off` command */
  export type ResetDaysOff = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `report` command */
  export type Report = {}
  /** Arguments passed to the `add-days-off` command */
  export type AddDaysOff = {
  /** Days */
  "amount": string
}
  /** Arguments passed to the `remove-days-off` command */
  export type RemoveDaysOff = {
  /** Days */
  "amount": string
}
  /** Arguments passed to the `reset-days-off` command */
  export type ResetDaysOff = {}
}

