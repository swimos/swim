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

import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {MemberAnimator, ViewInit, View, RenderedView, StrokeViewInit, StrokeView} from "@swim/view";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewController} from "./MapGraphicsViewController";
import {AnyMapPointView, MapPointView} from "./MapPointView";

export type AnyMapPolylineView = MapPolylineView | MapPolylineViewInit;

export interface MapPolylineViewInit extends ViewInit, StrokeViewInit {
  points?: AnyMapPointView[];

  hitWidth?: number;

  font?: AnyFont | null;
  textColor?: AnyColor | null;
}

export class MapPolylineView extends MapGraphicsView implements StrokeView {
  /** @hidden */
  _viewController: MapGraphicsViewController<MapPolylineView> | null;
  /** @hidden */
  _gradientStops: number;
  /** @hidden */
  _hitWidth: number;

  constructor() {
    super();
    this.stroke.setState(Color.black());
    this.strokeWidth.setState(Length.px(1));
    this._gradientStops = 0;
    this._hitWidth = 5;
  }

  get viewController(): MapGraphicsViewController<MapPolylineView> | null {
    return this._viewController;
  }

  get points(): ReadonlyArray<MapPointView> {
    const points = [];
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapPointView) {
        points.push(childView);
      }
    }
    return points;
  }

  appendPoint(point: AnyMapPointView): MapPointView {
    point = MapPointView.fromAny(point);
    this.appendChildView(point);
    this.requireUpdate(View.NeedsAnimate | MapView.NeedsProject);
    return point;
  }

  setPoint(key: string, point: AnyMapPointView): MapPointView {
    point = MapPointView.fromAny(point);
    this.setChildView(key, point);
    this.requireUpdate(View.NeedsAnimate | MapView.NeedsProject);
    return point;
  }

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  hitWidth(): number;
  hitWidth(hitWidth: number): this;
  hitWidth(hitWidth?: number): number | this {
    if (hitWidth === void 0) {
      return this._hitWidth;
    } else {
      this._hitWidth = hitWidth;
      return this;
    }
  }

  protected onAnimate(viewContext: MapViewContext): void {
    const t = viewContext.updateTime;
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);
    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onProject(viewContext: MapViewContext): void {
    const projection = viewContext.projection;
    const childViews = this._childViews;
    const n = childViews.length;
    let k = 0;
    let cx = 0;
    let cy = 0;
    let gradientStops = 0;
    let hitBounds: BoxR2 | null = null;
    let invalid = false;
    let xMin = Infinity;
    let yMin = Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;
    for (let i = 0; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapPointView) {
        const coord = childView.coord.value!;
        const point = projection.project(coord);
        k += 1;
        cx += point.x;
        cy += point.y;
        invalid = invalid || !isFinite(point.x) || !isFinite(point.y);
        xMin = Math.min(xMin, point.x);
        yMin = Math.min(yMin, point.y);
        xMax = Math.max(point.x, xMax);
        yMax = Math.max(point.y, yMax);
        if (childView.isGradientStop()) {
          gradientStops += 1;
        }
      }
    }
    if (k > 0) {
      cx /= k;
      cy /= k;
      if (!invalid) {
        hitBounds = new BoxR2(xMin, yMin, xMax, yMax);
      }
    }
    this._gradientStops = gradientStops;
    this._hitBounds = hitBounds;
    this.setAnchor(new PointR2(cx, cy));
  }

  protected onLayout(viewContext: MapViewContext): void {
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      const bounds = this._bounds;
      const culled = !bounds.intersects(hitBounds);
      this.setCulled(culled);
    } else {
      this.setCulled(true);
    }
    this.layoutChildViews(viewContext);
  }

  protected onRender(viewContext: MapViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      if (this._gradientStops) {
        this.renderPolylineGradient(context, this._bounds, this._anchor);
      } else {
        this.renderPolylineStroke(context, this._bounds, this._anchor);
      }
      context.restore();
    }
  }

  protected renderPolylineStroke(context: CanvasContext, bounds: BoxR2, anchor: PointR2): void {
    const childViews = this._childViews;
    const stroke = this.stroke.value!;
    const strokeWidth = this.strokeWidth.value!.pxValue(Math.min(bounds.width, bounds.height));

    context.beginPath();
    let k = 0;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapPointView) {
        const x = childView.x;
        const y = childView.y;
        if (k === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        k += 1;
      }
    }
    context.strokeStyle = stroke.toString();
    context.lineWidth = strokeWidth;
    context.stroke();
  }

  protected renderPolylineGradient(context: CanvasContext, bounds: BoxR2, anchor: PointR2): void {
    const childViews = this._childViews;
    const stroke = this.stroke.value!;
    const strokeWidth = this.strokeWidth.value!.pxValue(Math.min(bounds.width, bounds.height));

    let p0: MapPointView | undefined;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const p1 = childViews[i];
      if (p1 instanceof MapPointView) {
        if (p0 !== void 0) {
          const x0 = p0.x;
          const y0 = p0.y;
          const x1 = p1.x;
          const y1 = p1.y;
          const gradient = context.createLinearGradient(x0, y0, x1, y1);

          let color = p0.color.value || stroke;
          let opacity = p0.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(0, color.toString());

          color = p1.color.value || stroke;
          opacity = p1.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(1, color.toString());

          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.strokeStyle = gradient;
          context.lineWidth = strokeWidth;
          context.stroke();
        }
        p0 = p1;
      }
    }
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestPolyline(x, y, context, this._bounds, this._anchor);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestPolyline(x: number, y: number, context: CanvasContext,
                            bounds: BoxR2, anchor: PointR2): RenderedView | null {
    let hitWidth = this._hitWidth;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth) {
      const bounds = this.bounds;
      const size = Math.min(bounds.width, bounds.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = this._childViews[i];
      if (childView instanceof MapPointView) {
        const x = childView.x;
        const y = childView.y;
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
    }

    context.lineWidth = hitWidth;
    if (context.isPointInStroke(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(polyline: AnyMapPolylineView): MapPolylineView {
    if (polyline instanceof MapPolylineView) {
      return polyline;
    } else if (typeof polyline === "object" && polyline) {
      const view = new MapPolylineView();
      if (polyline.key !== void 0) {
        view.key(polyline.key);
      }
      if (polyline.stroke !== void 0) {
        view.stroke(polyline.stroke);
      }
      if (polyline.strokeWidth !== void 0) {
        view.strokeWidth(polyline.strokeWidth);
      }
      if (polyline.hitWidth !== void 0) {
        view.hitWidth(polyline.hitWidth);
      }
      if (polyline.font !== void 0) {
        view.font(polyline.font);
      }
      if (polyline.textColor !== void 0) {
        view.textColor(polyline.textColor);
      }
      const points = polyline.points;
      if (points !== void 0) {
        for (let i = 0, n = points.length; i < n; i += 1) {
          view.appendPoint(points[i]);
        }
      }
      return view;
    }
    throw new TypeError("" + polyline);
  }
}
