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
export class LightBase implements BaseLook {
  font?: Font;
  color?: Color;
  backgroundColor?: Color;

  constructor() {
    this.font = Font.parse("14px sans-serif");
    this.color = Color.parse("#4a4a4a");
    this.backgroundColor = Color.parse("#ffffff");
  }
}

/** @hidden */
export class LightPrimary implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#32c5ff");
    this.iconColor = Color.parse("#1e2022");
  }
}

/** @hidden */
export class LightSecondary implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#44d7b6");
    this.iconColor = Color.parse("#1e2022");
  }
}

/** @hidden */
export class LightDisabled implements AccentLook {
  fillColor: Color;
  iconColor: Color;

  constructor() {
    this.fillColor = Color.parse("#7b7c7d");
    this.iconColor = Color.parse("#ffffff");
  }
}

/** @hidden */
export class LightFloating implements SurfaceLook {
  shadow?: BoxShadow;
  opacity?: number;

  constructor() {
    this.shadow = BoxShadow.of(0, 2, 4, 0, Color.black(0.5));
  }
}

export class LightTheme implements Theme {
  base: BaseLook;

  primary: AccentLook;
  secondary: AccentLook;
  disabled: AccentLook;

  floating: SurfaceLook;

  constructor() {
    this.base = new LightBase();

    this.primary = new LightPrimary();
    this.secondary = new LightSecondary();
    this.disabled = new LightDisabled();

    this.floating = new LightFloating();
  }

  getStyle<V extends View>(view: V): ViewStyleType<V> | null {
    return null;
  }
}
