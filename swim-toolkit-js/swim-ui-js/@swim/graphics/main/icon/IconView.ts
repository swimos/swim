// Copyright 2015-2021 Swim inc.
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

import type {AnyLength, Length} from "@swim/math";
import type {AnyColor, Color} from "@swim/style";
import {ViewInit, View, ViewAnimator} from "@swim/view";
import type {Graphics} from "../graphics/Graphics";
import {GraphicsIconView} from "../"; // forward import
import {SvgIconView} from "../"; // forward import
import {HtmlIconView} from "../"; // forward import

export interface IconViewInit extends ViewInit {
  xAlign?: number;
  yAlign?: number;
  iconWidth?: AnyLength;
  iconHeight?: AnyLength;
  iconColor?: AnyColor;
  graphics?: Graphics;
}

export interface IconView extends View {
  readonly xAlign: ViewAnimator<this, number>;

  readonly yAlign: ViewAnimator<this, number>;

  readonly iconWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  readonly iconHeight: ViewAnimator<this, Length | null, AnyLength | null>;

  readonly iconColor: ViewAnimator<this, Color | null, AnyColor | null>;

  readonly graphics: ViewAnimator<this, Graphics | null>;
}

export const IconView = {} as {
  is(object: unknown): object is IconView;

  initView(view: IconView, init: IconViewInit): void;
};

IconView.is = function (object: unknown): object is IconView {
  if (typeof object === "object" && object !== null) {
    const view = object as IconView;
    return view instanceof GraphicsIconView
        || view instanceof SvgIconView
        || view instanceof HtmlIconView
        || view instanceof View
        && "xAlign" in view
        && "yAlign" in view
        && "iconWidth" in view
        && "iconHeight" in view
        && "iconColor" in view
        && "graphics" in view;
  }
  return false;
};

IconView.initView = function (view: IconView, init: IconViewInit): void {
  if (init.xAlign !== void 0) {
    view.xAlign(init.xAlign);
  }
  if (init.yAlign !== void 0) {
    view.yAlign(init.yAlign);
  }
  if (init.iconWidth !== void 0) {
    view.iconWidth(init.iconWidth);
  }
  if (init.iconHeight !== void 0) {
    view.iconHeight(init.iconHeight);
  }
  if (init.iconColor !== void 0) {
    view.iconColor(init.iconColor);
  }
  if (init.graphics !== void 0) {
    view.graphics(init.graphics);
  }
};
