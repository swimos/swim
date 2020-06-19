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

import {BoxR2} from "@swim/math";
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {View, GraphicsViewContext, GraphicsView} from "@swim/view";
import {ScaleViewInit, ScaleView} from "../scale/ScaleView";
import {AnyPlotView, PlotView} from "../plot/PlotView";
import {GraphViewController} from "./GraphViewController";

export type AnyGraphView<X = unknown, Y = unknown> = GraphView<X, Y> | GraphViewInit<X, Y>;

export interface GraphViewInit<X = unknown, Y = unknown> extends ScaleViewInit<X, Y> {
  plots?: AnyPlotView<X, Y>[];
}

export class GraphView<X = unknown, Y = unknown> extends ScaleView<X, Y> {
  constructor() {
    super();
  }

  get viewController(): GraphViewController<X, Y> | null {
    return this._viewController;
  }

  addPlot(plot: AnyPlotView<X, Y>): void {
    plot = PlotView.fromAny(plot);
    this.appendChildView(plot);
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (PlotView.is<X, Y>(childView)) {
      this.onInsertPlot(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (PlotView.is<X, Y>(childView)) {
      this.onRemovePlot(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertPlot(plot: PlotView<X, Y>): void {
    // hook
  }

  protected onRemovePlot(plot: PlotView<X, Y>): void {
    // hook
  }

  protected willRender(viewContext: GraphicsViewContext): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.clipGraph(context, this.viewFrame);
    }
  }

  protected didRender(viewContext: GraphicsViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected clipGraph(context: CanvasContext, frame: BoxR2): void {
    context.beginPath();
    context.rect(frame.x, frame.y, frame.width, frame.height);
    context.clip();
  }

  hitTest(x: number, y: number, viewContext: GraphicsViewContext): GraphicsView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      hit = this;
    }
    return hit;
  }

  static fromAny<X, Y>(graph: AnyGraphView<X, Y>): GraphView<X, Y> {
    if (graph instanceof GraphView) {
      return graph;
    } else if (typeof graph === "object" && graph !== null) {
      return GraphView.fromInit(graph);
    }
    throw new TypeError("" + graph);
  }

  static fromInit<X, Y>(init: GraphViewInit<X, Y>): GraphView<X, Y> {
    const view = new GraphView<X, Y>();
    ScaleView.init(view, init);

    const plots = init.plots;
    if (plots !== void 0) {
      for (let i = 0, n = plots.length; i < n; i += 1) {
        view.addPlot(plots[i]);
      }
    }

    return view;
  }
}
