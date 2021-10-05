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
import {Affinity} from "@swim/fastener";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewFastener, ControllerFastener} from "@swim/controller";
import type {DataPointController} from "../data/DataPointController";
import {DataSetTrait} from "../data/DataSetTrait";
import {AreaPlotView} from "./AreaPlotView";
import {AreaPlotTrait} from "./AreaPlotTrait";
import {SeriesPlotController} from "./SeriesPlotController";
import type {AreaPlotControllerObserver} from "./AreaPlotControllerObserver";

export class AreaPlotController<X, Y> extends SeriesPlotController<X, Y> {
  override readonly observerType?: Class<AreaPlotControllerObserver<X, Y>>;

  protected detectDataSet(plotTrait: AreaPlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  protected override attachDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    super.attachDataPoint(dataPointController, dataPointFastener);
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null && dataPointView.parent === null) {
      const plotView = this.plot.view;
      if (plotView !== null) {
        dataPointController.dataPoint.injectView(plotView);
      }
    }
  }

  protected initPlotTrait(plotTrait: AreaPlotTrait<X, Y>): void {
    if (this.dataSet.trait === null) {
      const dataSetTrait = this.detectDataSet(plotTrait);
      if (dataSetTrait !== null) {
        this.dataSet.setTrait(dataSetTrait);
      }
    }
  }

  protected attachPlotTrait(plotTrait: AreaPlotTrait<X, Y>): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      const fill = plotTrait.fill.state;
      if (fill !== null) {
        this.setPlotFill(fill);
      }
    }
  }

  protected detachPlotTrait(plotTrait: AreaPlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotTrait !== void 0) {
        observer.controllerWillSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected onSetPlotTrait(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null): void {
    if (oldPlotTrait !== null) {
      this.detachPlotTrait(oldPlotTrait);
    }
    if (newPlotTrait !== null) {
      this.attachPlotTrait(newPlotTrait);
      this.initPlotTrait(newPlotTrait);
    }
  }

  protected didSetPlotTrait(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotTrait !== void 0) {
        observer.controllerDidSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected createPlotView(): AreaPlotView<X, Y> {
    return new AreaPlotView<X, Y>();
  }

  protected initPlotView(plotView: AreaPlotView<X, Y>): void {
    // hook
  }

  protected attachPlotView(plotView: AreaPlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      const fill = plotTrait.fill.state;
      if (fill !== null) {
        this.setPlotFill(fill);
      }
    }

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointController = dataPointFasteners[i]!.controller;
      if (dataPointController !== null) {
        dataPointController.dataPoint.injectView(plotView);
      }
    }
  }

  protected detachPlotView(plotView: AreaPlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotView !== void 0) {
        observer.controllerWillSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected onSetPlotView(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null): void {
    if (oldPlotView !== null) {
      this.detachPlotView(oldPlotView);
    }
    if (newPlotView !== null) {
      this.attachPlotView(newPlotView);
      this.initPlotView(newPlotView);
    }
  }

  protected didSetPlotView(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotView !== void 0) {
        observer.controllerDidSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

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

  /** @internal */
  static PlotFastener = TraitViewFastener.define<AreaPlotController<unknown, unknown>, AreaPlotTrait<unknown, unknown>, AreaPlotView<unknown, unknown>>({
    traitType: AreaPlotTrait,
    observesTrait: true,
    willSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    onSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    didSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    traitDidSetPlotFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.setPlotFill(newFill);
    },
    viewType: AreaPlotView,
    observesView: true,
    willSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView);
    },
    onSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView);
    },
    didSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.didSetPlotView(newPlotView, oldPlotView);
    },
    viewWillSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<unknown, unknown>): void {
      this.owner.willSetPlotFill(newFill, oldFill, plotView);
    },
    viewDidSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: AreaPlotView<unknown, unknown>): void {
      this.owner.onSetPlotFill(newFill, oldFill, plotView);
      this.owner.didSetPlotFill(newFill, oldFill, plotView);
    },
    createView(): AreaPlotView<unknown, unknown> | null {
      return this.owner.createPlotView();
    },
  });

  @TraitViewFastener<AreaPlotController<X, Y>, AreaPlotTrait<X, Y>, AreaPlotView<X, Y>>({
    extends: AreaPlotController.PlotFastener,
  })
  readonly plot!: TraitViewFastener<this, AreaPlotTrait<X, Y>, AreaPlotView<X, Y>>;
}
