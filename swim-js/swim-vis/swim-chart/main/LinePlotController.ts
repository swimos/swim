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
import {LinePlotView} from "./LinePlotView";
import {LinePlotTrait} from "./LinePlotTrait";
import type {SeriesPlotControllerObserver} from "./SeriesPlotController";
import {SeriesPlotController} from "./SeriesPlotController";

/** @public */
export interface LinePlotControllerObserver<X = unknown, Y = unknown, C extends LinePlotController<X, Y> = LinePlotController<X, Y>> extends SeriesPlotControllerObserver<X, Y, C> {
  controllerWillAttachPlotTrait?(plotTrait: LinePlotTrait<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: LinePlotTrait<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: LinePlotView<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: LinePlotView<X, Y>, controller: C): void;

  controllerDidSetPlotStroke?(stroke: Color | null, controller: C): void;

  controllerDidSetPlotStrokeWidth?(strokeWidth: Length | null, controller: C): void;
}

/** @public */
export class LinePlotController<X = unknown, Y = unknown> extends SeriesPlotController<X, Y> {
  declare readonly observerType?: Class<LinePlotControllerObserver<X, Y>>;

  @TraitViewControllerSet({
    extends: true,
    get parentView(): LinePlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & SeriesPlotController<X, Y>["dataPoints"];

  protected setStroke(stroke: ColorOrLook | null, timing?: TimingLike | boolean): void {
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
      plotView.stroke.setIntrinsic(stroke, timing);
    }
  }

  protected setStrokeWidth(strokeWidth: Length | null, timing?: TimingLike | boolean): void {
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
      plotView.strokeWidth.setIntrinsic(strokeWidth, timing);
    }
  }

  @TraitViewRef({
    traitType: LinePlotTrait,
    observesTrait: true,
    initTrait(plotTrait: LinePlotTrait<X, Y>): void {
      if (this.owner.dataSet.trait === null) {
        const dataSetTrait = plotTrait.getTrait(DataSetTrait) as DataSetTrait<X, Y>;
        if (dataSetTrait !== null) {
          this.owner.dataSet.setTrait(dataSetTrait);
        }
      }
      const plotView = this.view;
      if (plotView !== null) {
        const stroke = plotTrait.stroke.value;
        if (stroke !== null) {
          this.owner.setStroke(stroke);
        }
        const strokeWidth = plotTrait.strokeWidth.value;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth);
        }
      }
    },
    willAttachTrait(plotTrait: LinePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didDetachTrait(plotTrait: LinePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetStroke(stroke: ColorOrLook | null): void {
      this.owner.setStroke(stroke);
    },
    traitDidSetStrokeWidth(strokeWidth: Length | null): void {
      this.owner.setStrokeWidth(strokeWidth);
    },
    viewType: LinePlotView,
    observesView: true,
    initView(plotView: LinePlotView<X, Y>): void {
      const dataPointControllers = this.owner.dataPoints.controllers;
      for (const controllerId in dataPointControllers) {
        const dataPointController = dataPointControllers[controllerId]!;
        dataPointController.dataPoint.insertView(plotView);
      }
      const plotTrait = this.trait;
      if (plotTrait !== null) {
        const stroke = plotTrait.stroke.value;
        if (stroke !== null) {
          this.owner.setStroke(stroke);
        }
        const strokeWidth = plotTrait.strokeWidth.value;
        if (strokeWidth !== null) {
          this.owner.setStrokeWidth(strokeWidth);
        }
      }
    },
    willAttachView(plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, this.owner);
    },
    didDetachView(plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotView, this.owner);
    },
    viewDidSetStroke(stroke: Color | null): void {
      this.owner.callObservers("controllerDidSetPlotStroke", stroke, this.owner);
    },
    viewDidSetStrokeWidth(strokeWidth: Length | null): void {
      this.owner.callObservers("controllerDidSetPlotStrokeWidth", strokeWidth, this.owner);
    },
  })
  readonly plot!: TraitViewRef<this, LinePlotTrait<X, Y>, LinePlotView<X, Y>> & Observes<LinePlotTrait<X, Y>> & Observes<LinePlotView<X, Y>>;
}
