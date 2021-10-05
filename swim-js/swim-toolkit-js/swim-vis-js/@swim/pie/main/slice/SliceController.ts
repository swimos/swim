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
import type {Color} from "@swim/style";
import {Look, Mood} from "@swim/theme";
import {ViewFastener} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {TraitViewFastener, GenericController} from "@swim/controller";
import {SliceView} from "./SliceView";
import {SliceLabel, SliceLegend, SliceTrait} from "./SliceTrait";
import type {SliceControllerObserver} from "./SliceControllerObserver";

export class SliceController extends GenericController {
  override readonly observerType?: Class<SliceControllerObserver>;

  protected initSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected attachSliceTrait(sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      this.setValue(sliceTrait.value.state);
      const sliceColor = sliceTrait.sliceColor.state;
      if (sliceColor !== null) {
        this.setSliceColor(sliceColor);
      }
      this.setLabelView(sliceTrait.label.state);
      this.setLegendView(sliceTrait.legend.state);
    }
  }

  protected detachSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected willSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceTrait !== void 0) {
        observer.controllerWillSetSliceTrait(newSliceTrait, oldSliceTrait, this);
      }
    }
  }

  protected onSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
    if (oldSliceTrait !== null) {
      this.detachSliceTrait(oldSliceTrait);
    }
    if (newSliceTrait !== null) {
      this.attachSliceTrait(newSliceTrait);
      this.initSliceTrait(newSliceTrait);
    }
  }

  protected didSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceTrait !== void 0) {
        observer.controllerDidSetSliceTrait(newSliceTrait, oldSliceTrait, this);
      }
    }
  }

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

  protected createSliceView(): SliceView {
    return SliceView.create();
  }

  protected initSliceView(sliceView: SliceView): void {
    const value = sliceView.value.value;
    sliceView.setHidden(value === 0);
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      this.updateLabel(value, sliceTrait);
      this.updateLegend(value, sliceTrait);
      this.setValue(sliceTrait.value.state);
      this.setLabelView(sliceTrait.label.state);
      this.setLegendView(sliceTrait.legend.state);
    }
  }

  protected attachSliceView(sliceView: SliceView): void {
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      const sliceColor = sliceTrait.sliceColor.state;
      if (sliceColor !== null) {
        this.setSliceColor(sliceColor);
      }
    }
    this.label.setView(sliceView.label.view);
    this.legend.setView(sliceView.legend.view);
  }

  protected detachSliceView(sliceView: SliceView): void {
    this.label.setView(null);
    this.legend.setView(null);
  }

  protected willSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceView !== void 0) {
        observer.controllerWillSetSliceView(newSliceView, oldSliceView, this);
      }
    }
  }

  protected onSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
    if (oldSliceView !== null) {
      this.detachSliceView(oldSliceView);
    }
    if (newSliceView !== null) {
      this.attachSliceView(newSliceView);
      this.initSliceView(newSliceView);
    }
  }

  protected didSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceView !== void 0) {
        observer.controllerDidSetSliceView(newSliceView, oldSliceView, this);
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

  protected willSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceValue !== void 0) {
        observer.controllerWillSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    sliceView.setHidden(newValue === 0);
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      this.updateLabel(newValue, sliceTrait);
      this.updateLegend(newValue, sliceTrait);
    }
  }

  protected didSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceValue !== void 0) {
        observer.controllerDidSetSliceValue(newValue, oldValue, this);
      }
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
      if (observer.controllerWillSetSliceLabelView !== void 0) {
        observer.controllerWillSetSliceLabelView(newLabelView, oldLabelView, this);
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
      if (observer.controllerDidSetSliceLabelView !== void 0) {
        observer.controllerDidSetSliceLabelView(newLabelView, oldLabelView, this);
      }
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

  protected initLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected attachLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected detachLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected willSetLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceLegendView !== void 0) {
        observer.controllerWillSetSliceLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  protected onSetLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    if (oldLegendView !== null) {
      this.detachLegendView(oldLegendView);
    }
    if (newLegendView !== null) {
      this.attachLegendView(newLegendView);
      this.initLegendView(newLegendView);
    }
  }

  protected didSetLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceLegendView !== void 0) {
        observer.controllerDidSetSliceLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  @Property({type: Timing, inherits: true})
  readonly sliceTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  /** @internal */
  static SliceFastener = TraitViewFastener.define<SliceController, SliceTrait, SliceView>({
    traitType: SliceTrait,
    observesTrait: true,
    willSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.willSetSliceTrait(newSliceTrait, oldSliceTrait);
    },
    onSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.onSetSliceTrait(newSliceTrait, oldSliceTrait);
    },
    didSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.didSetSliceTrait(newSliceTrait, oldSliceTrait);
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
    willSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.willSetSliceView(newSliceView, oldSliceView);
    },
    onSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.onSetSliceView(newSliceView, oldSliceView);
    },
    didSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.didSetSliceView(newSliceView, oldSliceView);
    },
    viewWillSetSliceValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      this.owner.willSetValue(newValue, oldValue, sliceView);
    },
    viewDidSetSliceValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      this.owner.onSetValue(newValue, oldValue, sliceView);
      this.owner.didSetValue(newValue, oldValue, sliceView);
    },
    viewDidSetSliceLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    viewDidSetSliceLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.legend.setView(newLegendView);
    },
    createView(): SliceView | null {
      return this.owner.createSliceView();
    },
  });

  @TraitViewFastener<SliceController, SliceTrait, SliceView>({
    extends: SliceController.SliceFastener,
  })
  readonly slice!: TraitViewFastener<this, SliceTrait, SliceView>;

  @ViewFastener<SliceController, GraphicsView>({
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

  @ViewFastener<SliceController, GraphicsView>({
    key: true,
    willSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetLegendView(newLegendView, oldLegendView);
    },
    onSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetLegendView(newLegendView, oldLegendView);
    },
    didSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.didSetLegendView(newLegendView, oldLegendView);
    },
  })
  readonly legend!: ViewFastener<this, GraphicsView>;
}
