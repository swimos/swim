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

import type {R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewAnimator} from "@swim/view";
import {GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {ScaledViewInit, ScaledView} from "../scaled/ScaledView";
import {AnyPlotView, PlotView} from "../plot/PlotView";
import type {GraphViewObserver} from "./GraphViewObserver";

export type AnyGraphView<X, Y> = GraphView<X, Y> | GraphViewInit<X, Y>;

export interface GraphViewInit<X, Y> extends ScaledViewInit<X, Y> {
  plots?: AnyPlotView<X, Y>[];

  font?: AnyFont;
  textColor?: AnyColor;
}

export class GraphView<X, Y> extends ScaledView<X, Y> {
  override readonly viewObservers!: ReadonlyArray<GraphViewObserver<X, Y>>;

  override initView(init: GraphViewInit<X, Y>): void {
    super.initView(init);
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

  @ViewAnimator({type: Font, inherit: true, state: null})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  addPlot(plot: AnyPlotView<X, Y>, key?: string): void {
    if (key === void 0 && typeof plot === "object" && plot !== null) {
      key = plot.key;
    }
    plot = PlotView.fromAny(plot);
    this.appendChildView(plot);
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

  static override create<X, Y>(): GraphView<X, Y> {
    return new GraphView<X, Y>();
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
