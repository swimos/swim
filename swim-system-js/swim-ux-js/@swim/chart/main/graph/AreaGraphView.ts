// Copyright 2015-2019 SWIM.AI inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont} from "@swim/font";
import {RenderingContext} from "@swim/render";
import {MemberAnimator,
  ViewInit,
  RenderViewContext,
  RenderView,
  FillViewInit,
  FillView,
} from "@swim/view";
import {AxisView} from "../axis/AxisView";
import {AnyDatumView} from "../data/DatumView";
import {AnyPlotView, PlotView} from "../plot/PlotView";
import {GraphType, AnyGraphView, GraphView} from "./GraphView";
import {GraphViewController} from "./GraphViewController";

export type AnyAreaGraphView<X, Y> = AreaGraphView<X, Y> | AreaGraphViewInit<X, Y>;

export interface AreaGraphViewInit<X, Y> extends ViewInit, FillViewInit {
  xAxis?: AxisView<X> | null;
  yAxis?: AxisView<Y> | null;

  data?: AnyDatumView<X, Y>[] | null;

  font?: AnyFont | null;
  textColor?: AnyColor | null;
}

export class AreaGraphView<X, Y> extends GraphView<X, Y> implements FillView {
  /** @hidden */
  _viewController: GraphViewController<X, Y, AreaGraphView<X, Y>> | null;

  constructor() {
    super();
    this.fill.setState(Color.black());
  }

  get viewController(): GraphViewController<X, Y, AreaGraphView<X, Y>> | null {
    return this._viewController;
  }

  get type(): GraphType {
    return "area";
  }

  @MemberAnimator(Color)
  fill: MemberAnimator<this, Color, AnyColor>;

  protected onAnimate(viewContext: RenderViewContext): void {
    const t = viewContext.updateTime;
    this.fill.onFrame(t);
    super.onAnimate(viewContext);
  }

  protected renderPlot(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const data = this._data;
    const n = data.size;

    const fill = this.fill.value!;
    const gradientStops = this._gradientStops;
    let gradient: CanvasGradient | undefined;

    context.beginPath();

    let x0: number;
    let x1: number;
    let dx: number;
    if (n > 0) {
      const p0 = data.firstValue()!;
      const p1 = data.lastValue()!;
      x0 = p0.xCoord;
      x1 = p1.xCoord;
      dx = x1 - x0;
      context.moveTo(p0.xCoord, p0.yCoord);
      if (gradientStops) {
        gradient = context.createLinearGradient(x0, 0, x1, 0);
        if (p0.isGradientStop()) {
          let color = p0.color.value || fill;
          const opacity = p0.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(0, color.toString());
        }
      }
    } else {
      x0 = NaN;
      x1 = NaN;
      dx = NaN;
    }

    const cursor = data.values();
    cursor.next();
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p.xCoord, p.yCoord);
      if (gradient && p.isGradientStop()) {
        let color = p.color.value || fill;
        const opacity = p.opacity.value;
        if (typeof opacity === "number") {
          color = color.alpha(opacity);
        }
        const offset = (p.xCoord - x0) / (dx || 1);
        gradient.addColorStop(offset, color.toString());
      }
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p.xCoord, p.y2Coord!);
    }
    if (n > 0) {
      context.closePath();
    }

    context.fillStyle = gradient ? gradient : fill.toString();
    context.fill();
  }

  protected hitTestGraph(x: number, y: number, context: RenderingContext,
                         bounds: BoxR2, anchor: PointR2): RenderView | null {
    const data = this._data;
    const n = data.size;

    context.beginPath();
    const cursor = data.values();
    if (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.moveTo(p.xCoord, p.yCoord);
    }
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p.xCoord, p.yCoord);
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p.xCoord, p.y2Coord!);
    }
    if (n > 0) {
      context.closePath();
    }

    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny<X, Y>(graph: AnyAreaGraphView<X, Y>): AreaGraphView<X, Y>;
  static fromAny<X, Y>(graph: AnyGraphView<X, Y>): GraphView<X, Y>;
  static fromAny<X, Y>(graph: AnyPlotView<X, Y>): PlotView<X, Y>;
  static fromAny<X, Y>(graph: AnyPlotView<X, Y> | AreaGraphViewInit<X, Y>): PlotView<X, Y> {
    if (graph instanceof AreaGraphView) {
      return graph;
    } else if (graph instanceof GraphView) {
      // error
    } else if (typeof graph === "object" && graph) {
      graph = graph as AreaGraphViewInit<X, Y>;
      const view = new AreaGraphView<X, Y>();
      if (graph.key !== void 0) {
        view.key(graph.key);
      }

      if (graph.xAxis !== void 0) {
        view.xAxis(graph.xAxis);
      }
      if (graph.yAxis !== void 0) {
        view.yAxis(graph.yAxis);
      }

      const data = graph.data;
      if (data) {
        for (let i = 0, n = data.length; i < n; i += 1) {
          view.insertDatum(data[i]);
        }
      }

      if (graph.fill !== void 0) {
        view.fill(graph.fill);
      }

      if (graph.font !== void 0) {
        view.font(graph.font);
      }
      if (graph.textColor !== void 0) {
        view.textColor(graph.textColor);
      }

      return view;
    }
    throw new TypeError("" + graph);
  }
}
PlotView.Area = AreaGraphView;
