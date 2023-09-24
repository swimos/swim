// Copyright 2015-2023 Nstream, inc.
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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {ThemeAnimator} from "@swim/theme";
import {GraphicsView} from "./GraphicsView";

/** @public */
export interface StrokeView extends GraphicsView {
  readonly stroke: ThemeAnimator<this, Color | null>;

  readonly strokeWidth: ThemeAnimator<this, Length | null>;
}

/** @public */
export const StrokeView = {
  [Symbol.hasInstance](instance: unknown): instance is StrokeView {
    return instance instanceof GraphicsView
        && "stroke" in instance
        && "strokeWidth" in instance;
  },
};
