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

import {AnyLength, Length} from "@swim/math";
import {TraitProperty} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {GeoPathTrait} from "./GeoPathTrait";
import type {GeoLineTraitObserver} from "./GeoLineTraitObserver";

export abstract class GeoLineTrait extends GeoPathTrait {
  declare readonly traitObservers: ReadonlyArray<GeoLineTraitObserver>;

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetStroke !== void 0) {
        traitObserver.traitWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetStroke !== void 0) {
        traitObserver.traitDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  @TraitProperty<GeoLineTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.willSetStroke(newStroke, oldStroke);
    },
    didSetState(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.onSetStroke(newStroke, oldStroke);
      this.owner.didSetStroke(newStroke, oldStroke);
    },
    fromAny(stroke: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (stroke !== null && !(stroke instanceof Look)) {
        stroke = Color.fromAny(stroke);
      }
      return stroke;
    },
  })
  declare stroke: TraitProperty<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetStrokeWidth !== void 0) {
        traitObserver.traitWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    // hook
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetStrokeWidth !== void 0) {
        traitObserver.traitDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  @TraitProperty<GeoLineTrait, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    willSetState(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
    didSetState(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      this.owner.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    },
  })
  declare strokeWidth: TraitProperty<this, Length | null, AnyLength | null>;
}
