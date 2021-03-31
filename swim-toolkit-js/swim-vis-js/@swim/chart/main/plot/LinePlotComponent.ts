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
      this.setPlotViewStroke(plotTrait.stroke, plotTrait);
      this.setPlotViewStrokeWidth(plotTrait.strokeWidth, plotTrait);
    }
  }

  protected detachPlotTrait(plotTrait: LinePlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: LinePlotTrait<X, Y> | null, oldPlotTrait: LinePlotTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.plotWillSetTrait !== void 0) {
        componentObserver.plotWillSetTrait(newPlotTrait, oldPlotTrait, this);
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
      if (componentObserver.plotDidSetTrait !== void 0) {
        componentObserver.plotDidSetTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected willSetPlotTraitStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.linePlotWillSetStroke !== void 0) {
        componentObserver.linePlotWillSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected onSetPlotTraitStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<X, Y>): void {
    this.setPlotViewStroke(newStroke, plotTrait);
  }

  protected didSetPlotTraitStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.linePlotDidSetStroke !== void 0) {
        componentObserver.linePlotDidSetStroke(newStroke, oldStroke, this);
      }
    }
  }

  protected willSetPlotTraitStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.linePlotWillSetStrokeWidth !== void 0) {
        componentObserver.linePlotWillSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected onSetPlotTraitStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<X, Y>): void {
    this.setPlotViewStrokeWidth(newStrokeWidth, plotTrait);
  }

  protected didSetPlotTraitStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.linePlotDidSetStrokeWidth !== void 0) {
        componentObserver.linePlotDidSetStrokeWidth(newStrokeWidth, oldStrokeWidth, this);
      }
    }
  }

  protected createPlotView(): LinePlotView<X, Y> {
    return LinePlotView.create<X, Y>();
  }

  protected initPlotView(plotView: LinePlotView<X, Y>): void {
    // hook
  }

  protected themePlotView(plotView: LinePlotView<X, Y>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachPlotView(plotView: LinePlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      this.setPlotViewStroke(plotTrait.stroke, plotTrait);
      this.setPlotViewStrokeWidth(plotTrait.strokeWidth, plotTrait);
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
      if (componentObserver.plotWillSetView !== void 0) {
        componentObserver.plotWillSetView(newPlotView, oldPlotView, this);
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
      if (componentObserver.plotDidSetView !== void 0) {
        componentObserver.plotDidSetView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected setPlotViewStroke(stroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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

  protected setPlotViewStrokeWidth(strokeWidth: Length | null, plotTrait: LinePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      this.owner.themePlotView(plotView, theme, mood, timing);
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
    linePlotTraitWillSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.willSetPlotTraitStroke(newStroke, oldStroke, plotTrait);
    },
    linePlotTraitDidSetStroke(newStroke: Look<Color> | Color | null, oldStroke: Look<Color> | Color | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.onSetPlotTraitStroke(newStroke, oldStroke, plotTrait);
      this.owner.didSetPlotTraitStroke(newStroke, oldStroke, plotTrait);
    },
    linePlotTraitWillSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.willSetPlotTraitStrokeWidth(newStrokeWidth, oldStrokeWidth, plotTrait);
    },
    linePlotTraitDidSetStrokeWidth(newStrokeWidth: Length | null, oldStrokeWidth: Length | null, plotTrait: LinePlotTrait<unknown, unknown>): void {
      this.owner.onSetPlotTraitStrokeWidth(newStrokeWidth, oldStrokeWidth, plotTrait);
      this.owner.didSetPlotTraitStrokeWidth(newStrokeWidth, oldStrokeWidth, plotTrait);
    },
  });

  @ComponentViewTrait<LinePlotComponent<X, Y>, LinePlotView<X, Y>, LinePlotTrait<X, Y>>({
    extends: LinePlotComponent.PlotFastener,
  })
  declare plot: ComponentViewTrait<this, LinePlotView<X, Y>, LinePlotTrait<X, Y>>;
}
