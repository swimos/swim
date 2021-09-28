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

import type {Mutable, AnyTiming} from "@swim/util";
import {AnyLength, Length, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewProperty, ViewAnimator} from "@swim/view";
import {GraphicsView, StrokeViewInit, StrokeView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import {AnyGeoPointView, GeoPointView} from "./GeoPointView";
import type {GeoPlotViewObserver} from "./GeoPlotViewObserver";

export type AnyGeoPlotView = GeoPlotView | GeoPlotViewInit;

export interface GeoPlotViewInit extends GeoViewInit, StrokeViewInit {
  points?: ReadonlyArray<AnyGeoPointView>;

  hitWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class GeoPlotView extends GeoLayerView implements StrokeView {
  constructor() {
    super();
    this.gradientStops = 0;
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: GeoPlotViewInit): void {
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

  override readonly viewObservers!: ReadonlyArray<GeoPlotViewObserver>;

  points(): ReadonlyArray<GeoPointView>;
  points(points: ReadonlyArray<AnyGeoPointView>, timing?: AnyTiming | boolean): this;
  points(points?: ReadonlyArray<AnyGeoPointView>, timing?: AnyTiming | boolean): ReadonlyArray<GeoPointView> | this {
    const childViews = this.childViews;
    if (points === void 0) {
      const points: GeoPointView[] = [];
      for (let i = 0; i < childViews.length; i += 1) {
        const childView = childViews[i];
        if (childView instanceof GeoPointView) {
          points.push(childView);
        }
      }
      return points;
    } else {
      const oldGeoBounds = this.geoBounds;
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
        if (childView instanceof GeoPointView) {
          const point = points[j]!;
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
        const point = GeoPointView.fromAny(points[j]!);
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
        if (childView instanceof GeoPointView) {
          this.removeChildView(childView);
        } else {
          i += 1;
        }
      }
      if (!invalid && j !== 0) {
        lngMid /= j;
        latMid /= j;
        this.geoCentroid.setState(new GeoPoint(lngMid, latMid), View.Intrinsic);
        (this as Mutable<this>).geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      } else {
        this.geoCentroid.setState(GeoPoint.origin(), View.Intrinsic);
        (this as Mutable<this>).geoBounds = GeoBox.undefined();
      }
      const newGeoBounds = this.geoBounds;
      if (!oldGeoBounds.equals(newGeoBounds)) {
        this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
        this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
        this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
      }
      return this;
    }
  }

  appendPoint(point: AnyGeoPointView, key?: string): GeoPointView {
    point = GeoPointView.fromAny(point);
    this.appendChildView(point, key);
    return point;
  }

  setPoint(key: string, point: AnyGeoPointView): GeoPointView {
    point = GeoPointView.fromAny(point);
    this.setChildView(key, point);
    return point;
  }

  @ViewProperty({type: GeoPoint, state: GeoPoint.origin()})
  readonly geoCentroid!: ViewProperty<this, GeoPoint, AnyGeoPoint>;

  @ViewProperty({type: R2Point, state: R2Point.origin()})
  readonly viewCentroid!: ViewProperty<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null, inherit: true})
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Font, state: null, inherit: true})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, state: null, inherit: true})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewProperty({type: Number})
  readonly hitWidth!: ViewProperty<this, number | undefined>;

  /** @hidden */
  readonly gradientStops: number;

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof GeoPointView) {
      this.onInsertPoint(childView);
    }
  }

  protected onInsertPoint(childView: GeoPointView): void {
    childView.requireUpdate(View.NeedsAnimate | View.NeedsProject);
  }

  protected override didProject(viewContext: ViewContextType<this>): void {
    const oldGeoBounds = this.geoBounds;
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
    const childViews = this.childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      if (childView instanceof GeoPointView) {
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
      this.geoCentroid.setState(new GeoPoint(lngMid, latMid), View.Intrinsic);
      (this as Mutable<this>).geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      xMid /= pointCount;
      yMid /= pointCount;
      this.viewCentroid.setState(new R2Point(xMid, yMid), View.Intrinsic);
      (this as Mutable<this>).viewBounds = new R2Box(xMin, yMin, xMax, yMax);
      this.cullGeoFrame(viewContext.geoViewport.geoFrame);
    } else {
      this.geoCentroid.setState(GeoPoint.origin(), View.Intrinsic);
      (this as Mutable<this>).geoBounds = GeoBox.undefined();
      this.viewCentroid.setState(R2Point.origin(), View.Intrinsic);
      (this as Mutable<this>).viewBounds = R2Box.undefined();
      this.setCulled(true);
    }
    (this as Mutable<this>).gradientStops = gradientStops;
    const newGeoBounds = this.geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    super.didProject(viewContext);
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      if (this.gradientStops !== 0) {
        this.renderPlotGradient(context, this.viewFrame);
      } else {
        this.renderPlotStroke(context, this.viewFrame);
      }
      context.restore();
    }
  }

  protected renderPlotStroke(context: CanvasContext, frame: R2Box): void {
    const childViews = this.childViews;
    const childCount = childViews.length;
    let pointCount = 0;
    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof GeoPointView) {
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
      if (stroke !== null) {
        const size = Math.min(frame.width, frame.height);
        const strokeWidth = this.strokeWidth.getValue().pxValue(size);
        context.strokeStyle = stroke.toString();
        context.lineWidth = strokeWidth;
        context.stroke();
      }
    }
  }

  protected renderPlotGradient(context: CanvasContext, frame: R2Box): void {
    const stroke = this.stroke.getValue();
    const size = Math.min(frame.width, frame.height);
    const strokeWidth = this.strokeWidth.getValue().pxValue(size);
    const childViews = this.childViews;
    const childCount = childViews.length;
    let p0: GeoPointView | undefined;
    for (let i = 0; i < childCount; i += 1) {
      const p1 = childViews[i];
      if (p1 instanceof GeoPointView) {
        if (p0 !== void 0) {
          const x0 = p0.viewPoint.getValue().x;
          const y0 = p0.viewPoint.getValue().y;
          const x1 = p1.viewPoint.getValue().x;
          const y1 = p1.viewPoint.getValue().y;
          const gradient = context.createLinearGradient(x0, y0, x1, y1);

          let color = p0.color.getValueOr(stroke);
          let opacity = p0.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(0, color.toString());

          color = p1.color.getValueOr(stroke);
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

  protected override updateGeoBounds(): void {
    // nop
  }

  override get popoverFrame(): R2Box {
    const viewCentroid = this.viewCentroid.state;
    const inversePageTransform = this.pageTransform.inverse();
    const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
    const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
    return new R2Box(px, py, px, py);
  }

  override readonly viewBounds!: R2Box;

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      const p = renderer.transform.transform(x, y);
      const hit = this.hitTestPlot(p.x, p.y, context, this.viewFrame);
      context.restore();
      return hit;
    }
    return null;
  }

  protected hitTestPlot(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const childViews = this.childViews;
    const childCount = childViews.length;
    let pointCount = 0;
    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = this.childViews[i];
      if (childView instanceof GeoPointView) {
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
      let hitWidth = this.hitWidth.getStateOr(0);
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
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

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  static override create(): GeoPlotView {
    return new GeoPlotView();
  }

  static fromInit(init: GeoPlotViewInit): GeoPlotView {
    const view = new GeoPlotView();
    view.initView(init);
    return view;
  }

  static value(value: AnyGeoPlotView): GeoPlotView {
    if (value instanceof GeoPlotView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
