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

import {PointR2, BoxR2, CircleR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  RenderedView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AnyLngLat, LngLat} from "./LngLat";
import {MapViewContext} from "./MapViewContext";
import {MapView} from "./MapView";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewController} from "./MapGraphicsViewController";

export type AnyMapCircleView = MapCircleView | MapCircleViewInit;

export interface MapCircleViewInit extends ViewInit, FillViewInit, StrokeViewInit {
  center?: AnyLngLat;
  radius?: AnyLength;
  hitRadius?: number;
}

export class MapCircleView extends MapGraphicsView implements FillView, StrokeView {
  /** @hidden */
  _viewController: MapGraphicsViewController<MapCircleView> | null;
  /** @hidden */
  _point: PointR2;
  /** @hidden */
  _hitRadius: number;

  constructor(center: LngLat = LngLat.origin(), radius: Length = Length.zero()) {
    super();
    this.center.setState(center);
    this.radius.setState(radius);
    this._point = PointR2.origin();
    this._hitRadius = 0;
  }

  get viewController(): MapGraphicsViewController<MapCircleView> | null {
    return this._viewController;
  }

  @MemberAnimator(LngLat)
  center: MemberAnimator<this, LngLat, AnyLngLat>;

  @MemberAnimator(Length)
  radius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  hitRadius(): number;
  hitRadius(hitRadius: number): this;
  hitRadius(hitRadius?: number): number | this {
    if (hitRadius === void 0) {
      return this._hitRadius;
    } else {
      this._hitRadius = hitRadius;
      return this;
    }
  }

  protected onAnimate(viewContext: MapViewContext): void {
    const t = viewContext.updateTime;
    const oldCenter = this.center.value!;
    this.center.onFrame(t);
    const newCenter = this.center.value!;
    this.radius.onFrame(t);
    this.fill.onFrame(t);
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);

    if (oldCenter !== newCenter) {
      this.requireUpdate(MapView.NeedsProject);
    }
  }

  protected onProject(viewContext: MapViewContext): void {
    const projection = viewContext.projection;
    const bounds = this._bounds;
    const point = projection.project(this.center.value!);
    this._point = point;
    const size = Math.min(bounds.width, bounds.height);
    const radius = this.radius.value!.pxValue(size);
    const hitRadius = Math.max(this._hitRadius, radius);
    this._hitBounds = new BoxR2(point.x - hitRadius, point.y - hitRadius,
                                point.x + hitRadius, point.y + hitRadius);
  }

  protected onLayout(viewContext: MapViewContext): void {
    const bounds = this._bounds;
    const point = this._point;
    const size = Math.min(bounds.width, bounds.height);
    const radius = this.radius.value!.pxValue(size);
    const invalid = !isFinite(point.x) || !isFinite(point.y) || !isFinite(radius);
    const culled = invalid || !bounds.intersectsCircle(new CircleR2(point.x, point.y, radius));
    this.setCulled(culled);
    this.layoutChildViews(viewContext);
  }

  protected onRender(viewContext: MapViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.renderCircle(context, this._bounds, this._anchor);
      context.restore();
    }
  }

  protected renderCircle(context: CanvasContext, bounds: BoxR2, anchor: PointR2): void {
    const size = Math.min(bounds.width, bounds.height);

    context.beginPath();
    const radius = this.radius.value!.pxValue(size);
    context.arc(this._point.x, this._point.y, radius, 0, 2 * Math.PI);

    const fill = this.fill.value;
    if (fill) {
      context.fillStyle = fill.toString();
      context.fill();
    }

    const stroke = this.stroke.value;
    if (stroke) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth) {
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
  }

  get popoverBounds(): BoxR2 {
    const inversePageTransform = this.pageTransform.inverse();
    const hitBounds = this._hitBounds;
    if (hitBounds !== null) {
      return hitBounds.transform(inversePageTransform);
    } else {
      const point = this._point.transform(inversePageTransform);
      const pointX = Math.round(point.x);
      const pointY = Math.round(point.y);
      return new BoxR2(pointX, pointY, pointX, pointY);
    }
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestCircle(x, y, context, this._bounds, this._anchor, renderer.pixelRatio);
      }
    }
    return hit;
  }

  protected hitTestCircle(x: number, y: number, context: CanvasContext,
                          bounds: BoxR2, anchor: PointR2,
                          pixelRatio: number): RenderedView | null {
    const size = Math.min(bounds.width, bounds.height);
    const radius = this.radius.value!.pxValue(size);

    if (this.fill.value) {
      const hitRadius = Math.max(this._hitRadius, radius);
      const dx = this._point.x - x;
      const dy = this._point.y - y;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        return this;
      }
    }

    const strokeWidth = this.strokeWidth.value;
    if (this.stroke.value && strokeWidth) {
      x *= pixelRatio;
      y *= pixelRatio;

      context.save();
      context.beginPath();
      context.arc(this._point.x, this._point.y, radius, 0, 2 * Math.PI);
      context.lineWidth = strokeWidth.pxValue(size);
      if (context.isPointInStroke(x, y)) {
        context.restore();
        return this;
      } else {
        context.restore();
      }
    }
    return null;
  }

  static fromAny(circle: AnyMapCircleView): MapCircleView {
    if (circle instanceof MapCircleView) {
      return circle;
    } else if (typeof circle === "object" && circle) {
      const view = new MapCircleView();
      if (circle.key !== void 0) {
        view.key(circle.key);
      }
      if (circle.center !== void 0) {
        view.center(circle.center);
      }
      if (circle.radius !== void 0) {
        view.radius(circle.radius);
      }
      if (circle.hitRadius !== void 0) {
        view.hitRadius(circle.hitRadius);
      }
      if (circle.fill !== void 0) {
        view.fill(circle.fill);
      }
      if (circle.stroke !== void 0) {
        view.stroke(circle.stroke);
      }
      if (circle.strokeWidth !== void 0) {
        view.strokeWidth(circle.strokeWidth);
      }
      return view;
    }
    throw new TypeError("" + circle);
  }
}
