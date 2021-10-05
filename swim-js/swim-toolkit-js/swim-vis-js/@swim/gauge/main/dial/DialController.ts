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
import {DialView} from "./DialView";
import {DialLabel, DialLegend, DialTrait} from "./DialTrait";
import type {DialControllerObserver} from "./DialControllerObserver";

export class DialController extends GenericController {
  override readonly observerType?: Class<DialControllerObserver>;

  protected initDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected attachDialTrait(dialTrait: DialTrait): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      this.setValue(dialTrait.value.state);
      this.setLimit(dialTrait.limit.state);
      const dialColor = dialTrait.dialColor.state;
      if (dialColor !== null) {
        this.setDialColor(dialColor);
      }
      const meterColor = dialTrait.meterColor.state;
      if (meterColor !== null) {
        this.setMeterColor(meterColor);
      }
      this.setLabelView(dialTrait.label.state);
      this.setLegendView(dialTrait.legend.state);
    }
  }

  protected detachDialTrait(dialTrait: DialTrait): void {
    // hook
  }

  protected willSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialTrait !== void 0) {
        observer.controllerWillSetDialTrait(newDialTrait, oldDialTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDialTrait !== void 0) {
        observer.controllerDidSetDialTrait(newDialTrait, oldDialTrait, this);
      }
    }
  }

  protected updateLabel(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.label.hasAffinity(Affinity.Intrinsic)) {
      const label = dialTrait.formatLabel(value, limit);
      if (label !== void 0) {
        dialTrait.label.setState(label, Affinity.Intrinsic);
      }
    }
  }

  protected updateLegend(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.legend.hasAffinity(Affinity.Intrinsic)) {
      const legend = dialTrait.formatLegend(value, limit);
      if (legend !== void 0) {
        dialTrait.legend.setState(legend, Affinity.Intrinsic);
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
      this.setValue(dialTrait.value.state);
      this.setLimit(dialTrait.limit.state);
      this.setLabelView(dialTrait.label.state);
      this.setLegendView(dialTrait.legend.state);
    }
  }

  protected attachDialView(dialView: DialView): void {
    const dialTrait = this.dial.trait;
    if (dialTrait !== null) {
      const dialColor = dialTrait.dialColor.state;
      if (dialColor !== null) {
        this.setDialColor(dialColor);
      }
      const meterColor = dialTrait.meterColor.state;
      if (meterColor !== null) {
        this.setMeterColor(meterColor);
      }
    }
    this.label.setView(dialView.label.view);
    this.legend.setView(dialView.legend.view);
  }

  protected detachDialView(dialView: DialView): void {
    this.label.setView(null);
    this.legend.setView(null);
  }

  protected willSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialView !== void 0) {
        observer.controllerWillSetDialView(newDialView, oldDialView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDialView !== void 0) {
        observer.controllerDidSetDialView(newDialView, oldDialView, this);
      }
    }
  }

  protected setValue(value: number, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.value.hasAffinity(Affinity.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dialView.value.setState(value, timing, Affinity.Intrinsic);
    }
  }

  protected willSetValue(newValue: number, oldValue: number, dialView: DialView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialValue !== void 0) {
        observer.controllerWillSetDialValue(newValue, oldValue, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDialValue !== void 0) {
        observer.controllerDidSetDialValue(newValue, oldValue, this);
      }
    }
  }

  protected setLimit(limit: number, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.limit.hasAffinity(Affinity.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dialView.limit.setState(limit, timing, Affinity.Intrinsic);
    }
  }

  protected willSetLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialLimit !== void 0) {
        observer.controllerWillSetDialLimit(newLimit, oldLimit, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetDialLimit !== void 0) {
        observer.controllerDidSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected setDialColor(dialColor: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (dialColor instanceof Look) {
        dialView.dialColor.setLook(dialColor, timing, Affinity.Intrinsic);
      } else {
        dialView.dialColor.setState(dialColor, timing, Affinity.Intrinsic);
      }
    }
  }

  protected setMeterColor(meterColor: Look<Color> | Color | null, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.state;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      if (meterColor instanceof Look) {
        dialView.meterColor.setLook(meterColor, timing, Affinity.Intrinsic);
      } else {
        dialView.meterColor.setState(meterColor, timing, Affinity.Intrinsic);
      }
    }
  }

  protected createLabelView(label: DialLabel): GraphicsView | string | null {
    if (typeof label === "function") {
      return label(this.dial.trait);
    } else {
      return label;
    }
  }

  protected setLabelView(label: DialLabel | null): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const labelView = label !== null ? this.createLabelView(label) : null;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialLabelView !== void 0) {
        observer.controllerWillSetDialLabelView(newLabelView, oldLabelView, this);
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
      if (observer.controllerDidSetDialLabelView !== void 0) {
        observer.controllerDidSetDialLabelView(newLabelView, oldLabelView, this);
      }
    }
  }

  protected createLegendView(legend: DialLegend): GraphicsView | string | null {
    if (typeof legend === "function") {
      return legend(this.dial.trait);
    } else {
      return legend;
    }
  }

  protected setLegendView(legend: DialLegend | null): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      const legendView = legend !== null ? this.createLegendView(legend) : null;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetDialLegendView !== void 0) {
        observer.controllerWillSetDialLegendView(newLegendView, oldLegendView, this);
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
      if (observer.controllerDidSetDialLegendView !== void 0) {
        observer.controllerDidSetDialLegendView(newLegendView, oldLegendView, this);
      }
    }
  }

  @Property({type: Timing, inherits: true})
  readonly dialTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  /** @internal */
  static DialFastener = TraitViewFastener.define<DialController, DialTrait, DialView>({
    traitType: DialTrait,
    observesTrait: true,
    willSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.willSetDialTrait(newDialTrait, oldDialTrait);
    },
    onSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.onSetDialTrait(newDialTrait, oldDialTrait);
    },
    didSetTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.didSetDialTrait(newDialTrait, oldDialTrait);
    },
    traitDidSetDialValue(newValue: number, oldValue: number): void {
      this.owner.setValue(newValue);
    },
    traitDidSetDialLimit(newLimit: number, oldLimit: number): void {
      this.owner.setLimit(newLimit);
    },
    traitDidSetDialColor(newDialColor: Look<Color> | Color | null, oldDialColor: Look<Color> | Color | null): void {
      this.owner.setDialColor(newDialColor);
    },
    traitDidSetMeterColor(newMeterColor: Look<Color> | Color | null, oldMeterColor: Look<Color> | Color | null): void {
      this.owner.setMeterColor(newMeterColor);
    },
    traitDidSetDialLabel(newLabel: DialLabel | null, oldLabel: DialLabel | null): void {
      this.owner.setLabelView(newLabel);
    },
    traitDidSetDialLegend(newLegend: DialLegend | null, oldLegend: DialLegend | null): void {
      this.owner.setLegendView(newLegend);
    },
    viewType: DialView,
    observesView: true,
    willSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.willSetDialView(newDialView, oldDialView);
    },
    onSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.onSetDialView(newDialView, oldDialView);
    },
    didSetView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.didSetDialView(newDialView, oldDialView);
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
  });

  @TraitViewFastener<DialController, DialTrait, DialView>({
    extends: DialController.DialFastener,
  })
  readonly dial!: TraitViewFastener<this, DialTrait, DialView>;

  @ViewFastener<DialController, GraphicsView>({
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

  @ViewFastener<DialController, GraphicsView>({
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
