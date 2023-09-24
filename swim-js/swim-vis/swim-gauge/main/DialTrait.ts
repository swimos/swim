// Copyright 2015-2023 Nstream, inc.
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
export interface DialTraitObserver<T extends DialTrait = DialTrait> extends TraitObserver<T> {
  traitDidSetValue?(value: number, trait: T): void;

  traitDidSetLimit?(limit: number, trait: T): void;

  traitDidSetDialColor?(dialColor: ColorOrLook | null, trait: T): void;

  traitDidSetMeterColor?(meterColor: ColorOrLook | null, trait: T): void;

  traitDidSetLabel?(label: string | undefined, trait: T): void;

  traitDidSetLegend?(legend: string | undefined, trait: T): void;
}

/** @public */
export class DialTrait extends Trait {
  declare readonly observerType?: Class<DialTraitObserver>;

  @Property({
    valueType: Number,
    value: 0,
    didSetValue(value: number): void {
      this.owner.callObservers("traitDidSetValue", value, this.owner);
    },
  })
  readonly value!: Property<this, number>;

  @Property({
    valueType: Number,
    value: 1,
    didSetValue(limit: number): void {
      this.owner.callObservers("traitDidSetLimit", limit, this.owner);
    },
  })
  readonly limit!: Property<this, number>;

  @Property({
    valueType: ColorLook,
    value: null,
    didSetValue(dialColor: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetDialColor", dialColor, this.owner);
    },
  })
  readonly dialColor!: Property<this, ColorOrLook | null>;

  @Property({
    valueType: ColorLook,
    value: null,
    didSetValue(meterColor: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetMeterColor", meterColor, this.owner);
    },
  })
  readonly meterColor!: Property<this, ColorOrLook | null>;

  formatLabel(value: number, limit: number): string | undefined {
    return void 0;
  }

  @Property({
    valueType: String,
    didSetValue(label: string | undefined): void {
      this.owner.callObservers("traitDidSetLabel", label, this.owner);
    },
  })
  readonly label!: Property<this, string | undefined>;

  formatLegend(value: number, limit: number): string | undefined {
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
