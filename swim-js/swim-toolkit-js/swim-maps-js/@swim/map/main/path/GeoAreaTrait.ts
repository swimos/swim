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

  protected willSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetFill !== void 0) {
        traitObserver.traitWillSetFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetFill !== void 0) {
        traitObserver.traitDidSetFill(newFill, oldFill, this);
      }
    }
  }

  @Property<GeoAreaTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.willSetFill(newFill, oldFill);
    },
    didSetState(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.onSetFill(newFill, oldFill);
      this.owner.didSetFill(newFill, oldFill);
    },
    fromAny(fill: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (fill !== null && !(fill instanceof Look)) {
        fill = Color.fromAny(fill);
      }
      return fill;
    },
  })
  readonly fill!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetStroke !== void 0) {
        traitObserver.traitWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetStroke !== void 0) {
        traitObserver.traitDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  @Property<GeoAreaTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
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
  readonly stroke!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitWillSetStrokeWidth !== void 0) {
        traitObserver.traitWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    // hook
  }

  protected didSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const traitObserver = observers[i]!;
      if (traitObserver.traitDidSetStrokeWidth !== void 0) {
        traitObserver.traitDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  @Property<GeoAreaTrait, Length | null, AnyLength | null>({
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
  readonly strokeWidth!: Property<this, Length | null, AnyLength | null>;
}
