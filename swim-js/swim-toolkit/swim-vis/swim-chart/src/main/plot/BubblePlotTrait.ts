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
import {AnyLength, Length} from "@swim/math";
import {AnyColorOrLook, ColorOrLook, ColorLook} from "@swim/theme";
import {ScatterPlotTrait} from "./ScatterPlotTrait";
import type {BubblePlotTraitObserver} from "./BubblePlotTraitObserver";
import type {ScatterPlotController} from "./ScatterPlotController";
import {BubblePlotController} from "./"; // forward import

/** @public */
export class BubblePlotTrait<X = unknown, Y = unknown> extends ScatterPlotTrait<X, Y> {
  override readonly observerType?: Class<BubblePlotTraitObserver<X, Y>>;

  @Property<BubblePlotTrait<X, Y>["radius"]>({
    valueType: Length,
    value: null,
    didSetValue(radius: Length | null): void {
      this.owner.callObservers("traitDidSetRadius", radius, this.owner);
    },
  })
  readonly radius!: Property<this, Length | null, AnyLength | null>;

  @Property<BubblePlotTrait<X, Y>["fill"]>({
    valueType: ColorLook,
    value: null,
    didSetValue(fill: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetFill", fill, this.owner);
    },
  })
  readonly fill!: Property<this, ColorOrLook | null, AnyColorOrLook | null>;

  override createPlotController(): ScatterPlotController<X, Y> {
    return new BubblePlotController<X, Y>();
  }
}
