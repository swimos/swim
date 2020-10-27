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
import {ViewContextType, View} from "@swim/view";
import {GraphicsView} from "@swim/graphics";
import {ScaleViewInit, ScaleView} from "../scale/ScaleView";
import {AnyPlotView, PlotView} from "../plot/PlotView";
import {GraphViewObserver} from "./GraphViewObserver";
import {GraphViewController} from "./GraphViewController";

export type AnyGraphView<X = unknown, Y = unknown> = GraphView<X, Y> | GraphViewInit<X, Y>;

export interface GraphViewInit<X = unknown, Y = unknown> extends ScaleViewInit<X, Y> {
  viewController?: GraphViewController<X, Y>;
  plots?: AnyPlotView<X, Y>[];
}

export class GraphView<X = unknown, Y = unknown> extends ScaleView<X, Y> {
  // @ts-ignore
  declare readonly viewController: GraphViewController<X, Y> | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<GraphViewObserver<X, Y>>;

  initView(init: GraphViewInit<X, Y>): void {
    super.initView(init);
    const plots = init.plots;
    if (plots !== void 0) {
      for (let i = 0, n = plots.length; i < n; i += 1) {
        this.addPlot(plots[i]);
      }
    }
  }

  addPlot(plot: AnyPlotView<X, Y>, key?: string): void {
    if (key === void 0 && typeof plot === "object" && plot !== null) {
      key = plot.key;
    }
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

  protected willRender(viewContext: ViewContextType<this>): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.clipGraph(context, this.viewFrame);
    }
  }

  protected didRender(viewContext: ViewContextType<this>): void {
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

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      hit = this;
    }
    return hit;
  }

  static fromInit<X, Y>(init: GraphViewInit<X, Y>): GraphView<X, Y> {
    const view = new GraphView<X, Y>();
    view.initView(init);
    return view;
  }

  static fromAny<X, Y>(value: AnyGraphView<X, Y>): GraphView<X, Y> {
    if (value instanceof GraphView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
