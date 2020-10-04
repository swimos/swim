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

import {Objects} from "@swim/util";
import {BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {Tween} from "@swim/transition";
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  ContinuousScaleViewAnimator,
  LayerView,
} from "@swim/view";
import {AnyDataPointView, DataPointView} from "../data/DataPointView";
import {PlotViewInit, PlotView} from "./PlotView";
import {PlotViewObserver} from "./PlotViewObserver";
import {PlotViewController} from "./PlotViewController";

export type ScatterPlotType = "bubble";

export type AnyScatterPlotView<X, Y> = ScatterPlotView<X, Y> | ScatterPlotViewInit<X, Y> | ScatterPlotType;

export interface ScatterPlotViewInit<X, Y> extends PlotViewInit<X, Y> {
  plotType?: ScatterPlotType;
}

export abstract class ScatterPlotView<X, Y> extends LayerView implements PlotView<X, Y> {
  /** @hidden */
  _xDataDomain: [X, X] | undefined;
  /** @hidden */
  _yDataDomain: [Y, Y] | undefined;
  /** @hidden */
  _xDataRange: [number, number] | undefined;
  /** @hidden */
  _yDataRange: [number, number] | undefined;

  constructor() {
    super();
    this._xDataDomain = void 0;
    this._yDataDomain = void 0;
    this._xDataRange = void 0;
    this._yDataRange = void 0;
  }

  // @ts-ignore
  declare readonly viewController: PlotViewController<X, Y> | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<PlotViewObserver<X, Y>>;

  initView(init: ScatterPlotViewInit<X, Y>): void {
    super.initView(init);
    if (init.xScale !== void 0) {
      this.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      this.yScale(init.yScale);
    }

    const data = init.data;
    if (data !== void 0) {
      for (let i = 0, n = data.length; i < n; i += 1) {
        this.insertDataPoint(data[i]);
      }
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
  }

  abstract get plotType(): ScatterPlotType;

  getDataPoint(key: string): DataPointView<X, Y> | undefined {
    const point = this.getChildView(key);
    return point instanceof DataPointView ? point : void 0;
  }

  insertDataPoint(point: AnyDataPointView<X, Y>, key?: string): DataPointView<X, Y> {
    if (key === void 0) {
      key = point.key;
    }
    point = DataPointView.fromAny(point);
    this.appendChildView(point, key);
    return point;
  }

  insertDataPoints(...points: AnyDataPointView<X, Y>[]): void {
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      this.insertDataPoint(arguments[i]);
    }
  }

  removeDataPoint(key: string): DataPointView<X, Y> | null {
    const point = this.getChildView(key);
    if (point instanceof DataPointView) {
      point.remove();
      return point;
    } else {
      return null;
    }
  }

  @ViewAnimator({type: ContinuousScale, inherit: true})
  xScale: ContinuousScaleViewAnimator<this, X, number>;

  @ViewAnimator({type: ContinuousScale, inherit: true})
  yScale: ContinuousScaleViewAnimator<this, Y, number>;

  xDomain(): readonly [X, X] | undefined;
  xDomain(xDomain: readonly [X, X] | string | undefined, tween?: Tween<ContinuousScale<X, number>>): this;
  xDomain(xMin: X, xMax: X, tween: Tween<ContinuousScale<X, number>>): this;
  xDomain(xMin?: readonly [X, X] | X | string, xMax?: X | Tween<ContinuousScale<X, number>>,
          tween?: Tween<ContinuousScale<X, number>>): readonly [X, X] | undefined | this {
    if (arguments.length === 0) {
      const xScale = this.xScale.value;
      return xScale !== void 0 ? xScale.domain() : void 0;
    } else {
      this.xScale.setDomain(xMin as any, xMax as any, tween);
      return this;
    }
  }

  yDomain(): readonly [Y, Y] | undefined;
  yDomain(yDomain: readonly [Y, Y] | string | undefined, tween?: Tween<ContinuousScale<Y, number>>): this;
  yDomain(yMin: Y, yMax: Y, tween: Tween<ContinuousScale<Y, number>>): this;
  yDomain(yMin?: readonly [Y, Y] | Y | string, yMax?: Y | Tween<ContinuousScale<Y, number>>,
          tween?: Tween<ContinuousScale<Y, number>>): readonly [Y, Y] | undefined | this {
    if (arguments.length === 0) {
      const yScale = this.yScale.value;
      return yScale !== void 0 ? yScale.domain() : void 0;
    } else {
      this.yScale.setDomain(yMin as any, yMax as any, tween);
      return this;
    }
  }

  xRange(): readonly [number, number] | undefined {
    const xScale = this.xScale.value;
    return xScale !== void 0 ? xScale.range() : void 0;
  }

  yRange(): readonly [number, number] | undefined {
    const yScale = this.yScale.value;
    return yScale !== void 0 ? yScale.range() : void 0;
  }

