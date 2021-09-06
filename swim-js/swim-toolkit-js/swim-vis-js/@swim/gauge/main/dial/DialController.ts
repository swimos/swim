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

import {AnyTiming, Timing} from "@swim/mapping";
import {Model} from "@swim/model";
import {Look, Mood, MoodVector, ThemeMatrix} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {ControllerProperty, ControllerView, ControllerViewTrait, CompositeController} from "@swim/controller";
import {DialView} from "./DialView";
import {DialLabel, DialLegend, DialTrait} from "./DialTrait";
import type {DialControllerObserver} from "./DialControllerObserver";

export class DialController extends CompositeController {
  override readonly controllerObservers!: ReadonlyArray<DialControllerObserver>;

  protected initDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected attachDialTrait(dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      this.setValue(dialTrait.value.state, dialTrait);
      this.setLimit(dialTrait.limit.state, dialTrait);
      this.setLabelView(dialTrait.label.state, dialTrait);
      this.setLegendView(dialTrait.legend.state, dialTrait);
    }
  }

  protected detachDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected willSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialTrait !== void 0) {
        controllerObserver.controllerWillSetDialTrait(newDialTrait, oldDialTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialTrait !== void 0) {
        controllerObserver.controllerDidSetDialTrait(newDialTrait, oldDialTrait, this);
      }
    }
  }

  protected updateLabel(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.label.takesPrecedence(Model.Intrinsic)) {
      const label = dialTrait.formatLabel(value, limit);
      if (label !== void 0) {
        dialTrait.label.setState(label, Model.Intrinsic);
      }
    }
  }

  protected updateLegend(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.legend.takesPrecedence(Model.Intrinsic)) {
      const legend = dialTrait.formatLegend(value, limit);
      if (legend !== void 0) {
        dialTrait.legend.setState(legend, Model.Intrinsic);
      }
    }
  }

  protected createDialView(): DialView {
    return DialView.create();
  }

  protected initDialView(dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const value = dialView.value.value;
      const limit = dialView.limit.value;
      this.updateLabel(value, limit, dialTrait);
      this.updateLegend(value, limit, dialTrait);
      this.setValue(dialTrait.value.state, dialTrait);
      this.setLimit(dialTrait.limit.state, dialTrait);
      this.setLabelView(dialTrait.label.state, dialTrait);
      this.setLegendView(dialTrait.legend.state, dialTrait);
    }
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialView !== void 0) {
        controllerObserver.controllerWillSetDialView(newDialView, oldDialView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialView !== void 0) {
        controllerObserver.controllerDidSetDialView(newDialView, oldDialView, this);
      }
    }
  }

  protected themeDialView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, dialView: DialView): void {
    // hook
  }

  protected setValue(value: number, dialTrait: DialTrait, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.value.takesPrecedence(View.Intrinsic)) {
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

  protected willSetValue(newValue: number, oldValue: number, dialView: DialView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialValue !== void 0) {
        controllerObserver.controllerWillSetDialValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number, dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const limit = dialView.limit.value;
      this.updateLabel(newValue, limit, dialTrait);
      this.updateLegend(newValue, limit, dialTrait);
    }
  }

  protected didSetValue(newValue: number, oldValue: number, dialView: DialView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialValue !== void 0) {
        controllerObserver.controllerDidSetDialValue(newValue, oldValue, this);
      }
    }
  }

  protected setLimit(limit: number, dialTrait: DialTrait, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.limit.takesPrecedence(View.Intrinsic)) {
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

  protected willSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLimit !== void 0) {
        controllerObserver.controllerWillSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected onSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const value = dialView.value.value;
      this.updateLabel(value, newLimit, dialTrait);
      this.updateLegend(value, newLimit, dialTrait);
    }
  }

  protected didSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLimit !== void 0) {
        controllerObserver.controllerDidSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected createLabelView(label: DialLabel, dialTrait: DialTrait): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(dialTrait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: DialLabel | null, dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const labelView = label !== null ? this.createLabelView(label, dialTrait) : null;
      dialView.label.setView(labelView);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLabelView !== void 0) {
        controllerObserver.controllerWillSetDialLabelView(newLabelView, oldLabelView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLabelView !== void 0) {
        controllerObserver.controllerDidSetDialLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected createLegendView(legend: DialLegend, dialTrait: DialTrait): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(dialTrait);
    } else {
      return legend;
    }
  }

  protected setLegendView(legend: DialLegend | null, dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const legendView = legend !== null ? this.createLegendView(legend, dialTrait) : null;
      dialView.legend.setView(legendView);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLegendView !== void 0) {
        controllerObserver.controllerWillSetDialLegendView(newLegendView, oldLegendView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLegendView !== void 0) {
        controllerObserver.controllerDidSetDialLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  @ControllerProperty({type: Timing, inherit: true})
  readonly dialTiming!: ControllerProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DialFastener = ControllerViewTrait.define<DialController, DialView, DialTrait>({
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
      this.owner.themeDialView(theme, mood, timing, dialView);
    },
    viewWillSetDialValue(newValue: number, oldValue: number, dialView: DialView): void {
      this.owner.willSetValue(newValue, oldValue, dialView);
    },
    viewDidSetDialValue(newValue: number, oldValue: number, dialView: DialView): void {
      this.owner.onSetValue(newValue, oldValue, dialView);
      this.owner.didSetValue(newValue, oldValue, dialView);
    },
    viewWillSetDialLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      this.owner.willSetLimit(newLimit, oldLimit, dialView);
    },
    viewDidSetDialLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      this.owner.onSetLimit(newLimit, oldLimit, dialView);
      this.owner.didSetLimit(newLimit, oldLimit, dialView);
    },
    viewDidSetDialLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.label.setView(newLabelView);
    },
    viewDidSetDialLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
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
    traitDidSetDialValue(newValue: number, oldValue: number, dialTrait: DialTrait): void {
      this.owner.setValue(newValue, dialTrait);
    },
    traitDidSetDialLimit(newLimit: number, oldLimit: number, dialTrait: DialTrait): void {
      this.owner.setLimit(newLimit, dialTrait);
    },
    traitDidSetDialLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null, dialTrait: DialTrait): void {
      this.owner.setLabelView(newLabel, dialTrait);
    },
    traitDidSetDialLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null, dialTrait: DialTrait): void {
      this.owner.setLegendView(newLegend, dialTrait);
    },
  });

  @ControllerViewTrait<DialController, DialView, DialTrait>({
    extends: DialController.DialFastener,
  })
  readonly dial!: ControllerViewTrait<this, DialView, DialTrait>;

  @ControllerView<DialController, GraphicsView>({
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
  readonly label!: ControllerView<this, GraphicsView>;

  @ControllerView<DialController, GraphicsView>({
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
  readonly legend!: ControllerView<this, GraphicsView>;
}
