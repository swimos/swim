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
import {BubblePlotView} from "./BubblePlotView";
import {BubblePlotTrait} from "./BubblePlotTrait";
import {ScatterPlotComponent} from "./ScatterPlotComponent";
import type {BubblePlotComponentObserver} from "./BubblePlotComponentObserver";

export class BubblePlotComponent<X, Y> extends ScatterPlotComponent<X, Y> {
  declare readonly componentObservers: ReadonlyArray<BubblePlotComponentObserver<X, Y>>;

  protected detectDataSet(plotTrait: BubblePlotTrait<X, Y>): DataSetTrait<X, Y> | null {
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
      this.setPlotRadius(plotTrait.radius, plotTrait);
      this.setPlotFill(plotTrait.fill, plotTrait);
    }
  }

  protected detachPlotTrait(plotTrait: BubblePlotTrait<X, Y>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: BubblePlotTrait<X, Y> | null, oldPlotTrait: BubblePlotTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotTrait !== void 0) {
        componentObserver.componentWillSetPlotTrait(newPlotTrait, oldPlotTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotTrait !== void 0) {
        componentObserver.componentDidSetPlotTrait(newPlotTrait, oldPlotTrait, this);
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
      this.setPlotRadius(plotTrait.radius, plotTrait);
      this.setPlotFill(plotTrait.fill, plotTrait);
    }

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const dataPointComponent = dataPointFasteners[i]!.component;
      if (dataPointComponent !== null) {
        dataPointComponent.dataPoint.injectView(plotView);
      }
    }
  }

  protected detachPlotView(plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected willSetPlotView(newPlotView: BubblePlotView<X, Y> | null, oldPlotView: BubblePlotView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotView !== void 0) {
        componentObserver.componentWillSetPlotView(newPlotView, oldPlotView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotView !== void 0) {
        componentObserver.componentDidSetPlotView(newPlotView, oldPlotView, this);
      }
    }
  }

  protected themePlotView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected setPlotRadius(radius: Length | null, plotTrait: BubblePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotRadius !== void 0) {
        componentObserver.componentWillSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotView: BubblePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotRadius !== void 0) {
        componentObserver.componentDidSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected setPlotFill(fill: Look<Color> | Color | null, plotTrait: BubblePlotTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotFill !== void 0) {
        componentObserver.componentWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
    // hook
  }

  protected didSetPlotFill(newFill: Color | null, oldFill: Color | null, plotView: BubblePlotView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotFill !== void 0) {
        componentObserver.componentDidSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  /** @hidden */
  static PlotFastener = ComponentViewTrait.define<BubblePlotComponent<unknown, unknown>, BubblePlotView<unknown, unknown>, BubblePlotTrait<unknown, unknown>>({
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
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, plotView: BubblePlotView<unknown, unknown>): void {
      this.owner.themePlotView(theme, mood, timing, plotView);
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
    traitDidSetPlotRadius(newRadius: Length | null, oldRadius: Length | null, plotTrait: BubblePlotTrait<unknown, unknown>): void {
      this.owner.setPlotRadius(newRadius, plotTrait);
    },
    traitDidSetPlotFill(newFill: Look<Color> | Color | null, oldFill: Look<Color> | Color | null, plotTrait: BubblePlotTrait<unknown, unknown>): void {
      this.owner.setPlotFill(newFill, plotTrait);
    },
  });

  @ComponentViewTrait<BubblePlotComponent<X, Y>, BubblePlotView<X, Y>, BubblePlotTrait<X, Y>>({
    extends: BubblePlotComponent.PlotFastener,
  })
  declare plot: ComponentViewTrait<this, BubblePlotView<X, Y>, BubblePlotTrait<X, Y>>;
}
