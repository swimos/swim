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
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Length} from "@swim/math";
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
import {BubblePlotView} from "./BubblePlotView";
import {BubblePlotTrait} from "./BubblePlotTrait";
import type {ScatterPlotControllerObserver} from "./ScatterPlotController";
import {ScatterPlotController} from "./ScatterPlotController";

/** @public */
export interface BubblePlotControllerObserver<X = unknown, Y = unknown, C extends BubblePlotController<X, Y> = BubblePlotController<X, Y>> extends ScatterPlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: BubblePlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: BubblePlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: BubblePlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: BubblePlotView<X, Y>, controller: C): void;

  controllerDidSetPlotRadius?(radius: Length | null, controller: C): void;

  controllerDidSetPlotFill?(fill: Color | null, controller: C): void;
}

/** @public */
export class BubblePlotController<X = unknown, Y = unknown> extends ScatterPlotController<X, Y> {
  declare readonly observerType?: Class<BubblePlotControllerObserver<X, Y>>;

  @TraitViewControllerSet({
    extends: true,
    get parentView(): BubblePlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & ScatterPlotController<X, Y>["dataPoints"];

  protected setRadius(radius: Length | null, timing?: TimingLike | boolean): void {
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
      plotView.radius.setIntrinsic(radius, timing);
    }
  }

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
    traitType: BubblePlotTrait,
    observesTrait: true,
    initTrait(plotTrait: BubblePlotTrait<X, Y>): void {
      if (this.owner.dataSet.trait === null) {
        const dataSetTrait = plotTrait.getTrait(DataSetTrait) as DataSetTrait<X, Y>;
        if (dataSetTrait !== null) {
          this.owner.dataSet.setTrait(dataSetTrait);
        }
      }
      const plotView = this.view;
      if (plotView !== null) {
        this.owner.setRadius(plotTrait.radius.value);
        this.owner.setFill(plotTrait.fill.value);
      }
    },
    willAttachTrait(plotTrait: BubblePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didDetachTrait(plotTrait: BubblePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetRadius(radius: Length | null): void {
      this.owner.setRadius(radius);
    },
    traitDidSetFill(fill: ColorOrLook | null): void {
      this.owner.setFill(fill);
    },
    viewType: BubblePlotView,
    observesView: true,
    initView(plotView: BubblePlotView<X, Y>): void {
      const dataPointControllers = this.owner.dataPoints.controllers;
      for (const controllerId in dataPointControllers) {
        const dataPointController = dataPointControllers[controllerId]!;
        dataPointController.dataPoint.insertView(plotView);
      }
      const plotTrait = this.trait;
      if (plotTrait !== null) {
        this.owner.setRadius(plotTrait.radius.value);
        this.owner.setFill(plotTrait.fill.value);
      }
    },
    willAttachView(plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, this.owner);
    },
    didDetachView(plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotView, this.owner);
    },
    viewDidSetRadius(radius: Length | null): void {
      this.owner.callObservers("controllerDidSetPlotRadius", radius, this.owner);
    },
    viewDidSetFill(fill: Color | null): void {
      this.owner.callObservers("controllerDidSetPlotFill", fill, this.owner);
    },
  })
  readonly plot!: TraitViewRef<this, BubblePlotTrait<X, Y>, BubblePlotView<X, Y>> & Observes<BubblePlotTrait<X, Y>> & Observes<BubblePlotView<X, Y>>;
}
