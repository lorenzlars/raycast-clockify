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
  "hoursPerDay": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `report` command */
  export type Report = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `report` command */
  export type Report = {}
}

