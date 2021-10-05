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
import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {TraitViewFastener, ControllerFastener} from "@swim/controller";
import type {DataPointController} from "../data/DataPointController";
import {DataSetTrait} from "../data/DataSetTrait";
import {LinePlotView} from "./LinePlotView";
import {LinePlotTrait} from "./LinePlotTrait";
import {SeriesPlotController} from "./SeriesPlotController";
import type {LinePlotControllerObserver} from "./LinePlotControllerObserver";

export class LinePlotController<X, Y> extends SeriesPlotController<X, Y> {
  override readonly observerType?: Class<LinePlotControllerObserver<X, Y>>;

  protected detectDataSet(plotTrait: LinePlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  protected override attachDataPoint(dataPointController: DataPointController<X, Y>, dataPointFastener: ControllerFastener<this, DataPointController<X, Y>>): void {
    super.attachDataPoint(dataPointController, dataPointFastener);
    const plotView = this.plot.view;
    if (plotView !== null) {
      dataPointController.dataPoint.injectView(plotView);
    }
  }

  protected initPlotTrait(plotTrait: LinePlotTrait<X, Y>): void {
    if (this.dataSet.trait === null) {
      const dataSetTrait = this.detectDataSet(plotTrait);
      if (dataSetTrait !== null) {
        this.dataSet.setTrait(dataSetTrait);
      }
    }
  }

  protected attachPlotTrait(plotTrait: LinePlotTrait<X, Y>): void {
    const plotView = this.plot.view;
    if (plotView !== null) {
      const stroke = plotTrait.stroke.state;
      if (stroke !== null) {
        this.setPlotStroke(stroke);
      }
      const strokeWidth = plotTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setPlotStrokeWidth(strokeWidth);
      }
    }
  }

  protected detachPlotTrait(plotTrait: LinePlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotTrait !== void 0) {
        observer.controllerWillSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected onSetPlotTrait(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null): void {
    if (oldPlotTrait !== null) {
      this.detachPlotTrait(oldPlotTrait);
    }
    if (newPlotTrait !== null) {
      this.attachPlotTrait(newPlotTrait);
      this.initPlotTrait(newPlotTrait);
    }
  }

  protected didSetPlotTrait(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotTrait !== void 0) {
        observer.controllerDidSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected createPlotView(): LinePlotView<X, Y> {
    return new LinePlotView<X, Y>();
  }

  protected initPlotView(plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected attachPlotView(plotView: LinePlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      const stroke = plotTrait.stroke.state;
      if (stroke !== null) {
        this.setPlotStroke(stroke);
      }
      const strokeWidth = plotTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setPlotStrokeWidth(strokeWidth);
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

  protected detachPlotView(plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotView !== void 0) {
        observer.controllerWillSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected onSetPlotView(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null): void {
    if (oldPlotView !== null) {
      this.detachPlotView(oldPlotView);
    }
    if (newPlotView !== null) {
      this.attachPlotView(newPlotView);
      this.initPlotView(newPlotView);
    }
  }

  protected didSetPlotView(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotView !== void 0) {
        observer.controllerDidSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

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

  protected willSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotStroke !== void 0) {
        observer.controllerWillSetPlotStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotStroke !== void 0) {
        observer.controllerDidSetPlotStroke(newStroke, oldStroke, this);
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

  protected willSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPlotStrokeWidth !== void 0) {
        observer.controllerWillSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPlotStrokeWidth !== void 0) {
        observer.controllerDidSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  /** @internal */
  static PlotFastener = TraitViewFastener.define<LinePlotController<unknown, unknown>, LinePlotTrait<unknown, unknown>, LinePlotView<unknown, unknown>>({
    traitType: LinePlotTrait,
    observesTrait: true,
    willSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    onSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    didSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    traitDidSetPlotStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null): void {
      this.owner.setPlotStroke(newStroke);
    },
    traitDidSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.setPlotStrokeWidth(newStrokeWidth);
    },
    viewType: LinePlotView,
    observesView: true,
    willSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView);
    },
    onSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView);
    },
    didSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.didSetPlotView(newPlotView, oldPlotView);
    },
    viewWillSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<unknown, unknown>): void {
      this.owner.willSetPlotStroke(newStroke, oldStroke, plotView);
    },
    viewDidSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<unknown, unknown>): void {
      this.owner.onSetPlotStroke(newStroke, oldStroke, plotView);
      this.owner.didSetPlotStroke(newStroke, oldStroke, plotView);
    },
    viewWillSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<unknown, unknown>): void {
      this.owner.willSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, plotView);
    },
    viewDidSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<unknown, unknown>): void {
      this.owner.onSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, plotView);
      this.owner.didSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, plotView);
    },
    createView(): LinePlotView<unknown, unknown> | null {
      return this.owner.createPlotView();
    },
  });

  @TraitViewFastener<LinePlotController<X, Y>, LinePlotTrait<X, Y>, LinePlotView<X, Y>>({
    extends: LinePlotController.PlotFastener,
  })
  readonly plot!: TraitViewFastener<this, LinePlotTrait<X, Y>, LinePlotView<X, Y>>;
}
