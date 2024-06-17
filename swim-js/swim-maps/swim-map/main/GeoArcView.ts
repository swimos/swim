// Copyright 2015-2024 Nstream, inc.
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
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Segment} from "@swim/math";
import {R2Box} from "@swim/math";
import {R2Circle} from "@swim/math";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {FillView} from "@swim/graphics";
import type {StrokeView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {Arc} from "@swim/graphics";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";

/** @public */
export interface GeoArcViewObserver<V extends GeoArcView = GeoArcView> extends GeoViewObserver<V> {
  viewDidSetGeoCenter?(geoCenter: GeoPoint | null, view: V): void;
}

/** @public */
export class GeoArcView extends GeoView implements FillView, StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly observerType?: Class<GeoArcViewObserver>;

  @Animator({
    valueType: GeoPoint,
    value: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectArc();
      }
      this.owner.callObservers("viewDidSetGeoCenter", newGeoCenter, this.owner);
    },
  })
  readonly geoCenter!: Animator<this, GeoPoint | null>;

  @Animator({valueType: R2Point, value: R2Point.undefined(), updateFlags: View.NeedsRender})
  readonly viewCenter!: Animator<this, R2Point | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly startAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly sweepAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly padAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsRender})
  readonly padRadius!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  get value(): Arc | null {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return null;
    }
    return new Arc(viewCenter, this.innerRadius.value, this.outerRadius.value,
                   this.startAngle.value, this.sweepAngle.value, this.padAngle.value,
                   this.padRadius.value, this.cornerRadius.value);
  }

  get state(): Arc | null {
    const viewCenter = this.viewCenter.state;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return null;
    }
    return new Arc(viewCenter, this.innerRadius.state, this.outerRadius.state,
                   this.startAngle.state, this.sweepAngle.state, this.padAngle.state,
                   this.padRadius.state, this.cornerRadius.state);
  }

  protected override onProject(): void {
    super.onProject();
    this.projectArc();
  }

  protected projectGeoCenter(geoCenter: GeoPoint | null): void {
    const geoViewport = this.geoViewport.value;
    if (!this.mounted || geoViewport === null) {
      return;
    }
    const viewCenter = geoCenter !== null && geoCenter.isDefined()
                     ? geoViewport.project(geoCenter)
                     : null;
    this.viewCenter.setInterpolatedValue(this.viewCenter.value, viewCenter);
    this.projectArc();
  }

  protected projectArc(): void {
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    if (Affinity.Intrinsic >= (this.viewCenter.flags & Affinity.Mask)) { // this.viewCenter.hasAffinity(Affinity.Intrinsic)
      const geoCenter = this.geoCenter.value;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? geoViewport.project(geoCenter)
                       : null;
      (this.viewCenter as Mutable<typeof this.viewCenter>).value = viewCenter; // this.viewCenter.setIntrinsic(viewCenter);
    }
    const viewFrame = this.viewFrame;
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

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderArc(renderer.context, this.viewFrame);
    }
  }

  protected renderArc(context: PaintingContext, frame: R2Box): void {
    const arc = this.value;
    if (arc === null || !frame.isDefined()) {
      return;
    }

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

  protected override renderGeoBounds(outlineColor: Color, outlineWidth: number): void {
    // nop
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  override readonly viewBounds!: R2Box;

  override deriveViewBounds(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return R2Box.undefined();
    }
    const viewFrame = this.viewFrame;
    const size = Math.min(viewFrame.width, viewFrame.height);
    const radius = this.outerRadius.getValue().pxValue(size);
    return new R2Box(viewCenter.x - radius, viewCenter.y - radius,
                     viewCenter.x + radius, viewCenter.y + radius);
  }

  override get popoverFrame(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return this.pageBounds;
    }
    const viewFrame = this.viewFrame;
    const size = Math.min(viewFrame.width, viewFrame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const px = inversePageTransform.transformX(viewCenter.x, viewCenter.y);
    const py = inversePageTransform.transformY(viewCenter.x, viewCenter.y);
    const r = (this.innerRadius.getValue().pxValue(size) + this.outerRadius.getValue().pxValue(size)) / 2;
    const a = this.startAngle.getValue().radValue() + this.sweepAngle.getValue().radValue() / 2;
    const x = px + r * Math.cos(a);
    const y = py + r * Math.sin(a);
    return new R2Box(x, y, x, y);
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestArc(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const arc = this.value;
    if (arc === null) {
      return null;
    }
    context.beginPath();
    arc.draw(context, frame);
    if (this.fill.value !== null && context.isPointInPath(x, y)) {
      return this;
    }
    let strokeWidth: Length | null;
    if (this.stroke.value === null || (strokeWidth = this.strokeWidth.value) === null) {
      return null;
    }

    // save
    const contextLineWidth = context.lineWidth;

    const size = Math.min(frame.width, frame.height);
    context.lineWidth = strokeWidth.pxValue(size);
    const pointInStroke = context.isPointInStroke(x, y);

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
