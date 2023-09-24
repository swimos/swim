// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {StrokeView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";
import {GeoPointView} from "./GeoPointView";

/** @public */
export interface GeoPlotViewObserver<V extends GeoPlotView = GeoPlotView> extends GeoViewObserver<V> {
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

  declare readonly observerType?: Class<GeoPlotViewObserver>;

  points(): readonly GeoPointView[] {
    const points: GeoPointView[] = [];
    let child = this.firstChild;
    while (child !== null) {
      if (child instanceof GeoPointView) {
        points.push(child);
      }
      child = child.nextSibling;
    }
    return points;
  }

  appendPoint(point: GeoPointView, key?: string): GeoPointView {
    this.appendChild(point, key);
    return point;
  }

  setPoint(key: string, point: GeoPointView): GeoPointView {
    this.setChild(key, point);
    return point;
  }

  @Property({valueType: GeoPoint, value: GeoPoint.origin()})
  readonly geoCentroid!: Property<this, GeoPoint>;

  @Property({valueType: R2Point, value: R2Point.origin()})
  readonly viewCentroid!: Property<this, R2Point>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  @Property({valueType: Number})
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

  protected override didProject(): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
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
    if (invalid || pointCount === 0) {
      this.geoCentroid.setIntrinsic(GeoPoint.origin());
      (this as Mutable<this>).geoBounds = GeoBox.undefined();
      this.viewCentroid.setIntrinsic(R2Point.origin());
      (this as Mutable<this>).viewBounds = R2Box.undefined();
      this.setCulled(true);
    } else {
      lngMid /= pointCount;
      latMid /= pointCount;
      this.geoCentroid.setIntrinsic(new GeoPoint(lngMid, latMid));
      (this as Mutable<this>).geoBounds = new GeoBox(lngMin, latMin, lngMax, latMax);
      xMid /= pointCount;
      yMid /= pointCount;
      this.viewCentroid.setIntrinsic(new R2Point(xMid, yMid));
      (this as Mutable<this>).viewBounds = new R2Box(xMin, yMin, xMax, yMax);
      this.cullGeoFrame(geoViewport.geoFrame);
    }
    (this as Mutable<this>).gradientStops = gradientStops;
    const newGeoBounds = this.geoBounds;
    if (!oldGeoBounds.equals(newGeoBounds)) {
      this.willSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.onSetGeoBounds(newGeoBounds, oldGeoBounds);
      this.didSetGeoBounds(newGeoBounds, oldGeoBounds);
    }
    super.didProject();
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      if (this.gradientStops !== 0 && renderer instanceof CanvasRenderer) {
        this.renderPlotGradient(renderer.context, this.viewFrame);
      } else {
        this.renderPlotStroke(renderer.context, this.viewFrame);
      }
    }
  }

  protected renderPlotStroke(context: PaintingContext, frame: R2Box): void {
    const stroke = this.stroke.value;
    if (stroke === null) {
      return;
    }

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
    if (pointCount === 0) {
      return;
    }

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
    const viewCentroid = this.viewCentroid.value;
    const inversePageTransform = this.pageTransform.inverse();
    const px = inversePageTransform.transformX(viewCentroid.x, viewCentroid.y);
    const py = inversePageTransform.transformY(viewCentroid.x, viewCentroid.y);
    return new R2Box(px, py, px, py);
  }

  override readonly viewBounds!: R2Box;

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestPlot(p.x, p.y, renderer.context, this.viewFrame);
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
    if (pointCount === 0) {
      return null;
    }

    // save
    const contextLineWidth = context.lineWidth;

    let hitWidth = this.hitWidth.getValueOr(0);
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== null) {
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }
    context.lineWidth = hitWidth;
    const pointInStroke = context.isPointInStroke(x, y);

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
