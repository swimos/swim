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

import {GraphicsView} from "@swim/view";
import {ScaleXView} from "./ScaleXView";
import {ScaleYView} from "./ScaleYView";
import {ScaleView} from "./ScaleView";

export interface ScaleXYView<X = unknown, Y = unknown> extends GraphicsView, ScaleXView<X>, ScaleYView<Y> {
}

/** @hidden */
export const ScaleXYView = {
  /** @hidden */
  is<X>(object: unknown): object is ScaleXYView<X> {
    if (typeof object === "object" && object !== null) {
      const view = object as ScaleXYView<X>;
      return view instanceof ScaleView
          || view instanceof GraphicsView && "xScale" in view && "yScale" in view;
    }
    return false;
  },
}
