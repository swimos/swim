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

import type {AnyLength, Length} from "@swim/math";
import type {AnyColor, Color} from "@swim/style";
import type {ViewAnimator} from "@swim/view";
import {GraphicsViewInit, GraphicsView} from "../graphics/GraphicsView";

export interface StrokeViewInit extends GraphicsViewInit {
  stroke?: AnyColor;
  strokeWidth?: AnyLength;
}

export interface StrokeView extends GraphicsView {
  readonly stroke: ViewAnimator<this, Color | null, AnyColor | null>;

  readonly strokeWidth: ViewAnimator<this, Length | null, AnyLength | null>;
}

export const StrokeView = {} as {
  is(object: unknown): object is StrokeView;

  initView(view: StrokeView, init: StrokeViewInit): void;
};

StrokeView.is = function (object: unknown): object is StrokeView {
  if (typeof object === "object" && object !== null) {
    const view = object as StrokeView;
    return view instanceof GraphicsView
        && "stroke" in view
        && "strokeWidth" in view;
  }
  return false;
};

StrokeView.initView = function (view: StrokeView, init: StrokeViewInit): void {
  if (init.stroke !== void 0) {
    view.stroke(init.stroke);
  }
  if (init.strokeWidth !== void 0) {
    view.strokeWidth(init.strokeWidth);
  }
};
