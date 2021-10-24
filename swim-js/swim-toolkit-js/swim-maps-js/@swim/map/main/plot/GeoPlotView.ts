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

import type {Mutable, Class, AnyTiming} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import {
  GraphicsView,
  StrokeViewInit,
  StrokeView,
  PaintingContext,
  PaintingRenderer,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
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

  override readonly observerType?: Class<GeoPlotViewObserver>;

  points(): ReadonlyArray<GeoPointView>;
  points(points: ReadonlyArray<AnyGeoPointView>, timing?: AnyTiming | boolean): this;
  points(points?: ReadonlyArray<AnyGeoPointView>, timing?: AnyTiming | boolean): ReadonlyArray<GeoPointView> | this {
    const children = this.children;
    if (points === void 0) {
      const points: GeoPointView[] = [];
      for (let i = 0; i < children.length; i += 1) {
        const childView = children[i];
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
      while (i < children.length && j < points.length) {
        const childView = children[i];
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
        this.appendChild(point);
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
      while (i < children.length) {
        const childView = children[i];
        if (childView instanceof GeoPointView) {
          this.removeChild(childView);
        } else {
          i += 1;
        }
      }
      if (!invalid && j !== 0) {
        lngMid /= j;
        latMid /= j;
        this.geoCentroid.setState(new GeoPoint(lngMid, latMid), Affinity.Intrinsic);
        (this as Mutable<this>).geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      } else {
        this.geoCentroid.setState(GeoPoint.origin(), Affinity.Intrinsic);
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
    this.appendChild(point, key);
    return point;
  }

  setPoint(key: string, point: AnyGeoPointView): GeoPointView {
    point = GeoPointView.fromAny(point);
    this.setChild(key, point);
    return point;
  }

  @Property({type: GeoPoint, state: GeoPoint.origin()})
  readonly geoCentroid!: Property<this, GeoPoint, AnyGeoPoint>;

  @Property({type: R2Point, state: R2Point.origin()})
  readonly viewCentroid!: Property<this, R2Point, AnyR2Point>;

  @ThemeAnimator({type: Color, state: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Length, state: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Font, state: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, state: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @Property({type: Number})
  readonly hitWidth!: Property<this, number | undefined>;

  /** @internal */
  readonly gradientStops: number;

  protected override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
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
    const children = this.children;
    for (let i = 0; i < children.length; i += 1) {
      const childView = children[i];
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
      this.geoCentroid.setState(new GeoPoint(lngMid, latMid), Affinity.Intrinsic);
      (this as Mutable<this>).geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      xMid /= pointCount;
      yMid /= pointCount;
      this.viewCentroid.setState(new R2Point(xMid, yMid), Affinity.Intrinsic);
      (this as Mutable<this>).viewBounds = new R2Box(xMin, yMin, xMax, yMax);
      this.cullGeoFrame(viewContext.geoViewport.geoFrame);
    } else {
      this.geoCentroid.setState(GeoPoint.origin(), Affinity.Intrinsic);
      (this as Mutable<this>).geoBounds = GeoBox.undefined();
      this.viewCentroid.setState(R2Point.origin(), Affinity.Intrinsic);
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
    if (renderer instanceof PaintingRenderer && !this.isHidden() && !this.culled) {
      if (this.gradientStops !== 0 && renderer instanceof CanvasRenderer) {
        this.renderPlotGradient(renderer.context, viewContext.viewFrame);
      } else {
        this.renderPlotStroke(renderer.context, viewContext.viewFrame);
      }
    }
  }

  protected renderPlotStroke(context: PaintingContext, frame: R2Box): void {
    const stroke = this.stroke.value;
    if (stroke !== null) {
      const children = this.children;
      const childCount = children.length;
      let pointCount = 0;

      context.beginPath();
      for (let i = 0; i < childCount; i += 1) {
        const childView = children[i];
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
        // save
        const contextLineWidth = context.lineWidth;
        const contextStrokeStyle = context.strokeStyle;

        const size = Math.min(frame.width, frame.height);
        const strokeWidth = this.strokeWidth.getValue().pxValue(size);
        context.lineWidth = strokeWidth;
        context.strokeStyle = stroke.toString();
        context.stroke();

        // restore
        context.lineWidth = contextLineWidth;
        context.strokeStyle = contextStrokeStyle;
      }
    }
  }

  protected renderPlotGradient(context: CanvasContext, frame: R2Box): void {
    const stroke = this.stroke.getValue();
    const size = Math.min(frame.width, frame.height);
    const strokeWidth = this.strokeWidth.getValue().pxValue(size);
    const children = this.children;
    const childCount = children.length;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    let p0: GeoPointView | undefined;
    for (let i = 0; i < childCount; i += 1) {
      const p1 = children[i];
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
          context.lineWidth = strokeWidth;
          context.strokeStyle = gradient;
          context.stroke();
        }
        p0 = p1;
      }
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
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
      const p = renderer.transform.transform(x, y);
      return this.hitTestPlot(p.x, p.y, renderer.context, viewContext.viewFrame);
    }
    return null;
  }

  protected hitTestPlot(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const children = this.children;
    const childCount = children.length;
    let pointCount = 0;

    context.beginPath();
    for (let i = 0; i < childCount; i += 1) {
      const childView = this.children[i];
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
      // save
      const contextLineWidth = context.lineWidth;

      let hitWidth = this.hitWidth.getStateOr(0);
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
        const size = Math.min(frame.width, frame.height);
        hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
      }
      context.lineWidth = hitWidth;
      const pointInStroke = context.isPointInStroke(x, y);

      // restore
      context.lineWidth = contextLineWidth;

      if (pointInStroke) {
        return this;
      }
    }

    return null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  override init(init: GeoPlotViewInit): void {
    super.init(init);
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
}
