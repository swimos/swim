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
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import type {AnyLength, Length} from "@swim/math";
import type {AnyColor, Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {Controller, TraitViewRef} from "@swim/controller";
import {DataPointView} from "./DataPointView";
import {DataPointLabel, DataPointTrait} from "./DataPointTrait";
import type {DataPointControllerObserver} from "./DataPointControllerObserver";

/** @public */
export class DataPointController<X = unknown, Y = unknown> extends Controller {
  override readonly observerType?: Class<DataPointControllerObserver<X, Y>>;

  protected updateLabel(x: X | undefined, y: Y | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
    const label = dataPointTrait.formatLabel(x, y);
    if (label !== void 0) {
      dataPointTrait.label.setState(label, Affinity.Intrinsic);
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

  @Property({type: Timing, inherits: true})
  readonly dataPointTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewRef<DataPointController<X, Y>, DataPointTrait<X, Y>, DataPointView<X, Y>>({
    traitType: DataPointTrait,
    observesTrait: true,
    willAttachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointTrait", dataPointTrait, this.owner);
    },
    didAttachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      const dataPointView = this.view;
      if (dataPointView !== null) {
        this.owner.setX(dataPointTrait.x.state, dataPointTrait);
        this.owner.setY(dataPointTrait.y.state, dataPointTrait);
        this.owner.setY2(dataPointTrait.y2.state, dataPointTrait);
        this.owner.setRadius(dataPointTrait.radius.state, dataPointTrait);
        this.owner.setColor(dataPointTrait.color.state, dataPointTrait);
        this.owner.setOpacity(dataPointTrait.opacity.state, dataPointTrait);
        this.owner.setLabelView(dataPointTrait.label.state, dataPointTrait);
      }
    },
    willDetachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      const dataPointView = this.view;
      if (dataPointView !== null) {
        this.owner.setLabelView(null, dataPointTrait);
      }
    },
    didDetachTrait(dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.callObservers("controllerDidDetachDataPointTrait", dataPointTrait, this.owner);
    },
    traitDidSetDataPointX(newX: X , oldX: X, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setX(newX, dataPointTrait);
    },
    traitDidSetDataPointY(newY: Y, oldY: Y, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setY(newY, dataPointTrait);
    },
    traitDidSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setY2(newY2, dataPointTrait);
    },
    traitDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setRadius(newRadius, dataPointTrait);
    },
    traitDidSetDataPointColor(newColor: Look<Color> | Color | null, oldColor: Look<Color> | Color | null, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setColor(newColor, dataPointTrait);
    },
    traitDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setOpacity(newOpacity, dataPointTrait);
    },
    traitDidSetDataPointLabel(newLabel: DataPointLabel<X, Y> | null, oldLabel: DataPointLabel<X, Y> | null, dataPointTrait: DataPointTrait<X, Y>): void {
      this.owner.setLabelView(newLabel, dataPointTrait);
    },
    viewType: DataPointView,
    observesView: true,
    willAttachView(dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillAttachDataPointView", dataPointView, this.owner);
    },
    didAttachView(dataPointView: DataPointView<X, Y>): void {
      this.owner.label.setView(dataPointView.label.view);
      const dataPointTrait = this.trait;
      if (dataPointTrait !== null) {
        this.owner.setX(dataPointTrait.x.state, dataPointTrait);
        this.owner.setY(dataPointTrait.y.state, dataPointTrait);
        this.owner.setY2(dataPointTrait.y2.state, dataPointTrait);
        this.owner.setRadius(dataPointTrait.radius.state, dataPointTrait);
        this.owner.setColor(dataPointTrait.color.state, dataPointTrait);
        this.owner.setOpacity(dataPointTrait.opacity.state, dataPointTrait);
        this.owner.setLabelView(dataPointTrait.label.state, dataPointTrait);
        const x = dataPointView.x.value;
        const y = dataPointView.y.value;
        this.owner.updateLabel(x, y, dataPointTrait);
      }
    },
    willDetachView(dataPointView: DataPointView<X, Y>): void {
      this.owner.label.setView(null);
    },
    didDetachView(dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerDidDetachDataPointView", dataPointView, this.owner);
    },
    viewWillSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointX", newX, oldX, this.owner);
    },
    viewDidSetDataPointX(newX: X | undefined, oldX: X | undefined, dataPointView: DataPointView<X, Y>): void {
      const dataPointTrait = this.trait;
      if (dataPointTrait !== null) {
        const y = dataPointView.y.value;
        this.owner.updateLabel(newX, y, dataPointTrait);
      }
      this.owner.callObservers("controllerDidSetDataPointX", newX, oldX, this.owner);
    },
    viewWillSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointY", newY, oldY, this.owner);
    },
    viewDidSetDataPointY(newY: Y | undefined, oldY: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      const dataPointTrait = this.trait;
      if (dataPointTrait !== null) {
        const x = dataPointView.x.value;
        this.owner.updateLabel(x, newY, dataPointTrait);
      }
      this.owner.callObservers("controllerDidSetDataPointY", newY, oldY, this.owner);
    },
    viewWillSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointY2", newY2, oldY2, this.owner);
    },
    viewDidSetDataPointY2(newY2: Y | undefined, oldY2: Y | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointY2", newY2, oldY2, this.owner);
    },
    viewWillSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointRadius", newRadius, oldRadius, this.owner);
    },
    viewDidSetDataPointRadius(newRadius: Length | null, oldRadius: Length | null, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointRadius", newRadius, oldRadius, this.owner);
    },
    viewWillSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointColor", newColor, oldColor, this.owner);
    },
    viewDidSetDataPointColor(newColor: Color | null, oldColor: Color | null, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointColor", newColor, oldColor, this.owner);
    },
    viewWillSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerWillSetDataPointOpacity", newOpacity, oldOpacity, this.owner);
    },
    viewDidSetDataPointOpacity(newOpacity: number | undefined, oldOpacity: number | undefined, dataPointView: DataPointView<X, Y>): void {
      this.owner.callObservers("controllerDidSetDataPointOpacity", newOpacity, oldOpacity, this.owner);
    },
    viewWillAttachDataPointLabel(labelView: GraphicsView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachDataPointLabel(labelView: GraphicsView): void {
      this.owner.label.setView(null);
    },
    createView(): DataPointView<X, Y> {
      const dataPointView = new DataPointView<X, Y>();
      const dataPointTrait = this.trait;
      if (dataPointTrait !== null) {
        dataPointView.x.setState(dataPointTrait.x.state, Affinity.Intrinsic);
        dataPointView.y.setState(dataPointTrait.y.state, Affinity.Intrinsic);
        dataPointView.y2.setState(dataPointTrait.y2.state, Affinity.Intrinsic);
        dataPointView.radius.setState(dataPointTrait.radius.state, Affinity.Intrinsic);
      }
      return dataPointView;
    },
  })
  readonly dataPoint!: TraitViewRef<this, DataPointTrait<X, Y>, DataPointView<X, Y>>;
  static readonly dataPoint: MemberFastenerClass<DataPointController, "dataPoint">;

  @ViewRef<DataPointController<X, Y>, GraphicsView>({
    key: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachDataPointLabelView", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachDataPointLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, GraphicsView>;
  static readonly label: MemberFastenerClass<DataPointController, "label">;
}
