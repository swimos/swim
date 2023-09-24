// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {DataPointView} from "./DataPointView";
import type {DataPointTrait} from "./DataPointTrait";
import type {DataPointController} from "./DataPointController";
import type {DataSetTrait} from "./DataSetTrait";
import type {PlotView} from "./PlotView";
import type {PlotTrait} from "./PlotTrait";
import {PlotController} from "./PlotController";
import {GraphView} from "./GraphView";
import {GraphTrait} from "./GraphTrait";

/** @public */
export interface GraphControllerObserver<X = unknown, Y = unknown, C extends GraphController<X, Y> = GraphController<X, Y>> extends ControllerObserver<C> {
  controllerWillAttachGraphTrait?(graphTrait: GraphTrait<X, Y> | null, controller: C): void;

  controllerDidDetachGraphTrait?(graphTrait: GraphTrait<X, Y>, controller: C): void;

  controllerWillAttachGraphView?(graphView: GraphView<X, Y>, controller: C): void;

  controllerDidDetachGraphView?(graphView: GraphView<X, Y>, controller: C): void;

  controllerWillAttachPlot?(plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachPlot?(plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachPlotTrait?(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachPlotTrait?(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachPlotView?(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachPlotView?(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachDataSetTrait?(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachDataSetTrait?(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachDataPoint?(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachDataPoint?(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachDataPointTrait?(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachDataPointView?(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachDataPointView?(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerWillAttachDataPointLabelView?(labelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;

  controllerDidDetachDataPointLabelView?(labelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>, controller: C): void;
}

/** @public */
export class GraphController<X = unknown, Y = unknown> extends Controller {
  declare readonly observerType?: Class<GraphControllerObserver<X, Y>>;

  @TraitViewRef({
    traitType: GraphTrait,
    observesTrait: true,
    willAttachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachGraphTrait", graphTrait, this.owner);
    },
    didAttachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.plots.addTraits(graphTrait.plots.traits);
    },
    willDetachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.plots.deleteTraits(graphTrait.plots.traits);
    },
    didDetachTrait(graphTrait: GraphTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachGraphTrait", graphTrait, this.owner);
    },
    traitWillAttachPlot(plotTrait: PlotTrait<X, Y>, targetTrait: Trait): void {
      this.owner.plots.addTrait(plotTrait, targetTrait);
    },
    traitDidDetachPlot(plotTrait: PlotTrait<X, Y>): void {
      this.owner.plots.deleteTrait(plotTrait);
    },
    viewType: GraphView,
    initView(graphView: GraphView<X, Y>): void {
      const plotControllers = this.owner.plots.controllers;
      for (const controllerId in plotControllers) {
        const plotController = plotControllers[controllerId]!;
        const plotView = plotController.plot.view;
        if (plotView !== null && plotView.parent === null) {
          plotController.plot.insertView(graphView);
        }
      }
    },
    willAttachView(newGraphView: GraphView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachGraphView", newGraphView, this.owner);
    },
    didDetachView(newGraphView: GraphView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachGraphView", newGraphView, this.owner);
    },
  })
  readonly graph!: TraitViewRef<this, GraphTrait<X, Y>, GraphView<X, Y>> & Observes<GraphTrait<X, Y>>;

  @TraitViewControllerSet({
    controllerType: PlotController,
    binds: true,
    observes: true,
    get parentView(): GraphView<X, Y> | null {
      return this.owner.graph.view;
    },
    getTraitViewRef(plotController: PlotController<X, Y>): TraitViewRef<unknown, PlotTrait<X, Y>, PlotView<X, Y>> {
      return plotController.plot;
    },
    willAttachController(plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlot", plotController, this.owner);
    },
    didAttachController(plotController: PlotController<X, Y>): void {
      const plotTrait = plotController.plot.trait;
      if (plotTrait !== null) {
        this.attachPlotTrait(plotTrait, plotController);
      }
      const plotView = plotController.plot.view;
      if (plotView !== null) {
        this.attachPlotView(plotView, plotController);
      }
      const dataSetTrait = plotController.dataSet.trait;
      if (dataSetTrait !== null) {
        this.attachDataSetTrait(dataSetTrait, plotController);
      }
    },
    willDetachController(plotController: PlotController<X, Y>): void {
      const dataSetTrait = plotController.dataSet.trait;
      if (dataSetTrait !== null) {
        this.detachDataSetTrait(dataSetTrait, plotController);
      }
      const plotView = plotController.plot.view;
      if (plotView !== null) {
        this.detachPlotView(plotView, plotController);
      }
      const plotTrait = plotController.plot.trait;
      if (plotTrait !== null) {
        this.detachPlotTrait(plotTrait, plotController);
      }
    },
    didDetachController(plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerDidDetachPlot", plotController, this.owner);
    },
    controllerWillAttachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotTrait", plotTrait, plotController, this.owner);
      this.attachPlotTrait(plotTrait, plotController);
    },
    controllerDidDetachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachPlotTrait(plotTrait, plotController);
      this.owner.callObservers("controllerDidDetachPlotTrait", plotTrait, plotController, this.owner);
    },
    attachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    detachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    controllerWillAttachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachPlotView", plotView, plotController, this.owner);
      this.attachPlotView(plotView, plotController);
    },
    controllerDidDetachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachPlotView(plotView, plotController);
      this.owner.callObservers("controllerDidDetachPlotView", plotView, plotController, this.owner);
    },
    attachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    detachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void {
      plotView.remove();
    },
    controllerWillAttachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataSetTrait", dataSetTrait, plotController, this.owner);
      this.attachDataSetTrait(dataSetTrait, plotController);
    },
    controllerDidDetachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachDataSetTrait(dataSetTrait, plotController);
      this.owner.callObservers("controllerDidDetachDataSetTrait", dataSetTrait, plotController, this.owner);
    },
    attachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    detachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    controllerWillAttachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPoint", dataPointController, plotController, this.owner);
      this.attachDataPoint(dataPointController, plotController);
    },
    controllerDidDetachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachDataPoint(dataPointController, plotController);
      this.owner.callObservers("controllerDidDetachDataPoint", dataPointController, plotController, this.owner);
    },
    attachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      const dataPointTrait = dataPointController.dataPoint.trait;
      if (dataPointTrait !== null) {
        this.attachDataPointTrait(dataPointTrait, dataPointController, plotController);
      }
      const dataPointView = dataPointController.dataPoint.view;
      if (dataPointView !== null) {
        this.attachDataPointView(dataPointView, dataPointController, plotController);
      }
    },
    detachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      const dataPointTrait = dataPointController.dataPoint.trait;
      if (dataPointTrait !== null) {
        this.detachDataPointTrait(dataPointTrait, dataPointController, plotController);
      }
      const dataPointView = dataPointController.dataPoint.view;
      if (dataPointView !== null) {
        this.detachDataPointView(dataPointView, dataPointController, plotController);
      }
    },
    controllerWillAttachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointTrait", dataPointTrait, dataPointController, plotController, this.owner);
      this.attachDataPointTrait(dataPointTrait, dataPointController, plotController);
    },
    controllerDidDetachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachDataPointTrait(dataPointTrait, dataPointController, plotController);
      this.owner.callObservers("controllerDidDetachDataPointTrait", dataPointTrait, dataPointController, plotController, this.owner);
    },
    attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    controllerWillAttachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointView", dataPointView, dataPointController, plotController, this.owner);
      this.attachDataPointView(dataPointView, dataPointController, plotController);
    },
    controllerDidDetachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachDataPointView(dataPointView, dataPointController, plotController);
      this.owner.callObservers("controllerDidDetachDataPointView", dataPointView, dataPointController, plotController, this.owner);
    },
    attachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.attachDataPointLabelView(labelView, dataPointController, plotController);
      }
    },
    detachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      const labelView = dataPointView.label.view;
      if (labelView !== null) {
        this.detachDataPointLabelView(labelView, dataPointController, plotController);
      }
    },
    controllerWillAttachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointLabelView", labelView, dataPointController, plotController, this.owner);
      this.attachDataPointLabelView(labelView, dataPointController, plotController);
    },
    controllerDidDetachDataPointLabelView(labelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      this.detachDataPointLabelView(labelView, dataPointController, plotController);
      this.owner.callObservers("controllerDidDetachDataPointLabelView", labelView, dataPointController, plotController, this.owner);
    },
    attachDataPointLabelView(dataPointLabelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    detachDataPointLabelView(dataPointLabelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void {
      // hook
    },
    createController(plotTrait?: PlotTrait<X, Y>): PlotController<X, Y> {
      if (plotTrait !== void 0) {
        return plotTrait.createPlotController();
      } else {
        return super.createController();
      }
    },
  })
  readonly plots!: TraitViewControllerSet<this, PlotTrait<X, Y>, PlotView<X, Y>, PlotController<X, Y>> & Observes<PlotController<X, Y>> & {
    attachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void,
    detachPlotTrait(plotTrait: PlotTrait<X, Y>, plotController: PlotController<X, Y>): void,
    attachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void,
    detachPlotView(plotView: PlotView<X, Y>, plotController: PlotController<X, Y>): void,
    attachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void,
    detachDataSetTrait(dataSetTrait: DataSetTrait<X, Y>, plotController: PlotController<X, Y>): void,
    attachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    detachDataPoint(dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    attachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    detachDataPointView(dataPointView: DataPointView<X, Y>, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    attachDataPointLabelView(dataPointLabelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
    detachDataPointLabelView(dataPointLabelView: GraphicsView, dataPointController: DataPointController<X, Y>, plotController: PlotController<X, Y>): void,
  };
}
