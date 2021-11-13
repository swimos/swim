// Copyright 2015-2021 Swim Inc.
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

import type {Class} from "@swim/util";
import {Property} from "@swim/fastener";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {AreaPlotTraitObserver} from "./AreaPlotTraitObserver";

export class AreaPlotTrait<X = unknown, Y = unknown> extends SeriesPlotTrait<X, Y> {
  override readonly observerType?: Class<AreaPlotTraitObserver<X, Y>>;

  @Property<AreaPlotTrait<X, Y>, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetPlotFill", newFill, oldFill, this.owner);
    },
    didSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetPlotFill", newFill, oldFill, this.owner);
    },
    fromAny(fill: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (fill !== null && !(fill instanceof Look)) {
        fill = Color.fromAny(fill);
      }
      return fill;
    },
  })
  readonly fill!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;
}
