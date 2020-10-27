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

import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import {GraphicsView, StrokeViewInit, StrokeView} from "@swim/graphics";
import {GeoPoint} from "../geo/GeoPoint";
import {GeoBox} from "../geo/GeoBox";
import {MapGraphicsViewInit} from "../graphics/MapGraphicsView";
import {MapLayerView} from "../graphics/MapLayerView";
import {AnyMapPointView, MapPointView} from "./MapPointView";

export type AnyMapPolylineView = MapPolylineView | MapPolylineViewInit;

export interface MapPolylineViewInit extends MapGraphicsViewInit, StrokeViewInit {
  points?: AnyMapPointView[];

  hitWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class MapPolylineView extends MapLayerView implements StrokeView {
  /** @hidden */
  _hitWidth?: number;
  /** @hidden */
  _geoCenter: GeoPoint;
  /** @hidden */
  _viewCentroid: PointR2;
  /** @hidden */
  _gradientStops: number;
  /** @hidden */
  _geoBounds: GeoBox;
  /** @hidden */
  _viewBounds: BoxR2;

  constructor() {
    super();
    this._geoCenter = GeoPoint.origin();
    this._viewCentroid = PointR2.origin();
    this._gradientStops = 0;
    this._geoBounds = GeoBox.undefined();
    this._viewBounds = BoxR2.undefined();
  }

  initView(init: MapPolylineViewInit): void {
    super.initView(init);
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
    if (init.hitWidth !== void 0) {
      this.hitWidth(init.hitWidth);
    }
    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
    const points = init.points;
    if (points !== void 0) {
      this.points(points);
    }
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
          const {lng, lat} = childView.geoPoint.getValue();
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
        const {lng, lat} = point.geoPoint.getValue();
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
        this._geoBounds = GeoBox.undefined();
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

  get geoCentroid(): GeoPoint {
    return this._geoCenter;
  }

  get viewCentroid(): PointR2 {
    return this._viewCentroid;
  }

  @ViewAnimator({type: Color, inherit: true})
  stroke: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  strokeWidth: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

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

  protected didProject(viewContext: ViewContextType<this>): void {
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
        const {lng, lat} = childView.geoPoint.getValue();
        lngMid += lng;
        latMid += lat;
        lngMin = Math.min(lngMin, lng);
        latMin = Math.min(latMin, lat);
        lngMax = Math.max(lng, lngMax);
        latMax = Math.max(lat, latMax);
        invalid = invalid || !isFinite(lng) || !isFinite(lat);
        const {x, y} = childView.viewPoint.getValue();
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
        xMax = Math.max(x, xMax);
        yMax = Math.max(y, yMax);
        xMid += x;
        yMid += y;
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
      this._viewCentroid = new PointR2(xMid, yMid);
      this._viewBounds = new BoxR2(xMin, yMin, xMax, yMax);
      this.cullGeoFrame(viewContext.geoFrame);
    } else {
      this._geoCenter = GeoPoint.origin();
      this._geoBounds = GeoBox.undefined();
      this._viewCentroid = PointR2.origin();
      this._viewBounds = BoxR2.undefined();
      this.setCulled(true);
    }
    this._gradientStops = gradientStops;
    const newGeoBounds = this._geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    super.didProject(viewContext);
  }

  protected onRender(viewContext: ViewContextType<this>): void {
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
        const {x, y} = childView.viewPoint.getValue();
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
        const strokeWidth = this.strokeWidth.getValue().pxValue(size);
        context.strokeStyle = stroke.toString();
        context.lineWidth = strokeWidth;
        context.stroke();
      }
    }
  }

  protected renderPolylineGradient(context: CanvasContext, frame: BoxR2): void {
    const stroke = this.stroke.getValue();
    const size = Math.min(frame.width, frame.height);
    const strokeWidth = this.strokeWidth.getValue().pxValue(size);
    const childViews = this._childViews;
    const childCount = childViews.length;
    let p0: MapPointView | undefined;
    for (let i = 0; i < childCount; i += 1) {
      const p1 = childViews[i];
      if (p1 instanceof MapPointView) {
        if (p0 !== void 0) {
          const x0 = p0.viewPoint.getValue().x;
          const y0 = p0.viewPoint.getValue().y;
          const x1 = p1.viewPoint.getValue().x;
          const y1 = p1.viewPoint.getValue().y;
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
    const viewCentroid = this._viewCentroid;
    const inversePageTransform = this.pageTransform.inverse();
    const [px, py] = inversePageTransform.transform(viewCentroid.x, viewCentroid.y);
    return new BoxR2(px, py, px, py);
  }

  get geoBounds(): GeoBox {
    return this._geoBounds;
  }

  get viewBounds(): BoxR2 {
    return this._viewBounds;
  }

  get hitBounds(): BoxR2 {
    return this.viewBounds;
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
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

  protected hitTestPolyline(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    const childViews = this._childViews;
    const childCount = childViews.length;
    let pointCount = 0;
    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = this._childViews[i];
      if (childView instanceof MapPointView) {
        const {x, y} = childView.viewPoint.getValue();
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

  static fromInit(init: MapPolylineViewInit): MapPolylineView {
    const view = new MapPolylineView();
    view.initView(init);
    return view;
  }

  static value(value: AnyMapPolylineView): MapPolylineView {
    if (value instanceof MapPolylineView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
