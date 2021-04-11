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
import {Model} from "@swim/model";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {ComponentProperty, ComponentView, ComponentViewTrait, CompositeComponent} from "@swim/component";
import {SliceView} from "./SliceView";
import {SliceLabel, SliceLegend, SliceTrait} from "./SliceTrait";
import type {SliceComponentObserver} from "./SliceComponentObserver";

export class SliceComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<SliceComponentObserver>;

  protected initSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected attachSliceTrait(sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      this.setValue(sliceTrait.value.state, sliceTrait);
      this.setLabelView(sliceTrait.label.state, sliceTrait);
      this.setLegendView(sliceTrait.legend.state, sliceTrait);
    }
  }

  protected detachSliceTrait(sliceTrait: SliceTrait): void {
    // hook
  }

  protected willSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceTrait !== void 0) {
        componentObserver.componentWillSetSliceTrait(newSliceTrait, oldSliceTrait, this);
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
      if (componentObserver.componentDidSetSliceTrait !== void 0) {
        componentObserver.componentDidSetSliceTrait(newSliceTrait, oldSliceTrait, this);
      }
    }
  }

  protected updateLabel(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.label.takesPrecedence(Model.Intrinsic)) {
      const label = sliceTrait.formatLabel(value);
      if (label !== void 0) {
        sliceTrait.label.setState(label, Model.Intrinsic);
      }
    }
  }

  protected updateLegend(value: number, sliceTrait: SliceTrait): void {
    if (sliceTrait.legend.takesPrecedence(Model.Intrinsic)) {
      const legend = sliceTrait.formatLegend(value);
      if (legend !== void 0) {
        sliceTrait.legend.setState(legend, Model.Intrinsic);
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
      this.setValue(sliceTrait.value.state, sliceTrait);
      this.setLabelView(sliceTrait.label.state, sliceTrait);
      this.setLegendView(sliceTrait.legend.state, sliceTrait);
    }
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
      if (componentObserver.componentWillSetSliceView !== void 0) {
        componentObserver.componentWillSetSliceView(newSliceView, oldSliceView, this);
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
      if (componentObserver.componentDidSetSliceView !== void 0) {
        componentObserver.componentDidSetSliceView(newSliceView, oldSliceView, this);
      }
    }
  }

  protected themeSliceView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, sliceView: SliceView): void {
    // hook
  }

  protected setValue(value: number, sliceTrait: SliceTrait, timing?: AnyTiming | boolean): void {
    const sliceView = this.slice.view;
    if (sliceView !== null && sliceView.value.takesPrecedence(View.Intrinsic)) {
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

  protected willSetValue(newValue: number, oldValue: number, sliceView: SliceView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceValue !== void 0) {
        componentObserver.componentWillSetSliceValue(newValue, oldValue, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceValue !== void 0) {
        componentObserver.componentDidSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  protected createLabelView(label: SliceLabel, sliceTrait: SliceTrait): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(sliceTrait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: SliceLabel | null, sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const labelView = label !== null ? this.createLabelView(label, sliceTrait) : null;
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceLabelView !== void 0) {
        componentObserver.componentWillSetSliceLabelView(newLabelView, oldLabelView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceLabelView !== void 0) {
        componentObserver.componentDidSetSliceLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected createLegendView(legend: SliceLegend, sliceTrait: SliceTrait): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(sliceTrait);
    } else {
      return legend;
    }
  }

  protected setLegendView(legend: SliceLegend | null, sliceTrait: SliceTrait): void {
    const sliceView = this.slice.view;
    if (sliceView !== null) {
      const legendView = legend !== null ? this.createLegendView(legend, sliceTrait) : null;
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetSliceLegendView !== void 0) {
        componentObserver.componentWillSetSliceLegendView(newLegendView, oldLegendView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetSliceLegendView !== void 0) {
        componentObserver.componentDidSetSliceLegendView(newLegendView, oldLegendView, this);
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
      this.owner.themeSliceView(theme, mood, timing, sliceView);
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
    traitDidSetSliceValue(newValue: number, oldValue: number, sliceTrait: SliceTrait): void {
      this.owner.setValue(newValue, sliceTrait);
    },
    traitDidSetSliceLabel(newLabel: SliceLabel | null, oldLabel: SliceLabel | null, sliceTrait: SliceTrait): void {
      this.owner.setLabelView(newLabel, sliceTrait);
    },
    traitDidSetSliceLegend(newLegend: SliceLegend | null, oldLegend: SliceLegend | null, sliceTrait: SliceTrait): void {
      this.owner.setLegendView(newLegend, sliceTrait);
    },
  });

  @ComponentViewTrait<SliceComponent, SliceView, SliceTrait>({
    extends: SliceComponent.SliceFastener,
  })
  declare slice: ComponentViewTrait<this, SliceView, SliceTrait>;

  @ComponentView<SliceComponent, GraphicsView>({
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
  declare label: ComponentView<this, GraphicsView>;

  @ComponentView<SliceComponent, GraphicsView>({
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
  declare legend: ComponentView<this, GraphicsView>;
}
