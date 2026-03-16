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
  /** Preferences accessible in the `overtime` command */
  export type Overtime = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar` command */
  export type MenuBar = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `overtime` command */
  export type Overtime = {}
  /** Arguments passed to the `menu-bar` command */
  export type MenuBar = {}
}

