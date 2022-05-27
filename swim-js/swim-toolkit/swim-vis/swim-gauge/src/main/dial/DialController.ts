// Copyright 2015-2022 Swim.inc
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

import {Class, AnyTiming, Timing, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {Look, Mood, ColorOrLook} from "@swim/theme";
import {ViewRef} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {Controller, TraitViewRef} from "@swim/controller";
import {DialView} from "./DialView";
import {DialTrait} from "./DialTrait";
import type {DialControllerObserver} from "./DialControllerObserver";

/** @public */
export class DialController extends Controller {
  override readonly observerType?: Class<DialControllerObserver>;

  protected updateLabel(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.label.hasAffinity(Affinity.Intrinsic)) {
      const label = dialTrait.formatLabel(value, limit);
      if (label !== void 0) {
        dialTrait.label.setValue(label, Affinity.Intrinsic);
      }
    }
  }

  protected updateLegend(value: number, limit: number, dialTrait: DialTrait): void {
    if (dialTrait.legend.hasAffinity(Affinity.Intrinsic)) {
      const legend = dialTrait.formatLegend(value, limit);
      if (legend !== void 0) {
        dialTrait.legend.setValue(legend, Affinity.Intrinsic);
      }
    }
  }

  protected setValue(value: number, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null && dialView.value.hasAffinity(Affinity.Intrinsic)) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.value;
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
        timing = this.dialTiming.value;
        if (timing === true) {
          timing = dialView.getLook(Look.timing, Mood.ambient);
        }
      } else {
        timing = Timing.fromAny(timing);
      }
      dialView.limit.setState(limit, timing, Affinity.Intrinsic);
    }
  }

  protected setDialColor(dialColor: ColorOrLook | null, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.value;
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

  protected setMeterColor(meterColor: ColorOrLook | null, timing?: AnyTiming | boolean): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      if (timing === void 0 || timing === true) {
        timing = this.dialTiming.value;
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

  protected setLabelView(label: string | undefined): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      dialView.label.setText(label);
    }
  }

  protected setLegendView(legend: string | undefined): void {
    const dialView = this.dial.view;
    if (dialView !== null) {
      dialView.legend.setText(legend);
    }
  }

  @Property({valueType: Timing, inherits: true})
  readonly dialTiming!: Property<this, Timing | boolean | undefined, AnyTiming | boolean | undefined>;

  @TraitViewRef<DialController["dial"]>({
    traitType: DialTrait,
    observesTrait: true,
    willAttachTrait(dialTrait: DialTrait): void {
      this.owner.callObservers("controllerWillAttachDialTrait", dialTrait, this.owner);
    },
    didAttachTrait(dialTrait: DialTrait): void {
      const dialView = this.view;
      if (dialView !== null) {
        this.owner.setValue(dialTrait.value.value);
        this.owner.setLimit(dialTrait.limit.value);
        const dialColor = dialTrait.dialColor.value;
        if (dialColor !== null) {
          this.owner.setDialColor(dialColor);
        }
        const meterColor = dialTrait.meterColor.value;
        if (meterColor !== null) {
          this.owner.setMeterColor(meterColor);
        }
        this.owner.setLabelView(dialTrait.label.value);
        this.owner.setLegendView(dialTrait.legend.value);
      }
    },
    didDetachTrait(dialTrait: DialTrait): void {
      this.owner.callObservers("controllerDidDetachDialTrait", dialTrait, this.owner);
    },
    traitDidSetValue(value: number): void {
      this.owner.setValue(value);
    },
    traitDidSetLimit(limit: number): void {
      this.owner.setLimit(limit);
    },
    traitDidSetDialColor(dialColor: ColorOrLook | null): void {
      this.owner.setDialColor(dialColor);
    },
    traitDidSetMeterColor(meterColor: ColorOrLook | null): void {
      this.owner.setMeterColor(meterColor);
    },
    traitDidSetLabel(label: string | undefined): void {
      this.owner.setLabelView(label);
    },
    traitDidSetLegend(legend: string | undefined): void {
      this.owner.setLegendView(legend);
    },
    viewType: DialView,
    observesView: true,
    willAttachView(dialView: DialView): void {
      this.owner.callObservers("controllerWillAttachDialView", dialView, this.owner);
    },
    didAttachView(dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const dialColor = dialTrait.dialColor.value;
        if (dialColor !== null) {
          this.owner.setDialColor(dialColor);
        }
        const meterColor = dialTrait.meterColor.value;
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
        this.owner.setValue(dialTrait.value.value);
        this.owner.setLimit(dialTrait.limit.value);
        this.owner.setLabelView(dialTrait.label.value);
        this.owner.setLegendView(dialTrait.legend.value);
      }
    },
    willDetachView(dialView: DialView): void {
      this.owner.label.setView(null);
      this.owner.legend.setView(null);
    },
    didDetachView(dialView: DialView): void {
      this.owner.callObservers("controllerDidDetachDialView", dialView, this.owner);
    },
    viewDidSetValue(value: number, dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const limit = dialView.limit.value;
        this.owner.updateLabel(value, limit, dialTrait);
        this.owner.updateLegend(value, limit, dialTrait);
      }
      this.owner.callObservers("controllerDidSetDialValue", value, this.owner);
    },
    viewDidSetLimit(limit: number, dialView: DialView): void {
      const dialTrait = this.trait;
      if (dialTrait !== null) {
        const value = dialView.value.value;
        this.owner.updateLabel(value, limit, dialTrait);
        this.owner.updateLegend(value, limit, dialTrait);
      }
      this.owner.callObservers("controllerDidSetDialLimit", limit, this.owner);
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
  readonly dial!: TraitViewRef<this, DialTrait, DialView> & Observes<DialTrait & DialView>;
  static readonly dial: FastenerClass<DialController["dial"]>;

  @ViewRef<DialController["label"]>({
    viewKey: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachDialLabelView", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachDialLabelView", labelView, this.owner);
    },
  })
  readonly label!: ViewRef<this, GraphicsView>;
  static readonly label: FastenerClass<DialController["label"]>;

  @ViewRef<DialController["legend"]>({
    viewKey: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerWillAttachDialLegendView", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("controllerDidDetachDialLegendView", legendView, this.owner);
    },
  })
  readonly legend!: ViewRef<this, GraphicsView>;
  static readonly legend: FastenerClass<DialController["legend"]>;
}
