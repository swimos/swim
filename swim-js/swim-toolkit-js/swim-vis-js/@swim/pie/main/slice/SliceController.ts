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
import {Affinity, MemberFastenerClass, Property} from "@swim/fastener";
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {GenericController, TraitViewRef} from "@swim/controller";
import {SliceView} from "./SliceView";
import {SliceLabel, SliceLegend, SliceTrait} from "./SliceTrait";
import type {SliceControllerObserver} from "./SliceControllerObserver";

export class SliceController extends GenericController {
  override readonly observerType?: Class<SliceControllerObserver>;

  protected updateLabel(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.label.hasAffinity(Affinity.Intrinsic)) {
      const label = sliceTrait.formatLabel(value);
      if (label !== void 0) {
        sliceTrait.label.setState(label, Affinity.Intrinsic);
      }
    }
  }

  protected updateLegend(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.legend.hasAffinity(Affinity.Intrinsic)) {
      const legend = sliceTrait.formatLegend(value);
      if (legend !== void 0) {
        sliceTrait.legend.setState(legend, Affinity.Intrinsic);
      }
    }
  }

  protected setValue(value: number, timing?: AnyTiming | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null && sliceView.value.hasAffinity(Affinity.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.sliceTiming.state;
        if (timing === true) {
          timing = sliceView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      sliceView.value.setState(value, timing, Affinity.Intrinsic);
    }
  }

  protected setSliceColor(sliceColor: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.sliceTiming.state;
        if (timing === true) {
          timing = sliceView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (sliceColor instanceof Look) {
        sliceView.sliceColor.setLook(sliceColor, timing, Affinity.Intrinsic);
      } else {
        sliceView.sliceColor.setState(sliceColor, timing, Affinity.Intrinsic);
      }
    }
  }

  protected createLabelView(label: SliceLabel): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(this.slice.trait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: SliceLabel | null): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const labelView = label !== null ? this.createLabelView(label) : null;
      sliceView.label.setView(labelView);
    }
  }

  protected createLegendView(legend: SliceLegend): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(this.slice.trait);
    } else {
      return legend;
    }
  }

  protected setLegendView(legend: SliceLegend | null): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const legendView = legend !== null ? this.createLegendView(legend) : null;
      sliceView.legend.setView(legendView);
    }
  }

  @Property({type: Timing, inherits: true})
  readonly sliceTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewRef<SliceController, SliceTrait, SliceView>({
    traitType: SliceTrait,
    observesTrait: true,
    willAttachTrait(sliceTrait: SliceTrait): void {
      this.owner.callObservers("controllerWillAttachSliceTrait", sliceTrait, this.owner);
    },
    didAttachTrait(sliceTrait: SliceTrait): void {
      const sliceView = this.view;
      if (sliceView !== null) {
        this.owner.setValue(sliceTrait.value.state);
        const sliceColor = sliceTrait.sliceColor.state;
        if (sliceColor !== null) {
          this.owner.setSliceColor(sliceColor);
        }
        this.owner.setLabelView(sliceTrait.label.state);
        this.owner.setLegendView(sliceTrait.legend.state);
      }
    },
    didDetachTrait(sliceTrait: SliceTrait): void {
      this.owner.callObservers("controllerDidDetachSliceTrait", sliceTrait, this.owner);
    },
    traitDidSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.setValue(newValue);
    },
    traitDidSetSliceColor(newSliceColor: Look<Color> | Color | null, oldSliceColor: Look<Color> | Color | null): void {
      this.owner.setSliceColor(newSliceColor);
    },
    traitDidSetSliceLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null): void {
      this.owner.setLabelView(newLabel);
    },
    traitDidSetSliceLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null): void {
      this.owner.setLegendView(newLegend);
    },
    viewType: SliceView,
    observesView: true,
    willAttachView(sliceView: SliceView): void {
      this.owner.callObservers("controllerWillAttachSliceView", sliceView, this.owner);
    },
    didAttachView(sliceView: SliceView): void {
      const sliceTrait = this.trait;
      if (sliceTrait !== null) {
        const sliceColor = sliceTrait.sliceColor.state;
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
        this.owner.setValue(sliceTrait.value.state);
        this.owner.setLabelView(sliceTrait.label.state);
        this.owner.setLegendView(sliceTrait.legend.state);
      }
    },
    willDetachView(sliceView: SliceView): void {
      this.owner.label.setView(null);
      this.owner.legend.setView(null);
    },
    didDetachView(sliceView: SliceView): void {
      this.owner.callObservers("controllerDidDetachSliceView", sliceView, this.owner);
    },
    viewWillSetSliceValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      this.owner.callObservers("controllerWillSetSliceValue", newValue, oldValue, this.owner);
    },
    viewDidSetSliceValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      sliceView.setHidden(newValue === 0);
      const sliceTrait = this.trait;
      if (sliceTrait !== null) {
        this.owner.updateLabel(newValue, sliceTrait);
        this.owner.updateLegend(newValue, sliceTrait);
      }
      this.owner.callObservers("controllerDidSetSliceValue", newValue, oldValue, this.owner);
    },
    viewWillAttachSliceLabel(labelView: GraphicsView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachSliceLabel(labelView: GraphicsView): void {
      this.owner.label.setView(null);
    },
    viewWillAttachSliceLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(legendView);
    },
    viewDidDetachSliceLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(null);
    },
  })
  readonly slice!: TraitViewRef<this, SliceTrait, SliceView>;
  static readonly slice: MemberFastenerClass<SliceController, "slice">;

  @ViewRef<SliceController, GraphicsView>({
    key: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachSliceLabelView", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachSliceLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, GraphicsView>;
  static readonly label: MemberFastenerClass<SliceController, "label">;

  @ViewRef<SliceController, GraphicsView>({
    key: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachSliceLegendView", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachSliceLegendView", legendView, this.owner);
    },
  })
  readonly legend!: ViewRef<this, GraphicsView>;
  static readonly legend: MemberFastenerClass<SliceController, "legend">;
}
