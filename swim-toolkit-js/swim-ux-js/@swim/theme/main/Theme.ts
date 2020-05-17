// Copyright 2015-2020 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Color} from "@swim/color";
import {Font} from "@swim/font";
import {BoxShadow} from "@swim/shadow";
import {View} from "@swim/view";
import {DarkTheme} from "./DarkTheme";
import {LightTheme} from "./LightTheme";

export type ViewStyleType<V extends View> = V extends {readonly style: infer S} ? S : unknown;

export interface BaseLook {
  readonly font?: Font;
  readonly color?: Color;
  readonly backgroundColor?: Color;
}

export interface AccentLook {
  readonly fillColor: Color;
  readonly iconColor: Color;
}

export interface SurfaceLook {
  readonly shadow?: BoxShadow;
  readonly opacity?: number;
}

export interface Theme {
  readonly base: BaseLook;

  readonly primary: AccentLook;
  readonly secondary: AccentLook;
  readonly disabled: AccentLook;

  readonly floating: SurfaceLook;

  getStyle<V extends View>(view: V): ViewStyleType<V> | null;
}

export interface ThemeClass {
  dark: Theme;
  light: Theme;
}

export const Theme: ThemeClass = {} as ThemeClass;

Object.defineProperty(Theme, "dark", {
  get: function (): Theme {
    // Lazily initialize theme.
    const theme = new DarkTheme();
    Object.defineProperty(Theme, "dark", {
      value: theme,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return theme;
  },
  set: function (theme: Theme): void {
    // Overwrite lazy property with writable property.
    Object.defineProperty(Theme, "dark", {
      value: theme,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(Theme, "light", {
  get: function (): Theme {
    // Lazily initialize theme.
    const theme = new LightTheme();
    Object.defineProperty(Theme, "light", {
      value: theme,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    return theme;
  },
  set: function (theme: Theme): void {
    // Overwrite lazy property with writable property.
    Object.defineProperty(Theme, "light", {
      value: theme,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  },
  enumerable: true,
  configurable: true,
});
