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

import {AnyPointR2, PointR2, BoxR2, CircleR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  View,
  MemberAnimator,
  RenderedView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AnyGeoPoint, GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapViewContext} from "../MapViewContext";
import {MapViewInit} from "../MapView";
import {MapGraphicsView} from "../graphics/MapGraphicsView";
import {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";

export type AnyMapCircleView = MapCircleView | MapCircleViewInit;

export interface MapCircleViewInit extends MapViewInit, FillViewInit, StrokeViewInit {
  geoCenter?: AnyGeoPoint;
  viewCenter?: AnyPointR2;
  radius?: AnyLength;
  hitRadius?: number;
}

export class MapCircleView extends MapGraphicsView implements FillView, StrokeView {
  /** @hidden */
  _hitRadius?: number;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoBounds = GeoBox.empty();
    this.geoCenter.onUpdate = this.onSetGeoCenter.bind(this);
  }

  get viewController(): MapGraphicsViewController<MapCircleView> | null {
    return this._viewController;
  }

  @MemberAnimator(GeoPoint, {value: GeoPoint.origin()})
  geoCenter: MemberAnimator<this, GeoPoint, AnyGeoPoint>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  viewCenter: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Length, {value: 0})
  radius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  hitRadius(): number | null;
  hitRadius(hitRadius: number | null): this;
  hitRadius(hitRadius?: number | null): number | null | this {
    if (hitRadius === void 0) {
      return this._hitRadius !== void 0 ? this._hitRadius : null;
    } else {
      if (hitRadius !== null) {
        this._hitRadius = hitRadius;
      } else if (this._hitRadius !== void 0) {
        this._hitRadius = void 0;
      }
      return this;
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | undefined, oldGeoCenter: GeoPoint | undefined): void {
    if (newGeoCenter !== void 0) {
      const oldGeoBounds = this._geoBounds;
      const newGeoBounds = new GeoBox(newGeoCenter._lng, newGeoCenter._lat, newGeoCenter._lng, newGeoCenter._lat);
      this._geoBounds = newGeoBounds;
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    this.requireUpdate(View.NeedsProject);
  }

  protected onProject(viewContext: MapViewContext): void {
    super.onProject(viewContext);
    let viewCenter: PointR2;
    if (this.viewCenter.isAuto()) {
      const geoProjection = viewContext.geoProjection;
      viewCenter = geoProjection.project(this.geoCenter.value!);
      this.viewCenter.setAutoState(viewCenter);
    } else {
      viewCenter = this.viewCenter.value!;
    }
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.value!.pxValue(size);
    const invalid = !isFinite(viewCenter.x) || !isFinite(viewCenter.y) || !isFinite(radius);
    const culled = invalid || !frame.intersectsCircle(new CircleR2(viewCenter.x, viewCenter.y, radius));
    this.setCulled(culled);
  }

  protected onRender(viewContext: MapViewContext): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderCircle(renderer.context, this.viewFrame);
      context.restore();
    }
  }

  protected renderCircle(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.value!;
    const radius = this.radius.value!.pxValue(size);

    context.beginPath();
    context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);

    const fill = this.fill.value;
    if (fill !== void 0) {
      context.fillStyle = fill.toString();
      context.fill();
    }

    const stroke = this.stroke.value;
    if (stroke !== void 0) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
  }

  get popoverFrame(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const viewCenter = this.viewCenter.value!;
    const [px, py] = inversePageTransform.transform(viewCenter.x, viewCenter.y);
    const radius = this.radius.value!.pxValue(size);
    return new BoxR2(px - radius, py - radius, px + radius, py + radius);
  }

  get viewBounds(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.value!;
    const radius = this.radius.value!.pxValue(size);
    return new BoxR2(viewCenter.x - radius, viewCenter.y - radius,
                     viewCenter.x + radius, viewCenter.y + radius);
  }

  get hitBounds(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.value!;
    const radius = this.radius.value!.pxValue(size);
    const hitRadius = this._hitRadius !== void 0 ? Math.max(this._hitRadius, radius) : radius;
    return new BoxR2(viewCenter.x - hitRadius, viewCenter.y - hitRadius,
                     viewCenter.x + hitRadius, viewCenter.y + hitRadius);
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  hitTest(x: number, y: number, viewContext: MapViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestCircle(x, y, context, this.viewFrame, renderer.pixelRatio);
      }
    }
    return hit;
  }

  protected hitTestCircle(x: number, y: number, context: CanvasContext,
                          frame: BoxR2, pixelRatio: number): RenderedView | null {
    const size = Math.min(frame.width, frame.height);
    const viewCenter = this.viewCenter.value!;
    const radius = this.radius.value!.pxValue(size);

    if (this.fill.value !== void 0) {
      const hitRadius = this._hitRadius !== void 0 ? Math.max(this._hitRadius, radius) : radius;
      const dx = viewCenter.x - x;
      const dy = viewCenter.y - y;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        return this;
      }
    }

    const strokeWidth = this.strokeWidth.value;
    if (this.stroke.value !== void 0 && strokeWidth !== void 0) {
      x *= pixelRatio;
      y *= pixelRatio;

      context.save();
      context.beginPath();
      context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);
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
    } else if (typeof circle === "object" && circle !== null) {
      const view = new MapCircleView();
      if (circle.geoCenter !== void 0) {
        view.geoCenter(circle.geoCenter);
      }
      if (circle.viewCenter !== void 0) {
        view.viewCenter(circle.viewCenter);
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
      if (circle.hidden !== void 0) {
        view.setHidden(circle.hidden);
      }
      if (circle.culled !== void 0) {
        view.setCulled(circle.culled);
      }
      return view;
    }
    throw new TypeError("" + circle);
  }
}
