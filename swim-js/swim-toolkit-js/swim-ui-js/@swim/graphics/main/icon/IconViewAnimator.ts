// Copyright 2015-2021 Swim Inc.
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

import {ViewAnimator} from "@swim/view";
import type {Graphics} from "../graphics/Graphics";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";
import type {IconView} from "./IconView";

/** @hidden */
export abstract class IconViewAnimator<V extends IconView> extends ViewAnimator<V, Graphics | null | undefined> {
  override fromAny(value: Graphics | null | undefined): Graphics | null | undefined {
    if (value instanceof Icon) {
      const iconColor = this.owner.iconColor.state;
      if (iconColor !== null && value instanceof FilledIcon) {
        value = value.withFillColor(iconColor);
      } else {
        const theme = this.owner.theme.state;
        const mood = this.owner.mood.state;
        if (theme !== null && mood !== null) {
          value = value.withTheme(theme, mood);
        }
      }
    }
    return value;
  }
}
