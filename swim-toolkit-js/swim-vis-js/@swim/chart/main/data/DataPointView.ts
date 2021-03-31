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

import type {AnyTiming} from "@swim/mapping";
import {AnyLength, Length, PointR2, BoxR2} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  GraphicsViewController,
  LayerView,
  CanvasContext,
  CanvasRenderer,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
import type {DataPointCategory, DataPointLabelPlacement} from "./DataPoint";
import type {DataPointViewObserver} from "./DataPointViewObserver";

export type AnyDataPointView<X, Y> = DataPointView<X, Y> | DataPointViewInit<X, Y>;

export interface DataPointViewInit<X, Y> extends GraphicsViewInit {
  x: X;
  y: Y;
  y2?: Y;
  radius?: AnyLength;
  hitRadius?: number;

  color?: AnyColor;
  opacity?: number;

  font?: AnyFont;
  textColor?: AnyColor;

  category?: DataPointCategory;

  labelPadding?: AnyLength;
  labelPlacement?: DataPointLabelPlacement;
  label?: GraphicsView | string;
}

export class DataPointView<X, Y> extends LayerView {
  constructor() {
    super();
    Object.defineProperty(this, "xCoord", {
      value: NaN,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yCoord", {
      value: NaN,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "y2Coord", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "gradientStop", {
      value: false,
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: DataPointViewInit<X, Y>): void {
    super.initView(init);
    this.setState(init);
  }

  declare readonly viewController: GraphicsViewController & DataPointViewObserver<X, Y> | null;

  declare readonly viewObservers: ReadonlyArray<DataPointViewObserver<X, Y>>;

  declare readonly xCoord: number

  /** @hidden */
  setXCoord(xCoord: number): void {
    Object.defineProperty(this, "xCoord", {
      value: xCoord,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly yCoord: number

  /** @hidden */
  setYCoord(yCoord: number): void {
    Object.defineProperty(this, "yCoord", {
      value: yCoord,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly y2Coord: number | undefined;

  /** @hidden */
  setY2Coord(y2Coord: number | undefined): void {
    Object.defineProperty(this, "y2Coord", {
      value: y2Coord,
      enumerable: true,
      configurable: true,
    });
  }

  protected willSetX(newX: X | undefined, oldX: X | undefined): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewWillSetX !== void 0) {
      viewController.dataPointViewWillSetX(newX, oldX, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewWillSetX !== void 0) {
        viewObserver.dataPointViewWillSetX(newX, oldX, this);
      }
    }
  }

  protected onSetX(newX: X | undefined, oldX: X | undefined): void {
    // hook
  }

  protected didSetX(newX: X | undefined, oldX: X | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewDidSetX !== void 0) {
        viewObserver.dataPointViewDidSetX(newX, oldX, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewDidSetX !== void 0) {
      viewController.dataPointViewDidSetX(newX, oldX, this);
    }
  }

  @ViewAnimator<DataPointView<X, Y>, X | undefined>({
    extends: void 0,
    willSetValue(newX: X | undefined, oldX: X | undefined): void {
      this.owner.willSetX(newX, oldX);
    },
    didSetValue(newX: X | undefined, oldX: X | undefined): void {
      this.owner.onSetX(newX, oldX);
      this.owner.didSetX(newX, oldX);
    },
  })
  declare x: ViewAnimator<this, X | undefined>;

  protected willSetY(newY: Y | undefined, oldY: Y | undefined): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewWillSetY !== void 0) {
      viewController.dataPointViewWillSetY(newY, oldY, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewWillSetY !== void 0) {
        viewObserver.dataPointViewWillSetY(newY, oldY, this);
      }
    }
  }

  protected onSetY(newY: Y | undefined, oldY: Y | undefined): void {
    // hook
  }

  protected didSetY(newY: Y | undefined, oldY: Y | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewDidSetY !== void 0) {
        viewObserver.dataPointViewDidSetY(newY, oldY, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewDidSetY !== void 0) {
      viewController.dataPointViewDidSetY(newY, oldY, this);
    }
  }

  @ViewAnimator<DataPointView<X, Y>, Y>({
    willSetValue(newY: Y | undefined, oldY: Y | undefined): void {
      this.owner.willSetY(newY, oldY);
    },
    didSetValue(newY: Y | undefined, oldY: Y | undefined): void {
      this.owner.onSetY(newY, oldY);
      this.owner.didSetY(newY, oldY);
    },
  })
  declare y: ViewAnimator<this, Y>;

  protected willSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewWillSetY2 !== void 0) {
      viewController.dataPointViewWillSetY2(newY2, oldY2, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewWillSetY2 !== void 0) {
        viewObserver.dataPointViewWillSetY2(newY2, oldY2, this);
      }
    }
  }

  protected onSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    // hook
  }

  protected didSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewDidSetY2 !== void 0) {
        viewObserver.dataPointViewDidSetY2(newY2, oldY2, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewDidSetY2 !== void 0) {
      viewController.dataPointViewDidSetY2(newY2, oldY2, this);
    }
  }

  @ViewAnimator<DataPointView<X, Y>, Y | undefined>({
    willSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.willSetY2(newY2, oldY2);
    },
    didSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.onSetY2(newY2, oldY2);
      this.owner.didSetY2(newY2, oldY2);
    },
  })
  declare y2: ViewAnimator<this, Y | undefined>;

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewWillSetRadius !== void 0) {
      viewController.dataPointViewWillSetRadius(newRadius, oldRadius, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewWillSetRadius !== void 0) {
        viewObserver.dataPointViewWillSetRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewDidSetRadius !== void 0) {
        viewObserver.dataPointViewDidSetRadius(newRadius, oldRadius, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewDidSetRadius !== void 0) {
      viewController.dataPointViewDidSetRadius(newRadius, oldRadius, this);
    }
  }

  @ViewAnimator<DataPointView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: null,
    willSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.willSetRadius(newRadius, oldRadius);
    },
    didSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.onSetRadius(newRadius, oldRadius);
      this.owner.didSetRadius(newRadius, oldRadius);
    },
  })
  declare radius: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Number, state: 5})
  declare hitRadius: ViewProperty<this, number>;

  @ViewAnimator<DataPointView<X, Y>, Color | null>({
    type: Color,
    state: null,
    didSetValue(newColor: Color | null, oldColor: Color | null): void {
      this.owner.updateGradientStop();
    },
  })
  declare color: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator<DataPointView<X, Y>, number | undefined>({
    type: Number,
    didSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.updateGradientStop();
    },
  })
  declare opacity: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  declare font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  declare textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewProperty({type: String})
  declare category: ViewProperty<this, DataPointCategory | undefined>;

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsLayout})
  declare labelPadding: ViewAnimator<this, Length, AnyLength>;

  protected initLabel(labelView: GraphicsView): void {
    // hook
  }

  protected attachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected detachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected willSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewWillSetLabel !== void 0) {
      viewController.dataPointViewWillSetLabel(newLabelView, oldLabelView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewWillSetLabel !== void 0) {
        viewObserver.dataPointViewWillSetLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachLabel(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabel(newLabelView);
      this.initLabel(newLabelView);
    }
  }

  protected didSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.dataPointViewDidSetLabel !== void 0) {
        viewObserver.dataPointViewDidSetLabel(newLabelView, oldLabelView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.dataPointViewDidSetLabel !== void 0) {
      viewController.dataPointViewDidSetLabel(newLabelView, oldLabelView, this);
    }
  }

  @ViewFastener<DataPointView<X, Y>, GraphicsView, AnyTextRunView>({
    key: true,
    type: TextRunView,
    fromAny(value: GraphicsView | AnyTextRunView): GraphicsView {
      if (value instanceof GraphicsView) {
        return value;
      } else if (typeof value === "string" && this.view instanceof TextRunView) {
        this.view.text(value);
        return this.view;
      } else {
        return TextRunView.fromAny(value);
      }
    },
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetLabel(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetLabel(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetLabel(newLabelView, oldLabelView);
    },
  })
  declare label: ViewFastener<this, GraphicsView, AnyTextRunView>;

  @ViewProperty({type: String, state: "auto"})
  declare labelPlacement: ViewProperty<this, DataPointLabelPlacement>;

  setState(point: DataPointViewInit<X, Y>, timing?: AnyTiming | boolean): void {
    if (point.x !== void 0) {
      this.x(point.x, timing);
    }
    if (point.y !== void 0) {
      this.y(point.y, timing);
    }
    if (point.y2 !== void 0) {
      this.y2(point.y2, timing);
    }
    if (point.radius !== void 0) {
      this.radius(point.radius, timing);
    }
    if (point.hitRadius !== void 0) {
      this.hitRadius(point.hitRadius);
    }

    if (point.color !== void 0) {
      this.color(point.color, timing);
    }
    if (point.opacity !== void 0) {
      this.opacity(point.opacity, timing);
    }

    if (point.font !== void 0) {
      this.font(point.font, timing);
    }
    if (point.textColor !== void 0) {
      this.textColor(point.textColor, timing);
    }

    if (point.category !== void 0) {
      this.category(point.category);
    }

    if (point.labelPadding !== void 0) {
      this.labelPadding(point.labelPadding, timing);
    }
    if (point.labelPlacement !== void 0) {
      this.labelPlacement(point.labelPlacement);
    }
    if (point.label !== void 0) {
      this.label(point.label);
    }
  }

  /** @hidden */
  declare readonly gradientStop: boolean;

  isGradientStop(): boolean {
    return this.gradientStop;
  }

  protected updateGradientStop(): void {
    Object.defineProperty(this, "gradientStop", {
      value: this.color.value !== null || this.opacity.value !== void 0,
      enumerable: true,
      configurable: true,
    });
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutDataPoint(this.viewFrame);
  }

  protected layoutDataPoint(frame: BoxR2): void {
    const labelView = this.label.view;
    if (labelView !== null) {
      this.layoutLabel(labelView, frame);
    }
  }

  protected layoutLabel(labelView: GraphicsView, frame: BoxR2): void {
    let placement = this.labelPlacement.state;
    if (placement !== "above" && placement !== "below" && placement !== "middle") {
      const category = this.category.state;
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

    if (TypesetView.is(labelView)) {
      labelView.textAlign.setState("center", View.Intrinsic);
      if (placement === "above") {
        labelView.textBaseline.setState("bottom", View.Intrinsic);
      } else if (placement === "below") {
        labelView.textBaseline.setState("top", View.Intrinsic);
      } else if (placement === "middle") {
        labelView.textBaseline.setState("middle", View.Intrinsic);
      }
      labelView.textOrigin.setState(new PointR2(x, y1), View.Intrinsic);
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
    let hitRadius = this.hitRadius.state;
    const radius = this.radius.value;
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

  static create<X, Y>(): DataPointView<X, Y> {
    return new DataPointView<X, Y>();
  }

  static fromInit<X, Y>(init: DataPointViewInit<X, Y>): DataPointView<X, Y> {
    const view = new DataPointView<X, Y>();
    view.initView(init);
    return view;
  }

  static fromAny<X, Y>(value: AnyDataPointView<X, Y>): DataPointView<X, Y> {
    if (value instanceof DataPointView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
