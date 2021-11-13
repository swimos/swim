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
import {DialView} from "./DialView";
import {DialLabel, DialLegend, DialTrait} from "./DialTrait";
import type {DialControllerObserver} from "./DialControllerObserver";

export class DialController extends GenericController {
  override readonly observerType?: Class<DialControllerObserver>;

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

  @Property({type: Timing, inherits: true})
  readonly dialTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @TraitViewRef<DialController, DialTrait, DialView>({
    traitType: DialTrait,
    observesTrait: true,
    willAttachTrait(dialTrait: DialTrait): void {
      this.owner.callObservers("controllerWillAttachDialTrait", dialTrait, this.owner);
    },
    didAttachTrait(dialTrait: DialTrait): void {
      const dialView = this.view;
      if (dialView !== null) {
        this.owner.setValue(dialTrait.value.state);
        this.owner.setLimit(dialTrait.limit.state);
        const dialColor = dialTrait.dialColor.state;
        if (dialColor !== null) {
          this.owner.setDialColor(dialColor);
        }
        const meterColor = dialTrait.meterColor.state;
        if (meterColor !== null) {
          this.owner.setMeterColor(meterColor);
        }
        this.owner.setLabelView(dialTrait.label.state);
        this.owner.setLegendView(dialTrait.legend.state);
      }
    },
    didDetachTrait(dialTrait: DialTrait): void {
      this.owner.callObservers("controllerDidDetachDialTrait", dialTrait, this.owner);
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
    willAttachView(dialView: DialView): void {
      this.owner.callObservers("controllerWillAttachDialView", dialView, this.owner);
    },
    didAttachView(dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const dialColor = dialTrait.dialColor.state;
        if (dialColor !== null) {
          this.owner.setDialColor(dialColor);
        }
        const meterColor = dialTrait.meterColor.state;
        if (meterColor !== null) {
          this.owner.setMeterColor(meterColor);
        }
      }
      this.owner.label.setView(dialView.label.view);
      this.owner.legend.setView(dialView.legend.view);
      if (dialTrait !== null) {
        const value = dialView.value.value;
        const limit = dialView.limit.value;
        this.owner.updateLabel(value, limit, dialTrait);
        this.owner.updateLegend(value, limit, dialTrait);
        this.owner.setValue(dialTrait.value.state);
        this.owner.setLimit(dialTrait.limit.state);
        this.owner.setLabelView(dialTrait.label.state);
        this.owner.setLegendView(dialTrait.legend.state);
      }
    },
    willDetachView(dialView: DialView): void {
      this.owner.label.setView(null);
      this.owner.legend.setView(null);
    },
    didDetachView(dialView: DialView): void {
      this.owner.callObservers("controllerDidDetachDialView", dialView, this.owner);
    },
    viewWillSetDialValue(newValue: number, oldValue: number, dialView: DialView): void {
      this.owner.callObservers("controllerWillSetDialValue", newValue, oldValue, this.owner);
    },
    viewDidSetDialValue(newValue: number, oldValue: number, dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const limit = dialView.limit.value;
        this.owner.updateLabel(newValue, limit, dialTrait);
        this.owner.updateLegend(newValue, limit, dialTrait);
      }
      this.owner.callObservers("controllerDidSetDialValue", newValue, oldValue, this.owner);
    },
    viewWillSetDialLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      this.owner.callObservers("controllerWillSetDialLimit", newLimit, oldLimit, this.owner);
    },
    viewDidSetDialLimit(newLimit: number, oldLimit: number, dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const value = dialView.value.value;
        this.owner.updateLabel(value, newLimit, dialTrait);
        this.owner.updateLegend(value, newLimit, dialTrait);
      }
      this.owner.callObservers("controllerDidSetDialLimit", newLimit, oldLimit, this.owner);
    },
    viewWillAttachDialLabel(labelView: GraphicsView): void {
      this.owner.label.setView(labelView);
    },
    viewDidDetachDialLabel(labelView: GraphicsView): void {
      this.owner.label.setView(null);
    },
    viewWillAttachDialLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(legendView);
    },
    viewDidDetachDialLegend(legendView: GraphicsView): void {
      this.owner.legend.setView(null);
    },
  })
  readonly dial!: TraitViewRef<this, DialTrait, DialView>;
  static readonly dial: MemberFastenerClass<DialController, "dial">;

  @ViewRef<DialController, GraphicsView>({
    key: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachDialLabelView", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachDialLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, GraphicsView>;
  static readonly label: MemberFastenerClass<DialController, "label">;

  @ViewRef<DialController, GraphicsView>({
    key: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachDialLegendView", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachDialLegendView", legendView, this.owner);
    },
  })
  readonly legend!: ViewRef<this, GraphicsView>;
  static readonly legend: MemberFastenerClass<DialController, "legend">;
}
