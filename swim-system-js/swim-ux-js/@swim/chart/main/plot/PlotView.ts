// Copyright 2015-2020 SWIM.AI inc.
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

import {Objects} from "@swim/util";
import {PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {RenderingContext} from "@swim/render";
import {MemberAnimator, ViewInit, View, RenderViewContext, GraphicView} from "@swim/view";
import {AxisView} from "../axis/AxisView";
import {AnyDatumView, DatumView} from "../data/DatumView";
import {PlotViewController} from "./PlotViewController";
import {BubblePlotView} from "./BubblePlotView";
import {LineGraphView} from "../graph/LineGraphView";
import {AreaGraphView} from "../graph/AreaGraphView";

export type PlotType = "bubble" | "line" | "area";

export type AnyPlotView<X, Y> = PlotView<X, Y> | PlotViewInit<X, Y> | PlotType;

export interface PlotViewInit<X, Y> extends ViewInit {
  type: PlotType;

  xAxis?: AxisView<X> | null;
  yAxis?: AxisView<Y> | null;

  data?: AnyDatumView<X, Y>[] | null;

  font?: AnyFont | null;
  textColor?: AnyColor | null;
}

export abstract class PlotView<X, Y> extends GraphicView {
  /** @hidden */
  _viewController: PlotViewController<X, Y> | null;

  /** @hidden */
  _xAxis: AxisView<X> | null;
  /** @hidden */
  _yAxis: AxisView<Y> | null;

  /** @hidden */
  readonly _xDomain: [X | null, X | null];
  /** @hidden */
  readonly _xRange: [number, number];
  /** @hidden */
  readonly _yDomain: [Y | null, Y | null];
  /** @hidden */
  readonly _yRange: [number, number];

  constructor() {
    super();
    this._xAxis = null;
    this._yAxis = null;

    this._xDomain = [null, null];
    this._xRange = [Infinity, -Infinity];
    this._yDomain = [null, null];
    this._yRange = [Infinity, -Infinity];
  }

  get viewController(): PlotViewController<X, Y> | null {
    return this._viewController;
  }

  abstract get type(): PlotType;

  xAxis(): AxisView<X> | null;
  xAxis(xAxis: AxisView<X> | null): this;
  xAxis(xAxis?: AxisView<X> | null): AxisView<X> | null | this {
    if (xAxis === void 0) {
      return this._xAxis;
    } else {
      this._xAxis = xAxis;
      return this;
    }
  }

  yAxis(): AxisView<Y> | null;
  yAxis(yAxis: AxisView<Y> | null): this;
  yAxis(yAxis?: AxisView<Y> | null): AxisView<Y> | null | this {
    if (yAxis === void 0) {
      return this._yAxis;
    } else {
      this._yAxis = yAxis;
      return this;
    }
  }

  xDomain(): Readonly<[X | null, X | null]> {
    return this._xDomain;
  }

  xRange(): Readonly<[number, number]> {
    return this._xRange;
  }

  yDomain(): Readonly<[Y | null, Y | null]> {
    return this._yDomain;
  }

  yRange(): Readonly<[number, number]> {
    return this._yRange;
  }

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  needsUpdate(updateFlags: number, viewContext: RenderViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsAnimate | View.NeedsLayout | View.NeedsRender;
    }
    return updateFlags;
  }

  protected onAnimate(viewContext: RenderViewContext): void {
    const t = viewContext.updateTime;
    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onLayout(viewContext: RenderViewContext): void {
    if (this._xAxis && this._yAxis) {
      this.layoutData(this._xAxis.scale.value!, this._yAxis.scale.value!, this._bounds, this._anchor);
    }
  }

  protected layoutData(xScale: ContinuousScale<X, number>, yScale: ContinuousScale<Y, number>,
                       bounds: BoxR2, anchor: PointR2): void {
    let datum0: DatumView<X, Y> | undefined;
    let xDomainMin: X | undefined;
    let xDomainMax: X | undefined;
    let xRangeMin: number | undefined;
    let xRangeMax: number | undefined;
    let yDomainMin: Y | undefined;
    let yDomainMax: Y | undefined;
    let yRangeMin: number | undefined;
    let yRangeMax: number | undefined;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const datum1 = childViews[i];
      if (datum1 instanceof DatumView) {
        const x1 = datum1.x.value!;
        const y1 = datum1.y.value!;
        const ax1 = xScale.scale(x1);
        const ay1 = yScale.scale(y1);
        const datumAnchor = new PointR2(anchor.x + ax1, anchor.y + ay1);
        datum1.setBounds(bounds);
        datum1.setAnchor(datumAnchor);

        if (datum0) {
          // compute extrema
          if (Objects.compare(x1, xDomainMin!) < 0) {
            xDomainMin = x1;
          } else if (Objects.compare(x1, xDomainMax!) > 0) {
            xDomainMax = x1;
          }
          if (ax1 < xRangeMin!) {
            xRangeMin = ax1;
          } else if (ax1 > xRangeMax!) {
            xRangeMax = ax1;
          }
          if (Objects.compare(y1, yDomainMin!) < 0) {
            yDomainMin = y1;
          } else if (Objects.compare(y1, yDomainMax!) > 0) {
            yDomainMax = y1;
          }
          if (ay1 < yRangeMin!) {
            yRangeMin = ay1;
          } else if (ay1 > yRangeMax!) {
            yRangeMax = ay1;
          }
        } else {
          xDomainMin = x1;
          xDomainMax = x1;
          xRangeMin = ax1;
          xRangeMax = ax1;
          yDomainMin = y1;
          yDomainMax = y1;
          yRangeMin = ay1;
          yRangeMax = ay1;
        }

        datum0 = datum1;
      }
    }

    if (datum0) {
      // update extrema
      let rebound = false;
      if (this._xDomain[0] !== xDomainMin) {
        this._xDomain[0] = xDomainMin!;
        rebound = true;
      }
      if (this._xDomain[1] !== xDomainMax) {
        this._xDomain[1] = xDomainMax!;
        rebound = true;
      }
      if (this._xRange[0] !== xRangeMin) {
        this._xRange[0] = xRangeMin!;
        rebound = true;
      }
      if (this._xRange[1] !== xRangeMax) {
        this._xRange[1] = xRangeMax!;
        rebound = true;
      }
      if (this._yDomain[0] !== yDomainMin) {
        this._yDomain[0] = yDomainMin!;
        rebound = true;
      }
      if (this._yDomain[1] !== yDomainMax) {
        this._yDomain[1] = yDomainMax!;
        rebound = true;
      }
      if (this._yRange[0] !== yRangeMin) {
        this._yRange[0] = yRangeMin!;
        rebound = true;
      }
      if (this._yRange[1] !== yRangeMax) {
        this._yRange[1] = yRangeMax!;
        rebound = true;
      }
      if (rebound) {
        this.requireUpdate(View.NeedsLayout);
      }
    }
  }

  protected willUpdate(viewContext: RenderViewContext): void {
    super.willUpdate(viewContext);
    const context = viewContext.renderingContext;
    context.save();
    this.clipPlot(context, this._bounds);
  }

  protected onRender(viewContext: RenderViewContext): void {
    const context = viewContext.renderingContext;
    const bounds = this._bounds;
    const anchor = this._anchor;
    this.renderPlot(context, bounds, anchor);
  }

  protected didUpdate(viewContext: RenderViewContext): void {
    const context = viewContext.renderingContext;
    context.restore();
    super.didUpdate(viewContext);
  }

  protected clipPlot(context: RenderingContext, bounds: BoxR2): void {
    context.beginPath();
    context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.clip();
  }

  protected abstract renderPlot(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void;

  static fromAny<X, Y>(plot: AnyPlotView<X, Y>): PlotView<X, Y> {
    if (plot instanceof PlotView) {
      return plot;
    } else if (typeof plot === "string") {
      if (plot === "bubble") {
        return new PlotView.Bubble();
      } else if (plot === "line") {
        return new PlotView.Line();
      } else if (plot === "area") {
        return new PlotView.Area();
      }
    } else if (typeof plot === "object" && plot) {
      const type = plot.type;
      if (type === "bubble") {
        return PlotView.Bubble.fromAny(plot);
      } else if (type === "line") {
        return PlotView.Line.fromAny(plot);
      } else if (type === "area") {
        return PlotView.Area.fromAny(plot);
      }
    }
    throw new TypeError("" + plot);
  }

  // Forward type declarations
  /** @hidden */
  static Bubble: typeof BubblePlotView; // defined by BubblePlotView
  /** @hidden */
  static Line: typeof LineGraphView; // defined by LineGraphView
  /** @hidden */
  static Area: typeof AreaGraphView; // defined by AreaGraphView
}
