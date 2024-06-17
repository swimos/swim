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
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Easing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import type {GeoPointLike} from "@swim/geo";
import {GeoPoint} from "@swim/geo";
import {GeoBox} from "@swim/geo";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {ColorOrLookLike} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {StrokeView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import type {GeoViewport} from "./GeoViewport";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";

/** @public */
export interface GeoRippleOptions {
  source?: GeoView | null;
  center?: GeoPointLike | null;
  width?: LengthLike | null;
  radius?: LengthLike | null;
  color?: ColorOrLookLike | null;
  opacity?: number;
  timing?: TimingLike | number | boolean;
}

/** @public */
export interface GeoRippleViewObserver<V extends GeoRippleView = GeoRippleView> extends GeoViewObserver<V> {
  viewDidSetGeoCenter?(geoCenter: GeoPoint | null, view: V): void;
}

/** @public */
export class GeoRippleView extends GeoView implements StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.setFlags(this.flags | View.UnboundedFlag);
  }

  declare readonly observerType?: Class<GeoRippleViewObserver>;

  @Animator({
    valueType: GeoPoint,
    value: null,
    didSetState(geoCenter: GeoPoint | null): void {
      this.owner.projectGeoCenter(geoCenter);
    },
    didSetValue(geoCenter: GeoPoint | null): void {
      this.owner.setGeoBounds(geoCenter !== null ? geoCenter.bounds : GeoBox.undefined());
      if (this.mounted) {
        this.owner.projectRipple();
      }
      this.owner.callObservers("viewDidSetGeoCenter", geoCenter, this.owner);
    },
  })
  readonly geoCenter!: Animator<this, GeoPoint | null>;

  @Animator({
    valueType: R2Point,
    value: R2Point.undefined(),
    updateFlags: View.NeedsRender,
    didSetValue(viewCenter: R2Point | null): void {
      this.owner.updateViewBounds();
    },
  })
  readonly viewCenter!: Animator<this, R2Point | null>;

  @ThemeAnimator({
    valueType: Length,
    value: Length.zero(),
    updateFlags: View.NeedsRender,
    didTransition() {
      this.owner.source.setView(null);
      this.owner.remove();
    },
  })
  readonly radius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.accentColor, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: Length.px(1), inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  @ViewRef({
    observes: true,
    didAttachView(sourceView: GeoView): void {
      this.owner.geoCenter.setIntrinsic(sourceView.geoBounds.center);
    },
    viewDidUnmount(sourceView: GeoView): void {
      this.owner.remove();
    },
    viewDidSetGeoBounds(geoBounds: GeoBox): void {
      this.owner.geoCenter.setIntrinsic(geoBounds.center);
    },
  })
  readonly source!: ViewRef<this, GeoView> & Observes<GeoView>;

  protected override onProject(): void {
    super.onProject();
    this.projectRipple();
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
    this.projectRipple();
  }

  protected projectRipple(): void {
    const geoViewport = this.geoViewport.value;
    if (!this.viewCenter.hasAffinity(Affinity.Intrinsic) || geoViewport === null) {
      return;
    }
    const geoCenter = this.geoCenter.value;
    const viewCenter = geoCenter !== null && geoCenter.isDefined()
                     ? geoViewport.project(geoCenter)
                     : null;
    this.viewCenter.setIntrinsic(viewCenter);
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderRipple(renderer.context, this.viewFrame);
    }
  }

  protected renderRipple(context: PaintingContext, frame: R2Box): void {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return;
    }
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValue().pxValue(size);
    const stroke = this.stroke.value;
    if (stroke === null) {
      return;
    }

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);

    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== null) {
      context.lineWidth = strokeWidth.pxValue(size);
    }
    context.strokeStyle = stroke.toString();
    context.stroke();

    // restore
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

  protected updateViewBounds(): void {
    (this as Mutable<GeoRippleView>).viewBounds = this.deriveViewBounds();
  }

  override deriveViewBounds(): R2Box {
    const viewCenter = this.viewCenter.value;
    if (viewCenter === null || !viewCenter.isDefined()) {
      return R2Box.undefined();
    }
    return viewCenter.bounds;
  }

  ripple(options?: GeoRippleOptions): this {
    let source: GeoView | null;
    if (options === void 0 || options.source === void 0) {
      source = null;
    } else {
      source = options.source;
    }
    let center: GeoPoint | null;
    if (options === void 0 || options.center === void 0 || options.center === null) {
      center = null;
    } else {
      center = GeoPoint.fromLike(options.center);
    }
    let width: Length | null;
    if (options === void 0 || options.width === void 0 || options.width === null) {
      width = null;
    } else {
      width = Length.fromLike(options.width);
    }
    let radius: Length;
    if (options === void 0 || options.radius === void 0 || options.radius === null) {
      radius = Length.pct(12.5);
    } else {
      radius = Length.fromLike(options.radius);
    }
    let color: Color | null;
    if (options === void 0 || options.color === void 0 || options.color === null) {
      color = this.getLookOr(Look.accentColor, null);
    } else if (options.color instanceof Look) {
      color = this.getLookOr(options.color, null);
    } else {
      color = Color.fromLike(options.color);
    }
    let timing: Timing | boolean;
    if (options === void 0 || options.timing === void 0 || options.timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else if (typeof options.timing === "number") {
      timing = Easing.linear.withDuration(options.timing);
    } else {
      timing = Timing.fromLike(options.timing);
    }
    const opacity = options !== void 0 ? options.opacity : void 0;

    if (source !== null) {
      this.source.setView(source);
    }
    if (center !== null) {
      this.geoCenter.setIntrinsic(center);
    }
    if (width !== null) {
      this.strokeWidth.setIntrinsic(width);
    }
    this.radius.set(radius, timing);
    if (color !== null) {
      this.stroke.set(opacity !== void 0 ? color.alpha(opacity) : color);
      this.stroke.set(color.alpha(0), timing);
    }

    return this;
  }

  static ripple(sourceView: GeoView, options?: GeoRippleOptions): GeoRippleView | null {
    let geoViewport: GeoViewport | null;
    if (document.hidden || sourceView.hidden || sourceView.culled
        || (geoViewport = sourceView.geoViewport.value) === null
        || !sourceView.geoBounds.intersects(geoViewport.geoFrame)) {
      return null;
    }
    const rippleView = GeoRippleView.create();
    rippleView.source.setView(sourceView);
    let containerView = sourceView.getRoot(GeoView);
    if (containerView === null) {
      containerView = sourceView;
    }
    containerView.appendChild(rippleView);
    rippleView.ripple(options);
    return rippleView;
  }
}
