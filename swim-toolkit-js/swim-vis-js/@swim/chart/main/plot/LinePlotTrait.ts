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
import {AnyLength, Length} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {LinePlotTraitObserver} from "./LinePlotTraitObserver";

export class LinePlotTrait<X, Y> extends SeriesPlotTrait<X, Y> {
  constructor() {
    super();
    Object.defineProperty(this, "stroke", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "strokeWidth", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<LinePlotTraitObserver<X, Y>>;

  declare readonly stroke: Look<Color> | Color | null;

  setStroke(newStroke: Look<Color> | AnyColor | null): void {
    if (newStroke !== null && !(newStroke instanceof Look)) {
      newStroke = Color.fromAny(newStroke);
    }
    const oldStroke = this.stroke;
    if (!Equals(newStroke, oldStroke)) {
      this.willSetStroke(newStroke, oldStroke);
      Object.defineProperty(this, "stroke", {
        value: newStroke,
        enumerable: true,
        configurable: true,
      });
      this.onSetStroke(newStroke, oldStroke);
      this.didSetStroke(newStroke, oldStroke);
    }
  }

  protected willSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.linePlotTraitWillSetStroke !== void 0) {
        traitObserver.linePlotTraitWillSetStroke(newStroke, oldStroke, this);
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
      if (traitObserver.linePlotTraitDidSetStroke !== void 0) {
        traitObserver.linePlotTraitDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  declare readonly strokeWidth: Length | null;

  setStrokeWidth(newStrokeWidth: AnyLength): void {
    newStrokeWidth = Length.fromAny(newStrokeWidth);
    const oldStrokeWidth = this.strokeWidth;
    if (!Equals(newStrokeWidth, oldStrokeWidth)) {
      this.willSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      Object.defineProperty(this, "strokeWidth", {
        value: newStrokeWidth,
        enumerable: true,
        configurable: true,
      });
      this.onSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
      this.didSetStrokeWidth(newStrokeWidth, oldStrokeWidth);
    }
  }

  protected willSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.linePlotTraitWillSetStrokeWidth !== void 0) {
        traitObserver.linePlotTraitWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
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
      if (traitObserver.linePlotTraitDidSetStrokeWidth !== void 0) {
        traitObserver.linePlotTraitDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }
}
