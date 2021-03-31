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
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {ComponentProperty, ComponentView, ComponentViewTrait, CompositeComponent} from "@swim/component";
import {SliceView} from "./SliceView";
import {SliceLabel, SliceLegend, SliceTrait} from "./SliceTrait";
import type {SliceComponentObserver} from "./SliceComponentObserver";

export class SliceComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<SliceComponentObserver>;

  get value(): number | undefined {
    const sliceTrait = this.slice.trait;
    return sliceTrait !== null ? sliceTrait.value : void 0;
  }

  setValue(value: number): void {
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      sliceTrait.setValue(value);
    }
  }

  setLabel(label: SliceLabel | null): void {
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      sliceTrait.setLabel(label);
    }
  }

  setLegend(label: SliceLegend | null): void {
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      sliceTrait.setLegend(label);
    }
  }

  protected initSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected attachSliceTrait(sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      this.setSliceViewValue(sliceTrait.value, sliceTrait);
      this.setSliceLabelView(sliceTrait.label, sliceTrait);
      this.setSliceLegendView(sliceTrait.legend, sliceTrait);
    }
  }

  protected detachSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected willSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceWillSetTrait !== void 0) {
        componentObserver.sliceWillSetTrait(newSliceTrait, oldSliceTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceDidSetTrait !== void 0) {
        componentObserver.sliceDidSetTrait(newSliceTrait, oldSliceTrait, this);
      }
    }
  }

  protected onSetSliceTraitValue(newValue: number, oldValue: number, sliceTrait: SliceTrait): void {
    this.setSliceViewValue(newValue, sliceTrait);
  }

  protected updateSliceTraitLabel(value: number, sliceTrait: SliceTrait): void {
    const label = sliceTrait.formatLabel(value);
    if (label !== void 0) {
      sliceTrait.setLabel(label);
    }
  }

  protected onSetSliceTraitLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null, sliceTrait: SliceTrait): void {
    this.setSliceLabelView(newLabel, sliceTrait);
  }

  protected updateSliceTraitLegend(value: number, sliceTrait: SliceTrait): void {
    const legend = sliceTrait.formatLegend(value);
    if (legend !== void 0) {
      sliceTrait.setLegend(legend);
    }
  }

  protected onSetSliceTraitLegend(newLegend: SliceLabel | null, oldLegend: SliceLabel | null, sliceTrait: SliceTrait): void {
    this.setSliceLegendView(newLegend, sliceTrait);
  }

  protected createSliceView(): SliceView {
    return SliceView.create();
  }

  protected initSliceView(sliceView: SliceView): void {
    const value = sliceView.value.value;
    sliceView.setHidden(value === 0);
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      this.updateSliceTraitLabel(value, sliceTrait);
      this.updateSliceTraitLegend(value, sliceTrait);
      this.setSliceViewValue(sliceTrait.value, sliceTrait);
      this.setSliceLabelView(sliceTrait.label, sliceTrait);
      this.setSliceLegendView(sliceTrait.legend, sliceTrait);
    }
  }

  protected themeSliceView(sliceView: SliceView, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachSliceView(sliceView: SliceView): void {
    this.label.setView(sliceView.label.view);
    this.legend.setView(sliceView.legend.view);
  }

  protected detachSliceView(sliceView: SliceView): void {
    this.label.setView(null);
    this.legend.setView(null);
  }

  protected willSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceWillSetView !== void 0) {
        componentObserver.sliceWillSetView(newSliceView, oldSliceView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceDidSetView !== void 0) {
        componentObserver.sliceDidSetView(newSliceView, oldSliceView, this);
      }
    }
  }

  protected setSliceViewValue(value: number, sliceTrait: SliceTrait, timing?: AnyTiming | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null && sliceView.value.isPrecedent(View.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.sliceTiming.state;
        if (timing === true) {
          timing = sliceView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      sliceView.value.setState(value, timing, View.Intrinsic);
    }
  }

  protected willSetSliceViewValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceWillSetViewValue !== void 0) {
        componentObserver.sliceWillSetViewValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetSliceViewValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    sliceView.setHidden(newValue === 0);
    const sliceTrait = this.slice.trait;
    if (sliceTrait !== null) {
      this.updateSliceTraitLabel(newValue, sliceTrait);
      this.updateSliceTraitLegend(newValue, sliceTrait);
    }
  }

  protected didSetSliceViewValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceDidSetViewValue !== void 0) {
        componentObserver.sliceDidSetViewValue(newValue, oldValue, this);
      }
    }
  }

  protected createSliceLabelView(label: SliceLabel, sliceTrait: SliceTrait): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(sliceTrait);
    } else {
      return label;
    }
  }

  protected setSliceLabelView(label: SliceLabel | null, sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const labelView = label !== null ? this.createSliceLabelView(label, sliceTrait) : null;
      sliceView.label.setView(labelView);
    }
  }

  protected initSliceLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected attachSliceLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected detachSliceLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected willSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceWillSetLabelView !== void 0) {
        componentObserver.sliceWillSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachSliceLabelView(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachSliceLabelView(newLabelView);
      this.initSliceLabelView(newLabelView);
    }
  }

  protected didSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceDidSetLabelView !== void 0) {
        componentObserver.sliceDidSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected createSliceLegendView(legend: SliceLegend, sliceTrait: SliceTrait): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(sliceTrait);
    } else {
      return legend;
    }
  }

  protected setSliceLegendView(legend: SliceLegend | null, sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const legendView = legend !== null ? this.createSliceLegendView(legend, sliceTrait) : null;
      sliceView.legend.setView(legendView);
    }
  }

  protected initSliceLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected attachSliceLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected detachSliceLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected willSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceWillSetLegendView !== void 0) {
        componentObserver.sliceWillSetLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  protected onSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    if (oldLegendView !== null) {
      this.detachSliceLegendView(oldLegendView);
    }
    if (newLegendView !== null) {
      this.attachSliceLegendView(newLegendView);
      this.initSliceLegendView(newLegendView);
    }
  }

  protected didSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.sliceDidSetLegendView !== void 0) {
        componentObserver.sliceDidSetLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  @ComponentProperty({type: Timing, inherit: true})
  declare sliceTiming: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static SliceFastener = ComponentViewTrait.define<SliceComponent, SliceView, SliceTrait>({
    viewType: SliceView,
    observeView: true,
    willSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.willSetSliceView(newSliceView, oldSliceView);
    },
    onSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.onSetSliceView(newSliceView, oldSliceView);
    },
    didSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.didSetSliceView(newSliceView, oldSliceView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, sliceView: SliceView): void {
      this.owner.themeSliceView(sliceView, theme, mood, timing);
    },
    sliceViewWillSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      this.owner.willSetSliceViewValue(newValue, oldValue, sliceView);
    },
    sliceViewDidSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
      this.owner.onSetSliceViewValue(newValue, oldValue, sliceView);
      this.owner.didSetSliceViewValue(newValue, oldValue, sliceView);
    },
    sliceViewDidSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    sliceViewDidSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.legend.setView(newLegendView);
    },
    createView(): SliceView | null {
      return this.owner.createSliceView();
    },
    traitType: SliceTrait,
    observeTrait: true,
    willSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.willSetSliceTrait(newSliceTrait, oldSliceTrait);
    },
    onSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.onSetSliceTrait(newSliceTrait, oldSliceTrait);
    },
    didSetTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.didSetSliceTrait(newSliceTrait, oldSliceTrait);
    },
    sliceTraitDidSetValue(newValue: number, oldValue: number, sliceTrait: SliceTrait): void {
      this.owner.onSetSliceTraitValue(newValue, oldValue, sliceTrait);
    },
    sliceTraitDidSetLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null, sliceTrait: SliceTrait): void {
      this.owner.onSetSliceTraitLabel(newLabel, oldLabel, sliceTrait);
    },
    sliceTraitDidSetLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null, sliceTrait: SliceTrait): void {
      this.owner.onSetSliceTraitLegend(newLegend, oldLegend, sliceTrait);
    },
  });

  @ComponentViewTrait<SliceComponent, SliceView, SliceTrait>({
    extends: SliceComponent.SliceFastener,
  })
  declare slice: ComponentViewTrait<this, SliceView, SliceTrait>;

  @ComponentView<SliceComponent, GraphicsView>({
    key: true,
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetSliceLabelView(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetSliceLabelView(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetSliceLabelView(newLabelView, oldLabelView);
    },
  })
  declare label: ComponentView<this, GraphicsView>;

  @ComponentView<SliceComponent, GraphicsView>({
    key: true,
    willSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetSliceLegendView(newLegendView, oldLegendView);
    },
    onSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetSliceLegendView(newLegendView, oldLegendView);
    },
    didSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.didSetSliceLegendView(newLegendView, oldLegendView);
    },
  })
  declare legend: ComponentView<this, GraphicsView>;
}
