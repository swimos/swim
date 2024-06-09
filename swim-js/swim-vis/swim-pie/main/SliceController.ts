// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Look} from "@swim/theme";
import {Mood} from "@swim/theme";
import type {ColorOrLook} from "@swim/theme";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {SliceView} from "./SliceView";
import {SliceTrait} from "./SliceTrait";

/** @public */
export interface SliceControllerObserver<C extends SliceController = SliceController> extends ControllerObserver<C> {
  controllerWillAttachSliceTrait?(sliceTrait: SliceTrait, controller: C): void;

  controllerDidDetachSliceTrait?(sliceTrait: SliceTrait, controller: C): void;

  controllerWillAttachSliceView?(sliceView: SliceView, controller: C): void;

  controllerDidDetachSliceView?(sliceView: SliceView, controller: C): void;

  controllerDidSetSliceValue?(value: number, controller: C): void;

  controllerWillAttachSliceLabelView?(labelView: GraphicsView, controller: C): void;

  controllerDidDetachSliceLabelView?(labelView: GraphicsView, controller: C): void;

  controllerWillAttachSliceLegendView?(legendView: GraphicsView, controller: C): void;

  controllerDidDetachSliceLegendView?(legendView: GraphicsView, controller: C): void;
}

/** @public */
export class SliceController extends Controller {
  declare readonly observerType?: Class<SliceControllerObserver>;

  protected updateLabel(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.label.hasAffinity(Affinity.Intrinsic)) {
      const label = sliceTrait.formatLabel(value);
      if (label !== void 0) {
        sliceTrait.label.setIntrinsic(label);
      }
    }
  }

  protected updateLegend(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.legend.hasAffinity(Affinity.Intrinsic)) {
      const legend = sliceTrait.formatLegend(value);
      if (legend !== void 0) {
        sliceTrait.legend.setIntrinsic(legend);
      }
    }
  }

  protected setValue(value: number, timing?: TimingLike | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null && sliceView.value.hasAffinity(Affinity.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.sliceTiming.value;
        if (timing === true) {
          timing = sliceView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromLike(timing);
      }
      sliceView.value.setIntrinsic(value, timing);
    }
  }

  protected setSliceColor(sliceColor: ColorOrLook | null, timing?: TimingLike | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.sliceTiming.value;
        if (timing === true) {
          timing = sliceView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromLike(timing);
      }
      sliceView.sliceColor.setIntrinsic(sliceColor, timing);
    }
  }

  protected setLabelView(label: string | undefined): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      sliceView.label.set(label !== void 0 ? label : "");
    }
  }

  protected setLegendView(legend: string | undefined): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      sliceView.legend.set(legend !== void 0 ? legend : "");
    }
  }

  @Property({valueType: Timing, inherits: true})
  get sliceTiming(): Property<this, Timing | boolean | undefined> {
    return Property.getter();
  }

  @TraitViewRef({
    traitType: SliceTrait,
    observesTrait: true,
    willAttachTrait(sliceTrait: SliceTrait): void {
      this.owner.callObservers("controllerWillAttachSliceTrait", sliceTrait, this.owner);
    },
    didAttachTrait(sliceTrait: SliceTrait): void {
      const sliceView = this.view;
      if (sliceView !== null) {
        this.owner.setValue(sliceTrait.value.value);
        const sliceColor = sliceTrait.sliceColor.value;
        if (sliceColor !== null) {
          this.owner.setSliceColor(sliceColor);
        }
        this.owner.setLabelView(sliceTrait.label.value);
        this.owner.setLegendView(sliceTrait.legend.value);
      }
    },
    didDetachTrait(sliceTrait: SliceTrait): void {
      this.owner.callObservers("controllerDidDetachSliceTrait", sliceTrait, this.owner);
    },
    traitDidSetValue(value: number): void {
      this.owner.setValue(value);
    },
    traitDidSetSliceColor(sliceColor: ColorOrLook | null): void {
      this.owner.setSliceColor(sliceColor);
    },
    traitDidSetLabel(label: string | undefined): void {
      this.owner.setLabelView(label);
    },
    traitDidSetLegend(legend: string | undefined): void {
      this.owner.setLegendView(legend);
    },
    viewType: SliceView,
    observesView: true,
    willAttachView(sliceView: SliceView): void {
      this.owner.callObservers("controllerWillAttachSliceView", sliceView, this.owner);
    },
    didAttachView(sliceView: SliceView): void {
      const sliceTrait = this.trait;
      if (sliceTrait !== null) {
        const sliceColor = sliceTrait.sliceColor.value;
        if (sliceColor !== null) {
          this.owner.setSliceColor(sliceColor);
        }
      }
      this.owner.label.setView(sliceView.label.view);
      this.owner.legend.setView(sliceView.legend.view);
      const value = sliceView.value.value;
      sliceView.setHidden(value === 0);
      if (sliceTrait !== null) {
        this.owner.updateLabel(value, sliceTrait);
        this.owner.updateLegend(value, sliceTrait);
        this.owner.setValue(sliceTrait.value.value);
        this.owner.setLabelView(sliceTrait.label.value);
        this.owner.setLegendView(sliceTrait.legend.value);
      }
    },
    willDetachView(sliceView: SliceView): void {
      this.owner.label.setView(null);
      this.owner.legend.setView(null);
    },
    didDetachView(sliceView: SliceView): void {
      this.owner.callObservers("controllerDidDetachSliceView", sliceView, this.owner);
    },
    viewDidSetValue(value: number, sliceView: SliceView): void {
      sliceView.setHidden(value === 0);
      const sliceTrait = this.trait;
      if (sliceTrait !== null) {
        this.owner.updateLabel(value, sliceTrait);
        this.owner.updateLegend(value, sliceTrait);
      }
      this.owner.callObservers("controllerDidSetSliceValue", value, this.owner);
    },
    viewWillAttachLabel(labelView: GraphicsView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachLabel(labelView: GraphicsView): void {
      this.owner.label.setView(null);
    },
    viewWillAttachLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(legendView);
    },
    viewDidDetachLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(null);
    },
  })
  readonly slice!: TraitViewRef<this, SliceTrait, SliceView> & Observes<SliceTrait> & Observes<SliceView>;

  @ViewRef({
    viewKey: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachSliceLabelView", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachSliceLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, GraphicsView>;

  @ViewRef({
    viewKey: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachSliceLegendView", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachSliceLegendView", legendView, this.owner);
    },
  })
  readonly legend!: ViewRef<this, GraphicsView>;
}
