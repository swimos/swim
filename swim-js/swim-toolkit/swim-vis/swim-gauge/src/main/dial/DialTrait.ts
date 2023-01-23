// Copyright 2015-2023 Swim.inc
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
import {AnyColorOrLook, ColorOrLook, ColorLook} from "@swim/theme";
import type {DialTraitObserver} from "./DialTraitObserver";

/** @public */
export class DialTrait extends Trait {
  override readonly observerType?: Class<DialTraitObserver>;

  @Property<DialTrait["value"]>({
    valueType: Number,
    value: 0,
    didSetValue(value: number): void {
      this.owner.callObservers("traitDidSetValue", value, this.owner);
    },
  })
  readonly value!: Property<this, number>;

  @Property<DialTrait["limit"]>({
    valueType: Number,
    value: 1,
    didSetValue(limit: number): void {
      this.owner.callObservers("traitDidSetLimit", limit, this.owner);
    },
  })
  readonly limit!: Property<this, number>;

  @Property<DialTrait["dialColor"]>({
    valueType: ColorLook,
    value: null,
    didSetValue(dialColor: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetDialColor", dialColor, this.owner);
    },
  })
  readonly dialColor!: Property<this, ColorOrLook | null, AnyColorOrLook | null>;

  @Property<DialTrait["meterColor"]>({
    valueType: ColorLook,
    value: null,
    didSetValue(meterColor: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetMeterColor", meterColor, this.owner);
    },
  })
  readonly meterColor!: Property<this, ColorOrLook | null, AnyColorOrLook | null>;

  formatLabel(value: number, limit: number): string | undefined {
    return void 0;
  }

  @Property<DialTrait["label"]>({
    valueType: String,
    didSetValue(label: string | undefined): void {
      this.owner.callObservers("traitDidSetLabel", label, this.owner);
    },
  })
  readonly label!: Property<this, string | undefined>;

  formatLegend(value: number, limit: number): string | undefined {
    return void 0;
  }

  @Property<DialTrait["legend"]>({
    valueType: String,
    didSetValue(legend: string | undefined): void {
      this.owner.callObservers("traitDidSetLegend", legend, this.owner);
    },
  })
  readonly legend!: Property<this, string | undefined>;
}
