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

import type {GraphicsView} from "@swim/graphics";
import type {ComponentObserver, ComponentFastener} from "@swim/component";
import type {DataPointView} from "../data/DataPointView";
import type {DataPointTrait} from "../data/DataPointTrait";
import type {DataPointComponent} from "../data/DataPointComponent";
import type {DataSetTrait} from "../data/DataSetTrait";
import type {PlotView} from "../plot/PlotView";
import type {PlotTrait} from "../plot/PlotTrait";
import type {PlotComponent} from "../plot/PlotComponent";
import type {GraphView} from "./GraphView";
import type {GraphTrait} from "./GraphTrait";
import type {GraphComponent} from "./GraphComponent";

export interface GraphComponentObserver<X, Y, C extends GraphComponent<X, Y> = GraphComponent<X, Y>> extends ComponentObserver<C> {
  graphWillSetTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, component: C): void;

  graphDidSetTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, component: C): void;

  graphWillSetView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, component: C): void;

  graphDidSetView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, component: C): void;

  graphWillSetPlot?(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetPlot?(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  graphDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;
}
