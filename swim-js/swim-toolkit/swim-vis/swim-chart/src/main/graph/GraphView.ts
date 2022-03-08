// Copyright 2015-2022 Swim.inc
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
import type {R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import {GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {ScaledViewInit, ScaledView} from "../scaled/ScaledView";
import type {AnyPlotView, PlotView} from "../plot/PlotView";
import type {GraphViewObserver} from "./GraphViewObserver";

/** @public */
export type AnyGraphView<X = unknown, Y = unknown> = GraphView<X, Y> | GraphViewInit<X, Y>;

/** @public */
export interface GraphViewInit<X = unknown, Y = unknown> extends ScaledViewInit<X, Y> {
  plots?: AnyPlotView<X, Y>[];

  font?: AnyFont;
  textColor?: AnyColor;
}

/** @public */
export class GraphView<X = unknown, Y = unknown> extends ScaledView<X, Y> {
  override readonly observerType?: Class<GraphViewObserver<X, Y>>;

  @ThemeAnimator({type: Font, inherits: true, value: null})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, inherits: true, value: null})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  addPlot(plot: AnyPlotView<X, Y>, key?: string): void {
    if (key === void 0 && typeof plot === "object" && plot !== null) {
      key = plot.key;
    }
    plot = View.fromAny(plot) as PlotView<X, Y>;
    this.appendChild(plot);
  }

  protected override willRender(viewContext: ViewContextType<this>): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.clipGraph(context, this.viewFrame);
    }
  }

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected clipGraph(context: CanvasContext, frame: R2Box): void {
    context.beginPath();
    context.rect(frame.x, frame.y, frame.width, frame.height);
    context.clip();
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    return this;
  }

  override init(init: GraphViewInit<X, Y>): void {
    super.init(init);
    const plots = init.plots;
    if (plots !== void 0) {
      for (let i = 0, n = plots.length; i < n; i += 1) {
        this.addPlot(plots[i]!);
      }
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
  }
}
