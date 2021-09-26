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

import type {Mutable} from "@swim/util";
import {AnyTiming, Timing, Easing} from "@swim/mapping";
import {AnyLength, Length, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPoint, GeoBox} from "@swim/geo";
import {AnyColor, Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewContextType, View, ViewAnimator, ViewFastener} from "@swim/view";
import {StrokeView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {GeoView} from "../geo/GeoView";
import {GeoLayerView} from "../layer/GeoLayerView";
import type {GeoRippleViewObserver} from "./GeoRippleViewObserver";

export interface GeoRippleOptions {
  source?: GeoView | null;
  center?: AnyGeoPoint | null;
  width?: AnyLength | null;
  radius?: AnyLength | null;
  color?: Look<Color> | AnyColor | null;
  opacity?: number;
  timing?: AnyTiming | number | boolean;
}

export class GeoRippleView extends GeoLayerView implements StrokeView {
  constructor() {
    super();
    Object.defineProperty(this, "viewBounds", {
      value: R2Box.undefined(),
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.setViewFlags(this.viewFlags | View.UnboundedFlag);
  }

  override readonly viewObservers!: ReadonlyArray<GeoRippleViewObserver>;

  protected willSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetGeoCenter !== void 0) {
        viewObserver.viewWillSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  protected onSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    this.setGeoBounds(newGeoCenter !== null ? newGeoCenter.bounds : GeoBox.undefined());
    if (this.isMounted()) {
      this.projectRipple(this.viewContext as ViewContextType<this>);
    }
  }

  protected didSetGeoCenter(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetGeoCenter !== void 0) {
        viewObserver.viewDidSetGeoCenter(newGeoCenter, oldGeoCenter, this);
      }
    }
  }

  @ViewAnimator<GeoRippleView, GeoPoint | null, AnyGeoPoint | null>({
    type: GeoPoint,
    state: null,
    didSetState(newGeoCenter: GeoPoint | null, oldGeoCemter: GeoPoint | null): void {
      this.owner.projectGeoCenter(newGeoCenter);
    },
    willSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.willSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
    didSetValue(newGeoCenter: GeoPoint | null, oldGeoCenter: GeoPoint | null): void {
      this.owner.onSetGeoCenter(newGeoCenter, oldGeoCenter);
      this.owner.didSetGeoCenter(newGeoCenter, oldGeoCenter);
    },
  })
  readonly geoCenter!: ViewAnimator<this, GeoPoint | null, AnyGeoPoint | null>;

  @ViewAnimator<GeoRippleView, R2Point | null, AnyR2Point | null>({
    type: R2Point,
    state: R2Point.undefined(),
    updateFlags: View.NeedsRender,
    didSetValue(newViewCenter: R2Point | null, oldViewCenter: R2Point | null): void {
      this.owner.updateViewBounds();
    },
  })
  readonly viewCenter!: ViewAnimator<this, R2Point | null, AnyR2Point | null>;

  @ViewAnimator<GeoRippleView, Length, AnyLength>({
    type: Length,
    state: Length.zero(),
    onEnd() {
      this.owner.source.setView(null);
      this.owner.remove();
    },
  })
  readonly radius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, look: Look.accentColor, inherit: true})
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: Length.px(1), inherit: true})
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewFastener<GeoRippleView, GeoView>({
    child: false,
    observe: true,
    onSetView(newSourceView: GeoView | null, oldSourceView: GeoView | null): void {
      if (newSourceView !== null) {
        this.owner.geoCenter.setState(newSourceView.geoBounds.center, View.Intrinsic);
      }
    },
    viewDidUnmount(sourceView: GeoView): void {
      this.owner.remove();
    },
    viewDidSetGeoBounds(newGeoBounds: GeoBox, oldGeoBounds: GeoBox, sourceView: GeoView): void {
      this.owner.geoCenter.setState(newGeoBounds.center, View.Intrinsic);
    },
  })
  readonly source!: ViewFastener<this, GeoView>;

  protected override onProject(viewContext: ViewContextType<this>): void {
    super.onProject(viewContext);
    this.projectRipple(viewContext);
  }

  protected projectGeoCenter(geoCenter: GeoPoint | null): void {
    if (this.isMounted()) {
      const viewContext = this.viewContext as ViewContextType<this>;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setIntermediateValue(this.viewCenter.value, viewCenter);
      this.projectRipple(viewContext);
    }
  }

  protected projectRipple(viewContext: ViewContextType<this>): void {
    if (this.viewCenter.takesPrecedence(View.Intrinsic)) {
      const geoCenter = this.geoCenter.value;
      const viewCenter = geoCenter !== null && geoCenter.isDefined()
                       ? viewContext.geoViewport.project(geoCenter)
                       : null;
      this.viewCenter.setValue(viewCenter);
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderRipple(renderer.context, this.viewFrame);
      context.restore();
    }
  }

  protected renderRipple(context: CanvasContext, frame: R2Box): void {
    const viewCenter = this.viewCenter.value;
    if (viewCenter !== null && viewCenter.isDefined()) {
      const size = Math.min(frame.width, frame.height);
      const radius = this.radius.getValue().pxValue(size);

      context.beginPath();
      context.arc(viewCenter.x, viewCenter.y, radius, 0, 2 * Math.PI);

      const stroke = this.stroke.value;
      if (stroke !== null) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth !== null) {
          context.lineWidth = strokeWidth.pxValue(size);
        }
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
  }

  protected override renderGeoBounds(viewContext: ViewContextType<this>, outlineColor: Color, outlineWidth: number): void {
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
    if (viewCenter !== null && viewCenter.isDefined()) {
      return viewCenter.bounds;
    } else {
      return R2Box.undefined();
    }
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
      center = GeoPoint.fromAny(options.center);
    }
    let width: Length | null;
    if (options === void 0 || options.width === void 0 || options.width === null) {
      width = null;
    } else {
      width = Length.fromAny(options.width);
    }
    let radius: Length;
    if (options === void 0 || options.radius === void 0 || options.radius === null) {
      radius = Length.pct(12.5);
    } else {
      radius = Length.fromAny(options.radius);
    }
    let color: Color | null;
    if (options === void 0 || options.color === void 0 || options.color === null) {
      color = this.getLookOr(Look.accentColor, null);
    } else if (options.color instanceof Look) {
      color = this.getLookOr(options.color, null);
    } else {
      color = Color.fromAny(options.color);
    }
    let timing: Timing | boolean;
    if (options === void 0 || options.timing === void 0 || options.timing === true) {
      timing = this.getLookOr(Look.timing, Mood.ambient, false);
    } else if (typeof options.timing === "number") {
      timing = Easing.linear.withDuration(options.timing);
    } else {
      timing = Timing.fromAny(options.timing);
    }
    const opacity = options !== void 0 ? options.opacity : void 0;

    if (source !== null) {
      this.source.setView(source);
    }
    if (center !== null) {
      this.geoCenter.setState(center, View.Intrinsic);
    }
    if (width !== null) {
      this.strokeWidth.setState(width, View.Intrinsic);
    }
    this.radius.setState(radius, timing);
    if (color !== null) {
      this.stroke.setState(opacity !== void 0 ? color.alpha(opacity) : color);
      this.stroke.setState(color.alpha(0), timing);
    }

    return this;
  }

  static ripple(sourceView: GeoView, options?: GeoRippleOptions): GeoRippleView | null {
    if (!document.hidden && !sourceView.isHidden() && !sourceView.isCulled() &&
        sourceView.geoBounds.intersects(sourceView.geoViewport.geoFrame)) {
      const rippleView = GeoRippleView.create();
      rippleView.source.setView(sourceView);
      let containerView = sourceView.getBaseView(GeoView);
      if (containerView === null) {
        containerView = sourceView;
      }
      containerView.appendChildView(rippleView);
      rippleView.ripple(options);
      return rippleView;
    } else {
      return null;
    }
  }

  static override create(): GeoRippleView {
    return new GeoRippleView();
  }
}
