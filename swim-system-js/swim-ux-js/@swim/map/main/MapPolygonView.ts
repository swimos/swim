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
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  AnyMemberAnimator,
  ViewInit,
  View,
  RenderView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapView} from "./MapView";
import {MapViewContext} from "./MapViewContext";
import {MapGraphicView} from "./MapGraphicView";
import {MapGraphicViewController} from "./MapGraphicViewController";

export type AnyMapPolygonView = MapPolygonView | MapPolygonViewInit;

export interface MapPolygonViewInit extends ViewInit, FillViewInit, StrokeViewInit {
  coords?: AnyLngLat[];
}

export class MapPolygonView extends MapGraphicView implements FillView, StrokeView {
  /** @hidden */
  _viewController: MapGraphicViewController<MapPolygonView> | null;
  /** @hidden */
  readonly _coords: MemberAnimator<this, LngLat, AnyLngLat>[];
  /** @hidden */
  readonly _points: PointR2[];

  constructor() {
    super();
    this._coords = [];
    this._points = [];
  }

  get viewController(): MapGraphicViewController<MapPolygonView> | null {
    return this._viewController;
  }

  get coords(): ReadonlyArray<MemberAnimator<this, LngLat, AnyLngLat>> {
    return this._coords;
  }

  setCoords(coords: AnyLngLat[], tween?: Tween<LngLat>): void {
    let i = 0;
    for (const n = Math.min(this._coords.length, coords.length); i < n; i += 1) {
      const coord = LngLat.fromAny(coords[i]);
      this._coords[i].setState(coord, tween);
    }
    for (const n = coords.length; i < n; i += 1) {
      const coord = LngLat.fromAny(coords[i]);
      this._coords.push(new AnyMemberAnimator(LngLat, this, coord as LngLat));
      this._points.push(PointR2.origin());
      this.requireUpdate(View.NeedsAnimate | MapView.NeedsProject);
    }
    this._coords.length = coords.length;
  }

  get points(): ReadonlyArray<PointR2> {
    return this._points;
  }

  appendCoord(coord: AnyLngLat): void {
    coord = LngLat.fromAny(coord);
    this._coords.push(new AnyMemberAnimator(LngLat, this, coord as LngLat));
    this._points.push(PointR2.origin());
    this.requireUpdate(View.NeedsAnimate | MapView.NeedsProject);
  }

  insertCoord(index: number, coord: AnyLngLat): void {
    coord = LngLat.fromAny(coord);
    this._coords.splice(index, 0, new AnyMemberAnimator(LngLat, this, coord as LngLat));
    this._points.splice(index, 0, PointR2.origin());
    this.requireUpdate(View.NeedsAnimate | MapView.NeedsProject);
  }

  removeCoord(index: number): void {
    this._coords.splice(index, 1);
    this._points.splice(index, 1);
  }

  @MemberAnimator(Color, {inherit: true})
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  protected onAnimate(viewContext: MapViewContext): void {
    const t = viewContext.updateTime;
    let moved = false;
    const coords = this._coords;
    for (let i = 0, n = coords.length; i < n; i += 1) {
      const point = coords[i];
      const oldPoint = point.value!;
      point.onFrame(t);
      const newPoint = point.value!;
      if (oldPoint !== newPoint) {
        moved = true;
      }
    }
    this.fill.onFrame(t);
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);

