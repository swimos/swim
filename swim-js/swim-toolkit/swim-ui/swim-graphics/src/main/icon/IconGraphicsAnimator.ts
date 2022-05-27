// Copyright 2015-2022 Swim.inc
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

import {ThemeAnimatorClass, ThemeAnimator} from "@swim/theme";
import {Graphics} from "../graphics/Graphics";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";
import {IconView} from "./"; // forward import

/** @internal */
export const IconGraphicsAnimator = (function (_super: typeof ThemeAnimator) {
  const IconGraphicsAnimator = _super.extend("IconGraphicsAnimator", {
    valueType: Graphics,
  }) as ThemeAnimatorClass<ThemeAnimator<any, any, any>>;

  IconGraphicsAnimator.prototype.transformState = function (this: ThemeAnimator<unknown, Graphics | null>, icon: Graphics | null): Graphics | null {
    const iconView = this.owner;
    if (IconView.is(iconView) && icon instanceof Icon) {
      const iconColor = iconView.iconColor.state;
      if (iconColor !== null && icon instanceof FilledIcon) {
        icon = icon.withFillColor(iconColor);
      } else {
        const theme = iconView.theme.value;
        const mood = iconView.mood.value;
        if (theme !== null && mood !== null) {
          icon = icon.withTheme(theme, mood);
        }
      }
    }
    return icon;
  };

  return IconGraphicsAnimator;
})(ThemeAnimator);
