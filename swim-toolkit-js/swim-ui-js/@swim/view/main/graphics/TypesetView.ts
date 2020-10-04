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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {ViewAnimator} from "../animator/ViewAnimator";
import {GraphicsViewInit, GraphicsView} from "./GraphicsView";

export interface TypesetViewInit extends GraphicsViewInit {
  font?: AnyFont;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textOrigin?: AnyPointR2;
  textColor?: AnyColor;
}

export interface TypesetView extends GraphicsView {
  readonly font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  readonly textAlign: ViewAnimator<this, CanvasTextAlign | undefined>;

  readonly textBaseline: ViewAnimator<this, CanvasTextBaseline | undefined>;

  readonly textOrigin: ViewAnimator<this, PointR2 | undefined, AnyPointR2 | undefined>;

  readonly textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;
}

/** @hidden */
export const TypesetView = {
  /** @hidden */
  is(object: unknown): object is TypesetView {
    if (typeof object === "object" && object !== null) {
      const view = object as TypesetView;
      return view instanceof GraphicsView
          && "font" in view
          && "textAlign" in view
          && "textBaseline" in view
          && "textOrigin" in view
          && "textColor" in view;
    }
    return false;
  },

  initView(view: TypesetView, init: TypesetViewInit): void {
    if (init.font !== void 0) {
      view.font(init.font);
    }
    if (init.textAlign !== void 0) {
      view.textAlign(init.textAlign);
    }
    if (init.textBaseline !== void 0) {
      view.textBaseline(init.textBaseline);
    }
    if (init.textOrigin !== void 0) {
      view.textOrigin(init.textOrigin);
    }
    if (init.textColor !== void 0) {
      view.textColor(init.textColor);
    }
  },
};
