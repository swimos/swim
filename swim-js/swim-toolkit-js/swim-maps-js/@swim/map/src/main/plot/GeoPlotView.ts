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
import {Affinity, Property} from "@swim/component";
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
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import {AnyGeoPointView, GeoPointView} from "./GeoPointView";
import type {GeoPlotViewObserver} from "./GeoPlotViewObserver";

/** @public */
export type AnyGeoPlotView = GeoPlotView | GeoPlotViewInit;

/** @public */
export interface GeoPlotViewInit extends GeoViewInit, StrokeViewInit {
  points?: ReadonlyArray<AnyGeoPointView>;

  hitWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

/** @public */
export class GeoPlotView extends GeoView implements StrokeView {
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
    let child: View | null;
    if (points === void 0) {
      const points: GeoPointView[] = [];
      child = this.firstChild;
      while (child !== null) {
        if (child instanceof GeoPointView) {
          points.push(child);
        }
        child = child.nextSibling;
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
      child = this.firstChild;
      while (child !== null && i < points.length) {
        if (child instanceof GeoPointView) {
          const point = points[i]!;
          child.setState(point);
          const {lng, lat} = child.geoPoint.getValue();
          lngMid += lng;
          latMid += lat;
          lngMin = Math.min(lngMin, lng);
          latMin = Math.min(latMin, lat);
          lngMax = Math.max(lng, lngMax);
          latMax = Math.max(lat, latMax);
          invalid = invalid || !isFinite(lng) || !isFinite(lat);
          i += 1;
        }
      }
      while (i < points.length) {
        const point = GeoPointView.fromAny(points[i]!);
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
      }
      while (child !== null) {
        const next = child.nextSibling;
        if (child instanceof GeoPointView) {
          this.removeChild(child);
        }
        child = next;
      }
      if (!invalid && i !== 0) {
        lngMid /= i;
        latMid /= i;
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
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof GeoPointView) {
        const {lng, lat} = child.geoPoint.getValue();
        lngMid += lng;
        latMid += lat;
        lngMin = Math.min(lngMin, lng);
        latMin = Math.min(latMin, lat);
        lngMax = Math.max(lng, lngMax);
        latMax = Math.max(lat, latMax);
        invalid = invalid || !isFinite(lng) || !isFinite(lat);
        const {x, y} = child.viewPoint.getValue();
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
        xMax = Math.max(x, xMax);
        yMax = Math.max(y, yMax);
        xMid += x;
        yMid += y;
        invalid = invalid || !isFinite(x) || !isFinite(y);
        if (child.isGradientStop()) {
          gradientStops += 1;
        }
        pointCount += 1;
      }
      child = child.nextSibling;
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
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
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
      let pointCount = 0;

      context.beginPath();
      let child = this.firstChild;
      while (child !== null) {
        if (child instanceof GeoPointView) {
          const {x, y} = child.viewPoint.getValue();
          if (pointCount === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
          pointCount += 1;
        }
        child = child.nextSibling;
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

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    let p0: GeoPointView | undefined;
    let p1 = this.firstChild;
    while (p1 !== null) {
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
      p1 = p1.nextSibling;
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
    let pointCount = 0;

    context.beginPath();
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof GeoPointView) {
        const {x, y} = child.viewPoint.getValue();
        if (pointCount === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
        pointCount += 1;
      }
      child = child.nextSibling;
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
