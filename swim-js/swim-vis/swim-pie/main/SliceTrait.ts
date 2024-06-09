// Copyright 2015-2024 Nstream, inc.
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
import type {TraitObserver} from "@swim/model";
import {Trait} from "@swim/model";
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";

/** @public */
export interface SliceTraitObserver<T extends SliceTrait = SliceTrait> extends TraitObserver<T> {
  traitDidSetValue?(value: number, trait: T): void;

  traitDidSetSliceColor?(sliceColor: ColorOrLook | null, trait: T): void;

  traitDidSetLabel?(label: string | undefined, trait: T): void;

  traitDidSetLegend?(legend: string | undefined, trait: T): void;
}

/** @public */
export class SliceTrait extends Trait {
  declare readonly observerType?: Class<SliceTraitObserver>;

  @Property({
    valueType: Number,
    value: 0,
    didSetValue(value: number): void {
      this.owner.callObservers("traitDidSetValue", value, this.owner);
    },
  })
  readonly value!: Property<this, number>;

  @Property({
    valueType: ColorLook,
    value: null,
    didSetValue(sliceColor: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetSliceColor", sliceColor, this.owner);
    },
  })
  readonly sliceColor!: Property<this, ColorOrLook | null>;

  formatLabel(value: number): string | undefined {
    return void 0;
  }

  @Property({
    valueType: String,
    didSetValue(label: string | undefined): void {
      this.owner.callObservers("traitDidSetLabel", label, this.owner);
    },
  })
  readonly label!: Property<this, string | undefined>;

  formatLegend(value: number): string | undefined {
    return void 0;
  }

  @Property({
    valueType: String,
    didSetValue(legend: string | undefined): void {
      this.owner.callObservers("traitDidSetLegend", legend, this.owner);
    },
  })
  readonly legend!: Property<this, string | undefined>;
}
