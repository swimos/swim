// Copyright 2015-2022 Swim.inc
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
import {Property} from "@swim/component";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {LinePlotTraitObserver} from "./LinePlotTraitObserver";

/** @public */
export class LinePlotTrait<X = unknown, Y = unknown> extends SeriesPlotTrait<X, Y> {
  override readonly observerType?: Class<LinePlotTraitObserver<X, Y>>;

  @Property<LinePlotTrait<X, Y>, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    value: null,
    willSetValue(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetPlotStroke", newStroke, oldStroke, this.owner);
    },
    didSetValue(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetPlotStroke", newStroke, oldStroke, this.owner);
    },
    fromAny(stroke: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (stroke !== null && !(stroke instanceof Look)) {
        stroke = Color.fromAny(stroke);
      }
      return stroke;
    },
  })
  readonly stroke!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  @Property<LinePlotTrait<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    value: null,
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("traitWillSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("traitDidSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly strokeWidth!: Property<this, Length | null, AnyLength | null>;
}
