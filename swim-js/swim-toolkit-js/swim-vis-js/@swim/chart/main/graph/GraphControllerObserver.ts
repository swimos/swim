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
import type {ControllerObserver} from "@swim/controller";
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
