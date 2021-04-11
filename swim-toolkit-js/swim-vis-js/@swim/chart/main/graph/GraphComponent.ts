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
import type {Length} from "@swim/math";
import type {Trait} from "@swim/model";
import type {Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import {Component, ComponentViewTrait, ComponentFastener, CompositeComponent} from "@swim/component";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointComponent} from "../data/DataPointComponent";
import type {DataSetTrait} from "../data/DataSetTrait";
import type {PlotView} from "../plot/PlotView";
import type {PlotTrait} from "../plot/PlotTrait";
import {PlotComponent} from "../plot/PlotComponent";
import {GraphView} from "./GraphView";
import {GraphTrait} from "./GraphTrait";
import type {GraphComponentObserver} from "./GraphComponentObserver";

export class GraphComponent<X, Y> extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "plotFasteners", {
      value: [],
      enumerable: true,
    });
  }

  declare readonly componentObservers: ReadonlyArray<GraphComponentObserver<X, Y>>;

  protected initGraphTrait(graphTrait: GraphTrait<X, Y>): void {
    // hook
  }

  protected attachGraphTrait(graphTrait: GraphTrait<X, Y>): void {
    const plotFasteners = graphTrait.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        this.insertPlotTrait(plotTrait);
      }
    }
  }

  protected detachGraphTrait(graphTrait: GraphTrait<X, Y>): void {
    const plotFasteners = graphTrait.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotTrait = plotFasteners[i]!.trait;
      if (plotTrait !== null) {
        this.removePlotTrait(plotTrait);
      }
    }
  }

  protected willSetGraphTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGraphTrait !== void 0) {
        componentObserver.componentWillSetGraphTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected onSetGraphTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null): void {
    if (oldGraphTrait !== null) {
      this.detachGraphTrait(oldGraphTrait);
    }
    if (newGraphTrait !== null) {
      this.attachGraphTrait(newGraphTrait);
      this.initGraphTrait(newGraphTrait);
    }
  }

  protected didSetGraphTrait(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGraphTrait !== void 0) {
        componentObserver.componentDidSetGraphTrait(newGraphTrait, oldGraphTrait, this);
      }
    }
  }

  protected createGraphView(): GraphView<X, Y> | null {
    return GraphView.create<X, Y>();
  }

  protected initGraphView(graphView: GraphView<X, Y>): void {
    // hook
  }

  protected attachGraphView(graphView: GraphView<X, Y>): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotComponent = plotFasteners[i]!.component;
      if (plotComponent !== null) {
        const plotView = plotComponent.plot.view;
        if (plotView !== null && plotView.parentView === null) {
          plotComponent.plot.injectView(graphView);
        }
      }
    }
  }

  protected detachGraphView(graphView: GraphView<X, Y>): void {
    // hook
  }

  protected willSetGraphView(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGraphView !== void 0) {
        componentObserver.componentWillSetGraphView(newGraphView, oldGraphView, this);
      }
    }
  }

  protected onSetGraphView(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null): void {
    if (oldGraphView !== null) {
      this.detachGraphView(oldGraphView);
    }
    if (newGraphView !== null) {
      this.attachGraphView(newGraphView);
      this.initGraphView(newGraphView);
    }
  }

  protected didSetGraphView(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGraphView !== void 0) {
        componentObserver.componentDidSetGraphView(newGraphView, oldGraphView, this);
      }
    }
  }

  protected themeGraphView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, graphView: GraphView<X, Y>): void {
    // hook
  }

  /** @hidden */
  static GraphFastener = ComponentViewTrait.define<GraphComponent<unknown, unknown>, GraphView<unknown, unknown>, GraphTrait<unknown, unknown>>({
    viewType: GraphView,
    observeView: true,
    willSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.willSetGraphView(newGraphView, oldGraphView);
    },
    onSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.onSetGraphView(newGraphView, oldGraphView);
    },
    didSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.didSetGraphView(newGraphView, oldGraphView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, graphView: GraphView<unknown, unknown>): void {
      this.owner.themeGraphView(theme, mood, timing, graphView);
    },
    createView(): GraphView<unknown, unknown> | null {
      return this.owner.createGraphView();
    },
    traitType: GraphTrait,
    observeTrait: true,
    willSetTrait(newGraphTrait: GraphTrait<unknown, unknown> | null, oldGraphTrait: GraphTrait<unknown, unknown> | null): void {
      this.owner.willSetGraphTrait(newGraphTrait, oldGraphTrait);
    },
    onSetTrait(newGraphTrait: GraphTrait<unknown, unknown> | null, oldGraphTrait: GraphTrait<unknown, unknown> | null): void {
      this.owner.onSetGraphTrait(newGraphTrait, oldGraphTrait);
    },
    didSetTrait(newGraphTrait: GraphTrait<unknown, unknown> | null, oldGraphTrait: GraphTrait<unknown, unknown> | null): void {
      this.owner.didSetGraphTrait(newGraphTrait, oldGraphTrait);
    },
    traitWillSetPlot(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null, targetTrait: Trait): void {
      if (oldPlotTrait !== null) {
        this.owner.removePlotTrait(oldPlotTrait);
      }
    },
    traitDidSetPlot(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null, targetTrait: Trait): void {
      if (newPlotTrait !== null) {
        this.owner.insertPlotTrait(newPlotTrait, targetTrait);
      }
    },
  });

  @ComponentViewTrait<GraphComponent<X, Y>, GraphView<X, Y>, GraphTrait<X, Y>>({
    extends: GraphComponent.GraphFastener,
  })
  declare graph: ComponentViewTrait<this, GraphView<X, Y>, GraphTrait<X, Y>>;

  insertPlot(plotComponent: PlotComponent<X, Y>, targetComponent: Component | null = null): void {
    const plotFasteners = this.plotFasteners as ComponentFastener<this, PlotComponent<X, Y>>[];
    let targetIndex = plotFasteners.length;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.component === plotComponent) {
        return;
      } else if (plotFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const plotFastener = this.createPlotFastener(plotComponent);
    plotFasteners.splice(targetIndex, 0, plotFastener);
    plotFastener.setComponent(plotComponent, targetComponent);
    if (this.isMounted()) {
      plotFastener.mount();
    }
  }

  removePlot(plotComponent: PlotComponent<X, Y>): void {
    const plotFasteners = this.plotFasteners as ComponentFastener<this, PlotComponent<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.component === plotComponent) {
        plotFastener.setComponent(null);
        if (this.isMounted()) {
          plotFastener.unmount();
        }
        plotFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createPlot(plotTrait: PlotTrait<X, Y>): PlotComponent<X, Y> | null {
    return PlotComponent.createPlot(plotTrait);
  }

  protected initPlot(plotComponent: PlotComponent<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const plotTrait = plotComponent.plot.trait;
    if (plotTrait !== null) {
      this.initPlotTrait(plotTrait, plotFastener);
    }
    const plotView = plotComponent.plot.view;
    if (plotView !== null) {
      this.initPlotView(plotView, plotFastener);
    }

    const dataSetTrait = plotComponent.dataSet.trait;
    if (dataSetTrait !== null) {
      this.initDataSetTrait(dataSetTrait, plotFastener);
    }
  }

  protected attachPlot(plotComponent: PlotComponent<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const plotTrait = plotComponent.plot.trait;
    if (plotTrait !== null) {
      this.attachPlotTrait(plotTrait, plotFastener);
    }
    const plotView = plotComponent.plot.view;
    if (plotView !== null) {
      this.attachPlotView(plotView, plotFastener);
    }

    const dataSetTrait = plotComponent.dataSet.trait;
    if (dataSetTrait !== null) {
      this.attachDataSetTrait(dataSetTrait, plotFastener);
    }
  }

  protected detachPlot(plotComponent: PlotComponent<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const dataSetTrait = plotComponent.dataSet.trait;
    if (dataSetTrait !== null) {
      this.detachDataSetTrait(dataSetTrait, plotFastener);
    }

    const plotView = plotComponent.plot.view;
    if (plotView !== null) {
      this.detachPlotView(plotView, plotFastener);
    }
    const plotTrait = plotComponent.plot.trait;
    if (plotTrait !== null) {
      this.detachPlotTrait(plotTrait, plotFastener);
    }
  }

  protected willSetPlot(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null,
                        plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlot !== void 0) {
        componentObserver.componentWillSetPlot(newPlotComponent, oldPlotComponent, plotFastener);
      }
    }
  }

  protected onSetPlot(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null,
                      plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldPlotComponent !== null) {
      this.detachPlot(oldPlotComponent, plotFastener);
    }
    if (newPlotComponent !== null) {
      this.attachPlot(newPlotComponent, plotFastener);
      this.initPlot(newPlotComponent, plotFastener);
    }
  }

  protected didSetPlot(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null,
                       plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlot !== void 0) {
        componentObserver.componentDidSetPlot(newPlotComponent, oldPlotComponent, plotFastener);
      }
    }
  }

  insertPlotTrait(plotTrait: PlotTrait<X, Y>, targetTrait: Trait | null = null): void {
    const plotFasteners = this.plotFasteners as ComponentFastener<this, PlotComponent<X, Y>>[];
    let targetComponent: PlotComponent<X, Y> | null = null;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotComponent = plotFasteners[i]!.component;
      if (plotComponent !== null) {
        if (plotComponent.plot.trait === plotTrait) {
          return;
        } else if (plotComponent.plot.trait === targetTrait) {
          targetComponent = plotComponent;
        }
      }
    }
    const plotComponent = this.createPlot(plotTrait);
    if (plotComponent !== null) {
      plotComponent.plot.setTrait(plotTrait);
      this.insertChildComponent(plotComponent, targetComponent);
      if (plotComponent.plot.view === null) {
        const plotView = this.createPlotView(plotComponent);
        let targetView: PlotView<X, Y> | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.plot.view;
        }
        const graphView = this.graph.view;
        if (graphView !== null) {
          plotComponent.plot.injectView(graphView, plotView, targetView, null);
        } else {
          plotComponent.plot.setView(plotView, targetView);
        }
      }
    }
  }

  removePlotTrait(plotTrait: PlotTrait<X, Y>): void {
    const plotFasteners = this.plotFasteners as ComponentFastener<this, PlotComponent<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      const plotComponent = plotFastener.component;
      if (plotComponent !== null && plotComponent.plot.trait === plotTrait) {
        plotFastener.setComponent(null);
        if (this.isMounted()) {
          plotFastener.unmount();
        }
        plotFasteners.splice(i, 1);
        plotComponent.remove();
        return;
      }
    }
  }

  protected initPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected attachPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected detachPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                             plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotTrait !== void 0) {
        componentObserver.componentWillSetPlotTrait(newPlotTrait, oldPlotTrait, plotFastener);
      }
    }
  }

  protected onSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                           plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldPlotTrait !== null) {
      this.detachPlotTrait(oldPlotTrait, plotFastener);
    }
    if (newPlotTrait !== null) {
      this.attachPlotTrait(newPlotTrait, plotFastener);
      this.initPlotTrait(newPlotTrait, plotFastener);
    }
  }

  protected didSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotTrait !== void 0) {
        componentObserver.componentDidSetPlotTrait(newPlotTrait, oldPlotTrait, plotFastener);
      }
    }
  }

  protected createPlotView(plotComponent: PlotComponent<X, Y>): PlotView<X, Y> | null {
    return plotComponent.plot.createView();
  }

  protected initPlotView(plotView: PlotView<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected attachPlotView(plotView: PlotView<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected detachPlotView(plotView: PlotView<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    plotView.remove();
  }

  protected willSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetPlotView !== void 0) {
        componentObserver.componentWillSetPlotView(newPlotView, oldPlotView, plotFastener);
      }
    }
  }

  protected onSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                          plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldPlotView !== null) {
      this.detachPlotView(oldPlotView, plotFastener);
    }
    if (newPlotView !== null) {
      this.attachPlotView(newPlotView, plotFastener);
      this.initPlotView(newPlotView, plotFastener);
    }
  }

  protected didSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                           plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetPlotView !== void 0) {
        componentObserver.componentDidSetPlotView(newPlotView, oldPlotView, plotFastener);
      }
    }
  }

  protected initDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected attachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected detachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected willSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDataSetTrait !== void 0) {
        componentObserver.componentWillSetDataSetTrait(newDataSetTrait, oldDataSetTrait, plotFastener);
      }
    }
  }

  protected onSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                              plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldDataSetTrait !== null) {
      this.detachDataSetTrait(oldDataSetTrait, plotFastener);
    }
    if (newDataSetTrait !== null) {
      this.attachDataSetTrait(newDataSetTrait, plotFastener);
      this.initDataSetTrait(newDataSetTrait, plotFastener);
    }
  }

  protected didSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                               plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDataSetTrait !== void 0) {
        componentObserver.componentDidSetDataSetTrait(newDataSetTrait, oldDataSetTrait, plotFastener);
      }
    }
  }

  protected initDataPoint(dataPointComponent: DataPointComponent<X, Y>,
                          dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                          plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const dataPointTrait = dataPointComponent.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.initDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointComponent.dataPoint.view;
    if (dataPointView !== null) {
      this.initDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected attachDataPoint(dataPointComponent: DataPointComponent<X, Y>,
                            dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const dataPointTrait = dataPointComponent.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.attachDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointComponent.dataPoint.view;
    if (dataPointView !== null) {
      this.attachDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected detachDataPoint(dataPointComponent: DataPointComponent<X, Y>,
                            dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const dataPointTrait = dataPointComponent.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.detachDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointComponent.dataPoint.view;
    if (dataPointView !== null) {
      this.detachDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected willSetDataPoint(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null,
                             dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                             plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDataPoint !== void 0) {
        componentObserver.componentWillSetDataPoint(newDataPointComponent, oldDataPointComponent, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPoint(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null,
                           dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                           plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldDataPointComponent !== null) {
      this.detachDataPoint(oldDataPointComponent, dataPointFastener, plotFastener);
    }
    if (newDataPointComponent !== null) {
      this.attachDataPoint(newDataPointComponent, dataPointFastener, plotFastener);
      this.initDataPoint(newDataPointComponent, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPoint(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null,
                            dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDataPoint !== void 0) {
        componentObserver.componentDidSetDataPoint(newDataPointComponent, oldDataPointComponent, dataPointFastener, plotFastener);
      }
    }
  }

  protected initDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                               dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                               plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                 plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                 plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected willSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                  dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                  plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDataPointTrait !== void 0) {
        componentObserver.componentWillSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldDataPointTrait !== null) {
      this.detachDataPointTrait(oldDataPointTrait, dataPointFastener, plotFastener);
    }
    if (newDataPointTrait !== null) {
      this.attachDataPointTrait(newDataPointTrait, dataPointFastener, plotFastener);
      this.initDataPointTrait(newDataPointTrait, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                 plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDataPointTrait !== void 0) {
        componentObserver.componentDidSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, plotFastener);
      }
    }
  }

  protected initDataPointView(dataPointView: DataPointView<X, Y>,
                              dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                              plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.initDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected attachDataPointView(dataPointView: DataPointView<X, Y>,
                                dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.attachDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected detachDataPointView(dataPointView: DataPointView<X, Y>,
                                dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.detachDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected willSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                 plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDataPointView !== void 0) {
        componentObserver.componentWillSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                               dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                               plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldDataPointView !== null) {
      this.detachDataPointView(oldDataPointView, dataPointFastener, plotFastener);
    }
    if (newDataPointView !== null) {
      this.attachDataPointView(newDataPointView, dataPointFastener, plotFastener);
      this.initDataPointView(newDataPointView, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDataPointView !== void 0) {
        componentObserver.componentDidSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointX(newX: X | undefined, oldX: X | undefined,
                            dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected onSetDataPointY(newY: Y | undefined, oldY: Y | undefined,
                            dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                            plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected onSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined,
                             dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                             plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected onSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                 plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected onSetDataPointColor(newColor: Color | null, oldColor: Color | null,
                                dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected onSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined,
                                  dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                  plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected initDataPointLabelView(labelView: GraphicsView,
                                   dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                   plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected attachDataPointLabelView(labelView: GraphicsView,
                                     dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                     plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected detachDataPointLabelView(labelView: GraphicsView,
                                     dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                     plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    // hook
  }

  protected willSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                      dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                      plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDataPointLabelView !== void 0) {
        componentObserver.componentWillSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                    dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                    plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    if (oldLabelView !== null) {
      this.detachDataPointLabelView(oldLabelView, dataPointFastener, plotFastener);
    }
    if (newLabelView !== null) {
      this.attachDataPointLabelView(newLabelView, dataPointFastener, plotFastener);
      this.initDataPointLabelView(newLabelView, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                     dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>,
                                     plotFastener: ComponentFastener<this, PlotComponent<X, Y>>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDataPointLabelView !== void 0) {
        componentObserver.componentDidSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, plotFastener);
      }
    }
  }

  /** @hidden */
  static PlotFastener = ComponentFastener.define<GraphComponent<unknown, unknown>, PlotComponent<unknown, unknown>>({
    type: PlotComponent,
    child: false,
    observe: true,
    willSetComponent(newPlotComponent: PlotComponent<unknown, unknown> | null, oldPlotComponent: PlotComponent<unknown, unknown> | null): void {
      this.owner.willSetPlot(newPlotComponent, oldPlotComponent, this);
    },
    onSetComponent(newPlotComponent: PlotComponent<unknown, unknown> | null, oldPlotComponent: PlotComponent<unknown, unknown> | null): void {
      this.owner.onSetPlot(newPlotComponent, oldPlotComponent, this);
    },
    didSetComponent(newPlotComponent: PlotComponent<unknown, unknown> | null, oldPlotComponent: PlotComponent<unknown, unknown> | null): void {
      this.owner.didSetPlot(newPlotComponent, oldPlotComponent, this);
    },
    componentWillSetPlotTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait, this);
    },
    componentDidSetPlotTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait, this);
    },
    componentWillSetPlotView(newPlotView: PlotView<unknown, unknown> | null, oldPlotView: PlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView, this);
    },
    componentDidSetPlotView(newPlotView: PlotView<unknown, unknown> | null, oldPlotView: PlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView, this);
      this.owner.didSetPlotView(newPlotView, oldPlotView, this);
    },
    componentWillSetDataSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.willSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
    },
    componentDidSetDataSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.onSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
      this.owner.didSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
    },
    componentWillSetDataPoint(newDataPointComponent: DataPointComponent<unknown, unknown> | null, oldDataPointComponent: DataPointComponent<unknown, unknown> | null,
                              dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.willSetDataPoint(newDataPointComponent, oldDataPointComponent, dataPointFastener, this);
    },
    componentDidSetDataPoint(newDataPointComponent: DataPointComponent<unknown, unknown> | null, oldDataPointComponent: DataPointComponent<unknown, unknown> | null,
                             dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPoint(newDataPointComponent, oldDataPointComponent, dataPointFastener, this);
      this.owner.didSetDataPoint(newDataPointComponent, oldDataPointComponent, dataPointFastener, this);
    },
    componentWillSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null,
                                   dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.willSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
    },
    componentDidSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null,
                                  dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
      this.owner.didSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
    },
    componentWillSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null,
                                  dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.willSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
    },
    componentDidSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null,
                                 dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
      this.owner.didSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
    },
    componentDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined,
                              dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointX(newX, oldX, dataPointFastener, this);
    },
    componentDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined,
                              dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointY(newY, oldY, dataPointFastener, this);
    },
    componentDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined,
                               dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointY2(newY2, oldY2, dataPointFastener, this);
    },
    componentDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null,
                                   dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointRadius(newRadius, oldRadius, dataPointFastener, this);
    },
    componentDidSetDataPointColor(newColor: Color | null, oldColor: Color | null,
                                  dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointColor(newColor, oldColor, dataPointFastener, this);
    },
    componentWillSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                       dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.willSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
    },
    componentDidSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                      dataPointFastener: ComponentFastener<PlotComponent<unknown, unknown>, DataPointComponent<unknown, unknown>>): void {
      this.owner.onSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
      this.owner.didSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
    },
  });

  protected createPlotFastener(plotComponent: PlotComponent<X, Y>): ComponentFastener<this, PlotComponent<X, Y>> {
    return new GraphComponent.PlotFastener(this as GraphComponent<unknown, unknown>, plotComponent.key, "plot") as ComponentFastener<this, PlotComponent<X, Y>>;
  }

  /** @hidden */
  declare readonly plotFasteners: ReadonlyArray<ComponentFastener<this, PlotComponent<X, Y>>>;

  protected getPlotFastener(plotTrait: PlotTrait<X, Y>): ComponentFastener<this, PlotComponent<X, Y>> | null {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      const plotComponent = plotFastener.component;
      if (plotComponent !== null && plotComponent.plot.trait === plotTrait) {
        return plotFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.mount();
    }
  }

  /** @hidden */
  protected unmountPlotFasteners(): void {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      plotFastener.unmount();
    }
  }

  protected detectPlotComponent(component: Component): PlotComponent<X, Y> | null {
    return component instanceof PlotComponent ? component : null;
  }

  protected onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const plotComponent = this.detectPlotComponent(childComponent);
    if (plotComponent !== null) {
      this.insertPlot(plotComponent, targetComponent);
    }
  }

  protected onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const plotComponent = this.detectPlotComponent(childComponent);
    if (plotComponent !== null) {
      this.removePlot(plotComponent);
    }
  }

  /** @hidden */
  protected mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountPlotFasteners();
  }

  /** @hidden */
  protected unmountComponentFasteners(): void {
    this.unmountPlotFasteners();
    super.unmountComponentFasteners();
  }
}