  xDataDomain(): readonly [X, X] | undefined {
    let xDataDomain = this._xDataDomain;
    if (xDataDomain === void 0) {
      let xDataDomainMin: X | undefined;
      let xDataDomainMax: X | undefined;
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const point = childViews[i];
        if (point instanceof DataPointView) {
          const x = point.x.value;
          if (xDataDomainMin === void 0 || Objects.compare(x, xDataDomainMin) < 0) {
            xDataDomainMin = x;
          }
          if (xDataDomainMax === void 0 || Objects.compare(xDataDomainMax, x) < 0) {
            xDataDomainMax = x;
          }
        }
      }
      if (xDataDomainMin !== void 0 && xDataDomainMax !== void 0) {
        xDataDomain = [xDataDomainMin, xDataDomainMax];
        this._xDataDomain = xDataDomain;
      }
    }
    return xDataDomain;
  }

  yDataDomain(): readonly [Y, Y] | undefined {
    let yDataDomain = this._yDataDomain;
    if (yDataDomain === void 0) {
      let yDataDomainMin: Y | undefined;
      let yDataDomainMax: Y | undefined;
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const point = childViews[i];
        if (point instanceof DataPointView) {
          const y = point.y.value;
          if (yDataDomainMin === void 0 || Objects.compare(y, yDataDomainMin) < 0) {
            yDataDomainMin = y;
          }
          if (yDataDomainMax === void 0 || Objects.compare(yDataDomainMax, y) < 0) {
            yDataDomainMax = y;
          }
        }
      }
      if (yDataDomainMin !== void 0 && yDataDomainMax !== void 0) {
        yDataDomain = [yDataDomainMin, yDataDomainMax];
        this._yDataDomain = yDataDomain;
      }
    }
    return yDataDomain;
  }

  xDataRange(): readonly [number, number] | undefined {
    return this._xDataRange;
  }

  yDataRange(): readonly [number, number] | undefined {
    return this._yDataRange;
  }

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsAnimate;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsLayout) !== 0) {
      processFlags |= View.NeedsAnimate;
    }
    return processFlags;
  }

  protected willResize(viewContext: ViewContextType<this>): void {
    super.willResize(viewContext);
    this.resizeScales(this.viewFrame);
  }

  /**
   * Updates own scale ranges to project onto view frame.
   */
  protected resizeScales(frame: BoxR2): void {
    const xScale = this.xScale.ownValue;
    if (xScale !== void 0 && xScale.range()[1] !== frame.width) {
      this.xScale.setRange(0, frame.width);
    }
    const yScale = this.yScale.ownValue;
    if (yScale !== void 0 && yScale.range()[1] !== frame.height) {
      this.yScale.setRange(0, frame.height);
    }
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    // Compute domain and range extrema while animating child views.
    let needsAnimate = (processFlags & View.NeedsAnimate) !== 0;
    const xScale = needsAnimate ? this.xScale.value : void 0;
    const yScale = needsAnimate ? this.yScale.value : void 0;
    const frame = needsAnimate ? this.viewFrame : void 0;
    let point0: DataPointView<X, Y> | undefined;
    let xDomainMin: X | undefined;
    let yDomainMin: Y | undefined;
    let xDomainMax: X | undefined;
    let yDomainMax: Y | undefined;
    let xRangeMin: number | undefined;
    let yRangeMin: number | undefined;
    let xRangeMax: number | undefined;
    let yRangeMax: number | undefined;

    function animateChildView(this: ScatterPlotView<X, Y>, point1: View): void {
      if (point1 instanceof DataPointView) {
        const x1 = point1.x.getValue();
        const y1 = point1.y.getValue();
        const sx1 = xScale!.scale(x1);
        const sy1 = yScale!.scale(y1);
        point1._xCoord = frame!.xMin + sx1;
        point1._yCoord = frame!.yMin + sy1;

        if (point0 !== void 0) {
          // compute extrema
          if (Objects.compare(x1, xDomainMin!) < 0) {
            xDomainMin = x1;
          } else if (Objects.compare(xDomainMax!, x1) < 0) {
            xDomainMax = x1;
          }
          if (Objects.compare(y1, yDomainMin!) < 0) {
            yDomainMin = y1;
          } else if (Objects.compare(yDomainMax!, y1) < 0) {
            yDomainMax = y1;
          }
          if (sx1 < xRangeMin!) {
            xRangeMin = sx1;
          } else if (sx1 > xRangeMax!) {
            xRangeMax = sx1;
          }
          if (sy1 < yRangeMin!) {
            yRangeMin = sy1;
          } else if (sy1 > yRangeMax!) {
            yRangeMax = sy1;
          }
        } else {
          xDomainMin = x1;
          yDomainMin = y1;
          xDomainMax = x1;
          yDomainMax = y1;
          xRangeMin = sx1;
          yRangeMin = sy1;
          xRangeMax = sx1;
          yRangeMax = sy1;
        }

        point0 = point1;
      }

      if (callback !== void 0) {
        callback.call(this, point1);
      }
    }
    needsAnimate = needsAnimate && xScale !== void 0 && yScale !== void 0;
    super.processChildViews(processFlags, viewContext, needsAnimate ? animateChildView : callback);

    if (needsAnimate) {
      if (point0 !== void 0) {
        // update extrema
        let xDataDomain = this._xDataDomain;
        if (xDataDomain === void 0) {
          xDataDomain = [xDomainMin!, xDomainMax!];
          this._xDataDomain = xDataDomain;
        } else {
          xDataDomain[0] = xDomainMin!;
          xDataDomain[1] = xDomainMax!;
        }
        let yDataDomain = this._yDataDomain;
        if (yDataDomain === void 0) {
          yDataDomain = [yDomainMin!, yDomainMax!];
          this._yDataDomain = yDataDomain;
        } else {
          yDataDomain[0] = yDomainMin!;
          yDataDomain[1] = yDomainMax!;
        }
        let xDataRange = this._xDataRange;
        if (xDataRange === void 0) {
          xDataRange = [xRangeMin!, xRangeMax!];
          this._xDataRange = xDataRange;
        } else {
          xDataRange[0] = xRangeMin!;
          xDataRange[1] = xRangeMax!;
        }
        let yDataRange = this._yDataRange;
        if (yDataRange === void 0) {
          yDataRange = [yRangeMin!, yRangeMax!];
          this._yDataRange = yDataRange;
        } else {
          yDataRange[0] = yRangeMin!;
          yDataRange[1] = yRangeMax!;
        }
      } else {
        this._xDataDomain = void 0;
        this._yDataDomain = void 0;
        this._xDataRange = void 0;
        this._yDataRange = void 0;
      }

      // We don't need to run the layout phase unless the view frame changes
      // between now and the display pass.
      this._viewFlags &= ~View.NeedsLayout;
    }
  }

  needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this._viewFlags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    // Recompute range extrema when laying out child views.
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    const xScale = needsLayout ? this.xScale.value : void 0;
    const yScale = needsLayout ? this.yScale.value : void 0;
    const frame = needsLayout ? this.viewFrame : void 0;
    let point0: DataPointView<X, Y> | undefined;
    let xRangeMin: number | undefined;
    let yRangeMin: number | undefined;
    let xRangeMax: number | undefined;
    let yRangeMax: number | undefined;

    function layoutChildView(this: ScatterPlotView<X, Y>, point1: View): void {
      if (point1 instanceof DataPointView) {
        const x1 = point1.x.getValue();
        const y1 = point1.y.getValue();
        const sx1 = xScale!.scale(x1);
        const sy1 = yScale!.scale(y1);
        point1._xCoord = frame!.xMin + sx1;
        point1._yCoord = frame!.yMin + sy1;

        if (point0 !== void 0) {
          // compute extrema
          if (sx1 < xRangeMin!) {
            xRangeMin = sx1;
          } else if (sx1 > xRangeMax!) {
            xRangeMax = sx1;
          }
          if (sy1 < yRangeMin!) {
            yRangeMin = sy1;
          } else if (sy1 > yRangeMax!) {
            yRangeMax = sy1;
          }
        } else {
          xRangeMin = sx1;
          yRangeMin = sy1;
          xRangeMax = sx1;
          yRangeMax = sy1;
        }

        point0 = point1;
      }

      if (callback !== void 0) {
        callback.call(this, point1);
      }
    }
    super.displayChildViews(displayFlags, viewContext, needsLayout ? layoutChildView : callback);

    if (needsLayout) {
      if (point0 !== void 0) {
        // update extrema
        let xDataRange = this._xDataRange;
        if (xDataRange === void 0) {
          xDataRange = [xRangeMin!, xRangeMax!];
          this._xDataRange = xDataRange;
        } else {
          xDataRange[0] = xRangeMin!;
          xDataRange[1] = xRangeMax!;
        }
        let yDataRange = this._yDataRange;
        if (yDataRange === void 0) {
          yDataRange = [yRangeMin!, yRangeMax!];
          this._yDataRange = yDataRange;
        } else {
          yDataRange[0] = yRangeMin!;
          yDataRange[1] = yRangeMax!;
        }
      } else {
        this._xDataRange = void 0;
        this._yDataRange = void 0;
      }
    }
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      this.renderPlot(context, this.viewFrame);
    }
  }

  protected abstract renderPlot(context: CanvasContext, frame: BoxR2): void;

  static fromAny<X, Y>(plot: AnyScatterPlotView<X, Y>): ScatterPlotView<X, Y> {
    if (plot instanceof ScatterPlotView) {
      return plot;
    } else if (typeof plot === "string") {
      return ScatterPlotView.fromType(plot);
    } else if (typeof plot === "object" && plot !== null) {
      return ScatterPlotView.fromInit(plot);
    }
    throw new TypeError("" + plot);
  }

  static fromType<X, Y>(type: ScatterPlotType): ScatterPlotView<X, Y> {
    if (type === "bubble") {
      return new PlotView.Bubble();
    }
    throw new TypeError("" + type);
  }

  static fromInit<X, Y>(init: ScatterPlotViewInit<X, Y>): ScatterPlotView<X, Y> {
    const type = init.plotType;
    if (type === "bubble") {
      return PlotView.Bubble.fromInit(init);
    }
    throw new TypeError("" + init);
  }
}
PlotView.Scatter = ScatterPlotView;
