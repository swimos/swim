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

import type {Length} from "@swim/math";
import type {Trait} from "@swim/model";
import type {Color} from "@swim/style";
import type {GraphicsView} from "@swim/graphics";
import {Controller, ControllerViewTrait, ControllerFastener, CompositeController} from "@swim/controller";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointController} from "../data/DataPointController";
import type {DataSetTrait} from "../data/DataSetTrait";
import type {PlotView} from "../plot/PlotView";
import type {PlotTrait} from "../plot/PlotTrait";
import {PlotController} from "../plot/PlotController";
import {GraphView} from "./GraphView";
import {GraphTrait} from "./GraphTrait";
import type {GraphControllerObserver} from "./GraphControllerObserver";

export class GraphController<X, Y> extends CompositeController {
  constructor() {
    super();
    Object.defineProperty(this, "plotFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly controllerObservers!: ReadonlyArray<GraphControllerObserver<X, Y>>;

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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGraphTrait !== void 0) {
        controllerObserver.controllerWillSetGraphTrait(newGraphTrait, oldGraphTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGraphTrait !== void 0) {
        controllerObserver.controllerDidSetGraphTrait(newGraphTrait, oldGraphTrait, this);
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
      const plotController = plotFasteners[i]!.controller;
      if (plotController !== null) {
        const plotView = plotController.plot.view;
        if (plotView !== null && plotView.parentView === null) {
          plotController.plot.injectView(graphView);
        }
      }
    }
  }

  protected detachGraphView(graphView: GraphView<X, Y>): void {
    // hook
  }

  protected willSetGraphView(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGraphView !== void 0) {
        controllerObserver.controllerWillSetGraphView(newGraphView, oldGraphView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGraphView !== void 0) {
        controllerObserver.controllerDidSetGraphView(newGraphView, oldGraphView, this);
      }
    }
  }

  /** @hidden */
  static GraphFastener = ControllerViewTrait.define<GraphController<unknown, unknown>, GraphView<unknown, unknown>, GraphTrait<unknown, unknown>>({
    viewType: GraphView,
    willSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.willSetGraphView(newGraphView, oldGraphView);
    },
    onSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.onSetGraphView(newGraphView, oldGraphView);
    },
    didSetView(newGraphView: GraphView<unknown, unknown> | null, oldGraphView: GraphView<unknown, unknown> | null): void {
      this.owner.didSetGraphView(newGraphView, oldGraphView);
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

  @ControllerViewTrait<GraphController<X, Y>, GraphView<X, Y>, GraphTrait<X, Y>>({
    extends: GraphController.GraphFastener,
  })
  readonly graph!: ControllerViewTrait<this, GraphView<X, Y>, GraphTrait<X, Y>>;

  insertPlot(plotController: PlotController<X, Y>, targetController: Controller | null = null): void {
    const plotFasteners = this.plotFasteners as ControllerFastener<this, PlotController<X, Y>>[];
    let targetIndex = plotFasteners.length;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.controller === plotController) {
        return;
      } else if (plotFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const plotFastener = this.createPlotFastener(plotController);
    plotFasteners.splice(targetIndex, 0, plotFastener);
    plotFastener.setController(plotController, targetController);
    if (this.isMounted()) {
      plotFastener.mount();
    }
  }

  removePlot(plotController: PlotController<X, Y>): void {
    const plotFasteners = this.plotFasteners as ControllerFastener<this, PlotController<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      if (plotFastener.controller === plotController) {
        plotFastener.setController(null);
        if (this.isMounted()) {
          plotFastener.unmount();
        }
        plotFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createPlot(plotTrait: PlotTrait<X, Y>): PlotController<X, Y> | null {
    return PlotController.createPlot(plotTrait);
  }

  protected initPlot(plotController: PlotController<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const plotTrait = plotController.plot.trait;
    if (plotTrait !== null) {
      this.initPlotTrait(plotTrait, plotFastener);
    }
    const plotView = plotController.plot.view;
    if (plotView !== null) {
      this.initPlotView(plotView, plotFastener);
    }

    const dataSetTrait = plotController.dataSet.trait;
    if (dataSetTrait !== null) {
      this.initDataSetTrait(dataSetTrait, plotFastener);
    }
  }

  protected attachPlot(plotController: PlotController<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const plotTrait = plotController.plot.trait;
    if (plotTrait !== null) {
      this.attachPlotTrait(plotTrait, plotFastener);
    }
    const plotView = plotController.plot.view;
    if (plotView !== null) {
      this.attachPlotView(plotView, plotFastener);
    }

    const dataSetTrait = plotController.dataSet.trait;
    if (dataSetTrait !== null) {
      this.attachDataSetTrait(dataSetTrait, plotFastener);
    }
  }

  protected detachPlot(plotController: PlotController<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const dataSetTrait = plotController.dataSet.trait;
    if (dataSetTrait !== null) {
      this.detachDataSetTrait(dataSetTrait, plotFastener);
    }

    const plotView = plotController.plot.view;
    if (plotView !== null) {
      this.detachPlotView(plotView, plotFastener);
    }
    const plotTrait = plotController.plot.trait;
    if (plotTrait !== null) {
      this.detachPlotTrait(plotTrait, plotFastener);
    }
  }

  protected willSetPlot(newPlotController: PlotController<X, Y> | null, oldPlotController: PlotController<X, Y> | null,
                        plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlot !== void 0) {
        controllerObserver.controllerWillSetPlot(newPlotController, oldPlotController, plotFastener);
      }
    }
  }

  protected onSetPlot(newPlotController: PlotController<X, Y> | null, oldPlotController: PlotController<X, Y> | null,
                      plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldPlotController !== null) {
      this.detachPlot(oldPlotController, plotFastener);
    }
    if (newPlotController !== null) {
      this.attachPlot(newPlotController, plotFastener);
      this.initPlot(newPlotController, plotFastener);
    }
  }

