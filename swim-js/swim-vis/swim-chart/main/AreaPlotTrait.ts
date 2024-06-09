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
import type {ColorOrLook} from "@swim/theme";
import {ColorLook} from "@swim/theme";
import type {SeriesPlotTraitObserver} from "./SeriesPlotTrait";
import {SeriesPlotTrait} from "./SeriesPlotTrait";
import type {SeriesPlotController} from "./SeriesPlotController";
import {AreaPlotController} from "./"; // forward import

/** @public */
export interface AreaPlotTraitObserver<X = unknown, Y = unknown, T extends AreaPlotTrait<X, Y> = AreaPlotTrait<X, Y>> extends SeriesPlotTraitObserver<X, Y, T> {
  traitDidSetFill?(fill: ColorOrLook | null, trait: T): void;
}

/** @public */
export class AreaPlotTrait<X = unknown, Y = unknown> extends SeriesPlotTrait<X, Y> {
  declare readonly observerType?: Class<AreaPlotTraitObserver<X, Y>>;

  @Property({
    valueType: ColorLook,
    value: null,
    didSetValue(fill: ColorOrLook | null): void {
      this.owner.callObservers("traitDidSetFill", fill, this.owner);
    },
  })
  readonly fill!: Property<this, ColorOrLook | null>;

  override createPlotController(): SeriesPlotController<X, Y> {
    return new AreaPlotController<X, Y>();
  }
}
