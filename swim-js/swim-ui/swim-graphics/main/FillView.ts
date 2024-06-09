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

import type {Color} from "@swim/style";
import type {ThemeAnimator} from "@swim/theme";
import {GraphicsView} from "./GraphicsView";

/** @public */
export interface FillView extends GraphicsView {
  readonly fill: ThemeAnimator<this, Color | null>;
}

/** @public */
export const FillView = {
  [Symbol.hasInstance](instance: unknown): instance is FillView {
    return instance instanceof GraphicsView
        && "fill" in instance;
  },
};
