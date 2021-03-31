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

import type {Timing} from "@swim/mapping";
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {Component, ComponentViewTrait, ComponentFastener} from "@swim/component";
import type {GraphView} from "../graph/GraphView";
import type {GraphTrait} from "../graph/GraphTrait";
import {GraphComponent} from "../graph/GraphComponent";
import type {AxisView} from "../axis/AxisView";
import type {AxisTrait} from "../axis/AxisTrait";
import {AxisComponent} from "../axis/AxisComponent";
import {TopAxisComponent} from "../axis/TopAxisComponent";
import {RightAxisComponent} from "../axis/RightAxisComponent";
import {BottomAxisComponent} from "../axis/BottomAxisComponent";
import {LeftAxisComponent} from "../axis/LeftAxisComponent";
import {ChartView} from "./ChartView";
import {ChartTrait} from "./ChartTrait";
import type {ChartComponentObserver} from "./ChartComponentObserver";

export class ChartComponent<X, Y> extends GraphComponent<X, Y> {
  declare readonly componentObservers: ReadonlyArray<ChartComponentObserver<X, Y>>;

  protected initChartTrait(chartTrait: ChartTrait<X, Y>): void {
    // hook
  }

  protected attachChartTrait(chartTrait: ChartTrait<X, Y>): void {
    this.graph.setTrait(chartTrait.graph.trait);
    const topAxisTrait = chartTrait.topAxis.trait;
    if (topAxisTrait !== null) {
      this.insertTopAxisTrait(topAxisTrait);
    }
    const rightAxisTrait = chartTrait.rightAxis.trait;
    if (rightAxisTrait !== null) {
      this.insertRightAxisTrait(rightAxisTrait);
    }
    const bottomAxisTrait = chartTrait.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      this.insertBottomAxisTrait(bottomAxisTrait);
    }
    const leftAxisTrait = chartTrait.leftAxis.trait;
    if (leftAxisTrait !== null) {
      this.insertLeftAxisTrait(leftAxisTrait);
    }
  }

  protected detachChartTrait(chartTrait: ChartTrait<X, Y>): void {
    const leftAxisTrait = chartTrait.leftAxis.trait;
    if (leftAxisTrait !== null) {
      this.removeLeftAxisTrait(leftAxisTrait);
    }
    const bottomAxisTrait = chartTrait.bottomAxis.trait;
    if (bottomAxisTrait !== null) {
      this.removeBottomAxisTrait(bottomAxisTrait);
    }
    const rightAxisTrait = chartTrait.rightAxis.trait;
    if (rightAxisTrait !== null) {
      this.removeRightAxisTrait(rightAxisTrait);
    }
    const topAxisTrait = chartTrait.topAxis.trait;
    if (topAxisTrait !== null) {
      this.removeTopAxisTrait(topAxisTrait);
    }
    this.graph.setTrait(null);
  }

  protected willSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetTrait !== void 0) {
        componentObserver.chartWillSetTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected onSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    if (oldGraphTrait !== null) {
      this.detachChartTrait(oldGraphTrait);
    }
    if (newGraphTrait !== null) {
      this.attachChartTrait(newGraphTrait);
      this.initChartTrait(newGraphTrait);
    }
  }

  protected didSetChartTrait(newGraphTrait: ChartTrait<X, Y> | null, oldGraphTrait: ChartTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetTrait !== void 0) {
        componentObserver.chartDidSetTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected createChartView(): ChartView<X, Y> | null {
    return ChartView.create<X, Y>();
  }

  protected initChartView(chartView: ChartView<X, Y>): void {
    // hook
  }

  protected themeChartView(chartView: ChartView<X, Y>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachChartView(chartView: ChartView<X, Y>): void {
    if (this.graph.view !== null || this.graph.trait !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected detachChartView(chartView: ChartView<X, Y>): void {
    // hook
  }

  protected willSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetView !== void 0) {
        componentObserver.chartWillSetView(newChartView, oldChartView, this);
      }
    }
  }

  protected onSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    if (oldChartView !== null) {
      this.detachChartView(oldChartView);
    }
    if (newChartView !== null) {
      this.attachChartView(newChartView);
      this.initChartView(newChartView);
    }
  }

  protected didSetChartView(newChartView: ChartView<X, Y> | null, oldChartView: ChartView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetView !== void 0) {
        componentObserver.chartDidSetView(newChartView, oldChartView, this);
      }
    }
  }

  /** @hidden */
  static ChartFastener = ComponentViewTrait.define<ChartComponent<unknown, unknown>, ChartView<unknown, unknown>, ChartTrait<unknown, unknown>>({
    viewType: ChartView,
    observeView: true,
    willSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.willSetChartView(newChartView, oldChartView);
    },
    onSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.onSetChartView(newChartView, oldChartView);
    },
    didSetView(newChartView: ChartView<unknown, unknown> | null, oldChartView: ChartView<unknown, unknown> | null): void {
      this.owner.didSetChartView(newChartView, oldChartView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, chartView: ChartView<unknown, unknown>): void {
      this.owner.themeChartView(chartView, theme, mood, timing);
    },
    createView(): ChartView<unknown, unknown> | null {
      return this.owner.createChartView();
    },
    traitType: ChartTrait,
    observeTrait: true,
    willSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.willSetChartTrait(newChartTrait, oldChartTrait);
    },
    onSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.onSetChartTrait(newChartTrait, oldChartTrait);
    },
    didSetTrait(newChartTrait: ChartTrait<unknown, unknown> | null, oldChartTrait: ChartTrait<unknown, unknown> | null): void {
      this.owner.didSetChartTrait(newChartTrait, oldChartTrait);
    },
    chartTraitWillSetTopAxis(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldTopAxisTrait !== null) {
        this.owner.removeTopAxisTrait(oldTopAxisTrait);
      }
    },
    chartTraitDidSetTopAxis(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newTopAxisTrait !== null) {
        this.owner.insertTopAxisTrait(newTopAxisTrait);
      }
    },
    chartTraitWillSetRightAxis(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldRightAxisTrait !== null) {
        this.owner.removeRightAxisTrait(oldRightAxisTrait);
      }
    },
    chartTraitDidSetRightAxis(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newRightAxisTrait !== null) {
        this.owner.insertRightAxisTrait(newRightAxisTrait);
      }
    },
    chartTraitWillSetBottomAxis(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldBottomAxisTrait !== null) {
        this.owner.removeBottomAxisTrait(oldBottomAxisTrait);
      }
    },
    chartTraitDidSetBottomAxis(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newBottomAxisTrait !== null) {
        this.owner.insertBottomAxisTrait(newBottomAxisTrait);
      }
    },
    chartTraitWillSetLeftAxis(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (oldLeftAxisTrait !== null) {
        this.owner.removeLeftAxisTrait(oldLeftAxisTrait);
      }
    },
    chartTraitDidSetLeftAxis(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null, targetTrait: Trait | null): void {
      if (newLeftAxisTrait !== null) {
        this.owner.insertLeftAxisTrait(newLeftAxisTrait);
      }
    },
  });

  @ComponentViewTrait<ChartComponent<X, Y>, ChartView<X, Y>, ChartTrait<X, Y>>({
    extends: ChartComponent.ChartFastener,
  })
  declare chart: ComponentViewTrait<this, ChartView<X, Y>, ChartTrait<X, Y>>;

  protected attachGraphTrait(graphTrait: GraphTrait<X, Y>): void {
    super.attachGraphTrait(graphTrait);
    const chartView = this.chart.view;
    if (chartView !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected attachGraphView(graphView: GraphView<X, Y>): void {
    super.attachGraphView(graphView);
    const chartView = this.chart.view;
    if (chartView !== null) {
      this.graph.injectView(chartView);
    }
  }

  protected detachGraphView(graphView: GraphView<X, Y>): void {
    graphView.remove();
  }

  protected createTopAxis(topAxisTrait: AxisTrait<X>): AxisComponent<X> | null {
    return new TopAxisComponent<X>();
  }

  protected initTopAxis(topAxisComponent: AxisComponent<X>): void {
    const topAxisTrait = topAxisComponent.axis.trait;
    if (topAxisTrait !== null) {
      this.initTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisComponent.axis.view;
    if (topAxisView !== null) {
      this.initTopAxisView(topAxisView);
    }
  }

  protected attachTopAxis(topAxisComponent: AxisComponent<X>): void {
    const topAxisTrait = topAxisComponent.axis.trait;
    if (topAxisTrait !== null) {
      this.attachTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisComponent.axis.view;
    if (topAxisView !== null) {
      this.attachTopAxisView(topAxisView);
    }
  }

  protected detachTopAxis(topAxisComponent: AxisComponent<X>): void {
    const topAxisTrait = topAxisComponent.axis.trait;
    if (topAxisTrait !== null) {
      this.detachTopAxisTrait(topAxisTrait);
    }
    const topAxisView = topAxisComponent.axis.view;
    if (topAxisView !== null) {
      this.detachTopAxisView(topAxisView);
    }
  }

  protected willSetTopAxis(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetTopAxis !== void 0) {
        componentObserver.chartWillSetTopAxis(newTopAxisComponent, oldTopAxisComponent, this);
      }
    }
  }

  protected onSetTopAxis(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null): void {
    if (oldTopAxisComponent !== null) {
      this.detachTopAxis(oldTopAxisComponent);
    }
    if (newTopAxisComponent !== null) {
      this.attachTopAxis(newTopAxisComponent);
      this.initTopAxis(newTopAxisComponent);
    }
  }

  protected didSetTopAxis(newTopAxisComponent: AxisComponent<X> | null, oldTopAxisComponent: AxisComponent<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetTopAxis !== void 0) {
        componentObserver.chartDidSetTopAxis(newTopAxisComponent, oldTopAxisComponent, this);
      }
    }
  }

  protected insertTopAxisTrait(topAxisTrait: AxisTrait<X>, targetTrait: Trait | null = null): void {
    const childComponents = this.childComponents;
    let targetComponent: AxisComponent<unknown> | null = null;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent) {
        if (childComponent.axis.trait === topAxisTrait) {
          return;
        } else if (childComponent.axis.trait === targetTrait) {
          targetComponent = childComponent;
        }
      }
    }
    const topAxisComponent = this.createTopAxis(topAxisTrait);
    if (topAxisComponent !== null) {
      topAxisComponent.axis.setTrait(topAxisTrait);
      this.topAxis.setComponent(topAxisComponent, targetComponent);
      this.insertChildComponent(topAxisComponent, targetComponent);
      if (topAxisComponent.axis.view === null) {
        const topAxisView = this.createTopAxisView(topAxisComponent);
        let targetView: AxisView<unknown> | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          topAxisComponent.axis.injectView(chartView, topAxisView, targetView, null);
        } else {
          topAxisComponent.axis.setView(topAxisView, targetView);
        }
      }
    }
  }

  protected removeTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    const childComponents = this.childComponents;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent && childComponent.axis.trait === topAxisTrait) {
        this.topAxis.setComponent(null);
        childComponent.remove();
        return;
      }
    }
  }

  protected initTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected detachTopAxisTrait(topAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected willSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetTopAxisTrait !== void 0) {
        componentObserver.chartWillSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait, this);
      }
    }
  }

  protected onSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    if (oldTopAxisTrait !== null) {
      this.detachTopAxisTrait(oldTopAxisTrait);
    }
    if (newTopAxisTrait !== null) {
      this.attachTopAxisTrait(newTopAxisTrait);
      this.initTopAxisTrait(newTopAxisTrait);
    }
  }

  protected didSetTopAxisTrait(newTopAxisTrait: AxisTrait<X> | null, oldTopAxisTrait: AxisTrait<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetTopAxisTrait !== void 0) {
        componentObserver.chartDidSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait, this);
      }
    }
  }

  protected createTopAxisView(topAxisComponent: AxisComponent<X>): AxisView<X> | null {
    return topAxisComponent.axis.createView();
  }

  protected initTopAxisView(topAxisView: AxisView<X>): void {
    // hook
  }

  protected attachTopAxisView(topAxisView: AxisView<X>): void {
    // hook
  }

  protected detachTopAxisView(topAxisView: AxisView<X>): void {
    topAxisView.remove();
  }

  protected willSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetTopAxisView !== void 0) {
        componentObserver.chartWillSetTopAxisView(newTopAxisView, oldTopAxisView, this);
      }
    }
  }

  protected onSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    if (oldTopAxisView !== null) {
      this.detachTopAxisView(oldTopAxisView);
    }
    if (newTopAxisView !== null) {
      this.attachTopAxisView(newTopAxisView);
      this.initTopAxisView(newTopAxisView);
    }
  }

  protected didSetTopAxisView(newTopAxisView: AxisView<X> | null, oldTopAxisView: AxisView<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetTopAxisView !== void 0) {
        componentObserver.chartDidSetTopAxisView(newTopAxisView, oldTopAxisView, this);
      }
    }
  }

  /** @hidden */
  static TopAxisFastener = ComponentFastener.define<ChartComponent<unknown, unknown>, AxisComponent<unknown>>({
    type: TopAxisComponent,
    observe: true,
    willSetComponent(newTopAxisComponent: AxisComponent<unknown> | null, oldTopAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.willSetTopAxis(newTopAxisComponent, oldTopAxisComponent);
    },
    onSetComponent(newTopAxisComponent: AxisComponent<unknown> | null, oldTopAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.onSetTopAxis(newTopAxisComponent, oldTopAxisComponent);
    },
    didSetComponent(newTopAxisComponent: AxisComponent<unknown> | null, oldTopAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.didSetTopAxis(newTopAxisComponent, oldTopAxisComponent);
    },
    axisWillSetTrait(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
    },
    axisDidSetTrait(newTopAxisTrait: AxisTrait<unknown> | null, oldTopAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
      this.owner.didSetTopAxisTrait(newTopAxisTrait, oldTopAxisTrait);
    },
    axisWillSetView(newTopAxisView: AxisView<unknown> | null, oldTopAxisView: AxisView<unknown> | null): void {
      this.owner.willSetTopAxisView(newTopAxisView, oldTopAxisView);
    },
    axisDidSetView(newTopAxisView: AxisView<unknown> | null, oldTopAxisView: AxisView<unknown> | null): void {
      this.owner.onSetTopAxisView(newTopAxisView, oldTopAxisView);
      this.owner.didSetTopAxisView(newTopAxisView, oldTopAxisView);
    },
  });

  @ComponentFastener<ChartComponent<X, Y>, AxisComponent<X>>({
    extends: ChartComponent.TopAxisFastener,
  })
  declare topAxis: ComponentFastener<this, AxisComponent<X>>;

  protected createRightAxis(rightAxisTrait: AxisTrait<Y>): AxisComponent<Y> | null {
    return new RightAxisComponent<Y>();
  }

  protected initRightAxis(rightAxisComponent: AxisComponent<Y>): void {
    const rightAxisTrait = rightAxisComponent.axis.trait;
    if (rightAxisTrait !== null) {
      this.initRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisComponent.axis.view;
    if (rightAxisView !== null) {
      this.initRightAxisView(rightAxisView);
    }
  }

  protected attachRightAxis(rightAxisComponent: AxisComponent<Y>): void {
    const rightAxisTrait = rightAxisComponent.axis.trait;
    if (rightAxisTrait !== null) {
      this.attachRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisComponent.axis.view;
    if (rightAxisView !== null) {
      this.attachRightAxisView(rightAxisView);
    }
  }

  protected detachRightAxis(rightAxisComponent: AxisComponent<Y>): void {
    const rightAxisTrait = rightAxisComponent.axis.trait;
    if (rightAxisTrait !== null) {
      this.detachRightAxisTrait(rightAxisTrait);
    }
    const rightAxisView = rightAxisComponent.axis.view;
    if (rightAxisView !== null) {
      this.detachRightAxisView(rightAxisView);
    }
  }

  protected willSetRightAxis(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetRightAxis !== void 0) {
        componentObserver.chartWillSetRightAxis(newRightAxisComponent, oldRightAxisComponent, this);
      }
    }
  }

  protected onSetRightAxis(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null): void {
    if (oldRightAxisComponent !== null) {
      this.detachRightAxis(oldRightAxisComponent);
    }
    if (newRightAxisComponent !== null) {
      this.attachRightAxis(newRightAxisComponent);
      this.initRightAxis(newRightAxisComponent);
    }
  }

  protected didSetRightAxis(newRightAxisComponent: AxisComponent<Y> | null, oldRightAxisComponent: AxisComponent<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetRightAxis !== void 0) {
        componentObserver.chartDidSetRightAxis(newRightAxisComponent, oldRightAxisComponent, this);
      }
    }
  }

  protected insertRightAxisTrait(rightAxisTrait: AxisTrait<Y>, targetTrait: Trait | null = null): void {
    const childComponents = this.childComponents;
    let targetComponent: AxisComponent<unknown> | null = null;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent) {
        if (childComponent.axis.trait === rightAxisTrait) {
          return;
        } else if (childComponent.axis.trait === targetTrait) {
          targetComponent = childComponent;
        }
      }
    }
    const rightAxisComponent = this.createRightAxis(rightAxisTrait);
    if (rightAxisComponent !== null) {
      rightAxisComponent.axis.setTrait(rightAxisTrait);
      this.rightAxis.setComponent(rightAxisComponent, targetComponent);
      this.insertChildComponent(rightAxisComponent, targetComponent);
      if (rightAxisComponent.axis.view === null) {
        const rightAxisView = this.createRightAxisView(rightAxisComponent);
        let targetView: AxisView<unknown> | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          rightAxisComponent.axis.injectView(chartView, rightAxisView, targetView, null);
        } else {
          rightAxisComponent.axis.setView(rightAxisView, targetView);
        }
      }
    }
  }

  protected removeRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    const childComponents = this.childComponents;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent && childComponent.axis.trait === rightAxisTrait) {
        this.rightAxis.setComponent(null);
        childComponent.remove();
        return;
      }
    }
  }

  protected initRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected detachRightAxisTrait(rightAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected willSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetRightAxisTrait !== void 0) {
        componentObserver.chartWillSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait, this);
      }
    }
  }

  protected onSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    if (oldRightAxisTrait !== null) {
      this.detachRightAxisTrait(oldRightAxisTrait);
    }
    if (newRightAxisTrait !== null) {
      this.attachRightAxisTrait(newRightAxisTrait);
      this.initRightAxisTrait(newRightAxisTrait);
    }
  }

  protected didSetRightAxisTrait(newRightAxisTrait: AxisTrait<Y> | null, oldRightAxisTrait: AxisTrait<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetRightAxisTrait !== void 0) {
        componentObserver.chartDidSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait, this);
      }
    }
  }

  protected createRightAxisView(rightAxisComponent: AxisComponent<Y>): AxisView<Y> | null {
    return rightAxisComponent.axis.createView();
  }

  protected initRightAxisView(rightAxisView: AxisView<Y>): void {
    // hook
  }

  protected attachRightAxisView(rightAxisView: AxisView<Y>): void {
    // hook
  }

  protected detachRightAxisView(rightAxisView: AxisView<Y>): void {
    rightAxisView.remove();
  }

  protected willSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetRightAxisView !== void 0) {
        componentObserver.chartWillSetRightAxisView(newRightAxisView, oldRightAxisView, this);
      }
    }
  }

  protected onSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    if (oldRightAxisView !== null) {
      this.detachRightAxisView(oldRightAxisView);
    }
    if (newRightAxisView !== null) {
      this.attachRightAxisView(newRightAxisView);
      this.initRightAxisView(newRightAxisView);
    }
  }

  protected didSetRightAxisView(newRightAxisView: AxisView<Y> | null, oldRightAxisView: AxisView<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetRightAxisView !== void 0) {
        componentObserver.chartDidSetRightAxisView(newRightAxisView, oldRightAxisView, this);
      }
    }
  }

  /** @hidden */
  static RightAxisFastener = ComponentFastener.define<ChartComponent<unknown, unknown>, AxisComponent<unknown>>({
    type: RightAxisComponent,
    observe: true,
    willSetComponent(newRightAxisComponent: AxisComponent<unknown> | null, oldRightAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.willSetRightAxis(newRightAxisComponent, oldRightAxisComponent);
    },
    onSetComponent(newRightAxisComponent: AxisComponent<unknown> | null, oldRightAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.onSetRightAxis(newRightAxisComponent, oldRightAxisComponent);
    },
    didSetComponent(newRightAxisComponent: AxisComponent<unknown> | null, oldRightAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.didSetRightAxis(newRightAxisComponent, oldRightAxisComponent);
    },
    axisWillSetTrait(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
    },
    axisDidSetTrait(newRightAxisTrait: AxisTrait<unknown> | null, oldRightAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
      this.owner.didSetRightAxisTrait(newRightAxisTrait, oldRightAxisTrait);
    },
    axisWillSetView(newRightAxisView: AxisView<unknown> | null, oldRightAxisView: AxisView<unknown> | null): void {
      this.owner.willSetRightAxisView(newRightAxisView, oldRightAxisView);
    },
    axisDidSetView(newRightAxisView: AxisView<unknown> | null, oldRightAxisView: AxisView<unknown> | null): void {
      this.owner.onSetRightAxisView(newRightAxisView, oldRightAxisView);
      this.owner.didSetRightAxisView(newRightAxisView, oldRightAxisView);
    },
  });

  @ComponentFastener<ChartComponent<X, Y>, AxisComponent<Y>>({
    extends: ChartComponent.RightAxisFastener,
  })
  declare rightAxis: ComponentFastener<this, AxisComponent<Y>>;

  protected createBottomAxis(bottomAxisTrait: AxisTrait<X>): AxisComponent<X> | null {
    return new BottomAxisComponent<X>();
  }

  protected initBottomAxis(bottomAxisComponent: AxisComponent<X>): void {
    const bottomAxisTrait = bottomAxisComponent.axis.trait;
    if (bottomAxisTrait !== null) {
      this.initBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisComponent.axis.view;
    if (bottomAxisView !== null) {
      this.initBottomAxisView(bottomAxisView);
    }
  }

  protected attachBottomAxis(bottomAxisComponent: AxisComponent<X>): void {
    const bottomAxisTrait = bottomAxisComponent.axis.trait;
    if (bottomAxisTrait !== null) {
      this.attachBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisComponent.axis.view;
    if (bottomAxisView !== null) {
      this.attachBottomAxisView(bottomAxisView);
    }
  }

  protected detachBottomAxis(bottomAxisComponent: AxisComponent<X>): void {
    const bottomAxisTrait = bottomAxisComponent.axis.trait;
    if (bottomAxisTrait !== null) {
      this.detachBottomAxisTrait(bottomAxisTrait);
    }
    const bottomAxisView = bottomAxisComponent.axis.view;
    if (bottomAxisView !== null) {
      this.detachBottomAxisView(bottomAxisView);
    }
  }

  protected willSetBottomAxis(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetBottomAxis !== void 0) {
        componentObserver.chartWillSetBottomAxis(newBottomAxisComponent, oldBottomAxisComponent, this);
      }
    }
  }

  protected onSetBottomAxis(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null): void {
    if (oldBottomAxisComponent !== null) {
      this.detachBottomAxis(oldBottomAxisComponent);
    }
    if (newBottomAxisComponent !== null) {
      this.attachBottomAxis(newBottomAxisComponent);
      this.initBottomAxis(newBottomAxisComponent);
    }
  }

  protected didSetBottomAxis(newBottomAxisComponent: AxisComponent<X> | null, oldBottomAxisComponent: AxisComponent<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetBottomAxis !== void 0) {
        componentObserver.chartDidSetBottomAxis(newBottomAxisComponent, oldBottomAxisComponent, this);
      }
    }
  }

  protected insertBottomAxisTrait(bottomAxisTrait: AxisTrait<X>, targetTrait: Trait | null = null): void {
    const childComponents = this.childComponents;
    let targetComponent: AxisComponent<unknown> | null = null;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent) {
        if (childComponent.axis.trait === bottomAxisTrait) {
          return;
        } else if (childComponent.axis.trait === targetTrait) {
          targetComponent = childComponent;
        }
      }
    }
    const bottomAxisComponent = this.createBottomAxis(bottomAxisTrait);
    if (bottomAxisComponent !== null) {
      bottomAxisComponent.axis.setTrait(bottomAxisTrait);
      this.bottomAxis.setComponent(bottomAxisComponent, targetComponent);
      this.insertChildComponent(bottomAxisComponent, targetComponent);
      if (bottomAxisComponent.axis.view === null) {
        const bottomAxisView = this.createBottomAxisView(bottomAxisComponent);
        let targetView: AxisView<unknown> | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          bottomAxisComponent.axis.injectView(chartView, bottomAxisView, targetView, null);
        } else {
          bottomAxisComponent.axis.setView(bottomAxisView, targetView);
        }
      }
    }
  }

  protected removeBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    const childComponents = this.childComponents;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent && childComponent.axis.trait === bottomAxisTrait) {
        this.bottomAxis.setComponent(null);
        childComponent.remove();
        return;
      }
    }
  }

  protected initBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected attachBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected detachBottomAxisTrait(bottomAxisTrait: AxisTrait<X>): void {
    // hook
  }

  protected willSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetBottomAxisTrait !== void 0) {
        componentObserver.chartWillSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait, this);
      }
    }
  }

  protected onSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    if (oldBottomAxisTrait !== null) {
      this.detachBottomAxisTrait(oldBottomAxisTrait);
    }
    if (newBottomAxisTrait !== null) {
      this.attachBottomAxisTrait(newBottomAxisTrait);
      this.initBottomAxisTrait(newBottomAxisTrait);
    }
  }

  protected didSetBottomAxisTrait(newBottomAxisTrait: AxisTrait<X> | null, oldBottomAxisTrait: AxisTrait<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetBottomAxisTrait !== void 0) {
        componentObserver.chartDidSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait, this);
      }
    }
  }

  protected createBottomAxisView(bottomAxisComponent: AxisComponent<X>): AxisView<X> | null {
    return bottomAxisComponent.axis.createView();
  }

  protected initBottomAxisView(bottomAxisView: AxisView<X>): void {
    // hook
  }

  protected attachBottomAxisView(bottomAxisView: AxisView<X>): void {
    // hook
  }

  protected detachBottomAxisView(bottomAxisView: AxisView<X>): void {
    bottomAxisView.remove();
  }

  protected willSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetBottomAxisView !== void 0) {
        componentObserver.chartWillSetBottomAxisView(newBottomAxisView, oldBottomAxisView, this);
      }
    }
  }

  protected onSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    if (oldBottomAxisView !== null) {
      this.detachBottomAxisView(oldBottomAxisView);
    }
    if (newBottomAxisView !== null) {
      this.attachBottomAxisView(newBottomAxisView);
      this.initBottomAxisView(newBottomAxisView);
    }
  }

  protected didSetBottomAxisView(newBottomAxisView: AxisView<X> | null, oldBottomAxisView: AxisView<X> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetBottomAxisView !== void 0) {
        componentObserver.chartDidSetBottomAxisView(newBottomAxisView, oldBottomAxisView, this);
      }
    }
  }

  /** @hidden */
  static BottomAxisFastener = ComponentFastener.define<ChartComponent<unknown, unknown>, AxisComponent<unknown>>({
    type: BottomAxisComponent,
    observe: true,
    willSetComponent(newBottomAxisComponent: AxisComponent<unknown> | null, oldBottomAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.willSetBottomAxis(newBottomAxisComponent, oldBottomAxisComponent);
    },
    onSetComponent(newBottomAxisComponent: AxisComponent<unknown> | null, oldBottomAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.onSetBottomAxis(newBottomAxisComponent, oldBottomAxisComponent);
    },
    didSetComponent(newBottomAxisComponent: AxisComponent<unknown> | null, oldBottomAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.didSetBottomAxis(newBottomAxisComponent, oldBottomAxisComponent);
    },
    axisWillSetTrait(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
    },
    axisDidSetTrait(newBottomAxisTrait: AxisTrait<unknown> | null, oldBottomAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
      this.owner.didSetBottomAxisTrait(newBottomAxisTrait, oldBottomAxisTrait);
    },
    axisWillSetView(newBottomAxisView: AxisView<unknown> | null, oldBottomAxisView: AxisView<unknown> | null): void {
      this.owner.willSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
    },
    axisDidSetView(newBottomAxisView: AxisView<unknown> | null, oldBottomAxisView: AxisView<unknown> | null): void {
      this.owner.onSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
      this.owner.didSetBottomAxisView(newBottomAxisView, oldBottomAxisView);
    },
  });

  @ComponentFastener<ChartComponent<X, Y>, AxisComponent<X>>({
    extends: ChartComponent.BottomAxisFastener,
  })
  declare bottomAxis: ComponentFastener<this, AxisComponent<X>>;

  protected createLeftAxis(leftAxisTrait: AxisTrait<Y>): AxisComponent<Y> | null {
    return new LeftAxisComponent<Y>();
  }

  protected initLeftAxis(leftAxisComponent: AxisComponent<Y>): void {
    const leftAxisTrait = leftAxisComponent.axis.trait;
    if (leftAxisTrait !== null) {
      this.initLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisComponent.axis.view;
    if (leftAxisView !== null) {
      this.initLeftAxisView(leftAxisView);
    }
  }

  protected attachLeftAxis(leftAxisComponent: AxisComponent<Y>): void {
    const leftAxisTrait = leftAxisComponent.axis.trait;
    if (leftAxisTrait !== null) {
      this.attachLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisComponent.axis.view;
    if (leftAxisView !== null) {
      this.attachLeftAxisView(leftAxisView);
    }
  }

  protected detachLeftAxis(leftAxisComponent: AxisComponent<Y>): void {
    const leftAxisTrait = leftAxisComponent.axis.trait;
    if (leftAxisTrait !== null) {
      this.detachLeftAxisTrait(leftAxisTrait);
    }
    const leftAxisView = leftAxisComponent.axis.view;
    if (leftAxisView !== null) {
      this.detachLeftAxisView(leftAxisView);
    }
  }

  protected willSetLeftAxis(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetLeftAxis !== void 0) {
        componentObserver.chartWillSetLeftAxis(newLeftAxisComponent, oldLeftAxisComponent, this);
      }
    }
  }

  protected onSetLeftAxis(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null): void {
    if (oldLeftAxisComponent !== null) {
      this.detachLeftAxis(oldLeftAxisComponent);
    }
    if (newLeftAxisComponent !== null) {
      this.attachLeftAxis(newLeftAxisComponent);
      this.initLeftAxis(newLeftAxisComponent);
    }
  }

  protected didSetLeftAxis(newLeftAxisComponent: AxisComponent<Y> | null, oldLeftAxisComponent: AxisComponent<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetLeftAxis !== void 0) {
        componentObserver.chartDidSetLeftAxis(newLeftAxisComponent, oldLeftAxisComponent, this);
      }
    }
  }

  protected insertLeftAxisTrait(leftAxisTrait: AxisTrait<Y>, targetTrait: Trait | null = null): void {
    const childComponents = this.childComponents;
    let targetComponent: AxisComponent<unknown> | null = null;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent) {
        if (childComponent.axis.trait === leftAxisTrait) {
          return;
        } else if (childComponent.axis.trait === targetTrait) {
          targetComponent = childComponent;
        }
      }
    }
    const leftAxisComponent = this.createLeftAxis(leftAxisTrait);
    if (leftAxisComponent !== null) {
      leftAxisComponent.axis.setTrait(leftAxisTrait);
      this.leftAxis.setComponent(leftAxisComponent, targetComponent);
      this.insertChildComponent(leftAxisComponent, targetComponent);
      if (leftAxisComponent.axis.view === null) {
        const leftAxisView = this.createLeftAxisView(leftAxisComponent);
        let targetView: AxisView<unknown> | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.axis.view;
        }
        const chartView = this.chart.view;
        if (chartView !== null) {
          leftAxisComponent.axis.injectView(chartView, leftAxisView, targetView, null);
        } else {
          leftAxisComponent.axis.setView(leftAxisView, targetView);
        }
      }
    }
  }

  protected removeLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    const childComponents = this.childComponents;
    for (let i = 0, n = childComponents.length; i < n; i += 1) {
      const childComponent = childComponents[i]!;
      if (childComponent instanceof AxisComponent && childComponent.axis.trait === leftAxisTrait) {
        this.leftAxis.setComponent(null);
        childComponent.remove();
        return;
      }
    }
  }

  protected initLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected attachLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected detachLeftAxisTrait(leftAxisTrait: AxisTrait<Y>): void {
    // hook
  }

  protected willSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetLeftAxisTrait !== void 0) {
        componentObserver.chartWillSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait, this);
      }
    }
  }

  protected onSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    if (oldLeftAxisTrait !== null) {
      this.detachLeftAxisTrait(oldLeftAxisTrait);
    }
    if (newLeftAxisTrait !== null) {
      this.attachLeftAxisTrait(newLeftAxisTrait);
      this.initLeftAxisTrait(newLeftAxisTrait);
    }
  }

  protected didSetLeftAxisTrait(newLeftAxisTrait: AxisTrait<Y> | null, oldLeftAxisTrait: AxisTrait<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetLeftAxisTrait !== void 0) {
        componentObserver.chartDidSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait, this);
      }
    }
  }

  protected createLeftAxisView(leftAxisComponent: AxisComponent<Y>): AxisView<Y> | null {
    return leftAxisComponent.axis.createView();
  }

  protected initLeftAxisView(leftAxisView: AxisView<Y>): void {
    // hook
  }

  protected attachLeftAxisView(leftAxisView: AxisView<Y>): void {
    // hook
  }

  protected detachLeftAxisView(leftAxisView: AxisView<Y>): void {
    leftAxisView.remove();
  }

  protected willSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartWillSetLeftAxisView !== void 0) {
        componentObserver.chartWillSetLeftAxisView(newLeftAxisView, oldLeftAxisView, this);
      }
    }
  }

  protected onSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    if (oldLeftAxisView !== null) {
      this.detachLeftAxisView(oldLeftAxisView);
    }
    if (newLeftAxisView !== null) {
      this.attachLeftAxisView(newLeftAxisView);
      this.initLeftAxisView(newLeftAxisView);
    }
  }

  protected didSetLeftAxisView(newLeftAxisView: AxisView<Y> | null, oldLeftAxisView: AxisView<Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.chartDidSetLeftAxisView !== void 0) {
        componentObserver.chartDidSetLeftAxisView(newLeftAxisView, oldLeftAxisView, this);
      }
    }
  }

  /** @hidden */
  static LeftAxisFastener = ComponentFastener.define<ChartComponent<unknown, unknown>, AxisComponent<unknown>>({
    type: LeftAxisComponent,
    observe: true,
    willSetComponent(newLeftAxisComponent: AxisComponent<unknown> | null, oldLeftAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.willSetLeftAxis(newLeftAxisComponent, oldLeftAxisComponent);
    },
    onSetComponent(newLeftAxisComponent: AxisComponent<unknown> | null, oldLeftAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.onSetLeftAxis(newLeftAxisComponent, oldLeftAxisComponent);
    },
    didSetComponent(newLeftAxisComponent: AxisComponent<unknown> | null, oldLeftAxisComponent: AxisComponent<unknown> | null): void {
      this.owner.didSetLeftAxis(newLeftAxisComponent, oldLeftAxisComponent);
    },
    axisWillSetTrait(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.willSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
    },
    axisDidSetTrait(newLeftAxisTrait: AxisTrait<unknown> | null, oldLeftAxisTrait: AxisTrait<unknown> | null): void {
      this.owner.onSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
      this.owner.didSetLeftAxisTrait(newLeftAxisTrait, oldLeftAxisTrait);
    },
    axisWillSetView(newLeftAxisView: AxisView<unknown> | null, oldLeftAxisView: AxisView<unknown> | null): void {
      this.owner.willSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
    },
    axisDidSetView(newLeftAxisView: AxisView<unknown> | null, oldLeftAxisView: AxisView<unknown> | null): void {
      this.owner.onSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
      this.owner.didSetLeftAxisView(newLeftAxisView, oldLeftAxisView);
    },
  });

  @ComponentFastener<ChartComponent<X, Y>, AxisComponent<Y>>({
    extends: ChartComponent.LeftAxisFastener,
  })
  declare leftAxis: ComponentFastener<this, AxisComponent<Y>>;

  protected detectTopAxisComponent(component: Component): AxisComponent<X> | null {
    return component instanceof TopAxisComponent ? component : null;
  }

  protected detectRightAxisComponent(component: Component): AxisComponent<Y> | null {
    return component instanceof RightAxisComponent ? component : null;
  }

  protected detectBottomAxisComponent(component: Component): AxisComponent<X> | null {
    return component instanceof BottomAxisComponent ? component : null;
  }

  protected detectLeftAxisComponent(component: Component): AxisComponent<Y> | null {
    return component instanceof LeftAxisComponent ? component : null;
  }

  protected onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const topAxisComponent = this.detectTopAxisComponent(childComponent);
    if (topAxisComponent !== null) {
      this.topAxis.setComponent(topAxisComponent, targetComponent);
    }
    const rightAxisComponent = this.detectRightAxisComponent(childComponent);
    if (rightAxisComponent !== null) {
      this.rightAxis.setComponent(rightAxisComponent, targetComponent);
    }
    const bottomAxisComponent = this.detectBottomAxisComponent(childComponent);
    if (bottomAxisComponent !== null) {
      this.bottomAxis.setComponent(bottomAxisComponent, targetComponent);
    }
    const leftAxisComponent = this.detectLeftAxisComponent(childComponent);
    if (leftAxisComponent !== null) {
      this.leftAxis.setComponent(leftAxisComponent, targetComponent);
    }
  }

  protected onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const topAxisComponent = this.detectTopAxisComponent(childComponent);
    if (topAxisComponent !== null) {
      this.topAxis.setComponent(null);
    }
    const rightAxisComponent = this.detectRightAxisComponent(childComponent);
    if (rightAxisComponent !== null) {
      this.rightAxis.setComponent(null);
    }
    const bottomAxisComponent = this.detectBottomAxisComponent(childComponent);
    if (bottomAxisComponent !== null) {
      this.bottomAxis.setComponent(null);
    }
    const leftAxisComponent = this.detectLeftAxisComponent(childComponent);
    if (leftAxisComponent !== null) {
      this.leftAxis.setComponent(null);
    }
  }
}
