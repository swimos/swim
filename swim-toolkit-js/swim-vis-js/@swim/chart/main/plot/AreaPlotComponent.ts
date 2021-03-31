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
import type {Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import {ComponentViewTrait, ComponentFastener} from "@swim/component";
import type {DataPointComponent} from "../data/DataPointComponent";
import {DataSetTrait} from "../data/DataSetTrait";
import {AreaPlotView} from "./AreaPlotView";
import {AreaPlotTrait} from "./AreaPlotTrait";
import {SeriesPlotComponent} from "./SeriesPlotComponent";
import type {AreaPlotComponentObserver} from "./AreaPlotComponentObserver";

export class AreaPlotComponent<X, Y> extends SeriesPlotComponent<X, Y> {
  declare readonly componentObservers: ReadonlyArray<AreaPlotComponentObserver<X, Y>>;

  protected detectDataSet(plotTrait: AreaPlotTrait<X, Y>): DataSetTrait<X, Y> | null {
    return plotTrait.getTrait(DataSetTrait);
  }

  protected attachDataPoint(dataPointComponent: DataPointComponent<X, Y>, dataPointFastener: ComponentFastener<this, DataPointComponent<X, Y>>): void {
    super.attachDataPoint(dataPointComponent, dataPointFastener);
    const dataPointView = dataPointComponent.dataPoint.view;
    if (dataPointView !== null && dataPointView.parentView === null) {
      const plotView = this.plot.view;
      if (plotView !== null) {
        dataPointComponent.dataPoint.injectView(plotView);
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
      this.setPlotViewFill(plotTrait.fill, plotTrait);
    }
  }

  protected detachPlotTrait(plotTrait: AreaPlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: AreaPlotTrait<X, Y> | null, oldPlotTrait: AreaPlotTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.plotWillSetTrait !== void 0) {
        componentObserver.plotWillSetTrait(newPlotTrait, oldPlotTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.plotDidSetTrait !== void 0) {
        componentObserver.plotDidSetTrait(newPlotTrait, oldPlotTrait, this);
      }
    }
  }

  protected willSetPlotTraitFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.areaPlotWillSetFill !== void 0) {
        componentObserver.areaPlotWillSetFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetPlotTraitFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<X, Y>): void {
    this.setPlotViewFill(newFill, plotTrait);
  }

  protected didSetPlotTraitFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.areaPlotDidSetFill !== void 0) {
        componentObserver.areaPlotDidSetFill(newFill, oldFill, this);
      }
    }
  }

  protected createPlotView(): AreaPlotView<X, Y> {
    return AreaPlotView.create<X, Y>();
  }

  protected initPlotView(plotView: AreaPlotView<X, Y>): void {
    // hook
  }

  protected themePlotView(plotView: AreaPlotView<X, Y>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachPlotView(plotView: AreaPlotView<X, Y>): void {
    const plotTrait = this.plot.trait;
    if (plotTrait !== null) {
      this.setPlotViewFill(plotTrait.fill, plotTrait);
    }

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointComponent = dataPointFasteners[i]!.component;
      if (dataPointComponent !== null) {
        dataPointComponent.dataPoint.injectView(plotView);
      }
    }
  }

  protected detachPlotView(plotView: AreaPlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: AreaPlotView<X, Y> | null, oldPlotView: AreaPlotView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.plotWillSetView !== void 0) {
        componentObserver.plotWillSetView(newPlotView, oldPlotView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.plotDidSetView !== void 0) {
        componentObserver.plotDidSetView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected setPlotViewFill(fill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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

  /** @hidden */
  static PlotFastener = ComponentViewTrait.define<AreaPlotComponent<unknown, unknown>, AreaPlotView<unknown, unknown>, AreaPlotTrait<unknown, unknown>>({
    viewType: AreaPlotView,
    observeView: true,
    willSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView);
    },
    onSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView);
    },
    didSetView(newPlotView: AreaPlotView<unknown, unknown> | null, oldPlotView: AreaPlotView<unknown, unknown> | null): void {
      this.owner.didSetPlotView(newPlotView, oldPlotView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, plotView: AreaPlotView<unknown, unknown>): void {
      this.owner.themePlotView(plotView, theme, mood, timing);
    },
    createView(): AreaPlotView<unknown, unknown> | null {
      return this.owner.createPlotView();
    },
    traitType: AreaPlotTrait,
    observeTrait: true,
    willSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    onSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    didSetTrait(newPlotTrait: AreaPlotTrait<unknown, unknown> | null, oldPlotTrait: AreaPlotTrait<unknown, unknown> | null): void {
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait);
    },
    areaPlotTraitWillSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<unknown, unknown>): void {
      this.owner.willSetPlotTraitFill(newFill, oldFill, plotTrait);
    },
    areaPlotTraitDidSetFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: AreaPlotTrait<unknown, unknown>): void {
      this.owner.onSetPlotTraitFill(newFill, oldFill, plotTrait);
      this.owner.didSetPlotTraitFill(newFill, oldFill, plotTrait);
    },
  });

  @ComponentViewTrait<AreaPlotComponent<X, Y>, AreaPlotView<X, Y>, AreaPlotTrait<X, Y>>({
    extends: AreaPlotComponent.PlotFastener,
  })
  declare plot: ComponentViewTrait<this, AreaPlotView<X, Y>, AreaPlotTrait<X, Y>>;
}
