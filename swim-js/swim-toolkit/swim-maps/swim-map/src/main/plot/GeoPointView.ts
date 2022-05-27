// Copyright 2015-2022 Swim.inc
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

import type {Class, AnyTiming} from "@swim/util";
import {Affinity, FastenerClass, Property, Animator} from "@swim/component";
import {AnyLength, Length, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyGeoPoint, GeoPointInit, GeoPointTuple, GeoPoint} from "@swim/geo";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewFlags, View, ViewRef} from "@swim/view";
import {GraphicsView, TypesetView, TextRunView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import {GeoViewInit, GeoView} from "../geo/GeoView";
import {GeoRippleOptions, GeoRippleView} from "../effect/GeoRippleView";
import type {GeoPointViewObserver} from "./GeoPointViewObserver";

/** @public */
export type GeoPointLabelPlacement = "auto" | "top" | "right" | "bottom" | "left";

/** @public */
export type AnyGeoPointView = GeoPointView | GeoPointViewInit | GeoPoint | GeoPointInit | GeoPointTuple;

/** @public */
export interface GeoPointViewInit extends GeoViewInit {
  lng?: number;
  lat?: number;
  x?: number;
  y?: number;

  radius?: AnyLength;

  hitRadius?: number;

  color?: AnyColor;
  opacity?: number;

  labelPadding?: AnyLength;
  labelPlacement?: GeoPointLabelPlacement;

  font?: AnyFont;
  textColor?: AnyColor;

  label?: GraphicsView | string;
}

/** @public */
export class GeoPointView extends GeoView {
  override readonly observerType?: Class<GeoPointViewObserver>;

  @Animator<GeoPointView["geoPoint"]>({
    valueType: GeoPoint,
    value: GeoPoint.origin(),
    updateFlags: View.NeedsProject,
    didSetValue(newGeoPoint: GeoPoint, oldGeoPoint: GeoPoint): void {
      this.owner.setGeoBounds(newGeoPoint.bounds);
      this.owner.callObservers("viewDidSetGeoPoint", newGeoPoint, this.owner);
    },
  })
  readonly geoPoint!: Animator<this, GeoPoint, AnyGeoPoint>;

  @Animator({valueType: R2Point, value: R2Point.origin()})
  readonly viewPoint!: Animator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({valueType: Length, value: null})
  readonly radius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({valueType: Color, value: null})
  readonly color!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Number})
  readonly opacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({valueType: Length, value: null})
  readonly labelPadding!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @Property({valueType: Number})
  readonly hitRadius!: Property<this, number | undefined>;

  @ViewRef<GeoPointView["label"]>({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachGeoLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachGeoLabel", labelView, this.owner);
    },
    setText(label: string | undefined): GraphicsView {
      let labelView = this.view;
      if (labelView === null) {
        labelView = this.createView();
        this.setView(labelView);
      }
      if (labelView instanceof TextRunView) {
        labelView.text(label !== void 0 ? label : "");
      }
      return labelView;
    },
  })
  readonly label!: ViewRef<this, GraphicsView> & {
    setText(label: string | undefined): GraphicsView,
  };
  static readonly label: FastenerClass<GeoPointView["label"]>;

  @Property({valueType: String, value: "auto"})
  readonly labelPlacement!: Property<this, GeoPointLabelPlacement>;

  isGradientStop(): boolean {
    return this.color.value !== null || this.opacity.value !== void 0;
  }

  setState(point: AnyGeoPointView, timing?: AnyTiming | boolean): void {
    let init: GeoPointViewInit;
    if (point instanceof GeoPointView) {
      init = point.toAny();
    } else if (point instanceof GeoPoint) {
      init = point.toAny();
    } else if (GeoPoint.isTuple(point)) {
      init = {lng: point[0], lat: point[1]};
    } else {
      init = point;
    }
    if (init.lng !== void 0 && init.lat !== void 0) {
      this.geoPoint(new GeoPoint(init.lng, init.lat), timing);
    } else if (init.x !== void 0 && init.y !== void 0) {
      this.viewPoint(new R2Point(init.x, init.y), timing);
    }

    if (init.radius !== void 0) {
      this.radius(init.radius, timing);
    }

    if (init.hitRadius !== void 0) {
      this.hitRadius(init.hitRadius);
    }

    if (init.color !== void 0) {
      this.color(init.color, timing);
    }
    if (init.opacity !== void 0) {
      this.opacity(init.opacity, timing);
    }

    if (init.labelPadding !== void 0) {
      this.labelPadding(init.labelPadding, timing);
    }
    if (init.labelPlacement !== void 0) {
      this.labelPlacement(init.labelPlacement);
    }

    if (init.font !== void 0) {
      this.font(init.font, timing);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor, timing);
    }

    if (typeof init.label === "string") {
      this.label.setText(init.label);
    } else if (init.label !== void 0) {
      this.label.setView(init.label);
    }
  }

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.NeedsProject) !== 0 && this.label.view !== null) {
      this.requireUpdate(View.NeedsLayout);
    }
    return processFlags;
  }

  protected override onProject(): void {
    super.onProject();
    if (this.viewPoint.hasAffinity(Affinity.Intrinsic)) {
      const viewPoint = this.geoViewport.value.project(this.geoPoint.getValue());
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

    if (TypesetView.is(labelView)) {
      labelView.textAlign.setState("center", Affinity.Intrinsic);
      labelView.textBaseline.setState("bottom", Affinity.Intrinsic);
      labelView.textOrigin.setState(new R2Point(x, y1), Affinity.Intrinsic);
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

  toAny(): GeoPointViewInit {
    const init: GeoPointViewInit = {};
    init.lng = this.geoPoint.value.lng;
    init.lat = this.geoPoint.value.lat;
    if (!this.viewPoint.hasAffinity(Affinity.Intrinsic)) {
      init.x = this.viewPoint.value.x;
      init.y = this.viewPoint.value.y;
    }
    if (this.radius.value !== null) {
      init.radius = this.radius.value;
    }
    if (this.hitRadius.value !== void 0) {
      init.hitRadius = this.hitRadius.value;
    }
    if (this.color.value !== null) {
      init.color = this.color.value;
    }
    if (this.opacity.value !== void 0) {
      init.opacity = this.opacity.value;
    }
    if (this.labelPadding.value !== null) {
      init.labelPadding = this.labelPadding.value;
    }
    if (this.labelPlacement.value !== void 0) {
      init.labelPlacement = this.labelPlacement.value;
    }
    return init;
  }

  override init(init: AnyGeoPoint | GeoPointViewInit): void {
    if (init instanceof GeoPoint || GeoPoint.isTuple(init)) {
      this.setState(init);
    } else {
      super.init(init as GeoPointViewInit);
    }
  }
}
Object.defineProperty(GeoPointView.prototype, "viewBounds", {
  get(this: GeoPointView): R2Box {
    const {x, y} = this.viewPoint.getValue();
    return new R2Box(x, y, x, y);
  },
  configurable: true,
});
