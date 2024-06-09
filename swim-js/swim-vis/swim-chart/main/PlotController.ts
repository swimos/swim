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
import {Timing} from "@swim/util";
import {Property} from "@swim/component";
import type {TraitViewRef} from "@swim/controller";
import type {DataSetControllerObserver} from "./DataSetController";
import {DataSetController} from "./DataSetController";
import type {PlotView} from "./PlotView";
import type {PlotTrait} from "./PlotTrait";

/** @public */
export interface PlotControllerObserver<X = unknown, Y = unknown, C extends PlotController<X, Y> = PlotController<X, Y>> extends DataSetControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: PlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: PlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: PlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: PlotView<X, Y>, controller: C): void;
}

/** @public */
export abstract class PlotController<X = unknown, Y = unknown> extends DataSetController<X, Y> {
  declare readonly observerType?: Class<PlotControllerObserver<X, Y>>;

  @Property({valueType: Timing, inherits: true})
  get plotTiming(): Property<this, Timing | boolean | undefined> {
    return Property.getter();
  }

  abstract readonly plot: TraitViewRef<this, PlotTrait<X, Y>, PlotView<X, Y>>;
}
