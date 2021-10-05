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

import {Class, AnyTiming, Timing} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import type {AnyLength, Length} from "@swim/math";
import type {AnyColor, Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewFastener} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {TraitViewFastener, GenericController} from "@swim/controller";
import {DataPointView} from "./DataPointView";
import {DataPointLabel, DataPointTrait} from "./DataPointTrait";
import type {DataPointControllerObserver} from "./DataPointControllerObserver";

export class DataPointController<X, Y> extends GenericController {
  override readonly observerType?: Class<DataPointControllerObserver<X, Y>>;

  protected initDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    // hook
  }

  protected attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      this.setX(dataPointTrait.x.state, dataPointTrait);
      this.setY(dataPointTrait.y.state, dataPointTrait);
      this.setY2(dataPointTrait.y2.state, dataPointTrait);
      this.setRadius(dataPointTrait.radius.state, dataPointTrait);
      this.setColor(dataPointTrait.color.state, dataPointTrait);
      this.setOpacity(dataPointTrait.opacity.state, dataPointTrait);
      this.setLabelView(dataPointTrait.label.state, dataPointTrait);
    }
  }

  protected detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      this.setLabelView(null, dataPointTrait);
    }
  }

  protected willSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointTrait !== void 0) {
        observer.controllerWillSetDataPointTrait(newDataPointTrait, oldDataPointTrait, this);
      }
    }
  }

  protected onSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null): void {
    if (oldDataPointTrait !== null) {
      this.detachDataPointTrait(oldDataPointTrait);
    }
    if (newDataPointTrait !== null) {
      this.attachDataPointTrait(newDataPointTrait);
      this.initDataPointTrait(newDataPointTrait);
    }
  }

  protected didSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointTrait !== void 0) {
        observer.controllerDidSetDataPointTrait(newDataPointTrait, oldDataPointTrait, this);
      }
    }
  }

  protected updateLabel(x: X | undefined, y: Y | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
    const label = dataPointTrait.formatLabel(x, y);
    if (label !== void 0) {
      dataPointTrait.label.setState(label, Affinity.Intrinsic);
    }
  }

  protected createDataPointView(dataPointTrait: DataPointTrait<X, Y> | null): DataPointView<X, Y> {
    const dataPointView = new DataPointView<X, Y>();
    if (dataPointTrait !== null) {
      dataPointView.x.setState(dataPointTrait.x.state, Affinity.Intrinsic);
      dataPointView.y.setState(dataPointTrait.y.state, Affinity.Intrinsic);
      dataPointView.y2.setState(dataPointTrait.y2.state, Affinity.Intrinsic);
      dataPointView.radius.setState(dataPointTrait.radius.state, Affinity.Intrinsic);
    }
    return dataPointView;
  }

  protected initDataPointView(dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const x = dataPointView.x.value;
      const y = dataPointView.y.value;
      this.updateLabel(x, y, dataPointTrait);
    }
  }

  protected attachDataPointView(dataPointView: DataPointView<X, Y>): void {
    this.label.setView(dataPointView.label.view);

    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.setX(dataPointTrait.x.state, dataPointTrait);
      this.setY(dataPointTrait.y.state, dataPointTrait);
      this.setY2(dataPointTrait.y2.state, dataPointTrait);
      this.setRadius(dataPointTrait.radius.state, dataPointTrait);
      this.setColor(dataPointTrait.color.state, dataPointTrait);
      this.setOpacity(dataPointTrait.opacity.state, dataPointTrait);
      this.setLabelView(dataPointTrait.label.state, dataPointTrait);
    }
  }

  protected detachDataPointView(dataPointView: DataPointView<X, Y>): void {
    this.label.setView(null);
  }

  protected willSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointView !== void 0) {
        observer.controllerWillSetDataPointView(newDataPointView, oldDataPointView, this);
      }
    }
  }

  protected onSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null): void {
    if (oldDataPointView !== null) {
      this.detachDataPointView(oldDataPointView);
    }
    if (newDataPointView !== null) {
      this.attachDataPointView(newDataPointView);
      this.initDataPointView(newDataPointView);
    }
  }

  protected didSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointView !== void 0) {
        observer.controllerDidSetDataPointView(newDataPointView, oldDataPointView, this);
      }
    }
  }

  protected setX(x: X, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dataPointView.x.setState(x, timing, Affinity.Intrinsic);
    }
  }

  protected willSetX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointX !== void 0) {
        observer.controllerWillSetDataPointX(newX, oldX, this);
      }
    }
  }

  protected onSetX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const y = dataPointView.y.value;
      this.updateLabel(newX, y, dataPointTrait);
    }
  }

  protected didSetX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointX !== void 0) {
        observer.controllerDidSetDataPointX(newX, oldX, this);
      }
    }
  }

  protected setY(y: Y, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dataPointView.y.setState(y, timing, Affinity.Intrinsic);
    }
  }

  protected willSetY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointY !== void 0) {
        observer.controllerWillSetDataPointY(newY, oldY, this);
      }
    }
  }

  protected onSetY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const x = dataPointView.x.value;
      this.updateLabel(x, newY, dataPointTrait);
    }
  }

  protected didSetY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointY !== void 0) {
        observer.controllerDidSetDataPointY(newY, oldY, this);
      }
    }
  }

  protected setY2(y2: Y | undefined, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dataPointView.y2.setState(y2, timing, Affinity.Intrinsic);
    }
  }

  protected willSetY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointY2 !== void 0) {
        observer.controllerWillSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  protected onSetY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointY2 !== void 0) {
        observer.controllerDidSetDataPointY2(newY2, oldY2, this);
      }
    }
  }

  protected setRadius(radius: AnyLength | null, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dataPointView.radius.setState(radius, timing, Affinity.Intrinsic);
    }
  }

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointRadius !== void 0) {
        observer.controllerWillSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointRadius !== void 0) {
        observer.controllerDidSetDataPointRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected setColor(color: Look<Color> | AnyColor | null, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (color instanceof Look) {
        dataPointView.color.setLook(color, timing, Affinity.Intrinsic);
      } else {
        dataPointView.color.setState(color, timing, Affinity.Intrinsic);
      }
    }
  }

  protected willSetColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointColor !== void 0) {
        observer.controllerWillSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  protected onSetColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointColor !== void 0) {
        observer.controllerDidSetDataPointColor(newColor, oldColor, this);
      }
    }
  }

  protected setOpacity(opacity: number | undefined, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dataPointTiming.state;
        if (timing === true) {
          timing = dataPointView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dataPointView.opacity.setState(opacity, timing, Affinity.Intrinsic);
    }
  }

  protected willSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDataPointOpacity !== void 0) {
        observer.controllerWillSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  protected onSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<X, Y>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointOpacity !== void 0) {
        observer.controllerDidSetDataPointOpacity(newOpacity, oldOpacity, this);
      }
    }
  }

  protected createLabelView(label: DataPointLabel<X, Y>, dataPointTrait: DataPointTrait<X, Y>): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(dataPointTrait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: DataPointLabel<X, Y> | null, dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      const labelView = label !== null ? this.createLabelView(label, dataPointTrait) : null;
      dataPointView.label.setView(labelView);
    }
  }

  protected initLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected attachLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected detachLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected willSetLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllertWillSetDataPointLabelView !== void 0) {
        observer.controllertWillSetDataPointLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachLabelView(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabelView(newLabelView);
      this.initLabelView(newLabelView);
    }
  }

  protected didSetLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDataPointLabelView !== void 0) {
        observer.controllerDidSetDataPointLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  @Property({type: Timing, inherits: true})
  readonly dataPointTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  /** @internal */
  static DataPointFastener = TraitViewFastener.define<DataPointController<unknown, unknown>, DataPointTrait<unknown, unknown>, DataPointView<unknown, unknown>>({
    traitType: DataPointTrait,
    observesTrait: true,
    willSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.willSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    onSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.onSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    didSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.didSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    traitDidSetDataPointX(newX: unknown , oldX: unknown, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setX(newX, dataPointTrait);
    },
    traitDidSetDataPointY(newY: unknown, oldY: unknown, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setY(newY, dataPointTrait);
    },
    traitDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setY2(newY2, dataPointTrait);
    },
    traitDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setRadius(newRadius, dataPointTrait);
    },
    traitDidSetDataPointColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setColor(newColor, dataPointTrait);
    },
    traitDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setOpacity(newOpacity, dataPointTrait);
    },
    traitDidSetDataPointLabel(newLabel: DataPointLabel<unknown, unknown> | null, oldLabel: DataPointLabel<unknown, unknown> | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.setLabelView(newLabel, dataPointTrait);
    },
    viewType: DataPointView,
    observesView: true,
    willSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.willSetDataPointView(newDataPointView, oldDataPointView);
    },
    onSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.onSetDataPointView(newDataPointView, oldDataPointView);
    },
    didSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.didSetDataPointView(newDataPointView, oldDataPointView);
    },
    viewWillSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetX(newX, oldX, dataPointView);
    },
    viewDidSetDataPointX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetX(newX, oldX, dataPointView);
      this.owner.didSetX(newX, oldX, dataPointView);
    },
    viewWillSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetY(newY, oldY, dataPointView);
    },
    viewDidSetDataPointY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetY(newY, oldY, dataPointView);
      this.owner.didSetY(newY, oldY, dataPointView);
    },
    viewWillSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetY2(newY2, oldY2, dataPointView);
    },
    viewDidSetDataPointY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetY2(newY2, oldY2, dataPointView);
      this.owner.didSetY2(newY2, oldY2, dataPointView);
    },
    viewWillSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetRadius(newRadius, oldRadius, dataPointView);
    },
    viewDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetRadius(newRadius, oldRadius, dataPointView);
      this.owner.didSetRadius(newRadius, oldRadius, dataPointView);
    },
    viewWillSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetColor(newColor, oldColor, dataPointView);
    },
    viewDidSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetColor(newColor, oldColor, dataPointView);
      this.owner.didSetColor(newColor, oldColor, dataPointView);
    },
    viewWillSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetOpacity(newOpacity, oldOpacity, dataPointView);
    },
    viewDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetOpacity(newOpacity, oldOpacity, dataPointView);
      this.owner.didSetOpacity(newOpacity, oldOpacity, dataPointView);
    },
    viewDidSetDataPointLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    createView(): DataPointView<unknown, unknown> | null {
      return this.owner.createDataPointView(this.trait);
    },
  });

  @TraitViewFastener<DataPointController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>>({
    extends: DataPointController.DataPointFastener,
  })
  readonly dataPoint!: TraitViewFastener<this, DataPointTrait<X, Y>, DataPointView<X, Y>>;

  @ViewFastener<DataPointController<X, Y>, GraphicsView>({
    key: true,
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetLabelView(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetLabelView(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetLabelView(newLabelView, oldLabelView);
    },
  })
  readonly label!: ViewFastener<this, GraphicsView>;
}
