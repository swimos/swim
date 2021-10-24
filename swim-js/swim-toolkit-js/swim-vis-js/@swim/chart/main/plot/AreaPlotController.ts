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
import {Affinity, MemberFastenerClass} from "@swim/fastener";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointController} from "../data/DataPointController";
import type {DataSetControllerDataPointExt} from "../data/DataSetController";
import {DataSetTrait} from "../data/DataSetTrait";
import {AreaPlotView} from "./AreaPlotView";
import {AreaPlotTrait} from "./AreaPlotTrait";
import {SeriesPlotController} from "./SeriesPlotController";
import type {AreaPlotControllerObserver} from "./AreaPlotControllerObserver";

export class AreaPlotController<X = unknown, Y = unknown> extends SeriesPlotController<X, Y> {
  override readonly observerType?: Class<AreaPlotControllerObserver<X, Y>>;

  protected detectDataSet(plotTrait: AreaPlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  @TraitViewControllerSet<AreaPlotController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>, DataSetControllerDataPointExt<X, Y>>({
    extends: true,
    get parentView(): AreaPlotView<X, Y> | null {
      return this.owner.plot.view;
    },
  })
  override readonly dataPoints!: TraitViewControllerSet<this, DataPointTrait<X, Y>, DataPointView<X, Y>, DataPointController<X, Y>>;
  static override readonly dataPoints: MemberFastenerClass<AreaPlotController, "dataPoints">;

  protected setPlotFill(fill: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
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
      if (fill instanceof Look) {
        plotView.fill.setLook(fill, timing, Affinity.Intrinsic);
      } else {
        plotView.fill.setState(fill, timing, Affinity.Intrinsic);
      }
    }
  }

  protected willSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotFill !== void 0) {
        observer.controllerWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotFill !== void 0) {
        observer.controllerDidSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  @TraitViewRef<AreaPlotController<X, Y>, AreaPlotTrait<X, Y>, AreaPlotView<X, Y>>({
    traitType: AreaPlotTrait,
    observesTrait: true,
    willAttachTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, this.owner);
    },
    didAttachTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      const plotView = this.view;
      if (plotView !== null) {
        const fill = plotTrait.fill.state;
        if (fill !== null) {
          this.owner.setPlotFill(fill);
        }
      }
      if (this.owner.dataSet.trait === null) {
        const dataSetTrait = this.owner.detectDataSet(plotTrait);
        if (dataSetTrait !== null) {
          this.owner.dataSet.setTrait(dataSetTrait);
        }
      }
    },
    didDetachTrait(plotTrait: AreaPlotTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, this.owner);
    },
    traitDidSetPlotFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.setPlotFill(newFill);
    },
    viewType: AreaPlotView,
    observesView: true,
    willAttachView(plotVIew: AreaPlotView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotVIew, this.owner);
    },
    didAttachView(plotView: AreaPlotView<X, Y>): void {
      const plotTrait = this.trait;
      if (plotTrait !== null) {
        const fill = plotTrait.fill.state;
        if (fill !== null) {
          this.owner.setPlotFill(fill);
        }
      }
      const dataPointControllers = this.owner.dataPoints.controllers;
      for (const controllerId in dataPointControllers) {
        const dataPointController = dataPointControllers[controllerId]!;
        dataPointController.dataPoint.insertView(plotView);
      }
    },
    didDetachView(plotVIew: AreaPlotView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlotView", plotVIew, this.owner);
    },
    viewWillSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<X, Y>): void {
      this.owner.willSetPlotFill(newFill, oldFill, plotView);
    },
    viewDidSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<X, Y>): void {
      this.owner.onSetPlotFill(newFill, oldFill, plotView);
      this.owner.didSetPlotFill(newFill, oldFill, plotView);
    },
  })
  readonly plot!: TraitViewRef<this, AreaPlotTrait<X, Y>, AreaPlotView<X, Y>>;
  static readonly plot: MemberFastenerClass<AreaPlotController, "plot">;
}
