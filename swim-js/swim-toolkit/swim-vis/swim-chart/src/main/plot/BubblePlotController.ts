// Copyright 2015-2021 Swim.inc
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
import {BubblePlotView} from "./BubblePlotView";
import {BubblePlotTrait} from "./BubblePlotTrait";
import {ScatterPlotController} from "./ScatterPlotController";
import type {BubblePlotControllerObserver} from "./BubblePlotControllerObserver";

/** @public */
export class BubblePlotController<X = unknown, Y = unknown> extends ScatterPlotController<X, Y> {
  override readonly observerType?: Class<BubblePlotControllerObserver<X, Y>>;

  @TraitViewControllerSet<BubblePlotController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>>({
    extends: true,
    get parentView(): BubblePlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>> & DataSetControllerDataPointExt<X, Y>;
  static override readonly dataPoints: MemberFastenerClass<BubblePlotController, "dataPoints">;

  protected setPlotRadius(radius: Length | null, timing?: AnyTiming | boolean): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.plotTiming.value;
        if (timing === true) {
          timing = plotView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      plotView.radius.setState(radius, timing, Affinity.Intrinsic);
    }
  }

  protected setPlotFill(fill: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.plotTiming.value;
        if (timing === true) {
          timing = plotView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (fill instanceof Look) {
        plotView.fill.setLook(fill, timing, Affinity.Intrinsic);
      } else {
        plotView.fill.setState(fill, timing, Affinity.Intrinsic);
      }
    }
  }

  @TraitViewRef<BubblePlotController<X, Y>, BubblePlotTrait<X, Y>, BubblePlotView<X, Y>>({
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
        this.owner.setPlotRadius(plotTrait.radius.value);
        this.owner.setPlotFill(plotTrait.fill.value);
      }
    },
    willAttachTrait(plotTrait: BubblePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didDetachTrait(plotTrait: BubblePlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetPlotRadius(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.setPlotRadius(newRadius);
    },
    traitDidSetPlotFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.setPlotFill(newFill);
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
        this.owner.setPlotRadius(plotTrait.radius.value);
        this.owner.setPlotFill(plotTrait.fill.value);
      }
    },
    willAttachView(plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, this.owner);
    },
    didDetachView(plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotView, this.owner);
    },
    viewWillSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillSetPlotRadius", newRadius, oldRadius, this.owner);
    },
    viewDidSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidSetPlotRadius", newRadius, oldRadius, this.owner);
    },
    viewWillSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerWillSetPlotFill", newFill, oldFill, this.owner);
    },
    viewDidSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
      this.owner.callObservers("controllerDidSetPlotFill", newFill, oldFill, this.owner);
    },
  })
  readonly plot!: TraitViewRef<this, BubblePlotTrait<X, Y>, BubblePlotView<X, Y>>;
  static readonly plot: MemberFastenerClass<BubblePlotController, "plot">;
}
