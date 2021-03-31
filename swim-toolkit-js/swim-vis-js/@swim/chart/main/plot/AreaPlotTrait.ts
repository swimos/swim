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

import {Equals} from "@swim/util";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {AreaPlotTraitObserver} from "./AreaPlotTraitObserver";

export class AreaPlotTrait<X, Y> extends SeriesPlotTrait<X, Y> {
  constructor() {
    super();
    Object.defineProperty(this, "fill", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<AreaPlotTraitObserver<X, Y>>;

  declare readonly fill: Look<Color> | Color | null;

  setFill(newFill: Look<Color> | AnyColor | null): void {
    if (newFill !== null && !(newFill instanceof Look)) {
      newFill = Color.fromAny(newFill);
    }
    const oldFill = this.fill;
    if (!Equals(newFill, oldFill)) {
      this.willSetFill(newFill, oldFill);
      Object.defineProperty(this, "fill", {
        value: newFill,
        enumerable: true,
        configurable: true,
      });
      this.onSetFill(newFill, oldFill);
      this.didSetFill(newFill, oldFill);
    }
  }

  protected willSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.areaPlotTraitWillSetFill !== void 0) {
        traitObserver.areaPlotTraitWillSetFill(newFill, oldFill, this);
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
      if (traitObserver.areaPlotTraitDidSetFill !== void 0) {
        traitObserver.areaPlotTraitDidSetFill(newFill, oldFill, this);
      }
    }
  }
}
