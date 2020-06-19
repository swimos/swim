// Copyright 2015-2020 Swim inc.
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
import {ViewStyleType, BaseLook, AccentLook, SurfaceLook, Theme} from "./Theme";

/** @hidden */
export class DarkBase implements BaseLook {
  font?: Font;
  color?: Color;
  backgroundColor?: Color;

  constructor() {
    this.font = Font.parse("14px sans-serif");
    this.color = Color.parse("#ffffff");
    this.backgroundColor = Color.parse("#1e2022");
  }
}

/** @hidden */
export class DarkPrimary implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#32c5ff");
    this.iconColor = Color.parse("#1e2022");
  }
}

/** @hidden */
export class DarkSecondary implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#44d7b6");
    this.iconColor = Color.parse("#1e2022");
  }
}

/** @hidden */
export class DarkDisabled implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#7b7c7d");
    this.iconColor = Color.parse("#ffffff");
  }
}

/** @hidden */
export class DarkFloating implements SurfaceLook {
  shadow?: BoxShadow;
  opacity?: number;

  constructor() {
    this.shadow = BoxShadow.of(0, 2, 4, 0, Color.black(0.5));
  }
}

export class DarkTheme implements Theme {
  base: BaseLook;

  primary: AccentLook;
  secondary: AccentLook;
  disabled: AccentLook;

  floating: SurfaceLook;

  constructor() {
    this.base = new DarkBase();

    this.primary = new DarkPrimary();
    this.secondary = new DarkSecondary();
    this.disabled = new DarkDisabled();

    this.floating = new DarkFloating();
  }

  getStyle<V extends View>(view: V): ViewStyleType<V> | null {
    return null;
  }
}
