// Copyright 2015-2020 SWIM.AI inc.
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
import {Tween} from "@swim/transition";
import {View} from "./View";
import {RenderView} from "./RenderView";

export interface StrokeViewInit {
  stroke?: AnyColor | null;
  strokeWidth?: AnyLength | null;
}

export interface StrokeView extends RenderView {
  stroke(): Color | null | undefined;
  stroke(value: AnyColor | null, tween?: Tween<Color>): this;

  strokeWidth(): Length | null | undefined;
  strokeWidth(value: AnyLength | null, tween?: Tween<Length>): this;
}

/** @hidden */
export const StrokeView = {
  is(object: unknown): object is StrokeView {
    if (typeof object === "object" && object) {
      const view = object as StrokeView;
      return view instanceof View
          && typeof view.stroke === "function"
          && typeof view.strokeWidth === "function";
    }
    return false;
  },
};
