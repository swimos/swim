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

import {AnyTiming, Timing} from "@swim/util";
import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {View} from "@swim/view";
import {ControllerViewTrait, ControllerFastener} from "@swim/controller";
import type {DataPointController} from "../data/DataPointController";
import {DataSetTrait} from "../data/DataSetTrait";
import {BubblePlotView} from "./BubblePlotView";
import {BubblePlotTrait} from "./BubblePlotTrait";
import {ScatterPlotController} from "./ScatterPlotController";
import type {BubblePlotControllerObserver} from "./BubblePlotControllerObserver";

export class BubblePlotController<X, Y> extends ScatterPlotController<X, Y> {
  override readonly controllerObservers!: ReadonlyArray<BubblePlotControllerObserver<X, Y>>;

  protected detectDataSet(plotTrait: BubblePlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  protected override attachDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    super.attachDataPoint(dataPointController, dataPointFastener);
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null && dataPointView.parentView === null) {
      const plotView = this.plot.view;
      if (plotView !== null) {
        dataPointController.dataPoint.injectView(plotView);
      }
    }
  }

  protected initPlotTrait(plotTrait: BubblePlotTrait<X, Y>): void {
    if (this.dataSet.trait === null) {
      const dataSetTrait = this.detectDataSet(plotTrait);
      if (dataSetTrait !== null) {
        this.dataSet.setTrait(dataSetTrait);
      }
    }
  }

  protected attachPlotTrait(plotTrait: BubblePlotTrait<X, Y>): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      this.setPlotRadius(plotTrait.radius);
      this.setPlotFill(plotTrait.fill);
    }
  }

  protected detachPlotTrait(plotTrait: BubblePlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: BubblePlotTrait<X, Y> | null, oldPlotTrait: BubblePlotTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotTrait !== void 0) {
        controllerObserver.controllerWillSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected onSetPlotTrait(newPlotTrait: BubblePlotTrait<X, Y> | null, oldPlotTrait: BubblePlotTrait<X, Y> | null): void {
    if (oldPlotTrait !== null) {
      this.detachPlotTrait(oldPlotTrait);
    }
    if (newPlotTrait !== null) {
      this.attachPlotTrait(newPlotTrait);
      this.initPlotTrait(newPlotTrait);
    }
  }

  protected didSetPlotTrait(newPlotTrait: BubblePlotTrait<X, Y> | null, oldPlotTrait: BubblePlotTrait<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotTrait !== void 0) {
        controllerObserver.controllerDidSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected createPlotView(): BubblePlotView<X, Y> {
    return BubblePlotView.create<X, Y>();
  }

  protected initPlotView(plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected attachPlotView(plotView: BubblePlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      this.setPlotRadius(plotTrait.radius);
      this.setPlotFill(plotTrait.fill);
    }

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointController = dataPointFasteners[i]!.controller;
      if (dataPointController !== null) {
        dataPointController.dataPoint.injectView(plotView);
      }
    }
  }

  protected detachPlotView(plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: BubblePlotView<X, Y> | null, oldPlotView: BubblePlotView<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotView !== void 0) {
        controllerObserver.controllerWillSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected onSetPlotView(newPlotView: BubblePlotView<X, Y> | null, oldPlotView: BubblePlotView<X, Y> | null): void {
    if (oldPlotView !== null) {
      this.detachPlotView(oldPlotView);
    }
    if (newPlotView !== null) {
      this.attachPlotView(newPlotView);
      this.initPlotView(newPlotView);
    }
  }

  protected didSetPlotView(newPlotView: BubblePlotView<X, Y> | null, oldPlotView: BubblePlotView<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotView !== void 0) {
        controllerObserver.controllerDidSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected setPlotRadius(radius: Length | null, timing?: AnyTiming | boolean): void {
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
      plotView.radius.setState(radius, timing, View.Intrinsic);
    }
  }

  protected willSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotRadius !== void 0) {
        controllerObserver.controllerWillSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotRadius !== void 0) {
        controllerObserver.controllerDidSetPlotRadius(newRadius, oldRadius, this);
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
        plotView.fill.setLook(fill, timing, View.Intrinsic);
      } else {
        plotView.fill.setState(fill, timing, View.Intrinsic);
      }
    }
  }

  protected willSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotFill !== void 0) {
        controllerObserver.controllerWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotFill !== void 0) {
        controllerObserver.controllerDidSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  /** @hidden */
  static PlotFastener = ControllerViewTrait.define<BubblePlotController<unknown, unknown>, BubblePlotView<unknown, unknown>, BubblePlotTrait<unknown, unknown>>({
    viewType: BubblePlotView,
    observeView: true,
    willSetView(newPlotView: BubblePlotView<unknown, unknown> | null, oldPlotView: BubblePlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView);
    },
    onSetView(newPlotView: BubblePlotView<unknown, unknown> | null, oldPlotView: BubblePlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView);
    },
    didSetView(newPlotView: BubblePlotView<unknown, unknown> | null, oldPlotView: BubblePlotView<unknown, unknown> | null): void {
      this.owner.didSetPlotView(newPlotView, oldPlotView);
    },
    viewWillSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<unknown, unknown>): void {
      this.owner.willSetPlotRadius(newRadius, oldRadius, plotView);
    },
    viewDidSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<unknown, unknown>): void {
      this.owner.onSetPlotRadius(newRadius, oldRadius, plotView);
      this.owner.didSetPlotRadius(newRadius, oldRadius, plotView);
    },
    viewWillSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<unknown, unknown>): void {
      this.owner.willSetPlotFill(newFill, oldFill, plotView);
    },
    viewDidSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<unknown, unknown>): void {
      this.owner.onSetPlotFill(newFill, oldFill, plotView);
      this.owner.didSetPlotFill(newFill, oldFill, plotView);
    },
    createView(): BubblePlotView<unknown, unknown> | null {
      return this.owner.createPlotView();
    },
    traitType: BubblePlotTrait,
    observeTrait: true,
    willSetTrait(newPlotTrait: BubblePlotTrait<unknown, unknown> | null, oldPlotTrait: BubblePlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    onSetTrait(newPlotTrait: BubblePlotTrait<unknown, unknown> | null, oldPlotTrait: BubblePlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    didSetTrait(newPlotTrait: BubblePlotTrait<unknown, unknown> | null, oldPlotTrait: BubblePlotTrait<unknown, unknown> | null): void {
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    traitDidSetPlotRadius(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.setPlotRadius(newRadius);
    },
    traitDidSetPlotFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null): void {
      this.owner.setPlotFill(newFill);
    },
  });

  @ControllerViewTrait<BubblePlotController<X, Y>, BubblePlotView<X, Y>, BubblePlotTrait<X, Y>>({
    extends: BubblePlotController.PlotFastener,
  })
  readonly plot!: ControllerViewTrait<this, BubblePlotView<X, Y>, BubblePlotTrait<X, Y>>;
}
