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
import {DialView} from "./DialView";
import {DialLabel, DialLegend, DialTrait} from "./DialTrait";
import type {DialComponentObserver} from "./DialComponentObserver";

export class DialComponent extends CompositeComponent {
  declare readonly componentObservers: ReadonlyArray<DialComponentObserver>;

  get value(): number | undefined {
    const dialTrait = this.dial.trait;
    return dialTrait !== null ? dialTrait.value : void 0;
  }

  setValue(value: number): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      dialTrait.setValue(value);
    }
  }

  setLimit(limit: number): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      dialTrait.setLimit(limit);
    }
  }

  setLabel(label: DialLabel | null): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      dialTrait.setLabel(label);
    }
  }

  setLegend(label: DialLegend | null): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      dialTrait.setLegend(label);
    }
  }

  protected initDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected attachDialTrait(dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      this.setDialViewValue(dialTrait.value, dialTrait);
      this.setDialViewLimit(dialTrait.limit, dialTrait);
      this.setDialLabelView(dialTrait.label, dialTrait);
      this.setDialLegendView(dialTrait.legend, dialTrait);
    }
  }

  protected detachDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected willSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetTrait !== void 0) {
        componentObserver.dialWillSetTrait(newDialTrait, oldDialTrait, this);
      }
    }
  }

  protected onSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
    if (oldDialTrait !== null) {
      this.detachDialTrait(oldDialTrait);
    }
    if (newDialTrait !== null) {
      this.attachDialTrait(newDialTrait);
      this.initDialTrait(newDialTrait);
    }
  }

  protected didSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetTrait !== void 0) {
        componentObserver.dialDidSetTrait(newDialTrait, oldDialTrait, this);
      }
    }
  }

  protected onSetDialTraitValue(newValue: number, oldValue: number, dialTrait: DialTrait): void {
    this.setDialViewValue(newValue, dialTrait);
  }

  protected onSetDialTraitLimit(newLimit: number, oldLimit: number, dialTrait: DialTrait): void {
    this.setDialViewLimit(newLimit, dialTrait);
  }

  protected updateDialTraitLabel(value: number, limit: number, dialTrait: DialTrait): void {
    const label = dialTrait.formatLabel(value, limit);
    if (label !== void 0) {
      dialTrait.setLabel(label);
    }
  }

  protected onSetDialTraitLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null, dialTrait: DialTrait): void {
    this.setDialLabelView(newLabel, dialTrait);
  }

  protected updateDialTraitLegend(value: number, limit: number, dialTrait: DialTrait): void {
    const legend = dialTrait.formatLegend(value, limit);
    if (legend !== void 0) {
      dialTrait.setLegend(legend);
    }
  }

  protected onSetDialTraitLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null, dialTrait: DialTrait): void {
    this.setDialLegendView(newLegend, dialTrait);
  }

  protected createDialView(): DialView {
    return DialView.create();
  }

  protected initDialView(dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const value = dialView.value.value;
      const limit = dialView.limit.value;
      this.updateDialTraitLabel(value, limit, dialTrait);
      this.updateDialTraitLegend(value, limit, dialTrait);
      this.setDialViewValue(dialTrait.value, dialTrait);
      this.setDialViewLimit(dialTrait.limit, dialTrait);
      this.setDialLabelView(dialTrait.label, dialTrait);
      this.setDialLegendView(dialTrait.legend, dialTrait);
    }
  }

  protected themeDialView(dialView: DialView, theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    // hook
  }

  protected attachDialView(dialView: DialView): void {
    this.label.setView(dialView.label.view);
    this.legend.setView(dialView.legend.view);
  }

  protected detachDialView(dialView: DialView): void {
    this.label.setView(null);
    this.legend.setView(null);
  }

  protected willSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetView !== void 0) {
        componentObserver.dialWillSetView(newDialView, oldDialView, this);
      }
    }
  }

  protected onSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
    if (oldDialView !== null) {
      this.detachDialView(oldDialView);
    }
    if (newDialView !== null) {
      this.attachDialView(newDialView);
      this.initDialView(newDialView);
    }
  }

  protected didSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetView !== void 0) {
        componentObserver.dialDidSetView(newDialView, oldDialView, this);
      }
    }
  }

  protected setDialViewValue(value: number, dialTrait: DialTrait, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.value.isPrecedent(View.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dialView.value.setState(value, timing, View.Intrinsic);
    }
  }

  protected willSetDialViewValue(newValue: number, oldValue: number, dialView: DialView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetViewValue !== void 0) {
        componentObserver.dialWillSetViewValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetDialViewValue(newValue: number, oldValue: number, dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const limit = dialView.limit.value;
      this.updateDialTraitLabel(newValue, limit, dialTrait);
      this.updateDialTraitLegend(newValue, limit, dialTrait);
    }
  }

  protected didSetDialViewValue(newValue: number, oldValue: number, dialView: DialView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetViewValue !== void 0) {
        componentObserver.dialDidSetViewValue(newValue, oldValue, this);
      }
    }
  }

  protected setDialViewLimit(limit: number, dialTrait: DialTrait, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.limit.isPrecedent(View.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dialView.limit.setState(limit, timing, View.Intrinsic);
    }
  }

  protected willSetDialViewLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetViewLimit !== void 0) {
        componentObserver.dialWillSetViewLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected onSetDialViewLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const value = dialView.value.value;
      this.updateDialTraitLabel(value, newLimit, dialTrait);
      this.updateDialTraitLegend(value, newLimit, dialTrait);
    }
  }

  protected didSetDialViewLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetViewLimit !== void 0) {
        componentObserver.dialDidSetViewLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected createDialLabelView(label: DialLabel, dialTrait: DialTrait): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(dialTrait);
    } else {
      return label;
    }
  }

  protected setDialLabelView(label: DialLabel | null, dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const labelView = label !== null ? this.createDialLabelView(label, dialTrait) : null;
      dialView.label.setView(labelView);
    }
  }

  protected initDialLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected attachDialLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected detachDialLabelView(labelView: GraphicsView): void {
    // hook
  }

  protected willSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetLabelView !== void 0) {
        componentObserver.dialWillSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachDialLabelView(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachDialLabelView(newLabelView);
      this.initDialLabelView(newLabelView);
    }
  }

  protected didSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetLabelView !== void 0) {
        componentObserver.dialDidSetLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected createDialLegendView(legend: DialLegend, dialTrait: DialTrait): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(dialTrait);
    } else {
      return legend;
    }
  }

  protected setDialLegendView(legend: DialLegend | null, dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const legendView = legend !== null ? this.createDialLegendView(legend, dialTrait) : null;
      dialView.legend.setView(legendView);
    }
  }

  protected initDialLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected attachDialLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected detachDialLegendView(legendView: GraphicsView): void {
    // hook
  }

  protected willSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialWillSetLegendView !== void 0) {
        componentObserver.dialWillSetLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  protected onSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    if (oldLegendView !== null) {
      this.detachDialLegendView(oldLegendView);
    }
    if (newLegendView !== null) {
      this.attachDialLegendView(newLegendView);
      this.initDialLegendView(newLegendView);
    }
  }

  protected didSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.dialDidSetLegendView !== void 0) {
        componentObserver.dialDidSetLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  @ComponentProperty({type: Timing, inherit: true})
  declare dialTiming: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DialFastener = ComponentViewTrait.define<DialComponent, DialView, DialTrait>({
    viewType: DialView,
    observeView: true,
    willSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.willSetDialView(newDialView, oldDialView);
    },
    onSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.onSetDialView(newDialView, oldDialView);
    },
    didSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.didSetDialView(newDialView, oldDialView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, dialView: DialView): void {
      this.owner.themeDialView(dialView, theme, mood, timing);
    },
    dialViewWillSetValue(newValue: number, oldValue: number, dialView: DialView): void {
      this.owner.willSetDialViewValue(newValue, oldValue, dialView);
    },
    dialViewDidSetValue(newValue: number, oldValue: number, dialView: DialView): void {
      this.owner.onSetDialViewValue(newValue, oldValue, dialView);
      this.owner.didSetDialViewValue(newValue, oldValue, dialView);
    },
    dialViewWillSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      this.owner.willSetDialViewLimit(newLimit, oldLimit, dialView);
    },
    dialViewDidSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      this.owner.onSetDialViewLimit(newLimit, oldLimit, dialView);
      this.owner.didSetDialViewLimit(newLimit, oldLimit, dialView);
    },
    dialViewDidSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    dialViewDidSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.legend.setView(newLegendView);
    },
    createView(): DialView | null {
      return this.owner.createDialView();
    },
    traitType: DialTrait,
    observeTrait: true,
    willSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.willSetDialTrait(newDialTrait, oldDialTrait);
    },
    onSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.onSetDialTrait(newDialTrait, oldDialTrait);
    },
    didSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.didSetDialTrait(newDialTrait, oldDialTrait);
    },
    dialTraitDidSetValue(newValue: number, oldValue: number, dialTrait: DialTrait): void {
      this.owner.onSetDialTraitValue(newValue, oldValue, dialTrait);
    },
    dialTraitDidSetLimit(newLimit: number, oldLimit: number, dialTrait: DialTrait): void {
      this.owner.onSetDialTraitLimit(newLimit, oldLimit, dialTrait);
    },
    dialTraitDidSetLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null, dialTrait: DialTrait): void {
      this.owner.onSetDialTraitLabel(newLabel, oldLabel, dialTrait);
    },
    dialTraitDidSetLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null, dialTrait: DialTrait): void {
      this.owner.onSetDialTraitLegend(newLegend, oldLegend, dialTrait);
    },
  });

  @ComponentViewTrait<DialComponent, DialView, DialTrait>({
    extends: DialComponent.DialFastener,
  })
  declare dial: ComponentViewTrait<this, DialView, DialTrait>;

  @ComponentView<DialComponent, GraphicsView>({
    key: true,
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetDialLabelView(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetDialLabelView(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetDialLabelView(newLabelView, oldLabelView);
    },
  })
  declare label: ComponentView<this, GraphicsView>;

  @ComponentView<DialComponent, GraphicsView>({
    key: true,
    willSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetDialLegendView(newLegendView, oldLegendView);
    },
    onSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetDialLegendView(newLegendView, oldLegendView);
    },
    didSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.didSetDialLegendView(newLegendView, oldLegendView);
    },
  })
  declare legend: ComponentView<this, GraphicsView>;
}
