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
import {Trait} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {SliceTraitObserver} from "./SliceTraitObserver";

/** @public */
export type SliceLabel = SliceLabelFunction | string;
/** @public */
export type SliceLabelFunction = (sliceTrait: SliceTrait | null) => GraphicsView | string | null;

/** @public */
export type SliceLegend = SliceLegendFunction | string;
/** @public */
export type SliceLegendFunction = (sliceTrait: SliceTrait | null) => GraphicsView | string | null;

/** @public */
export class SliceTrait extends Trait {
  override readonly observerType?: Class<SliceTraitObserver>;

  @Property<SliceTrait, number>({
    type: Number,
    value: 0,
    willSetValue(newValue: number, oldValue: number): void {
      this.owner.callObservers("traitWillSetSliceValue", newValue, oldValue, this.owner);
    },
    didSetValue(newValue: number, oldValue: number): void {
      this.owner.callObservers("traitDidSetSliceValue", newValue, oldValue, this.owner);
    },
  })
  readonly value!: Property<this, number>;

  @Property<SliceTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    value: null,
    willSetValue(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitWillSetSliceColor", newSliceColor, oldSliceColor, this.owner);
    },
    didSetValue(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
      this.owner.callObservers("traitDidSetSliceColor", newSliceColor, oldSliceColor, this.owner);
    },
    fromAny(sliceColor: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (sliceColor !== null && !(sliceColor instanceof Look)) {
        sliceColor = Color.fromAny(sliceColor);
      }
      return sliceColor;
    },
  })
  readonly sliceColor!: Property<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  formatLabel(value: number): string | undefined {
    return void 0;
  }

  @Property<SliceTrait, SliceLabel | null>({
    value: null,
    willSetValue(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
      this.owner.callObservers("traitWillSetSliceLabel", newLabel, oldLabel, this.owner);
    },
    didSetValue(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
      this.owner.callObservers("traitDidSetSliceLabel", newLabel, oldLabel, this.owner);
    },
  })
  readonly label!: Property<this, SliceLabel | null>;

  formatLegend(value: number): string | undefined {
    return void 0;
  }

  @Property<SliceTrait, SliceLegend | null>({
    value: null,
    willSetValue(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
      this.owner.callObservers("traitWillSetSliceLegend", newLegend, oldLegend, this.owner);
    },
    didSetValue(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
      this.owner.callObservers("traitDidSetSliceLegend", newLegend, oldLegend, this.owner);
    },
  })
  readonly legend!: Property<this, SliceLegend | null>;
}
