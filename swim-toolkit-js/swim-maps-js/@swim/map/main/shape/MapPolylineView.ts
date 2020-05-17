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
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {View, MemberAnimator, RenderedView, StrokeViewInit, StrokeView} from "@swim/view";
import {GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapViewContext} from "../MapViewContext";
import {MapViewInit} from "../MapView";
import {MapGraphicsView} from "../graphics/MapGraphicsView";
import {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import {AnyMapPointView, MapPointView} from "./MapPointView";

export type AnyMapPolylineView = MapPolylineView | MapPolylineViewInit;

export interface MapPolylineViewInit extends MapViewInit, StrokeViewInit {
  points?: AnyMapPointView[];

  hitWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class MapPolylineView extends MapGraphicsView implements StrokeView {
  /** @hidden */
  _hitWidth?: number;
  /** @hidden */
  _geoCenter: GeoPoint;
  /** @hidden */
  _viewCenter: PointR2;
  /** @hidden */
  _gradientStops: number;
  /** @hidden */
  _viewBounds: BoxR2;
  /** @hidden */
  _geoBounds: GeoBox;

  constructor() {
    super();
    this._geoCenter = GeoPoint.origin();
    this._viewCenter = PointR2.origin();
    this._gradientStops = 0;
    this._viewBounds = BoxR2.empty();
    this._geoBounds = GeoBox.empty();
  }

  get viewController(): MapGraphicsViewController<MapPolylineView> | null {
    return this._viewController;
  }

  points(): ReadonlyArray<MapPointView>;
  points(points: AnyMapPointView[], tween?: Tween<GeoPoint>): this;
  points(points?: AnyMapPointView[], tween?: Tween<GeoPoint>): ReadonlyArray<MapPointView> | this {
    const childViews = this._childViews;
    if (points === void 0) {
      points = [];
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i];
        if (childView instanceof MapPointView) {
          points.push(childView);
        }
      }
      return points as ReadonlyArray<MapPointView>;
    } else {
      const oldGeoBounds = this._geoBounds;
      let lngMin = Infinity;
      let latMin = Infinity;
      let lngMax = -Infinity;
      let latMax = -Infinity;
      let lngMid = 0;
      let latMid = 0;
      let invalid = false;
      let i = 0;
      let j = 0;
      while (i < childViews.length && j < points.length) {
        const childView = childViews[i];
        if (childView instanceof MapPointView) {
          const point = points[j];
          childView.setState(point);
          const {lng, lat} = childView.geoPoint.value!;
          lngMid += lng;
          latMid += lat;
          lngMin = Math.min(lngMin, lng);
          latMin = Math.min(latMin, lat);
          lngMax = Math.max(lng, lngMax);
          latMax = Math.max(lat, latMax);
          invalid = invalid || !isFinite(lng) || !isFinite(lat);
          j += 1;
        }
        i += 1;
      }
      while (j < points.length) {
        const point = MapPointView.fromAny(points[j]);
        this.appendChildView(point);
        const {lng, lat} = point.geoPoint.value!;
        lngMid += lng;
        latMid += lat;
        lngMin = Math.min(lngMin, lng);
        latMin = Math.min(latMin, lat);
        lngMax = Math.max(lng, lngMax);
        latMax = Math.max(lat, latMax);
        invalid = invalid || !isFinite(lng) || !isFinite(lat);
        i += 1;
        j += 1;
      }
      while (i < childViews.length) {
        const childView = childViews[i];
        if (childView instanceof MapPointView) {
          this.removeChildView(childView);
        } else {
          i += 1;
        }
      }
      if (!invalid && j !== 0) {
        lngMid /= j;
        latMid /= j;
        this._geoCenter = new GeoPoint(lngMid, latMid);
        this._geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      } else {
        this._geoCenter = GeoPoint.origin();
        this._geoBounds = GeoBox.empty();
      }
      const newGeoBounds = this._geoBounds;
      if (!oldGeoBounds.equals(newGeoBounds)) {
        this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
      }
      return this;
    }
  }

  appendPoint(point: AnyMapPointView, key?: string): MapPointView {
    point = MapPointView.fromAny(point);
    this.appendChildView(point, key);
    return point;
  }

  setPoint(key: string, point: AnyMapPointView): MapPointView {
    point = MapPointView.fromAny(point);
    this.setChildView(key, point);
    return point;
  }

  get geoCenter(): GeoPoint {
    return this._geoCenter;
  }

  get viewCenter(): PointR2 {
    return this._viewCenter;
  }

  @MemberAnimator(Color, {inherit: true})
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  hitWidth(): number | null;
  hitWidth(hitWidth: number | null): this;
  hitWidth(hitWidth?: number | null): number | null | this {
    if (hitWidth === void 0) {
      return this._hitWidth !== void 0 ? this._hitWidth : null;
    } else {
      if (hitWidth !== null) {
        this._hitWidth = hitWidth;
      } else if (this._hitWidth !== void 0) {
        this._hitWidth = void 0;
      }
      return this;
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof MapPointView) {
      this.onInsertPoint(childView);
    }
  }

  protected onInsertPoint(childView: MapPointView): void {
    childView.requireUpdate(View.NeedsAnimate | View.NeedsProject);
  }

  protected didProject(viewContext: MapViewContext): void {
    const oldGeoBounds = this._geoBounds;
    let lngMin = Infinity;
    let latMin = Infinity;
    let lngMax = -Infinity;
    let latMax = -Infinity;
    let lngMid = 0;
    let latMid = 0;
    let xMin = Infinity;
    let yMin = Infinity;
    let xMax = -Infinity;
    let yMax = -Infinity;
    let xMid = 0;
    let yMid = 0;
    let invalid = false;
    let gradientStops = 0;
    let pointCount = 0;
    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapPointView) {
        const {lng, lat} = childView.geoPoint.value!;
        lngMid += lng;
        latMid += lat;
        lngMin = Math.min(lngMin, lng);
        latMin = Math.min(latMin, lat);
        lngMax = Math.max(lng, lngMax);
        latMax = Math.max(lat, latMax);
        invalid = invalid || !isFinite(lng) || !isFinite(lat);
        const {x, y} = childView.viewPoint.value!;
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
        xMax = Math.max(x, xMax);
        yMax = Math.max(y, yMax);
        xMid += x;
        yMid += x;
        invalid = invalid || !isFinite(x) || !isFinite(y);
        if (childView.isGradientStop()) {
          gradientStops += 1;
        }
        pointCount += 1;
      }
    }
    if (!invalid && pointCount !== 0) {
      lngMid /= pointCount;
      latMid /= pointCount;
      this._geoCenter = new GeoPoint(lngMid, latMid);
      this._geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      xMid /= pointCount;
      yMid /= pointCount;
      this._viewCenter = new PointR2(xMid, yMid);
      this._viewBounds = new BoxR2(xMin, yMin, xMax, yMax);
      this.cullGeoFrame(viewContext.geoFrame);
    } else {
      this._geoCenter = GeoPoint.origin();
      this._geoBounds = GeoBox.empty();
      this._viewCenter = PointR2.origin();
      this._viewBounds = BoxR2.empty();
      this.setCulled(true);
    }
    this._gradientStops = gradientStops;
    const newGeoBounds = this._geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    super.didProject(viewContext);
  }

  protected onRender(viewContext: MapViewContext): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      if (this._gradientStops !== 0) {
        this.renderPolylineGradient(context, this.viewFrame);
      } else {
        this.renderPolylineStroke(context, this.viewFrame);
      }
      context.restore();
    }
  }

  protected renderPolylineStroke(context: CanvasContext, frame: BoxR2): void {
    const childViews = this._childViews;
    const childCount = childViews.length;
    let pointCount = 0;
    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof MapPointView) {
        const {x, y} = childView.viewPoint.value!;
        if (pointCount === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        pointCount += 1;
      }
    }
    if (pointCount !== 0) {
      const stroke = this.stroke.value;
      if (stroke !== void 0) {
        const size = Math.min(frame.width, frame.height);
        const strokeWidth = this.strokeWidth.value!.pxValue(size);
        context.strokeStyle = stroke.toString();
        context.lineWidth = strokeWidth;
        context.stroke();
      }
    }
  }

  protected renderPolylineGradient(context: CanvasContext, frame: BoxR2): void {
    const stroke = this.stroke.value!;
    const size = Math.min(frame.width, frame.height);
    const strokeWidth = this.strokeWidth.value!.pxValue(size);
    const childViews = this._childViews;
    const childCount = childViews.length;
    let p0: MapPointView | undefined;
    for (let i = 0; i < childCount; i += 1) {
      const p1 = childViews[i];
      if (p1 instanceof MapPointView) {
        if (p0 !== void 0) {
          const x0 = p0.viewPoint.value!.x;
          const y0 = p0.viewPoint.value!.y;
          const x1 = p1.viewPoint.value!.x;
          const y1 = p1.viewPoint.value!.y;
          const gradient = context.createLinearGradient(x0, y0, x1, y1);

          let color = p0.color.value;
          if (color === void 0) {
            color = stroke;
          }
          let opacity = p0.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(0, color.toString());

          color = p1.color.value;
          if (color === void 0) {
            color = stroke;
          }
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

  get popoverFrame(): BoxR2 {
    const viewCenter = this._viewCenter;
    const inversePageTransform = this.pageTransform.inverse();
    const [px, py] = inversePageTransform.transform(viewCenter.x, viewCenter.y);
    return new BoxR2(px, py, px, py);
  }

  get viewBounds(): BoxR2 {
    return this._viewBounds;
  }

  get hitBounds(): BoxR2 {
    return this.viewBounds;
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
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestPolyline(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestPolyline(x: number, y: number, context: CanvasContext, frame: BoxR2): RenderedView | null {
    const childViews = this._childViews;
    const childCount = childViews.length;
    let pointCount = 0;
    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = this._childViews[i];
      if (childView instanceof MapPointView) {
        const {x, y} = childView.viewPoint.value!;
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        pointCount += 1;
      }
    }
    if (pointCount !== 0) {
      let hitWidth = this._hitWidth !== void 0 ? this._hitWidth : 0;
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        const size = Math.min(frame.width, frame.height);
        hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
      }
      context.lineWidth = hitWidth;
      if (context.isPointInStroke(x, y)) {
        return this;
      }
    }
    return null;
  }

  static fromAny(polyline: AnyMapPolylineView): MapPolylineView {
    if (polyline instanceof MapPolylineView) {
      return polyline;
    } else if (typeof polyline === "object" && polyline !== null) {
      const view = new MapPolylineView();
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
        view.points(points);
      }
      if (polyline.hidden !== void 0) {
        view.setHidden(polyline.hidden);
      }
      if (polyline.culled !== void 0) {
        view.setCulled(polyline.culled);
      }
      return view;
    }
    throw new TypeError("" + polyline);
  }
}
