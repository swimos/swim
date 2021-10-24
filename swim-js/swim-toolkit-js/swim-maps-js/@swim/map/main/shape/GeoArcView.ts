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

import type {Mutable, Class} from "@swim/util";
import {Affinity, Animator} from "@swim/fastener";
import {
  AnyLength,
  Length,
  AnyAngle,
  Angle,
  AnyR2Point,
  R2Point,
  R2Segment,
  R2Box,
  R2Circle,
} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import {
  GraphicsView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
  PaintingContext,
  PaintingRenderer,
  CanvasContext,
  CanvasRenderer,
} from "@swim/graphics";
import {Arc} from "@swim/graphics";
import type {GeoViewInit} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoArcViewObserver} from "./GeoArcViewObserver";

export type AnyGeoArcView = GeoArcView | GeoArcViewInit;

export interface GeoArcViewInit extends GeoViewInit, FillViewInit, StrokeViewInit {
  geoCenter?: AnyGeoPoint;
  viewCenter?: R2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  padAngle?: AnyAngle;
  padRadius?: AnyLength | null;
  cornerRadius?: AnyLength;
}

export class GeoArcView extends GeoLayerView implements FillView, StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly observerType?: Class<GeoArcViewObserver>;

  @Animator<GeoArcView, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    willSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.callObservers("viewWillSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectArc(this.owner.viewContext);
      }
      this.owner.callObservers("viewDidSetGeoCenter", newGeoCenter, oldGeoCenter, this.owner);
    },
  })
  readonly geoCenter!: Animator<this, GeoPoint | null, AnyGeoPoint | null>;

  @Animator<GeoArcView, R2Point | null, AnyR2Point | null>({
    type: R2Point,
    state: R2Point.undefined(),
    updateFlags: View.NeedsRender,
  })
  readonly viewCenter!: Animator<this, R2Point | null, AnyR2Point | null>;

  @ThemeAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Angle, state: Angle.zero(), updateFlags: View.NeedsRender})
  readonly startAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Angle, state: Angle.zero(), updateFlags: View.NeedsRender})
  readonly sweepAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Angle, state: Angle.zero(), updateFlags: View.NeedsRender})
  readonly padAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsRender})
  readonly padRadius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, state: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Color, state: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Length, state: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  get value(): Arc | null {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      return new Arc(viewCenter, this.innerRadius.value, this.outerRadius.value,
                     this.startAngle.value, this.sweepAngle.value, this.padAngle.value,
                     this.padRadius.value, this.cornerRadius.value);
    } else {
      return null;
    }
  }

  get state(): Arc | null {
    const viewCenter = this.viewCenter.state;
    if (viewCenter !== null && viewCenter.isDefined()) {
      return new Arc(viewCenter, this.innerRadius.state, this.outerRadius.state,
                     this.startAngle.state, this.sweepAngle.state, this.padAngle.state,
                     this.padRadius.state, this.cornerRadius.state);
    } else {
      return null;
    }
  }

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectArc(viewContext);
  }

  protected projectGeoCenter(geoCenter: GeoPoint | null): void {
    if (this.mounted) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setInterpolatedValue(this.viewCenter.value, viewCenter);
      this.projectArc(viewContext);
    }
  }

  protected projectArc(viewContext: ViewContextType<this>): void {
    if (Affinity.Intrinsic >= this.viewCenter.affinity) { // this.viewCenter.hasAffinity(Affinity.Intrinsic)
      const geoCenter = this.geoCenter.value;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      (this.viewCenter as Mutable<typeof this.viewCenter>).value = viewCenter; // this.viewCenter.setValue(viewCenter)
    }
    const viewFrame = viewContext.viewFrame;
    const size = Math.min(viewFrame.width, viewFrame.height);
    const r = this.outerRadius.getValue().pxValue(size);
    const p0 = this.viewCenter.value;
    const p1 = this.viewCenter.state;
    if (p0 !== null && p1 !== null && (
        viewFrame.intersectsCircle(new R2Circle(p0.x, p0.y, r)) ||
        viewFrame.intersectsSegment(new R2Segment(p0.x, p0.y, p1.x, p1.y)))) {
      this.setCulled(false);
    } else {
      this.setCulled(true);
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof PaintingRenderer && !this.isHidden() && !this.culled) {
      this.renderArc(renderer.context, viewContext.viewFrame);
    }
  }

  protected renderArc(context: PaintingContext, frame: R2Box): void {
    const arc = this.value;
    if (arc !== null && frame.isDefined()) {
      // save
      const contextFillStyle = context.fillStyle;
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      context.beginPath();
      arc.draw(context, frame);

      const fill = this.fill.value;
      if (fill !== null) {
        context.fillStyle = fill.toString();
        context.fill();
      }

      const stroke = this.stroke.value;
      if (stroke !== null) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          const size = Math.min(frame.width, frame.height);
          context.lineWidth = strokeWidth.pxValue(size);
        }
        context.strokeStyle = stroke.toString();
        context.stroke();
      }

      // restore
      context.fillStyle = contextFillStyle;
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }

  protected override renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
    // nop
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override readonly viewBounds!: R2Box;

  override deriveViewBounds(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const viewFrame = this.viewContext.viewFrame;
      const size = Math.min(viewFrame.width, viewFrame.height);
      const radius = this.outerRadius.getValue().pxValue(size);
      return new R2Box(viewCenter.x - radius, viewCenter.y - radius,
                       viewCenter.x + radius, viewCenter.y + radius);
    } else {
      return R2Box.undefined();
    }
  }

  override get popoverFrame(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const viewFrame = this.viewContext.viewFrame;
      const size = Math.min(viewFrame.width, viewFrame.height);
      const inversePageTransform = this.pageTransform.inverse();
      const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
      const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
      const r = (this.innerRadius.getValue().pxValue(size) + this.outerRadius.getValue().pxValue(size)) / 2;
      const a = this.startAngle.getValue().radValue() + this.sweepAngle.getValue().radValue() / 2;
      const x = px + r * Math.cos(a);
      const y = py + r * Math.sin(a);
      return new R2Box(x, y, x, y);
    } else {
      return this.pageBounds;
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestArc(p.x, p.y, renderer.context, viewContext.viewFrame);
    }
    return null;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const arc = this.value;
    if (arc !== null) {
      context.beginPath();
      arc.draw(context, frame);
      if (this.fill.value !== null && context.isPointInPath(x, y)) {
        return this;
      } else if (this.stroke.value !== void 0) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          // save
          const contextLineWidth = context.lineWidth;

          const size = Math.min(frame.width, frame.height);
          context.lineWidth = strokeWidth.pxValue(size);
          const pointInStroke = context.isPointInStroke(x, y);

          // restore
          context.lineWidth = contextLineWidth;

          if (pointInStroke) {
            return this;
          }
        }
      }
    }
    return null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }

  override init(init: GeoArcViewInit): void {
    super.init(init);
    if (init.geoCenter !== void 0) {
      this.geoCenter(init.geoCenter);
    }
    if (init.viewCenter !== void 0) {
      this.viewCenter(init.viewCenter);
    }
    if (init.innerRadius !== void 0) {
      this.innerRadius(init.innerRadius);
    }
    if (init.outerRadius !== void 0) {
      this.outerRadius(init.outerRadius);
    }
    if (init.startAngle !== void 0) {
      this.startAngle(init.startAngle);
    }
    if (init.sweepAngle !== void 0) {
      this.sweepAngle(init.sweepAngle);
    }
    if (init.padAngle !== void 0) {
      this.padAngle(init.padAngle);
    }
    if (init.padRadius !== void 0) {
      this.padRadius(init.padRadius);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
    }
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
  }
}
