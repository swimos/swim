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
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {TypesetView} from "@swim/graphics";
import {TextRunView} from "@swim/graphics";

/** @public */
export type DataPointCategory = "flat" | "increasing" | "decreasing" | "maxima" | "minima";

/** @public */
export type DataPointLabelPlacement = "auto" | "above" | "middle" | "below";

/** @public */
export interface DataPointViewObserver<X = unknown, Y = unknown, V extends DataPointView<X, Y> = DataPointView<X, Y>> extends GraphicsViewObserver<V> {
  viewDidSetX?(x: X | undefined, view: V): void;

  viewDidSetY?(y: Y | undefined, view: V): void;

  viewDidSetY2?(y2: Y | undefined, view: V): void;

  viewDidSetRadius?(radius: Length | null, view: V): void;

  viewDidSetColor?(color: Color | null, view: V): void;

  viewDidSetOpacity?(opacity: number | undefined, view: V): void;

  viewWillAttachLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachLabel?(labelView: GraphicsView, view: V): void;
}

/** @public */
export class DataPointView<X = unknown, Y = unknown> extends GraphicsView {
  constructor(x?: X, y?: Y) {
    super();
    this.xCoord = NaN;
    this.yCoord = NaN;
    this.y2Coord = void 0;
    this.gradientStop = false;
    if (x !== void 0) {
      this.x.setState(x);
    }
    if (y !== void 0) {
      this.y.setState(y);
    }
  }

  declare readonly observerType?: Class<DataPointViewObserver<X, Y>>;

  readonly xCoord: number;

  /** @internal */
  setXCoord(xCoord: number): void {
    (this as Mutable<this>).xCoord = xCoord;
  }

  readonly yCoord: number;

  /** @internal */
  setYCoord(yCoord: number): void {
    (this as Mutable<this>).yCoord = yCoord;
  }

  readonly y2Coord: number | undefined;

  /** @internal */
  setY2Coord(y2Coord: number | undefined): void {
    (this as Mutable<this>).y2Coord = y2Coord;
  }

  @Animator({
    didSetValue(x: X | undefined, oldX: X | undefined): void {
      this.owner.callObservers("viewDidSetX", x, this.owner);
    },
  })
  readonly x!: Animator<this, X | undefined>;

  @Animator({
    didSetValue(y: Y | undefined, oldY: Y | undefined): void {
      this.owner.callObservers("viewDidSetY", y, this.owner);
    },
  })
  readonly y!: Animator<this, Y | undefined>;

  @Animator({
    didSetValue(y2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.callObservers("viewDidSetY2", y2, this.owner);
    },
  })
  get y2(): Animator<this, Y | undefined> {
    return Animator.getter();
  }

  @ThemeAnimator({
    valueType: Length,
    value: null,
    didSetValue(radius: Length | null): void {
      this.owner.callObservers("viewDidSetRadius", radius, this.owner);
    },
  })
  get radius(): ThemeAnimator<this, Length | null> {
    return ThemeAnimator.getter();
  }

  @Property({valueType: Number, value: 5})
  get hitRadius(): Property<this, number> {
    return Property.getter();
  }

  @ThemeAnimator({
    valueType: Color,
    value: null,
    didSetValue(color: Color | null): void {
      this.owner.updateGradientStop();
      this.owner.callObservers("viewDidSetColor", color, this.owner);
    },
  })
  get color(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

  @ThemeAnimator({
    valueType: Number,
    didSetValue(opacity: number | undefined): void {
      this.owner.updateGradientStop();
      this.owner.callObservers("viewDidSetOpacity", opacity, this.owner);
    },
  })
  get opacity(): ThemeAnimator<this, number | undefined> {
    return ThemeAnimator.getter();
  }

  @ThemeAnimator({valueType: Font, inherits: true})
  get font(): ThemeAnimator<this, Font | undefined> {
    return ThemeAnimator.getter();
  }

  @ThemeAnimator({valueType: Color, inherits: true})
  get textColor(): ThemeAnimator<this, Color | undefined> {
    return ThemeAnimator.getter();
  }

  @Property({valueType: String})
  get category(): Property<this, DataPointCategory> {
    return Property.getter();
  }

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsLayout})
  get labelPadding(): ThemeAnimator<this, Length> {
    return ThemeAnimator.getter();
  }

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachLabel", labelView, this.owner);
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
  get labelPlacement(): Property<this, DataPointLabelPlacement> {
    return Property.getter();
  }

  /** @internal */
  readonly gradientStop: boolean;

  isGradientStop(): boolean {
    return this.gradientStop;
  }

  protected updateGradientStop(): void {
    (this as Mutable<this>).gradientStop = this.color.value !== null || this.opacity.value !== void 0;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.layoutDataPoint(this.viewFrame);
  }

  protected layoutDataPoint(frame: R2Box): void {
    const labelView = ViewRef.tryView(this, "label");
    if (labelView !== null) {
      this.layoutLabel(labelView, frame);
    }
  }

  protected layoutLabel(labelView: GraphicsView, frame: R2Box): void {
    let placement = this.labelPlacement.value;
    if (placement !== "above" && placement !== "below" && placement !== "middle") {
      const category = this.category.value;
      if (category === "increasing" || category === "maxima") {
        placement = "above";
      } else if (category === "decreasing" || category === "minima") {
        placement = "below";
      } else {
        placement = "above";
      }
    }

    const x = this.xCoord;
    const y0 = this.yCoord;
    let y1 = y0;
    if (placement === "above") {
      y1 -= this.labelPadding.getValue().pxValue(Math.min(frame.width, frame.height));
    } else if (placement === "below") {
      y1 += this.labelPadding.getValue().pxValue(Math.min(frame.width, frame.height));
    }

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.textAlign.setIntrinsic("center");
      if (placement === "above") {
        labelView.textBaseline.setIntrinsic("bottom");
      } else if (placement === "below") {
        labelView.textBaseline.setIntrinsic("top");
      } else if (placement === "middle") {
        labelView.textBaseline.setIntrinsic("middle");
      }
      labelView.textOrigin.setIntrinsic(new R2Point(x, y1));
    }
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestPoint(x, y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestPoint(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    let hitRadius: number = Property.tryValue(this, "hitRadius");
    const radius = ThemeAnimator.tryValue(this, "radius");
    if (radius !== null) {
      const size = Math.min(frame.width, frame.height);
      hitRadius = Math.max(hitRadius, radius.pxValue(size));
    }

    const dx = this.xCoord - x;
    const dy = this.yCoord - y;
    if (dx * dx + dy * dy < hitRadius * hitRadius) {
      return this;
    }
    return null;
  }
}
