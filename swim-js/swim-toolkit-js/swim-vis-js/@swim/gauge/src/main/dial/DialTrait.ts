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
import {Trait} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {DialTraitObserver} from "./DialTraitObserver";

/** @public */
export type DialLabel = DialLabelFunction | string;
/** @public */
export type DialLabelFunction = (dialTrait: DialTrait | null) => GraphicsView | string | null;

/** @public */
export type DialLegend = DialLegendFunction | string;
/** @public */
export type DialLegendFunction = (dialTrait: DialTrait | null) => GraphicsView | string | null;

/** @public */
export class DialTrait extends Trait {
  override readonly observerType?: Class<DialTraitObserver>;

  @Property<DialTrait, number>({
    type: Number,
    state: 0,
    willSetState(newValue: number, oldValue: number): void {
      this.owner.callObservers("traitWillSetDialValue", newValue, oldValue, this.owner);
    },
    didSetState(newValue: number, oldValue: number): void {
      this.owner.callObservers("traitDidSetDialValue", newValue, oldValue, this.owner);
    },
  })
  readonly value!: Property<this, number>;

  @Property<DialTrait, number>({
    type: Number,
    state: 1,
    willSetState(newLimit: number, oldLimit: number): void {
      this.owner.callObservers("traitWillSetDialLimit", newLimit, oldLimit, this.owner);
    },
    didSetState(newLimit: number, oldLimit: number): void {
      this.owner.callObservers("traitDidSetDialLimit", newLimit, oldLimit, this.owner);
    },
  })
  readonly limit!: Property<this, number>;

  @Property<DialTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newDialColor: Look<Color> | Color | null, oldDialColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetDialColor", newDialColor, oldDialColor, this.owner);
    },
    didSetState(newDialColor: Look<Color> | Color | null, oldDialColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetDialColor", newDialColor, oldDialColor, this.owner);
    },
    fromAny(dialColor: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (dialColor !== null && !(dialColor instanceof Look)) {
        dialColor = Color.fromAny(dialColor);
      }
      return dialColor;
    },
  })
  readonly dialColor!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  @Property<DialTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newMeterColor: Look<Color> | Color | null, oldMeterColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetMeterColor", newMeterColor, oldMeterColor, this.owner);
    },
    didSetState(newMeterColor: Look<Color> | Color | null, oldMeterColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetMeterColor", newMeterColor, oldMeterColor, this.owner);
    },
    fromAny(meterColor: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (meterColor !== null && !(meterColor instanceof Look)) {
        meterColor = Color.fromAny(meterColor);
      }
      return meterColor;
    },
  })
  readonly meterColor!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  formatLabel(value: number, limit: number): string | undefined {
    return void 0;
  }

  @Property<DialTrait, DialLabel | null>({
    state: null,
    willSetState(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
      this.owner.callObservers("traitWillSetDialLabel", newLabel, oldLabel, this.owner);
    },
    didSetState(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
      this.owner.callObservers("traitDidSetDialLabel", newLabel, oldLabel, this.owner);
    },
  })
  readonly label!: Property<this, DialLabel | null>;

  formatLegend(value: number, limit: number): string | undefined {
    return void 0;
  }

  @Property<DialTrait, DialLegend | null>({
    state: null,
    willSetState(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
      this.owner.callObservers("traitWillSetDialLegend", newLegend, oldLegend, this.owner);
    },
    didSetState(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
      this.owner.callObservers("traitDidSetDialLegend", newLegend, oldLegend, this.owner);
    },
  })
  readonly legend!: Property<this, DialLegend | null>;
}
