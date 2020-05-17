// Copyright 2015-2020 SWIM.AI inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewFlags,
  View,
  MemberAnimator,
  RenderedViewContext,
  RenderedViewInit,
  RenderedView,
  TypesetView,
  GraphicsView,
  GraphicsViewController,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {DatumCategory, DatumLabelPlacement} from "./Datum";

export type AnyDatumView<X, Y> = DatumView<X, Y> | DatumViewInit<X, Y>;

export interface DatumViewInit<X, Y> extends RenderedViewInit {
  x: X;
  y: Y;
  y2?: Y;
  r?: AnyLength;

  hitRadius?: number;

  category?: DatumCategory | null;

  color?: AnyColor;
  opacity?: number;

  labelPadding?: AnyLength;
  labelPlacement?: DatumLabelPlacement;

  font?: AnyFont;
  textColor?: AnyColor;

  label?: View | string | null;
}

export class DatumView<X, Y> extends GraphicsView {
  /** @hidden */
  _xCoord: number;
  /** @hidden */
  _yCoord: number;
  /** @hidden */
  _y2Coord?: number;
  /** @hidden */
  _hitRadius?: number;
  /** @hidden */
  _category?: DatumCategory;
  /** @hidden */
  _labelPlacement?: DatumLabelPlacement;

  constructor(x: X, y: Y) {
    super();
    this._xCoord = NaN;
    this._yCoord = NaN;
    this.x.setAutoState(x);
    this.y.setAutoState(y);
  }

  get viewController(): GraphicsViewController<DatumView<X, Y>> | null {
    return this._viewController;
  }

  get xCoord(): number {
    return this._xCoord;
  }

  get yCoord(): number {
    return this._yCoord;
  }

  get y2Coord(): number | null {
    return this._y2Coord !== void 0 ? this._y2Coord : null;
  }

  @MemberAnimator(Object)
  x: MemberAnimator<this, X>;

  @MemberAnimator(Object)
  y: MemberAnimator<this, Y>;

  @MemberAnimator(Object)
  y2: MemberAnimator<this, Y | null>;

  @MemberAnimator(Length)
  r: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  color: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number)
  opacity: MemberAnimator<this, number>;

  @MemberAnimator(Length)
  labelPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  hitRadius(): number;
  hitRadius(hitRadius: number): this;
  hitRadius(hitRadius?: number): number | this {
    if (hitRadius === void 0) {
      return this._hitRadius !== void 0 ? this._hitRadius : 5;
    } else {
      this._hitRadius = hitRadius;
      return this;
    }
  }

  category(): DatumCategory | null;
  category(category: DatumCategory | null): this;
  category(category?: DatumCategory | null): DatumCategory | null | this {
    if (category === void 0) {
      return this._category !== void 0 ? this._category : null;
    } else {
      if (category !== null) {
        this._category = category;
      } else if (this._category !== void 0) {
        this._category = void 0;
      }
      return this;
    }
  }

  label(): View | null;
  label(label: View | AnyTextRunView | null): this;
  label(label?: View | AnyTextRunView | null): View | null | this {
    if (label === void 0) {
      return this.getChildView("label");
    } else {
      if (label !== null && !(label instanceof View)) {
        label = TextRunView.fromAny(label);
      }
      this.setChildView("label", label);
      return this;
    }
  }

  labelPlacement(): DatumLabelPlacement;
  labelPlacement(labelPlacement: DatumLabelPlacement): this;
  labelPlacement(labelPlacement?: DatumLabelPlacement): DatumLabelPlacement | this {
    if (labelPlacement === void 0) {
      return this._labelPlacement !== void 0 ? this._labelPlacement : "auto";
    } else {
      this._labelPlacement = labelPlacement;
      return this;
    }
  }

  setState(datum: DatumViewInit<X, Y>, tween?: Tween<any>): void {
    if (datum.y2 !== void 0) {
      this.y2(datum.y2, tween);
    }
    if (datum.r !== void 0) {
      this.r(datum.r, tween);
    }

    if (datum.hitRadius !== void 0) {
      this.hitRadius(datum.hitRadius);
    }

    if (datum.category !== void 0) {
      this.category(datum.category);
    }

    if (datum.color !== void 0) {
      this.color(datum.color, tween);
    }
    if (datum.opacity !== void 0) {
      this.opacity(datum.opacity, tween);
    }

    if (datum.labelPadding !== void 0) {
      this.labelPadding(datum.labelPadding, tween);
    }
    if (datum.labelPlacement !== void 0) {
      this.labelPlacement(datum.labelPlacement);
    }

    if (datum.font !== void 0) {
      this.font(datum.font, tween);
    }
    if (datum.textColor !== void 0) {
      this.textColor(datum.textColor, tween);
    }

    if (datum.label !== void 0) {
      this.label(datum.label);
    }

    if (datum.hidden !== void 0) {
      this.setHidden(datum.hidden);
    }
    if (datum.culled !== void 0) {
      this.setCulled(datum.culled);
    }
  }

  isGradientStop(): boolean {
    return !!this.color.value || typeof this.opacity.value === "number";
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    super.onLayout(viewContext);
    const label = this.label();
    if (RenderedView.is(label)) {
      this.layoutLabel(label, this.viewFrame);
    }
  }

  protected layoutLabel(label: RenderedView, frame: BoxR2): void {
    let placement = this._labelPlacement;
    if (placement !== "above" && placement !== "below" && placement !== "middle") {
      const category = this._category;
      if (category === "increasing" || category === "maxima") {
        placement = "above";
      } else if (category === "decreasing" || category === "minima") {
        placement = "below";
      } else {
        placement = "above";
      }
    }

    const labelPadding = this.labelPadding.value;
    const padding = labelPadding !== void 0 ? labelPadding.pxValue(Math.min(frame.width, frame.height)) : 0;
    const x = this._xCoord;
    const y0 = this._yCoord;
    let y1 = y0;
    if (placement === "above") {
      y1 -= padding;
    } else if (placement === "below") {
      y1 += padding;
    }

    if (TypesetView.is(label)) {
      label.textAlign.setAutoState("center");
      if (placement === "above") {
        label.textBaseline.setAutoState("bottom");
      } else if (placement === "below") {
        label.textBaseline.setAutoState("top");
      } else if (placement === "middle") {
        label.textBaseline.setAutoState("middle");
      }
      label.textOrigin.setAutoState(new PointR2(x, y1));
    }
  }

  hitTest(x: number, y: number, viewContext: RenderedViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestDatum(x, y, context, this.viewFrame);
      }
    }
    return hit;
  }

  protected hitTestDatum(x: number, y: number, context: CanvasContext, frame: BoxR2): RenderedView | null {
    let hitRadius = this.hitRadius();
    const radius = this.r.value;
    if (radius !== void 0) {
      const size = Math.min(frame.width, frame.height);
      hitRadius = Math.max(hitRadius, radius.pxValue(size));
    }

    const dx = this._xCoord - x;
    const dy = this._yCoord - y;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return this;
    }
    return null;
  }

  static fromAny<X, Y>(datum: AnyDatumView<X, Y>): DatumView<X, Y> {
    if (datum instanceof DatumView) {
      return datum;
    } else if (typeof datum === "object" && datum !== null) {
      const view = new DatumView(datum.x, datum.y);
      view.setState(datum);
      return view;
    }
    throw new TypeError("" + datum);
  }
}
