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

import {AnyTiming, Timing} from "@swim/mapping";
import type {AnyLength, Length} from "@swim/math";
import type {AnyColor, Color} from "@swim/style";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {ComponentProperty, ComponentView, ComponentViewTrait, CompositeComponent} from "@swim/component";
import {DataPointView} from "./DataPointView";
import {DataPointLabel, DataPointTrait} from "./DataPointTrait";
import type {DataPointComponentObserver} from "./DataPointComponentObserver";

export class DataPointComponent<X, Y> extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<DataPointComponentObserver<X, Y>>;

  get x(): X | undefined {
    const dataPointTrait = this.dataPoint.trait;
    return dataPointTrait !== null ? dataPointTrait.x : void 0;
  }

  get y(): Y | undefined {
    const dataPointTrait = this.dataPoint.trait;
    return dataPointTrait !== null ? dataPointTrait.y : void 0;
  }

  get y2(): Y | undefined {
    const dataPointTrait = this.dataPoint.trait;
    return dataPointTrait !== null ? dataPointTrait.y2 : void 0;
  }

  get radius(): Length | null {
    const dataPointTrait = this.dataPoint.trait;
    return dataPointTrait !== null ? dataPointTrait.radius : null;
  }

  get color(): Look<Color> | AnyColor | null {
    const dataPointTrait = this.dataPoint.trait;
    return dataPointTrait !== null ? dataPointTrait.color : null;
  }

  setX(x: X): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setX(x);
    }
  }

  setY(y: Y): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setY(y);
    }
  }

  setY2(y: Y): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setY2(y);
    }
  }

  setRadius(radius: AnyLength | null): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setRadius(radius);
    }
  }

  setColor(color: Look<Color> | AnyColor | null): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setColor(color);
    }
  }

  setLabel(label: DataPointLabel<X, Y> | null): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      dataPointTrait.setLabel(label);
    }
  }

  protected initDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    // hook
  }

  protected attachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      this.setDataPointViewX(dataPointTrait.x, dataPointTrait);
      this.setDataPointViewY(dataPointTrait.y, dataPointTrait);
      this.setDataPointViewY2(dataPointTrait.y2, dataPointTrait);
      this.setDataPointViewRadius(dataPointTrait.radius, dataPointTrait);
      this.setDataPointViewColor(dataPointTrait.color, dataPointTrait);
      this.setDataPointLabelView(dataPointTrait.label, dataPointTrait);
    }
  }

  protected detachDataPointTrait(dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      this.setDataPointLabelView(null, dataPointTrait);
    }
  }

  protected willSetDataPointTrait(newDataPointTrait: DataPointTrait<X, Y> | null, oldDataPointTrait: DataPointTrait<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetTrait !== void 0) {
        componentObserver.dataPointWillSetTrait(newDataPointTrait, oldDataPointTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetTrait !== void 0) {
        componentObserver.dataPointDidSetTrait(newDataPointTrait, oldDataPointTrait, this);
      }
    }
  }

  protected onSetDataPointTraitX(newX: X, oldX: X, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointViewX(newX, dataPointTrait);
  }

  protected onSetDataPointTraitY(newY: Y, oldY: Y, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointViewY(newY, dataPointTrait);
  }

  protected updateDataPointTraitLabel(x: X | undefined, y: Y | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
    const label = dataPointTrait.formatLabel(x, y);
    if (label !== void 0) {
      dataPointTrait.setLabel(label);
    }
  }

  protected onSetDataPointTraitY2(newY2: Y | undefined, oldY: Y | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointViewY2(newY2, dataPointTrait);
  }

  protected onSetDataPointTraitRadius(newRadius: Length | null, oldRadius: Length | null, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointViewRadius(newRadius, dataPointTrait);
  }

  protected onSetDataPointTraitColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointViewColor(newColor, dataPointTrait);
  }

  protected onSetDataPointTraitLabel(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, dataPointTrait: DataPointTrait<X, Y>): void {
    this.setDataPointLabelView(newLabel, dataPointTrait);
  }

  protected createDataPointView(dataPointTrait: DataPointTrait<X, Y> | null): DataPointView<X, Y> {
    const dataPointView = DataPointView.create<X, Y>();
    if (dataPointTrait !== null) {
      dataPointView.x.setState(dataPointTrait.x, View.Intrinsic);
      dataPointView.y.setState(dataPointTrait.y, View.Intrinsic);
      dataPointView.y2.setState(dataPointTrait.y2, View.Intrinsic);
      dataPointView.radius.setState(dataPointTrait.radius, View.Intrinsic);
    }
    return dataPointView;
  }

  protected initDataPointView(dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const x = dataPointView.x.value;
      const y = dataPointView.y.value;
      this.updateDataPointTraitLabel(x, y, dataPointTrait);
    }
  }

  protected themeDataPointView(dataPointView: DataPointView<X, Y>, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachDataPointView(dataPointView: DataPointView<X, Y>): void {
    this.label.setView(dataPointView.label.view);

    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      this.setDataPointViewX(dataPointTrait.x, dataPointTrait);
      this.setDataPointViewY(dataPointTrait.y, dataPointTrait);
      this.setDataPointViewY2(dataPointTrait.y2, dataPointTrait);
      this.setDataPointViewRadius(dataPointTrait.radius, dataPointTrait);
      this.setDataPointViewColor(dataPointTrait.color, dataPointTrait);
      this.setDataPointLabelView(dataPointTrait.label, dataPointTrait);
    }
  }

  protected detachDataPointView(dataPointView: DataPointView<X, Y>): void {
    this.label.setView(null);
  }

  protected willSetDataPointView(newDataPointView: DataPointView<X, Y> | null, oldDataPointView: DataPointView<X, Y> | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetView !== void 0) {
        componentObserver.dataPointWillSetView(newDataPointView, oldDataPointView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetView !== void 0) {
        componentObserver.dataPointDidSetView(newDataPointView, oldDataPointView, this);
      }
    }
  }

  protected setDataPointViewX(x: X, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      dataPointView.x.setState(x, timing, View.Intrinsic);
    }
  }

  protected willSetDataPointViewX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetViewX !== void 0) {
        componentObserver.dataPointWillSetViewX(newX, oldX, this);
      }
    }
  }

  protected onSetDataPointViewX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const y = dataPointView.y.value;
      this.updateDataPointTraitLabel(newX, y, dataPointTrait);
    }
  }

  protected didSetDataPointViewX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetViewX !== void 0) {
        componentObserver.dataPointDidSetViewX(newX, oldX, this);
      }
    }
  }

  protected setDataPointViewY(y: Y, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      dataPointView.y.setState(y, timing, View.Intrinsic);
    }
  }

  protected willSetDataPointViewY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetViewY !== void 0) {
        componentObserver.dataPointWillSetViewY(newY, oldY, this);
      }
    }
  }

  protected onSetDataPointViewY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const dataPointTrait = this.dataPoint.trait;
    if (dataPointTrait !== null) {
      const x = dataPointView.x.value;
      this.updateDataPointTraitLabel(x, newY, dataPointTrait);
    }
  }

  protected didSetDataPointViewY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetViewY !== void 0) {
        componentObserver.dataPointDidSetViewY(newY, oldY, this);
      }
    }
  }

  protected setDataPointViewY2(y2: Y | undefined, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      dataPointView.y2.setState(y2, timing, View.Intrinsic);
    }
  }

  protected willSetDataPointViewY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetViewY2 !== void 0) {
        componentObserver.dataPointWillSetViewY2(newY2, oldY2, this);
      }
    }
  }

  protected onSetDataPointViewY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetDataPointViewY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetViewY2 !== void 0) {
        componentObserver.dataPointDidSetViewY2(newY2, oldY2, this);
      }
    }
  }

  protected setDataPointViewRadius(radius: AnyLength | null, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
      dataPointView.radius.setState(radius, timing, View.Intrinsic);
    }
  }

  protected willSetDataPointViewRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetViewRadius !== void 0) {
        componentObserver.dataPointWillSetViewRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetDataPointViewRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    // hook
  }

  protected didSetDataPointViewRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetViewRadius !== void 0) {
        componentObserver.dataPointDidSetViewRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected setDataPointViewColor(color: Look<Color> | AnyColor | null, dataPointTrait: DataPointTrait<X, Y>, timing?: AnyTiming | boolean): void {
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
        dataPointView.color.setLook(color, timing, View.Intrinsic);
      } else {
        dataPointView.color.setState(color, timing, View.Intrinsic);
      }
    }
  }

  protected createDataPointLabelView(label: DataPointLabel<X, Y>, dataPointTrait: DataPointTrait<X, Y>): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(dataPointTrait);
    } else {
      return label;
    }
  }

  protected setDataPointLabelView(label: DataPointLabel<X, Y> | null, dataPointTrait: DataPointTrait<X, Y>): void {
    const dataPointView = this.dataPoint.view;
    if (dataPointView !== null) {
      const labelView = label !== null ? this.createDataPointLabelView(label, dataPointTrait) : null;
      dataPointView.label.setView(labelView);
    }
  }

  protected initDataPointLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected attachDataPointLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected detachDataPointLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected willSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointWillSetLabelView !== void 0) {
        componentObserver.dataPointWillSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachDataPointLabelView(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachDataPointLabelView(newLabelView);
      this.initDataPointLabelView(newLabelView);
    }
  }

  protected didSetDataPointLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dataPointDidSetLabelView !== void 0) {
        componentObserver.dataPointDidSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  @ComponentProperty({type: Timing, inherit: true})
  declare dataPointTiming: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DataPointFastener = ComponentViewTrait.define<DataPointComponent<unknown, unknown>, DataPointView<unknown, unknown>, DataPointTrait<unknown, unknown>>({
    viewType: DataPointView,
    observeView: true,
    willSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.willSetDataPointView(newDataPointView, oldDataPointView);
    },
    onSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.onSetDataPointView(newDataPointView, oldDataPointView);
    },
    didSetView(newDataPointView: DataPointView<unknown, unknown> | null, oldDataPointView: DataPointView<unknown, unknown> | null): void {
      this.owner.didSetDataPointView(newDataPointView, oldDataPointView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.themeDataPointView(dataPointView, theme, mood, timing);
    },
    dataPointViewWillSetX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetDataPointViewX(newX, oldX, dataPointView);
    },
    dataPointViewDidSetX(newX: unknown | undefined, oldX: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointViewX(newX, oldX, dataPointView);
      this.owner.didSetDataPointViewX(newX, oldX, dataPointView);
    },
    dataPointViewWillSetY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetDataPointViewY(newY, oldY, dataPointView);
    },
    dataPointViewDidSetY(newY: unknown | undefined, oldY: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointViewY(newY, oldY, dataPointView);
      this.owner.didSetDataPointViewY(newY, oldY, dataPointView);
    },
    dataPointViewWillSetY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetDataPointViewY2(newY2, oldY2, dataPointView);
    },
    dataPointViewDidSetY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointViewY2(newY2, oldY2, dataPointView);
      this.owner.didSetDataPointViewY2(newY2, oldY2, dataPointView);
    },
    dataPointViewWillSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.willSetDataPointViewRadius(newRadius, oldRadius, dataPointView);
    },
    dataPointViewDidSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<unknown, unknown>): void {
      this.owner.onSetDataPointViewRadius(newRadius, oldRadius, dataPointView);
      this.owner.didSetDataPointViewRadius(newRadius, oldRadius, dataPointView);
    },
    dataPointViewDidSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    createView(): DataPointView<unknown, unknown> | null {
      return this.owner.createDataPointView(this.trait);
    },
    traitType: DataPointTrait,
    observeTrait: true,
    willSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.willSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    onSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.onSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    didSetTrait(newDataPointTrait: DataPointTrait<unknown, unknown> | null, oldDataPointTrait: DataPointTrait<unknown, unknown> | null): void {
      this.owner.didSetDataPointTrait(newDataPointTrait, oldDataPointTrait);
    },
    dataPointTraitDidSetX(newX: unknown , oldX: unknown, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitX(newX, oldX, dataPointTrait);
    },
    dataPointTraitDidSetY(newY: unknown, oldY: unknown, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitY(newY, oldY, dataPointTrait);
    },
    dataPointTraitDidSetY2(newY2: unknown | undefined, oldY2: unknown | undefined, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitY2(newY2, oldY2, dataPointTrait);
    },
    dataPointTraitDidSetRadius(newRadius: Length | null, oldRadius: Length | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitRadius(newRadius, oldRadius, dataPointTrait);
    },
    dataPointTraitDidSetColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitColor(newColor, oldColor, dataPointTrait);
    },
    dataPointTraitDidSetLabel(newLabel: DataPointLabel<unknown, unknown> | null, oldLabel: DataPointLabel<unknown, unknown> | null, dataPointTrait: DataPointTrait<unknown, unknown>): void {
      this.owner.onSetDataPointTraitLabel(newLabel, oldLabel, dataPointTrait);
    },
  });

  @ComponentViewTrait<DataPointComponent<X, Y>, DataPointView<X, Y>, DataPointTrait<X, Y>>({
    extends: DataPointComponent.DataPointFastener,
  })
  declare dataPoint: ComponentViewTrait<this, DataPointView<X, Y>, DataPointTrait<X, Y>>;

  @ComponentView<DataPointComponent<X, Y>, GraphicsView>({
    key: true,
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetDataPointLabelView(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetDataPointLabelView(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetDataPointLabelView(newLabelView, oldLabelView);
    },
  })
  declare label: ComponentView<this, GraphicsView>;
}
