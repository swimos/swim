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
  componentWillSetGraphTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, component: C): void;

  componentDidSetGraphTrait?(newGraphTrait: GraphTrait<X, Y> | null, oldGraphTrait: GraphTrait<X, Y> | null, component: C): void;

  componentWillSetGraphView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, component: C): void;

  componentDidSetGraphView?(newGraphView: GraphView<X, Y> | null, oldGraphView: GraphView<X, Y> | null, component: C): void;

  componentWillSetPlot?(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetPlot?(newPlotComponent: PlotComponent<X, Y> | null, oldPlotComponent: PlotComponent<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetPlotTrait?(newPlotTrait: PlotTrait<X, Y> | null, oldPlotTrait: PlotTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetPlotView?(newPlotView: PlotView<X, Y> | null, oldPlotView: PlotView<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetDataSetTrait?(newDataSetTrait: DataSetTrait<X, Y> | null, oldDataSetTrait: DataSetTrait<X, Y> | null, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetDataPoint?(newDataPointComponent: DataPointComponent<X, Y> | null, oldDataPointComponent: DataPointComponent<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetDataPointTrait?(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetDataPointView?(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentWillSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;

  componentDidSetDataPointLabelView?(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null, dataPointFastener: ComponentFastener<PlotComponent<X, Y>, DataPointComponent<X, Y>>, plotFastener: ComponentFastener<C, PlotComponent<X, Y>>): void;
}
