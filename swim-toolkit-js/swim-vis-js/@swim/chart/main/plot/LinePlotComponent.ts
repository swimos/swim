// Copyright 2015-2020 Swim inc.
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

import {AnyTiming, Timing} from "@swim/mapping";
import type {Length} from "@swim/math";
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {ComponentViewTrait, ComponentFastener} from "@swim/component";
import type {DataPointComponent} from "../data/DataPointComponent";
import {DataSetTrait} from "../data/DataSetTrait";
import {LinePlotView} from "./LinePlotView";
import {LinePlotTrait} from "./LinePlotTrait";
import {SeriesPlotComponent} from "./SeriesPlotComponent";
import type {LinePlotComponentObserver} from "./LinePlotComponentObserver";

export class LinePlotComponent<X, Y> extends SeriesPlotComponent<X, Y> {
  declare readonly componentObservers: ReadonlyArray<LinePlotComponentObserver<X, Y>>;

  protected detectDataSet(plotTrait: LinePlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  protected attachDataPoint(dataPointComponent: DataPointComponent<X, Y>, dataPointFastener: ComponentFastener<this, DataPointComponent<X, Y>>): void {
    super.attachDataPoint(dataPointComponent, dataPointFastener);
    const plotView = this.plot.view;
    if (plotView !== null) {
      dataPointComponent.dataPoint.injectView(plotView);
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
        this.setPlotStroke(stroke, plotTrait);
      }
      const strokeWidth = plotTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setPlotStrokeWidth(strokeWidth, plotTrait);
      }
    }
  }

  protected detachPlotTrait(plotTrait: LinePlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotTrait !== void 0) {
        componentObserver.componentWillSetPlotTrait(newPlotTrait, oldPlotTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotTrait !== void 0) {
        componentObserver.componentDidSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected createPlotView(): LinePlotView<X, Y> {
    return LinePlotView.create<X, Y>();
  }

  protected initPlotView(plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected attachPlotView(plotView: LinePlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      const stroke = plotTrait.stroke.state;
      if (stroke !== null) {
        this.setPlotStroke(stroke, plotTrait);
      }
      const strokeWidth = plotTrait.strokeWidth.state;
      if (strokeWidth !== null) {
        this.setPlotStrokeWidth(strokeWidth, plotTrait);
      }
    }

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointComponent = dataPointFasteners[i]!.component;
      if (dataPointComponent !== null) {
        dataPointComponent.dataPoint.injectView(plotView);
      }
    }
  }

  protected detachPlotView(plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: LinePlotView<X, Y> | null, oldPlotView: LinePlotView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotView !== void 0) {
        componentObserver.componentWillSetPlotView(newPlotView, oldPlotView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotView !== void 0) {
        componentObserver.componentDidSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected themePlotView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected setPlotStroke(stroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
        plotView.stroke.setLook(stroke, timing, View.Intrinsic);
      } else {
        plotView.stroke.setState(stroke, timing, View.Intrinsic);
      }
    }
  }

  protected willSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotStroke !== void 0) {
        componentObserver.componentWillSetPlotStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotStroke(newStroke: Color | null, oldStroke: Color | null, plotView: LinePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotStroke !== void 0) {
        componentObserver.componentDidSetPlotStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected setPlotStrokeWidth(strokeWidth: Length | null, plotTrait: LinePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      plotView.strokeWidth.setState(strokeWidth, timing, View.Intrinsic);
    }
  }

  protected willSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotStrokeWidth !== void 0) {
        componentObserver.componentWillSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotView: LinePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotStrokeWidth !== void 0) {
        componentObserver.componentDidSetPlotStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  /** @hidden */
  static PlotFastener = ComponentViewTrait.define<LinePlotComponent<unknown, unknown>, LinePlotView<unknown, unknown>, LinePlotTrait<unknown, unknown>>({
    viewType: LinePlotView,
    observeView: true,
    willSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView);
    },
    onSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView);
    },
    didSetView(newPlotView: LinePlotView<unknown, unknown> | null, oldPlotView: LinePlotView<unknown, unknown> | null): void {
      this.owner.didSetPlotView(newPlotView, oldPlotView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, plotView: LinePlotView<unknown, unknown>): void {
      this.owner.themePlotView(theme, mood, timing, plotView);
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
    traitType: LinePlotTrait,
    observeTrait: true,
    willSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    onSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    didSetTrait(newPlotTrait: LinePlotTrait<unknown, unknown> | null, oldPlotTrait: LinePlotTrait<unknown, unknown> | null): void {
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    traitDidSetPlotStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.setPlotStroke(newStroke, plotTrait);
    },
    traitDidSetPlotStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.setPlotStrokeWidth(newStrokeWidth, plotTrait);
    },
  });

  @ComponentViewTrait<LinePlotComponent<X, Y>, LinePlotView<X, Y>, LinePlotTrait<X, Y>>({
    extends: LinePlotComponent.PlotFastener,
  })
  declare plot: ComponentViewTrait<this, LinePlotView<X, Y>, LinePlotTrait<X, Y>>;
}