    if (moved) {
      this.requireUpdate(MapView.NeedsProject);
    }
  }

  protected onProject(viewContext: MapViewContext): void {
    const projection = viewContext.projection;
    const coords = this._coords;
    const points = this._points;
    const n = coords.length;
    let cx = 0;
    let cy = 0;
    let hitBounds: BoxR2 | null = null;
    if (n > 0) {
      let invalid = false;
      let xMin = Infinity;
      let yMin = Infinity;
      let xMax = -Infinity;
      let yMax = -Infinity;
      for (let i = 0; i < n; i += 1) {
        const coord = coords[i].value!;
        const point = projection.project(coord);
        points[i] = point;
        cx += point.x;
        cy += point.y;
        invalid = invalid || !isFinite(point.x) || !isFinite(point.y);
        xMin = Math.min(xMin, point.x);
        yMin = Math.min(yMin, point.y);
        xMax = Math.max(point.x, xMax);
        yMax = Math.max(point.y, yMax);
      }
      cx /= n;
      cy /= n;
      if (!invalid) {
        hitBounds = new BoxR2(xMin, yMin, xMax, yMax);
      }
    }
    this._hitBounds = hitBounds;
    this.setAnchor(new PointR2(cx, cy));
  }

  protected onLayout(viewContext: MapViewContext): void {
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      const bounds = this._bounds;
      // check if 3x3 viewport fully contains hitBounds
      const contained = bounds.xMin - bounds.width <= hitBounds.xMin
                     && hitBounds.xMax <= bounds.xMax + bounds.width
                     && bounds.yMin - bounds.height <= hitBounds.yMin
                     && hitBounds.yMax <= bounds.yMax + bounds.height;
      const culled = !contained || !bounds.intersects(hitBounds);
      this.setCulled(culled);
    } else {
      this.setCulled(true);
    }
    this.layoutChildViews(viewContext);
  }

  protected onRender(viewContext: MapViewContext): void {
    const context = viewContext.renderingContext;
    context.save();
    const bounds = this._bounds;
    const anchor = this._anchor;
    this.renderPolygon(context, bounds, anchor);
    context.restore();
  }

  protected renderPolygon(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const points = this._points;
    const n = points.length;
    if (n > 0) {
      context.beginPath();
      const start = points[0];
      context.moveTo(start.x, start.y);
      for (let i = 1; i < n; i += 1) {
        const point = points[i];
        context.lineTo(point.x, point.y);
      }
      context.closePath();

      const fill = this.fill.value;
      if (fill) {
        context.fillStyle = fill.toString();
        context.fill();
      }

      const stroke = this.stroke.value;
      if (stroke) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth) {
          const size = Math.min(bounds.width, bounds.height);
          context.lineWidth = strokeWidth.pxValue(size);
          context.strokeStyle = stroke.toString();
          context.stroke();
        }
      }
    }
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    let hit = super.hitTest(x, y, context);
    if (hit === null) {
      context.save();
      const pixelRatio = this.pixelRatio;
      x *= pixelRatio;
      y *= pixelRatio;
      const bounds = this._bounds;
      const anchor = this._anchor;
      hit = this.hitTestPolygon(x, y, context, bounds, anchor);
      context.restore();
    }
    return hit;
  }

  protected hitTestPolygon(x: number, y: number, context: RenderingContext,
                           bounds: BoxR2, anchor: PointR2): RenderView | null {
    const points = this._points;
    const n = points.length;
    if (n > 0) {
      context.beginPath();
      const start = points[0];
      context.moveTo(start.x, start.y);
      for (let i = 1; i < n; i += 1) {
        const point = points[i];
        context.lineTo(point.x, point.y);
      }
      context.closePath();

      if (this.fill.value && context.isPointInPath(x, y)) {
        return this;
      }

      if (this.stroke.value) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth) {
          const size = Math.min(bounds.width, bounds.height);
          context.lineWidth = strokeWidth.pxValue(size);
          if (context.isPointInStroke(x, y)) {
            return this;
          }
        }
      }
    }
    return null;
  }

  static fromAny(polygon: AnyMapPolygonView): MapPolygonView {
    if (polygon instanceof MapPolygonView) {
      return polygon;
    } else if (typeof polygon === "object" && polygon) {
      const view = new MapPolygonView();
      if (polygon.key !== void 0) {
        view.key(polygon.key);
      }
      if (polygon.fill !== void 0) {
        view.fill(polygon.fill);
      }
      if (polygon.stroke !== void 0) {
        view.stroke(polygon.stroke);
      }
      if (polygon.strokeWidth !== void 0) {
        view.strokeWidth(polygon.strokeWidth);
      }
      const coords = polygon.coords;
      if (coords !== void 0) {
        for (let i = 0, n = coords.length; i < n; i += 1) {
          view.appendCoord(coords[i]);
        }
      }
      return view;
    }
    throw new TypeError("" + polygon);
  }
}
