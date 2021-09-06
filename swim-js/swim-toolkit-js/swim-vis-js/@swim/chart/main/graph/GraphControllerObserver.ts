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

import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver, ControllerFastener} from "@swim/controller";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointController} from "../data/DataPointController";
import type {DataSetTrait} from "../data/DataSetTrait";
import type {PlotView} from "../plot/PlotView";
import type {PlotTrait} from "../plot/PlotTrait";
import type {PlotController} from "../plot/PlotController";
import type {GraphView} from "./GraphView";
import type {GraphTrait} from "./GraphTrait";
import type {GraphController} from "./GraphController";

export interface GraphControllerObserver<X, Y, C extends GraphController<X, Y> = GraphController<X, Y>> extends ControllerObserver<C> {
  controllerWillSetGraphTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, controller: C): void;

  controllerDidSetGraphTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, controller: C): void;

  controllerWillSetGraphView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, controller: C): void;

  controllerDidSetGraphView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, controller: C): void;

  controllerWillSetPlot?(newPlotController: PlotController<X, Y> | null, oldPlotController: PlotController<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetPlot?(newPlotController: PlotController<X, Y> | null, oldPlotController: PlotController<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetDataPoint?(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetDataPoint?(newDataPointController: DataPointController<X, Y> | null, oldDataPointController: DataPointController<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllertWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;

  controllerDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ControllerFastener<PlotController<X, Y>, DataPointController<X, Y>>, plotFastener: ControllerFastener<C, PlotController<X, Y>>): void;
}
