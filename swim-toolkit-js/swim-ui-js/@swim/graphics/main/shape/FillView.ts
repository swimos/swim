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

import {AnyColor, Color} from "@swim/color";
import {ViewAnimator} from "@swim/view";
import {GraphicsViewInit, GraphicsView} from "../GraphicsView";

export interface FillViewInit extends GraphicsViewInit {
  fill?: AnyColor;
}

export interface FillView extends GraphicsView {
  readonly fill: ViewAnimator<this, Color | undefined, AnyColor | undefined>;
}

/** @hidden */
export const FillView = {
  /** @hidden */
  is(object: unknown): object is FillView {
    if (typeof object === "object" && object !== null) {
      const view = object as FillView;
      return view instanceof GraphicsView
          && "fill" in view;
    }
    return false;
  },

  initView(view: FillView, init: FillViewInit): void {
    if (init.fill !== void 0) {
      view.fill(init.fill);
    }
  },
};
