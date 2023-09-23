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
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {ColorOrLook} from "@swim/theme";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointController} from "./DataPointController";
import {DataSetTrait} from "./DataSetTrait";
import {AreaPlotView} from "./AreaPlotView";
import {AreaPlotTrait} from "./AreaPlotTrait";
import type {SeriesPlotControllerObserver} from "./SeriesPlotController";
import {SeriesPlotController} from "./SeriesPlotController";

/** @public */
export interface AreaPlotControllerObserver<X = unknown, Y = unknown, C extends AreaPlotController<X, Y> = AreaPlotController<X, Y>> extends SeriesPlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: AreaPlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: AreaPlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: AreaPlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: AreaPlotView<X, Y>, controller: C): void;

  controllerDidSetPlotFill?(fill: Color | null, controller: C): void;
}

/** @public */
export class AreaPlotController<X = unknown, Y = unknown> extends SeriesPlotController<X, Y> {
  declare readonly observerType?: Class<AreaPlotControllerObserver<X, Y>>;

  @TraitViewControllerSet({
    extends: true,
    get parentView(): AreaPlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & SeriesPlotController<X, Y>["dataPoints"];

  protected setFill(fill: ColorOrLook | null, timing?: TimingLike | boolean): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.plotTiming.value;
        if (timing === true) {
          timing = plotView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromLike(timing);
      }
      plotView.fill.setIntrinsic(fill, timing);
    }
  }

  @TraitViewRef({
    traitType: AreaPlotTrait,
    observesTrait: true,
    initTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      if (this.owner.dataSet.trait === null) {
        const dataSetTrait = plotTrait.getTrait(DataSetTrait) as DataSetTrait<X, Y>;
        if (dataSetTrait !== null) {
          this.owner.dataSet.setTrait(dataSetTrait);
        }
      }
      const plotView = this.view;
      if (plotView !== null) {
        const fill = plotTrait.fill.value;
        if (fill !== null) {
          this.owner.setFill(fill);
        }
      }
    },
    willAttachTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didDetachTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetFill(fill: ColorOrLook | null): void {
      this.owner.setFill(fill);
    },
    viewType: AreaPlotView,
    observesView: true,
    initView(plotView: AreaPlotView<X, Y>): void {
      const dataPointControllers = this.owner.dataPoints.controllers;
      for (const controllerId in dataPointControllers) {
        const dataPointController = dataPointControllers[controllerId]!;
        dataPointController.dataPoint.insertView(plotView);
      }
      const plotTrait = this.trait;
      if (plotTrait !== null) {
        const fill = plotTrait.fill.value;
        if (fill !== null) {
          this.owner.setFill(fill);
        }
      }
    },
    willAttachView(plotView: AreaPlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, this.owner);
    },
    didDetachView(plotView: AreaPlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotView, this.owner);
    },
    viewDidSetFill(fill: Color | null): void {
      this.owner.callObservers("controllerDidSetPlotFill", fill, this.owner);
    },
  })
  readonly plot!: TraitViewRef<this, AreaPlotTrait<X, Y>, AreaPlotView<X, Y>> & Observes<AreaPlotTrait<X, Y>> & Observes<AreaPlotView<X, Y>>;
}
