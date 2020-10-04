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

import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {ViewAnimator} from "../animator/ViewAnimator";
import {GraphicsViewInit, GraphicsView} from "./GraphicsView";

export interface StrokeViewInit extends GraphicsViewInit {
  stroke?: AnyColor;
  strokeWidth?: AnyLength;
}

export interface StrokeView extends GraphicsView {
  readonly stroke: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  readonly strokeWidth: ViewAnimator<this, Length | undefined, AnyLength | undefined>;
}

/** @hidden */
export const StrokeView = {
  /** @hidden */
  is(object: unknown): object is StrokeView {
    if (typeof object === "object" && object !== null) {
      const view = object as StrokeView;
      return view instanceof GraphicsView
          && "stroke" in view
          && "strokeWidth" in view;;
    }
    return false;
  },

  initView(view: StrokeView, init: StrokeViewInit): void {
    if (init.stroke !== void 0) {
      view.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      view.strokeWidth(init.strokeWidth);
    }
  },
};
