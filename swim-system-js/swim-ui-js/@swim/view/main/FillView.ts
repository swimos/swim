// Copyright 2015-2019 SWIM.AI inc.
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
import {Tween} from "@swim/transition";
import {View} from "./View";
import {RenderView} from "./RenderView";

export interface FillViewInit {
  fill?: AnyColor | null;
}

export interface FillView extends RenderView {
  fill(): Color | null | undefined;
  fill(value: AnyColor | null, tween?: Tween<Color>): this;
}

/** @hidden */
export const FillView = {
  is(object: unknown): object is FillView {
    if (typeof object === "object" && object) {
      const view = object as FillView;
      return view instanceof View
          && typeof view.fill === "function";
    }
    return false;
  },
};
