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

import {TraitProperty, GenericTrait} from "@swim/model";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {SliceTraitObserver} from "./SliceTraitObserver";

export type SliceLabel = SliceLabelFunction | string;
export type SliceLabelFunction = (sliceTrait: SliceTrait | null) => GraphicsView | string | null;

export type SliceLegend = SliceLegendFunction | string;
export type SliceLegendFunction = (sliceTrait: SliceTrait | null) => GraphicsView | string | null;

export class SliceTrait extends GenericTrait {
  override readonly traitObservers!: ReadonlyArray<SliceTraitObserver>;

  protected willSetValue(newValue: number, oldValue: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetSliceValue !== void 0) {
        traitObserver.traitWillSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number): void {
    // hook
  }

  protected didSetValue(newValue: number, oldValue: number): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetSliceValue !== void 0) {
        traitObserver.traitDidSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  @TraitProperty<SliceTrait, number>({
    type: Number,
    state: 0,
    willSetState(newValue: number, oldValue: number): void {
      this.owner.willSetValue(newValue, oldValue);
    },
    didSetState(newValue: number, oldValue: number): void {
      this.owner.onSetValue(newValue, oldValue);
      this.owner.didSetValue(newValue, oldValue);
    },
  })
  readonly value!: TraitProperty<this, number>;

  protected willSetSliceColor(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetSliceColor !== void 0) {
        traitObserver.traitWillSetSliceColor(newSliceColor, oldSliceColor, this);
      }
    }
  }

  protected onSetSliceColor(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
    // hook
  }

  protected didSetSliceColor(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetSliceColor !== void 0) {
        traitObserver.traitDidSetSliceColor(newSliceColor, oldSliceColor, this);
      }
    }
  }

  @TraitProperty<SliceTrait, Look<Color> | Color | null, Look<Color> | AnyColor | null>({
    state: null,
    willSetState(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
      this.owner.willSetSliceColor(newSliceColor, oldSliceColor);
    },
    didSetState(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
      this.owner.onSetSliceColor(newSliceColor, oldSliceColor);
      this.owner.didSetSliceColor(newSliceColor, oldSliceColor);
    },
    fromAny(sliceColor: Look<Color> | AnyColor | null): Look<Color> | Color | null {
      if (sliceColor !== null && !(sliceColor instanceof Look)) {
        sliceColor = Color.fromAny(sliceColor);
      }
      return sliceColor;
    },
  })
  readonly sliceColor!: TraitProperty<this, Look<Color> | Color | null, Look<Color> | AnyColor | null>;

  protected willSetLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetSliceLabel !== void 0) {
        traitObserver.traitWillSetSliceLabel(newLabel, oldLabel, this);
      }
    }
  }

  protected onSetLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
    // hook
  }

  protected didSetLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetSliceLabel !== void 0) {
        traitObserver.traitDidSetSliceLabel(newLabel, oldLabel, this);
      }
    }
  }

  formatLabel(value: number): string | undefined {
    return void 0;
  }

  @TraitProperty<SliceTrait, SliceLabel | null>({
    state: null,
    willSetState(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
      this.owner.willSetLabel(newLabel, oldLabel);
    },
    didSetState(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
      this.owner.onSetLabel(newLabel, oldLabel);
      this.owner.didSetLabel(newLabel, oldLabel);
    },
  })
  readonly label!: TraitProperty<this, SliceLabel | null>;

  protected willSetLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetSliceLegend !== void 0) {
        traitObserver.traitWillSetSliceLegend(newLegend, oldLegend, this);
      }
    }
  }

  protected onSetLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
    // hook
  }

  protected didSetLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetSliceLegend !== void 0) {
        traitObserver.traitDidSetSliceLegend(newLegend, oldLegend, this);
      }
    }
  }

  formatLegend(value: number): string | undefined {
    return void 0;
  }

  @TraitProperty<SliceTrait, SliceLegend | null>({
    state: null,
    willSetState(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
      this.owner.willSetLegend(newLegend, oldLegend);
    },
    didSetState(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
      this.owner.onSetLegend(newLegend, oldLegend);
      this.owner.didSetLegend(newLegend, oldLegend);
    },
  })
  readonly legend!: TraitProperty<this, SliceLegend | null>;
}
