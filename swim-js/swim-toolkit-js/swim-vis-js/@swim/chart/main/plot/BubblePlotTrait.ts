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

import {Equals, Mutable} from "@swim/util";
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ScatterPlotTrait} from "./ScatterPlotTrait";
import type {BubblePlotTraitObserver} from "./BubblePlotTraitObserver";

export class BubblePlotTrait<X, Y> extends ScatterPlotTrait<X, Y> {
  constructor() {
    super();
    this.radius = null;
    this.fill = null;
  }

  override readonly traitObservers!: ReadonlyArray<BubblePlotTraitObserver<X, Y>>;

  readonly radius: Length | null;

  setRadius(newRadius: AnyLength): void {
    newRadius = Length.fromAny(newRadius);
    const oldRadius = this.radius;
    if (!Equals(newRadius, oldRadius)) {
      this.willSetRadius(newRadius, oldRadius);
      (this as Mutable<this>).radius = newRadius;
      this.onSetRadius(newRadius, oldRadius);
      this.didSetRadius(newRadius, oldRadius);
    }
  }

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetPlotRadius !== void 0) {
        traitObserver.traitWillSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetPlotRadius !== void 0) {
        traitObserver.traitDidSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  readonly fill: Look<Color> | Color | null;

  setFill(newFill: Look<Color> | AnyColor | null): void {
    if (newFill !== null && !(newFill instanceof Look)) {
      newFill = Color.fromAny(newFill);
    }
    const oldFill = this.fill;
    if (!Equals(newFill, oldFill)) {
      this.willSetFill(newFill, oldFill);
      (this as Mutable<this>).fill = newFill;
      this.onSetFill(newFill, oldFill);
      this.didSetFill(newFill, oldFill);
    }
  }

  protected willSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetPlotFill !== void 0) {
        traitObserver.traitWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetPlotFill !== void 0) {
        traitObserver.traitDidSetPlotFill(newFill, oldFill, this);
      }
    }
  }
}
