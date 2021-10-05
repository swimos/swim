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

import type {Mutable, Class, AnyTiming} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View, ViewFastener} from "@swim/view";
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

export type AnyDataPointView<X = unknown, Y = unknown> = DataPointView<X, Y> | DataPointViewInit<X, Y>;

export interface DataPointViewInit<X = unknown, Y = unknown> extends GraphicsViewInit {
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

export class DataPointView<X = unknown, Y = unknown> extends LayerView {
  constructor() {
    super();
    this.xCoord = NaN;
    this.yCoord = NaN;
    this.y2Coord = void 0;
    this.gradientStop = false;
  }

  override readonly observerType?: Class<DataPointViewObserver<X, Y>>;

  readonly xCoord: number

  /** @internal */
  setXCoord(xCoord: number): void {
    (this as Mutable<this>).xCoord = xCoord;
  }

  readonly yCoord: number

  /** @internal */
  setYCoord(yCoord: number): void {
    (this as Mutable<this>).yCoord = yCoord;
  }

  readonly y2Coord: number | undefined;

  /** @internal */
  setY2Coord(y2Coord: number | undefined): void {
    (this as Mutable<this>).y2Coord = y2Coord;
  }

  protected willSetX(newX: X | undefined, oldX: X | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointX !== void 0) {
        observer.viewWillSetDataPointX(newX, oldX, this);
      }
    }
  }

  protected onSetX(newX: X | undefined, oldX: X | undefined): void {
    // hook
  }

  protected didSetX(newX: X | undefined, oldX: X | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointX !== void 0) {
        observer.viewDidSetDataPointX(newX, oldX, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, X | undefined>({
    extends: null,
    willSetValue(newX: X | undefined, oldX: X | undefined): void {
      this.owner.willSetX(newX, oldX);
    },
    didSetValue(newX: X | undefined, oldX: X | undefined): void {
      this.owner.onSetX(newX, oldX);
      this.owner.didSetX(newX, oldX);
    },
  })
  readonly x!: ThemeAnimator<this, X | undefined>;

  protected willSetY(newY: Y | undefined, oldY: Y | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointY !== void 0) {
        observer.viewWillSetDataPointY(newY, oldY, this);
      }
    }
  }

  protected onSetY(newY: Y | undefined, oldY: Y | undefined): void {
    // hook
  }

  protected didSetY(newY: Y | undefined, oldY: Y | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointY !== void 0) {
        observer.viewDidSetDataPointY(newY, oldY, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, Y>({
    willSetValue(newY: Y | undefined, oldY: Y | undefined): void {
      this.owner.willSetY(newY, oldY);
    },
    didSetValue(newY: Y | undefined, oldY: Y | undefined): void {
      this.owner.onSetY(newY, oldY);
      this.owner.didSetY(newY, oldY);
    },
  })
  readonly y!: ThemeAnimator<this, Y>;

  protected willSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointY2 !== void 0) {
        observer.viewWillSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  protected onSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    // hook
  }

  protected didSetY2(newY2: Y | undefined, oldY2: Y | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointY2 !== void 0) {
        observer.viewDidSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, Y | undefined>({
    willSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.willSetY2(newY2, oldY2);
    },
    didSetValue(newY2: Y | undefined, oldY2: Y | undefined): void {
      this.owner.onSetY2(newY2, oldY2);
      this.owner.didSetY2(newY2, oldY2);
    },
  })
  readonly y2!: ThemeAnimator<this, Y | undefined>;

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointRadius !== void 0) {
        observer.viewWillSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointRadius !== void 0) {
        observer.viewDidSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, Length | null, AnyLength | null>({
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
  readonly radius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Number, state: 5})
  readonly hitRadius!: Property<this, number>;

  protected willSetColor(newColor: Color | null, oldColor: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointColor !== void 0) {
        observer.viewWillSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  protected onSetColor(newColor: Color | null, oldColor: Color | null): void {
    this.updateGradientStop();
  }

  protected didSetColor(newColor: Color | null, oldColor: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointColor !== void 0) {
        observer.viewDidSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, Color | null, AnyColor | null>({
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
  readonly color!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected willSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointOpacity !== void 0) {
        observer.viewWillSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  protected onSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    this.updateGradientStop();
  }

  protected didSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointOpacity !== void 0) {
        observer.viewDidSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  @ThemeAnimator<DataPointView<X, Y>, number | undefined>({
    type: Number,
    willSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.willSetOpacity(newOpacity, oldOpacity);
    },
    didSetValue(newOpacity: number | undefined, oldOpacity: number | undefined): void {
      this.owner.onSetOpacity(newOpacity, oldOpacity);
      this.owner.didSetOpacity(newOpacity, oldOpacity);
    },
  })
  readonly opacity!: ThemeAnimator<this, number | undefined>;

  @ThemeAnimator({type: Font, inherits: true})
  readonly font!: ThemeAnimator<this, Font | undefined, AnyFont | undefined>;

  @ThemeAnimator({type: Color, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | undefined, AnyColor | undefined>;

  @Property({type: String})
  readonly category!: Property<this, DataPointCategory | undefined>;

  @ThemeAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsLayout})
  readonly labelPadding!: ThemeAnimator<this, Length, AnyLength>;

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetDataPointLabel !== void 0) {
        observer.viewWillSetDataPointLabel(newLabelView, oldLabelView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetDataPointLabel !== void 0) {
        observer.viewDidSetDataPointLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<DataPointView<X, Y>, GraphicsView, AnyTextRunView>({
    key: true,
    type: TextRunView,
    child: true,
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

  @Property({type: String, state: "auto"})
  readonly labelPlacement!: Property<this, DataPointLabelPlacement>;

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

  /** @internal */
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
      labelView.textAlign.setState("center", Affinity.Intrinsic);
      if (placement === "above") {
        labelView.textBaseline.setState("bottom", Affinity.Intrinsic);
      } else if (placement === "below") {
        labelView.textBaseline.setState("top", Affinity.Intrinsic);
      } else if (placement === "middle") {
        labelView.textBaseline.setState("middle", Affinity.Intrinsic);
      }
      labelView.textOrigin.setState(new R2Point(x, y1), Affinity.Intrinsic);
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestPoint(x, y, renderer.context, this.viewFrame);
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

  override init(init: DataPointViewInit<X, Y>): void {
    super.init(init);
    this.setState(init);
  }
}
