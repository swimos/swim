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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Property} from "@swim/component";
import type {TraitViewRef} from "@swim/controller";
import {DataSetController} from "../data/DataSetController";
import type {PlotView} from "./PlotView";
import type {PlotTrait} from "./PlotTrait";
import type {PlotControllerObserver} from "./PlotControllerObserver";

/** @public */
export abstract class PlotController<X = unknown, Y = unknown> extends DataSetController<X, Y> {
  override readonly observerType?: Class<PlotControllerObserver<X, Y>>;

  @Property({valueType: Timing, inherits: true})
  readonly plotTiming!: Property<this, Timing | boolean | undefined, AnyTiming | boolean | undefined>;

  abstract readonly plot: TraitViewRef<this, PlotTrait<X, Y>, PlotView<X, Y>>;
}