  protected didSetPlot(newPlotController: PlotController<X, Y> | null, oldPlotController: PlotController<X, Y> | null,
                       plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlot !== void 0) {
        controllerObserver.controllerDidSetPlot(newPlotController, oldPlotController, plotFastener);
      }
    }
  }

  insertPlotTrait(plotTrait: PlotTrait<X, Y>, targetTrait: Trait | null = null): void {
    const plotFasteners = this.plotFasteners as ControllerFastener<this, PlotController<X, Y>>[];
    let targetController: PlotController<X, Y> | null = null;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotController = plotFasteners[i]!.controller;
      if (plotController !== null) {
        if (plotController.plot.trait === plotTrait) {
          return;
        } else if (plotController.plot.trait === targetTrait) {
          targetController = plotController;
        }
      }
    }
    const plotController = this.createPlot(plotTrait);
    if (plotController !== null) {
      plotController.plot.setTrait(plotTrait);
      this.insertChildController(plotController, targetController);
      if (plotController.plot.view === null) {
        const plotView = this.createPlotView(plotController);
        let targetView: PlotView<X, Y> | null = null;
        if (targetController !== null) {
          targetView = targetController.plot.view;
        }
        const graphView = this.graph.view;
        if (graphView !== null) {
          plotController.plot.injectView(graphView, plotView, targetView, null);
        } else {
          plotController.plot.setView(plotView, targetView);
        }
      }
    }
  }

  removePlotTrait(plotTrait: PlotTrait<X, Y>): void {
    const plotFasteners = this.plotFasteners as ControllerFastener<this, PlotController<X, Y>>[];
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      const plotController = plotFastener.controller;
      if (plotController !== null && plotController.plot.trait === plotTrait) {
        plotFastener.setController(null);
        if (this.isMounted()) {
          plotFastener.unmount();
        }
        plotFasteners.splice(i, 1);
        plotController.remove();
        return;
      }
    }
  }

  protected initPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected attachPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected detachPlotTrait(plotTrait: PlotTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected willSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                             plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotTrait !== void 0) {
        controllerObserver.controllerWillSetPlotTrait(newPlotTrait, oldPlotTrait, plotFastener);
      }
    }
  }

  protected onSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                           plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldPlotTrait !== null) {
      this.detachPlotTrait(oldPlotTrait, plotFastener);
    }
    if (newPlotTrait !== null) {
      this.attachPlotTrait(newPlotTrait, plotFastener);
      this.initPlotTrait(newPlotTrait, plotFastener);
    }
  }

  protected didSetPlotTrait(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotTrait !== void 0) {
        controllerObserver.controllerDidSetPlotTrait(newPlotTrait, oldPlotTrait, plotFastener);
      }
    }
  }

  protected createPlotView(plotController: PlotController<X, Y>): PlotView<X, Y> | null {
    return plotController.plot.createView();
  }

  protected initPlotView(plotView: PlotView<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected attachPlotView(plotView: PlotView<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected detachPlotView(plotView: PlotView<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    plotView.remove();
  }

  protected willSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetPlotView !== void 0) {
        controllerObserver.controllerWillSetPlotView(newPlotView, oldPlotView, plotFastener);
      }
    }
  }

  protected onSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                          plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldPlotView !== null) {
      this.detachPlotView(oldPlotView, plotFastener);
    }
    if (newPlotView !== null) {
      this.attachPlotView(newPlotView, plotFastener);
      this.initPlotView(newPlotView, plotFastener);
    }
  }

  protected didSetPlotView(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null,
                           plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetPlotView !== void 0) {
        controllerObserver.controllerDidSetPlotView(newPlotView, oldPlotView, plotFastener);
      }
    }
  }

  protected initDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected attachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected detachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected willSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataSetTrait !== void 0) {
        controllerObserver.controllerWillSetDataSetTrait(newDataSetTrait, oldDataSetTrait, plotFastener);
      }
    }
  }

  protected onSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                              plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldDataSetTrait !== null) {
      this.detachDataSetTrait(oldDataSetTrait, plotFastener);
    }
    if (newDataSetTrait !== null) {
      this.attachDataSetTrait(newDataSetTrait, plotFastener);
      this.initDataSetTrait(newDataSetTrait, plotFastener);
    }
  }

  protected didSetDataSetTrait(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null,
                               plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataSetTrait !== void 0) {
        controllerObserver.controllerDidSetDataSetTrait(newDataSetTrait, oldDataSetTrait, plotFastener);
      }
    }
  }

  protected initDataPoint(dataPointController: DataPointController<X, Y>,
                          dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                          plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.initDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.initDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected attachDataPoint(dataPointController: DataPointController<X, Y>,
                            dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.attachDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.attachDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected detachDataPoint(dataPointController: DataPointController<X, Y>,
                            dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const dataPointTrait = dataPointController.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.detachDataPointTrait(dataPointTrait, dataPointFastener, plotFastener);
    }
    const dataPointView = dataPointController.dataPoint.view;
    if (dataPointView !== null) {
      this.detachDataPointView(dataPointView, dataPointFastener, plotFastener);
    }
  }

  protected willSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                             dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                             plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPoint !== void 0) {
        controllerObserver.controllerWillSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                           dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                           plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldDataPointController !== null) {
      this.detachDataPoint(oldDataPointController, dataPointFastener, plotFastener);
    }
    if (newDataPointController !== null) {
      this.attachDataPoint(newDataPointController, dataPointFastener, plotFastener);
      this.initDataPoint(newDataPointController, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPoint(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null,
                            dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPoint !== void 0) {
        controllerObserver.controllerDidSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener, plotFastener);
      }
    }
  }

  protected initDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                               dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                               plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                 plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                 plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected willSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                  dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                  plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointTrait !== void 0) {
        controllerObserver.controllerWillSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldDataPointTrait !== null) {
      this.detachDataPointTrait(oldDataPointTrait, dataPointFastener, plotFastener);
    }
    if (newDataPointTrait !== null) {
      this.attachDataPointTrait(newDataPointTrait, dataPointFastener, plotFastener);
      this.initDataPointTrait(newDataPointTrait, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null,
                                 dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                 plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointTrait !== void 0) {
        controllerObserver.controllerDidSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, plotFastener);
      }
    }
  }

  protected initDataPointView(dataPointView: DataPointView<X, Y>,
                              dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                              plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.initDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected attachDataPointView(dataPointView: DataPointView<X, Y>,
                                dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.attachDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected detachDataPointView(dataPointView: DataPointView<X, Y>,
                                dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const labelView = dataPointView.label.view;
    if (labelView !== null) {
      this.detachDataPointLabelView(labelView, dataPointFastener, plotFastener);
    }
  }

  protected willSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                 dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                 plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDataPointView !== void 0) {
        controllerObserver.controllerWillSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                               dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                               plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldDataPointView !== null) {
      this.detachDataPointView(oldDataPointView, dataPointFastener, plotFastener);
    }
    if (newDataPointView !== null) {
      this.attachDataPointView(newDataPointView, dataPointFastener, plotFastener);
      this.initDataPointView(newDataPointView, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null,
                                dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointView !== void 0) {
        controllerObserver.controllerDidSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointX(newX: X | undefined, oldX: X | undefined,
                            dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected onSetDataPointY(newY: Y | undefined, oldY: Y | undefined,
                            dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                            plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected onSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined,
                             dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                             plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected onSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null,
                                 dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                 plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected onSetDataPointColor(newColor: Color | null, oldColor: Color | null,
                                dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected onSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined,
                                  dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                  plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected initDataPointLabelView(labelView: GraphicsView,
                                   dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                   plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected attachDataPointLabelView(labelView: GraphicsView,
                                     dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                     plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected detachDataPointLabelView(labelView: GraphicsView,
                                     dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                     plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    // hook
  }

  protected willSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                      dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                      plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllertWillSetDataPointLabelView !== void 0) {
        controllerObserver.controllertWillSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, plotFastener);
      }
    }
  }

  protected onSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                    dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                    plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    if (oldLabelView !== null) {
      this.detachDataPointLabelView(oldLabelView, dataPointFastener, plotFastener);
    }
    if (newLabelView !== null) {
      this.attachDataPointLabelView(newLabelView, dataPointFastener, plotFastener);
      this.initDataPointLabelView(newLabelView, dataPointFastener, plotFastener);
    }
  }

  protected didSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                     dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>,
                                     plotFastener: ControllerFastener<this, PlotController<X, Y>>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDataPointLabelView !== void 0) {
        controllerObserver.controllerDidSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, plotFastener);
      }
    }
  }

  /** @hidden */
  static PlotFastener = ControllerFastener.define<GraphController<unknown, unknown>, PlotController<unknown, unknown>>({
    type: PlotController,
    child: false,
    observe: true,
    willSetController(newPlotController: PlotController<unknown, unknown> | null, oldPlotController: PlotController<unknown, unknown> | null): void {
      this.owner.willSetPlot(newPlotController, oldPlotController, this);
    },
    onSetController(newPlotController: PlotController<unknown, unknown> | null, oldPlotController: PlotController<unknown, unknown> | null): void {
      this.owner.onSetPlot(newPlotController, oldPlotController, this);
    },
    didSetController(newPlotController: PlotController<unknown, unknown> | null, oldPlotController: PlotController<unknown, unknown> | null): void {
      this.owner.didSetPlot(newPlotController, oldPlotController, this);
    },
    controllerWillSetPlotTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null): void {
      this.owner.willSetPlotTrait(newPlotTrait, oldPlotTrait, this);
    },
    controllerDidSetPlotTrait(newPlotTrait: PlotTrait<unknown, unknown> | null, oldPlotTrait: PlotTrait<unknown, unknown> | null): void {
      this.owner.onSetPlotTrait(newPlotTrait, oldPlotTrait, this);
      this.owner.didSetPlotTrait(newPlotTrait, oldPlotTrait, this);
    },
    controllerWillSetPlotView(newPlotView: PlotView<unknown, unknown> | null, oldPlotView: PlotView<unknown, unknown> | null): void {
      this.owner.willSetPlotView(newPlotView, oldPlotView, this);
    },
    controllerDidSetPlotView(newPlotView: PlotView<unknown, unknown> | null, oldPlotView: PlotView<unknown, unknown> | null): void {
      this.owner.onSetPlotView(newPlotView, oldPlotView, this);
      this.owner.didSetPlotView(newPlotView, oldPlotView, this);
    },
    controllerWillSetDataSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.willSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
    },
    controllerDidSetDataSetTrait(newDataSetTrait: DataSetTrait<unknown, unknown> | null, oldDataSetTrait: DataSetTrait<unknown, unknown> | null): void {
      this.owner.onSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
      this.owner.didSetDataSetTrait(newDataSetTrait, oldDataSetTrait, this);
    },
    controllerWillSetDataPoint(newDataPointController: DataPointController<unknown, unknown> | null, oldDataPointController: DataPointController<unknown, unknown> | null,
                               dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.willSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener, this);
    },
    controllerDidSetDataPoint(newDataPointController: DataPointController<unknown, unknown> | null, oldDataPointController: DataPointController<unknown, unknown> | null,
                              dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener, this);
      this.owner.didSetDataPoint(newDataPointController, oldDataPointController, dataPointFastener, this);
    },
    controllerWillSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null,
                                    dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.willSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
    },
    controllerDidSetDataPointTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null,
                                   dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
      this.owner.didSetDataPointTrait(newDataPointTrait, oldDataPointTrait, dataPointFastener, this);
    },
    controllerWillSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null,
                                   dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.willSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
    },
    controllerDidSetDataPointView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null,
                                  dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
      this.owner.didSetDataPointView(newDataPointView, oldDataPointView, dataPointFastener, this);
    },
    controllerDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined,
                               dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointX(newX, oldX, dataPointFastener, this);
    },
    controllerDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined,
                               dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointY(newY, oldY, dataPointFastener, this);
    },
    controllerDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined,
                                dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointY2(newY2, oldY2, dataPointFastener, this);
    },
    controllerDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null,
                                    dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointRadius(newRadius, oldRadius, dataPointFastener, this);
    },
    controllerDidSetDataPointColor(newColor: Color | null, oldColor: Color | null,
                                   dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointColor(newColor, oldColor, dataPointFastener, this);
    },
    controllertWillSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                         dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.willSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
    },
    controllerDidSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                       dataPointFastener: ControllerFastener<PlotController<unknown, unknown>, DataPointController<unknown, unknown>>): void {
      this.owner.onSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
      this.owner.didSetDataPointLabelView(newLabelView, oldLabelView, dataPointFastener, this);
    },
  });

  protected createPlotFastener(plotController: PlotController<X, Y>): ControllerFastener<this, PlotController<X, Y>> {
    return new GraphController.PlotFastener(this as GraphController<unknown, unknown>, plotController.key, "plot") as ControllerFastener<this, PlotController<X, Y>>;
  }

  /** @hidden */
  readonly plotFasteners!: ReadonlyArray<ControllerFastener<this, PlotController<X, Y>>>;

  protected getPlotFastener(plotTrait: PlotTrait<X, Y>): ControllerFastener<this, PlotController<X, Y>> | null {
    const plotFasteners = this.plotFasteners;
    for (let i = 0, n = plotFasteners.length; i < n; i += 1) {
      const plotFastener = plotFasteners[i]!;
      const plotController = plotFastener.controller;
      if (plotController !== null && plotController.plot.trait === plotTrait) {
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

  protected detectPlotController(controller: Controller): PlotController<X, Y> | null {
    return controller instanceof PlotController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const plotController = this.detectPlotController(childController);
    if (plotController !== null) {
      this.insertPlot(plotController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const plotController = this.detectPlotController(childController);
    if (plotController !== null) {
      this.removePlot(plotController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountPlotFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountPlotFasteners();
    super.unmountControllerFasteners();
  }
}
