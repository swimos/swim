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
import type {AnyTiming} from "@swim/mapping";
import {AnyLength, Length, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
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
    this.xCoord = NaN;
    this.yCoord = NaN;
    this.y2Coord = void 0;
    this.gradientStop = false;
  }

  override initView(init: DataPointViewInit<X, Y>): void {
    super.initView(init);
    this.setState(init);
  }

  override readonly viewObservers!: ReadonlyArray<DataPointViewObserver<X, Y>>;

  readonly xCoord: number

  /** @hidden */
  setXCoord(xCoord: number): void {
    (this as Mutable<this>).xCoord = xCoord;
  }

  readonly yCoord: number

  /** @hidden */
  setYCoord(yCoord: number): void {
    (this as Mutable<this>).yCoord = yCoord;
  }

  readonly y2Coord: number | undefined;

  /** @hidden */
  setY2Coord(y2Coord: number | undefined): void {
    (this as Mutable<this>).y2Coord = y2Coord;
  }

  protected willSetX(newX: X | undefined, oldX: X | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointX !== void 0) {
        viewObserver.viewWillSetDataPointX(newX, oldX, this);
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
      if (viewObserver.viewDidSetDataPointX !== void 0) {
        viewObserver.viewDidSetDataPointX(newX, oldX, this);
      }
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
  readonly x!: ViewAnimator<this, X | undefined>;

  protected willSetY(newY: Y | undefined, oldY: Y | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointY !== void 0) {
        viewObserver.viewWillSetDataPointY(newY, oldY, this);
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
      if (viewObserver.viewDidSetDataPointY !== void 0) {
        viewObserver.viewDidSetDataPointY(newY, oldY, this);
      }
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
  readonly y!: ViewAnimator<this, Y>;

  protected willSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointY2 !== void 0) {
        viewObserver.viewWillSetDataPointY2(newY2, oldY2, this);
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
      if (viewObserver.viewDidSetDataPointY2 !== void 0) {
        viewObserver.viewDidSetDataPointY2(newY2, oldY2, this);
      }
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
  readonly y2!: ViewAnimator<this, Y | undefined>;

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointRadius !== void 0) {
        viewObserver.viewWillSetDataPointRadius(newRadius, oldRadius, this);
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
      if (viewObserver.viewDidSetDataPointRadius !== void 0) {
        viewObserver.viewDidSetDataPointRadius(newRadius, oldRadius, this);
      }
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
  readonly radius!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewProperty({type: Number, state: 5})
  readonly hitRadius!: ViewProperty<this, number>;

  protected willSetColor(newColor: Color | null, oldColor: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointColor !== void 0) {
        viewObserver.viewWillSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  protected onSetColor(newColor: Color | null, oldColor: Color | null): void {
    this.updateGradientStop();
  }

  protected didSetColor(newColor: Color | null, oldColor: Color | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetDataPointColor !== void 0) {
        viewObserver.viewDidSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  @ViewAnimator<DataPointView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    willSetValue(newColor: Color | null, oldColor: Color | null): void {
      this.owner.willSetColor(newColor, oldColor);
    },
    didSetValue(newColor: Color | null, oldColor: Color | null): void {
      this.owner.onSetColor(newColor, oldColor);
      this.owner.didSetColor(newColor, oldColor);
    },
  })
  readonly color!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected willSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointOpacity !== void 0) {
        viewObserver.viewWillSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  protected onSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    this.updateGradientStop();
  }

  protected didSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetDataPointOpacity !== void 0) {
        viewObserver.viewDidSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  @ViewAnimator<DataPointView<X, Y>, number | undefined>({
    type: Number,
    willSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.willSetOpacity(newOpacity, oldOpacity);
    },
    didSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.onSetOpacity(newOpacity, oldOpacity);
      this.owner.didSetOpacity(newOpacity, oldOpacity);
    },
  })
  readonly opacity!: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  readonly font!: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  readonly textColor!: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewProperty({type: String})
  readonly category!: ViewProperty<this, DataPointCategory | undefined>;

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsLayout})
  readonly labelPadding!: ViewAnimator<this, Length, AnyLength>;

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
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDataPointLabel !== void 0) {
        viewObserver.viewWillSetDataPointLabel(newLabelView, oldLabelView, this);
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
      if (viewObserver.viewDidSetDataPointLabel !== void 0) {
        viewObserver.viewDidSetDataPointLabel(newLabelView, oldLabelView, this);
      }
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
  readonly label!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  @ViewProperty({type: String, state: "auto"})
  readonly labelPlacement!: ViewProperty<this, DataPointLabelPlacement>;

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
  readonly gradientStop: boolean;

  isGradientStop(): boolean {
    return this.gradientStop;
  }

  protected updateGradientStop(): void {
    (this as Mutable<this>).gradientStop = this.color.value !== null || this.opacity.value !== void 0;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutDataPoint(this.viewFrame);
  }

  protected layoutDataPoint(frame: R2Box): void {
    const labelView = this.label.view;
    if (labelView !== null) {
      this.layoutLabel(labelView, frame);
    }
  }

  protected layoutLabel(labelView: GraphicsView, frame: R2Box): void {
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
      labelView.textOrigin.setState(new R2Point(x, y1), View.Intrinsic);
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      return this.hitTestPoint(x, y, context, this.viewFrame);
    }
    return null;
  }

  protected hitTestPoint(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
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

  static override create<X, Y>(): DataPointView<X, Y> {
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
