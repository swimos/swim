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
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Segment} from "@swim/math";
import {R2Box} from "@swim/math";
import {R2Circle} from "@swim/math";
import type {Transform} from "@swim/math";
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
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";

/** @public */
export interface GeoCircleViewObserver<V extends GeoCircleView = GeoCircleView> extends GeoViewObserver<V> {
  viewDidSetGeoCenter?(geoCenter: GeoPoint | null, view: V): void;
}

/** @public */
export class GeoCircleView extends GeoView implements FillView, StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly observerType?: Class<GeoCircleViewObserver>;

  @Animator({
    valueType: GeoPoint,
    value: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectCircle();
      }
      this.owner.callObservers("viewDidSetGeoCenter", newGeoCenter, this.owner);
    },
  })
  readonly geoCenter!: Animator<this, GeoPoint | null>;

  @Animator({valueType: R2Point, value: R2Point.undefined(), updateFlags: View.NeedsRender})
  readonly viewCenter!: Animator<this, R2Point | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly radius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  @Property({valueType: Number})
  readonly hitRadius!: Property<this, number | undefined>;

  protected override onProject(): void {
    super.onProject();
    this.projectCircle();
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
    this.projectCircle();
  }

  protected projectCircle(): void {
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
    const r = this.radius.getValue().pxValue(size);
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
      this.renderCircle(renderer.context, this.viewFrame);
    }
  }

  protected renderCircle(context: PaintingContext, frame: R2Box): void {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return;
    }

    // save
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValue().pxValue(size);

    context.beginPath();
    context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);

    const fill = this.fill.value;
    if (fill !== null) {
      context.fillStyle = fill.toString();
      context.fill();
    }

    const stroke = this.stroke.value;
    if (stroke !== null) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
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
    const radius = this.radius.getValue().pxValue(size);
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
    const radius = this.radius.getValue().pxValue(size);
    return new R2Box(px - radius, py - radius, px + radius, py + radius);
  }

  override get hitBounds(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return this.viewBounds;
    }
    const viewFrame = this.viewFrame;
    const size = Math.min(viewFrame.width, viewFrame.height);
    const radius = this.radius.getValue().pxValue(size);
    const hitRadius = Math.max(this.hitRadius.getValueOr(radius), radius);
    return new R2Box(viewCenter.x - hitRadius, viewCenter.y - hitRadius,
                     viewCenter.x + hitRadius, viewCenter.y + hitRadius);
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestCircle(x, y, renderer.context, this.viewFrame, renderer.transform);
    }
    return null;
  }

  protected hitTestCircle(x: number, y: number, context: CanvasContext,
                          frame: R2Box, transform: Transform): GraphicsView | null {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return null;
    }
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValue().pxValue(size);

    if (this.fill.value !== null) {
      const hitRadius = Math.max(this.hitRadius.getValueOr(radius), radius);
      const dx = viewCenter.x - x;
      const dy = viewCenter.y - y;
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
        return this;
      }
    }

    let strokeWidth: Length | null;
    if (this.stroke.value === null || (strokeWidth = this.strokeWidth.value) === null) {
      return null;
    }

    // save
    const contextLineWidth = context.lineWidth;

    const p = transform.transform(x, y);
    context.beginPath();
    context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);
    context.lineWidth = strokeWidth.pxValue(size);
    const pointInStroke = context.isPointInStroke(p.x, p.y);

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
