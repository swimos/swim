// Copyright 2015-2024 Nstream, inc.
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

import type {Animator} from "@swim/component";
import type {Color} from "@swim/style";
import type {ThemeAnimatorClass} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {Graphics} from "./Graphics";
import type {IconLayout} from "./IconLayout";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";

/** @public */
export interface IconView extends View {
  readonly iconLayout: Animator<this, IconLayout | null>;

  readonly iconColor: ThemeAnimator<this, Color | null>;

  readonly graphics: ThemeAnimator<this, Graphics | null>;
}

/** @public */
export const IconView = {
  [Symbol.hasInstance](instance: unknown): instance is IconView {
    return instance instanceof View
        && "iconLayout" in instance
        && "iconColor" in instance
        && "graphics" in instance;
  },
};

/** @internal */
export const IconGraphicsAnimator = (<R, A extends ThemeAnimator<any, any, any>>() => ThemeAnimator.extend<ThemeAnimator<R, Graphics | null>, ThemeAnimatorClass<A>>("IconGraphicsAnimator", {
  valueType: Graphics,

  deriveValue(graphics: Graphics | null): Graphics | null {
    const iconView = this.owner;
    if (!IconView[Symbol.hasInstance](iconView) || !(graphics instanceof Icon)) {
      return graphics;
    }
    const iconColor = iconView.iconColor.state;
    if (iconColor !== null && graphics instanceof FilledIcon && graphics.fillLook !== iconView.iconColor.look) {
      graphics = graphics.withFillColor(iconColor);
    }
    return graphics;
  },

  transformState(graphics: Graphics | null): Graphics | null {
    const iconView = this.owner;
    if (!IconView[Symbol.hasInstance](iconView) || !(graphics instanceof Icon)) {
      return graphics;
    }
    const iconColor = iconView.iconColor.state;
    if (iconColor !== null && graphics instanceof FilledIcon) {
      graphics = graphics.withFillColor(iconColor);
    } else {
      const theme = iconView.theme.value;
      const mood = iconView.mood.value;
      if (theme !== null && mood !== null) {
        graphics = graphics.withTheme(theme, mood);
      }
    }
    return graphics;
  },
}))();
