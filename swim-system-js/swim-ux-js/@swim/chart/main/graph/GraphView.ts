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
import {BTree} from "@swim/collections";
import {PointR2, BoxR2} from "@swim/math";
import {ContinuousScale} from "@swim/scale";
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {View, RenderedViewContext, RenderedView} from "@swim/view";
import {DatumCategory} from "../data/Datum";
import {AnyDatumView, DatumView} from "../data/DatumView";
import {AnyPlotView, PlotViewInit, PlotView} from "../plot/PlotView";
import {GraphViewController} from "./GraphViewController";

export type GraphType = "line" | "area";

export type AnyGraphView<X, Y> = GraphView<X, Y> | GraphViewInit<X, Y> | GraphType;

export interface GraphViewInit<X, Y> extends PlotViewInit<X, Y> {
}

export abstract class GraphView<X, Y> extends PlotView<X, Y> {
  /** @hidden */
  _viewController: GraphViewController<X, Y> | null;

  /** @hidden */
  readonly _data: BTree<X, DatumView<X, Y>>;

  /** @hidden */
  _gradientStops: number;

  constructor() {
    super();
    this._data = new BTree();
    this._gradientStops = 0;
  }

  get viewController(): GraphViewController<X, Y> | null {
    return this._viewController;
  }

  abstract get type(): GraphType;

  getDatum(x: X): DatumView<X, Y> | undefined {
    return this._data.get(x);
  }

  insertDatum(datum: AnyDatumView<X, Y>): DatumView<X, Y> {
    datum = DatumView.fromAny(datum);
    this.insertChildView(datum, this._data.nextValue(datum.x.state!) || null);
    return datum;
  }

  insertData(...data: AnyDatumView<X, Y>[]): void {
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      this.insertDatum(arguments[i]);
    }
  }

  removeDatum(x: X): DatumView<X, Y> | null {
    const datum = this._data.get(x);
    if (datum) {
      datum.remove();
      this._data.delete(x);
      return datum;
    } else {
      return null;
    }
  }

  protected layoutData(xScale: ContinuousScale<X, number>, yScale: ContinuousScale<Y, number>,
                       bounds: BoxR2, anchor: PointR2): void {
    let datum0: DatumView<X, Y> | undefined;
    let datum1: DatumView<X, Y> | undefined;
    let y0: Y | undefined;
    let y1: Y | undefined;
    let xDomainMin: X | undefined;
    let xDomainMax: X | undefined;
    let xRangeMin: number | undefined;
    let xRangeMax: number | undefined;
    let yDomainMin: Y | undefined;
    let yDomainMax: Y | undefined;
    let yRangeMin: number | undefined;
    let yRangeMax: number | undefined;
    let gradientStops = 0;
    this._data.forEach(function (x2: X, datum2: DatumView<X, Y>): void {
      const y2 = datum2.y.value!;
      const ax2 = xScale.scale(x2);
      const ay2 = yScale.scale(y2);
      const datumAnchor = new PointR2(anchor.x + ax2, anchor.y + ay2);
      datum2.setAnchor(datumAnchor);

      const dy2 = datum2.y2.value;
      const ady2 = dy2 !== null && dy2 !== void 0 ? yScale.scale(dy2) : null;
      datum2._y2Coord = ady2 !== null ? anchor.y + ady2 : null;

      if (datum2.isGradientStop()) {
        gradientStops += 1;
      }

      if (datum1) {
        let category: DatumCategory;
        if (datum0) {
          // categorize mid point
          if (Objects.compare(y0!, y1!) < 0 && Objects.compare(y1!, y2) > 0) {
            category = "maxima";
          } else if (Objects.compare(y0!, y1!) > 0 && Objects.compare(y1!, y2) < 0) {
            category = "minima";
          } else if (Objects.compare(y0!, y1!) < 0 && Objects.compare(y1!, y2) < 0) {
            category = "increasing";
          } else if (Objects.compare(y0!, y1!) > 0 && Objects.compare(y1!, y2) > 0) {
            category = "decreasing";
          } else {
            category = "flat";
          }
        } else {
          // categorize start point
          if (Objects.compare(y1!, y2) < 0) {
            category = "increasing";
          } else if (Objects.compare(y1!, y2) > 0) {
            category = "decreasing";
          } else {
            category = "flat";
          }
        }
        datum1.category(category);

        // compute extrema
        if (Objects.compare(y2, yDomainMin!) < 0) {
          yDomainMin = y2;
        } else if (Objects.compare(y2, yDomainMax!) > 0) {
          yDomainMax = y2;
        }
        if (dy2 !== null && dy2 !== void 0) {
          if (Objects.compare(dy2, yDomainMin!) < 0) {
            yDomainMin = dy2;
          } else if (Objects.compare(dy2, yDomainMax!) > 0) {
            yDomainMax = dy2;
          }
        }
        if (ay2 < yRangeMin!) {
          yRangeMin = ay2;
        } else if (ay2 > yRangeMax!) {
          yRangeMax = ay2;
        }
      } else {
        xDomainMin = x2;
        xRangeMin = ax2;
        yDomainMin = y2;
        yDomainMax = y2;
        yRangeMin = ay2;
        yRangeMax = ay2;
      }

      datum0 = datum1;
      datum1 = datum2;
      y0 = y1;
      y1 = y2;
      xDomainMax = x2;
      xRangeMax = ax2;
    }, this);

    if (datum1) {
      let category: DatumCategory;
      if (datum0) {
        // categorize end point
        if (Objects.compare(y0!, y1!) < 0) {
          category = "increasing";
        } else if (Objects.compare(y0!, y1!) > 0) {
          category = "decreasing";
        } else {
          category = "flat";
        }
      } else {
        // categorize only point
        category = "flat";
      }
      datum1.category(category);

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
    this._gradientStops = gradientStops;
  }

  hitTest(x: number, y: number, viewContext: RenderedViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestGraph(x, y, context, this._bounds, this._anchor);
        context.restore();
      }
    }
    return hit;
  }

  protected abstract hitTestGraph(x: number, y: number, context: CanvasContext,
                                  bounds: BoxR2, anchor: PointR2): RenderedView | null;

  protected onInsertChildView(childView: View, targetView: View): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof DatumView) {
      this._data.set(childView.x.state!, childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof DatumView) {
      this._data.delete(childView.x.state!);
    }
    super.onRemoveChildView(childView);
  }

  static fromAny<X, Y>(graph: AnyGraphView<X, Y>): GraphView<X, Y>;
  static fromAny<X, Y>(plot: AnyPlotView<X, Y>): PlotView<X, Y>;
  static fromAny<X, Y>(plot: AnyPlotView<X, Y>): PlotView<X, Y> {
    return PlotView.fromAny(plot);
  }
}
