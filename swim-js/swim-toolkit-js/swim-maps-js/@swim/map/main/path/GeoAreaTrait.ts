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
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {GeoPathTrait} from "./GeoPathTrait";
import type {GeoAreaTraitObserver} from "./GeoAreaTraitObserver";

export abstract class GeoAreaTrait extends GeoPathTrait {
  override readonly observerType?: Class<GeoAreaTraitObserver>;

  @Property<GeoAreaTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetFill", newFill, oldFill, this.owner);
    },
    didSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetFill", newFill, oldFill, this.owner);
    },
    fromAny(fill: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (fill !== null && !(fill instanceof Look)) {
        fill = Color.fromAny(fill);
      }
      return fill;
    },
  })
  readonly fill!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  @Property<GeoAreaTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetStroke", newStroke, oldStroke, this.owner);
    },
    didSetState(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetStroke", newStroke, oldStroke, this.owner);
    },
    fromAny(stroke: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (stroke !== null && !(stroke instanceof Look)) {
        stroke = Color.fromAny(stroke);
      }
      return stroke;
    },
  })
  readonly stroke!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  @Property<GeoAreaTrait, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    willSetState(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("traitWillSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    didSetState(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("traitDidSetStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly strokeWidth!: Property<this, Length | null, AnyLength | null>;
}
