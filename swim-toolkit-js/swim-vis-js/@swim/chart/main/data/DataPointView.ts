// Copyright 2015-2020 Swim inc.
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
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  TypesetView,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {DataPointCategory, DataPointLabelPlacement} from "./DataPoint";

export type AnyDataPointView<X, Y> = DataPointView<X, Y> | DataPointViewInit<X, Y>;

export interface DataPointViewInit<X, Y> extends GraphicsViewInit {
  x: X;
  y: Y;
  y2?: Y;
  r?: AnyLength;

  hitRadius?: number;

  category?: DataPointCategory | null;

  color?: AnyColor;
  opacity?: number;

  labelPadding?: AnyLength;
  labelPlacement?: DataPointLabelPlacement;

  font?: AnyFont;
  textColor?: AnyColor;

  label?: GraphicsView | string | null;
}

export class DataPointView<X, Y> extends LayerView {
  /** @hidden */
  _xCoord: number;
  /** @hidden */
  _yCoord: number;
  /** @hidden */
  _y2Coord?: number;
  /** @hidden */
  _hitRadius?: number;
  /** @hidden */
  _gradientStop?: boolean;
  /** @hidden */
  _category?: DataPointCategory;
  /** @hidden */
  _labelPlacement?: DataPointLabelPlacement;

  constructor(x: X, y: Y) {
    super();
    this._xCoord = NaN;
    this._yCoord = NaN;
    this.x.setAutoState(x);
    this.y.setAutoState(y);
  }

  initView(init: DataPointViewInit<X, Y>): void {
    super.initView(init);
    this.setState(init);
  }

  get xCoord(): number {
    return this._xCoord;
  }

  get yCoord(): number {
    return this._yCoord;
  }

  get y2Coord(): number | undefined {
    return this._y2Coord;
  }

  @ViewAnimator({type: Object})
  x: ViewAnimator<this, X | undefined>;

  @ViewAnimator({type: Object})
  y: ViewAnimator<this, Y | undefined>;

  @ViewAnimator({type: Object})
  y2: ViewAnimator<this, Y | undefined>;

  @ViewAnimator({type: Length})
  r: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Color})
  color: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Number})
  opacity: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Length})
  labelPadding: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

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

  category(): DataPointCategory | null;
  category(category: DataPointCategory | null): this;
  category(category?: DataPointCategory | null): DataPointCategory | null | this {
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

  label(): GraphicsView | null;
  label(label: GraphicsView | AnyTextRunView | null): this;
  label(label?: GraphicsView | AnyTextRunView | null): GraphicsView | null | this {
    if (label === void 0) {
      const childView = this.getChildView("label");
      return childView instanceof GraphicsView ? childView : null;
    } else {
      if (label !== null && !(label instanceof GraphicsView)) {
        label = TextRunView.fromAny(label);
      }
      this.setChildView("label", label);
      return this;
    }
  }

  labelPlacement(): DataPointLabelPlacement;
  labelPlacement(labelPlacement: DataPointLabelPlacement): this;
  labelPlacement(labelPlacement?: DataPointLabelPlacement): DataPointLabelPlacement | this {
    if (labelPlacement === void 0) {
      return this._labelPlacement !== void 0 ? this._labelPlacement : "auto";
    } else {
      this._labelPlacement = labelPlacement;
      return this;
    }
  }

  setState(point: DataPointViewInit<X, Y>, tween?: Tween<any>): void {
    if (point.y2 !== void 0) {
      this.y2(point.y2, tween);
    }
    if (point.r !== void 0) {
      this.r(point.r, tween);
    }

    if (point.hitRadius !== void 0) {
      this.hitRadius(point.hitRadius);
    }

    if (point.category !== void 0) {
      this.category(point.category);
    }

    if (point.color !== void 0) {
      this.color(point.color, tween);
    }
    if (point.opacity !== void 0) {
      this.opacity(point.opacity, tween);
    }

    if (point.labelPadding !== void 0) {
      this.labelPadding(point.labelPadding, tween);
    }
    if (point.labelPlacement !== void 0) {
      this.labelPlacement(point.labelPlacement);
    }

    if (point.font !== void 0) {
      this.font(point.font, tween);
    }
    if (point.textColor !== void 0) {
      this.textColor(point.textColor, tween);
    }

    if (point.label !== void 0) {
      this.label(point.label);
    }
  }

  isGradientStop(): boolean {
    let gradientStop = this._gradientStop;
    if (gradientStop === void 0) {
      gradientStop = this.color.value !== void 0 || this.opacity.value !== void 0;
      this._gradientStop = gradientStop;
    }
    return gradientStop;
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
    if (childView.key === "label" && childView instanceof GraphicsView) {
      this.onInsertLabel(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
    if (childView.key === "label" && childView instanceof GraphicsView) {
      this.onRemoveLabel(childView);
    }
  }

  protected onInsertLabel(label: GraphicsView): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected onRemoveLabel(label: GraphicsView): void {
    // hook
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    this._gradientStop = this.color.value !== void 0 || this.opacity.value !== void 0;
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    const label = this.label();
    if (label !== null) {
      this.layoutLabel(label, this.viewFrame);
    }
  }

  protected layoutLabel(label: GraphicsView, frame: BoxR2): void {
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

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        hit = this.hitTestPoint(x, y, context, this.viewFrame);
      }
    }
    return hit;
  }

  protected hitTestPoint(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
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

  static fromAny<X, Y>(point: AnyDataPointView<X, Y>): DataPointView<X, Y> {
    if (point instanceof DataPointView) {
      return point;
    } else if (typeof point === "object" && point !== null) {
      return DataPointView.fromInit(point);
    }
    throw new TypeError("" + point);
  }

  static fromInit<X, Y>(init: DataPointViewInit<X, Y>): DataPointView<X, Y> {
    const view = new DataPointView(init.x, init.y);
    view.initView(init);
    return view;
  }
}
