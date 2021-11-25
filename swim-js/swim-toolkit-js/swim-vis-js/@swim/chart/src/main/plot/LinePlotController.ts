// Copyright 2015-2021 Swim Inc.
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
import {Affinity, MemberFastenerClass} from "@swim/component";
import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointController} from "../data/DataPointController";
import type {DataSetControllerDataPointExt} from "../data/DataSetController";
import {DataSetTrait} from "../data/DataSetTrait";
import {LinePlotView} from "./LinePlotView";
import {LinePlotTrait} from "./LinePlotTrait";
import {SeriesPlotController} from "./SeriesPlotController";
import type {LinePlotControllerObserver} from "./LinePlotControllerObserver";

/** @public */
export class LinePlotController<X = unknown, Y = unknown> extends SeriesPlotController<X, Y> {
  override readonly observerType?: Class<LinePlotControllerObserver<X, Y>>;

  @TraitViewControllerSet<LinePlotController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>, DataSetControllerDataPointExt<X, Y>>({
    extends: true,
    get parentView(): LinePlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & DataSetControllerDataPointExt<X, Y>;
  static override readonly dataPoints: MemberFastenerClass<LinePlotController, "dataPoints">;

  protected setPlotStroke(stroke: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.plotTiming.state;
        if (timing === true) {
          timing = plotView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (stroke instanceof Look) {
        plotView.stroke.setLook(stroke, timing, Affinity.Intrinsic);
      } else {
        plotView.stroke.setState(stroke, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setPlotStrokeWidth(strokeWidth: Length | null, timing?: AnyTiming | boolean): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.plotTiming.state;
        if (timing === true) {
          timing = plotView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      plotView.strokeWidth.setState(strokeWidth, timing, Affinity.Intrinsic);
    }
  }

  @TraitViewRef<LinePlotController<X, Y>, LinePlotTrait<X, Y>, LinePlotView<X, Y>>({
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
        const stroke = plotTrait.stroke.state;
        if (stroke !== null) {
          this.owner.setPlotStroke(stroke);
        }
        const strokeWidth = plotTrait.strokeWidth.state;
        if (strokeWidth !== null) {
          this.owner.setPlotStrokeWidth(strokeWidth);
        }
      }
    },
    willAttachTrait(plotTrait: LinePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didDetachTrait(plotTrait: LinePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetPlotStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.setPlotStroke(newStroke);
    },
    traitDidSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.setPlotStrokeWidth(newStrokeWidth);
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
        const stroke = plotTrait.stroke.state;
        if (stroke !== null) {
          this.owner.setPlotStroke(stroke);
        }
        const strokeWidth = plotTrait.strokeWidth.state;
        if (strokeWidth !== null) {
          this.owner.setPlotStrokeWidth(strokeWidth);
        }
      }
    },
    willAttachView(plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, this.owner);
    },
    didDetachView(plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotView, this.owner);
    },
    viewWillSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillSetPlotStroke", newStroke, oldStroke, this.owner);
    },
    viewDidSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidSetPlotStroke", newStroke, oldStroke, this.owner);
    },
    viewWillSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    viewDidSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly plot!: TraitViewRef<this, LinePlotTrait<X, Y>, LinePlotView<X, Y>>;
  static readonly plot: MemberFastenerClass<LinePlotController, "plot">;
}
