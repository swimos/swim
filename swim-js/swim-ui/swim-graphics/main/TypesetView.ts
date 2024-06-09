// Copyright 2015-2024 Nstream, inc.
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

import type {R2Point} from "@swim/math";
import type {Font} from "@swim/style";
import type {Color} from "@swim/style";
import type {ThemeAnimator} from "@swim/theme";
import {GraphicsView} from "./GraphicsView";

/** @public */
export interface TypesetView extends GraphicsView {
  readonly font: ThemeAnimator<this, Font | null>;

  readonly textAlign: ThemeAnimator<this, CanvasTextAlign | undefined>;

  readonly textBaseline: ThemeAnimator<this, CanvasTextBaseline | undefined>;

  readonly textOrigin: ThemeAnimator<this, R2Point | null>;

  readonly textColor: ThemeAnimator<this, Color | null>;
}

/** @public */
export const TypesetView = {
  [Symbol.hasInstance](instance: unknown): instance is TypesetView {
    return instance instanceof GraphicsView
          && "font" in instance
          && "textAlign" in instance
          && "textBaseline" in instance
          && "textOrigin" in instance
          && "textColor" in instance;
  },
};
