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

import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import type {ScatterPlotTraitObserver} from "./ScatterPlotTraitObserver";
import type {BubblePlotTrait} from "./BubblePlotTrait";

export interface BubblePlotTraitObserver<X, Y, R extends BubblePlotTrait<X, Y> = BubblePlotTrait<X, Y>> extends ScatterPlotTraitObserver<X, Y, R> {
  traitWillSetPlotRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  traitDidSetPlotRadius?(newRadius: Length | null, oldRadius: Length | null, trait: R): void;

  traitWillSetPlotFill?(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, trait: R): void;

  traitDidSetPlotFill?(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, trait: R): void;
}
