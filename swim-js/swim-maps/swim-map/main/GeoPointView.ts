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

import type {Class} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import {R2Box} from "@swim/math";
import {GeoPoint} from "@swim/geo";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {TypesetView} from "@swim/graphics";
import {TextRunView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import type {GeoViewObserver} from "./GeoView";
import {GeoView} from "./GeoView";
import type {GeoRippleOptions} from "./GeoRippleView";
import {GeoRippleView} from "./GeoRippleView";

/** @public */
export type GeoPointLabelPlacement = "auto" | "top" | "right" | "bottom" | "left";

/** @public */
export interface GeoPointViewObserver<V extends GeoPointView = GeoPointView> extends GeoViewObserver<V> {
  viewDidSetGeoPoint?(geoPoint: GeoPoint, view: V): void;

  viewWillAttachGeoLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachGeoLabel?(labelView: GraphicsView, view: V): void;
}

/** @public */
export class GeoPointView extends GeoView {
  declare readonly observerType?: Class<GeoPointViewObserver>;

  @Animator({
    valueType: GeoPoint,
    value: GeoPoint.origin(),
    updateFlags: View.NeedsProject,
    didSetValue(newGeoPoint: GeoPoint, oldGeoPoint: GeoPoint): void {
      this.owner.setGeoBounds(newGeoPoint.bounds);
      this.owner.callObservers("viewDidSetGeoPoint", newGeoPoint, this.owner);
    },
  })
  readonly geoPoint!: Animator<this, GeoPoint>;

  @Animator({valueType: R2Point, value: R2Point.origin()})
  readonly viewPoint!: Animator<this, R2Point>;

  @ThemeAnimator({valueType: Length, value: null})
  readonly radius!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Color, value: null})
  readonly color!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number})
  readonly opacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({valueType: Length, value: null})
  readonly labelPadding!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  @Property({valueType: Number})
  readonly hitRadius!: Property<this, number | undefined>;

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachGeoLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachGeoLabel", labelView, this.owner);
    },
    fromLike(value: GraphicsView | LikeType<GraphicsView> | string | undefined): GraphicsView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        if (view instanceof TextRunView) {
          view.text.setState(value !== void 0 ? value : "");
        }
        return view;
      }
      return super.fromLike(value);
    },
  })
  readonly label!: ViewRef<this, Like<GraphicsView, string | undefined>>;

  @Property({valueType: String, value: "auto"})
  readonly labelPlacement!: Property<this, GeoPointLabelPlacement>;

  isGradientStop(): boolean {
    return this.color.value !== null || this.opacity.value !== void 0;
  }

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.NeedsProject) !== 0 && this.label.view !== null) {
      this.requireUpdate(View.NeedsLayout);
    }
    return processFlags;
  }

  protected override onProject(): void {
    super.onProject();
    const geoViewport = this.geoViewport.value;
    if (geoViewport === null) {
      return;
    }
    if (this.viewPoint.hasAffinity(Affinity.Intrinsic)) {
      const viewPoint = geoViewport.project(this.geoPoint.getValue());
      this.viewPoint.setInterpolatedValue(viewPoint, viewPoint);
    }
  }

  protected override onLayout(): void {
    super.onLayout();
    const labelView = this.label.view;
    if (labelView !== null) {
      this.layoutLabel(labelView, this.viewFrame);
    }
  }

  protected layoutLabel(labelView: GraphicsView, frame: R2Box): void {
    const placement = this.labelPlacement.value;
    // TODO: auto placement

    const size = Math.min(frame.width, frame.height);
    const padding = this.labelPadding.getValue().pxValue(size);
    const {x, y} = this.viewPoint.getValue();
    let y1 = y;
    if (placement === "top") {
      y1 -= padding;
    } else if (placement === "bottom") {
      y1 += padding;
    }

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.setIntrinsic({
        textAlign: "center",
        textBaseline: "bottom",
        textOrigin: new R2Point(x, y1),
      });
    }
  }

  protected override updateGeoBounds(): void {
    // nop
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  override get hitBounds(): R2Box {
    const {x, y} = this.viewPoint.getValue();
    const hitRadius = this.hitRadius.getValueOr(0);
    return new R2Box(x - hitRadius, y - hitRadius, x + hitRadius, y + hitRadius);
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestPoint(x, y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestPoint(hx: number, hy: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const {x, y} = this.viewPoint.getValue();
    const radius = this.radius.value;

    let hitRadius = this.hitRadius.getValueOr(0);
    if (radius !== null) {
      const size = Math.min(frame.width, frame.height);
      hitRadius = Math.max(hitRadius, radius.pxValue(size));
    }

    const dx = x - hx;
    const dy = y - hy;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return this;
    }
    return null;
  }

  ripple(options?: GeoRippleOptions): GeoRippleView | null {
    return GeoRippleView.ripple(this, options);
  }
}
Object.defineProperty(GeoPointView.prototype, "viewBounds", {
  get(this: GeoPointView): R2Box {
    const {x, y} = this.viewPoint.getValue();
    return new R2Box(x, y, x, y);
  },
  configurable: true,
});
