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
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import {
  Component,
  ComponentProperty,
  ComponentView,
  ComponentViewTrait,
  ComponentFastener,
  CompositeComponent,
} from "@swim/component";
import type {DialView} from "../dial/DialView";
import type {DialTrait} from "../dial/DialTrait";
import {DialComponent} from "../dial/DialComponent";
import {GaugeView} from "./GaugeView";
import {GaugeTitle, GaugeTrait} from "./GaugeTrait";
import type {GaugeComponentObserver} from "./GaugeComponentObserver";

export class GaugeComponent extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "dialFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<GaugeComponentObserver>;

  protected initGaugeTrait(gaugeTrait: GaugeTrait): void {
    // hook
  }

  protected attachGaugeTrait(gaugeTrait: GaugeTrait): void {
    const gaugeView = this.gauge.view;
    if (gaugeView !== null) {
      this.setTitleView(gaugeTrait.title.state, gaugeTrait);
    }

    const dialFasteners = gaugeTrait.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        this.insertDialTrait(dialTrait);
      }
    }
  }

  protected detachGaugeTrait(gaugeTrait: GaugeTrait): void {
    const dialFasteners = gaugeTrait.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialTrait = dialFasteners[i]!.trait;
      if (dialTrait !== null) {
        this.removeDialTrait(dialTrait);
      }
    }
 
    const gaugeView = this.gauge.view;
    if (gaugeView !== null) {
      this.setTitleView(null, gaugeTrait);
    }
 }

  protected willSetGaugeTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGaugeTrait !== void 0) {
        componentObserver.componentWillSetGaugeTrait(newGaugeTrait, oldGaugeTrait, this);
      }
    }
  }

  protected onSetGaugeTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
    if (oldGaugeTrait !== null) {
      this.detachGaugeTrait(oldGaugeTrait);
    }
    if (newGaugeTrait !== null) {
      this.attachGaugeTrait(newGaugeTrait);
      this.initGaugeTrait(newGaugeTrait);
    }
  }

  protected didSetGaugeTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGaugeTrait !== void 0) {
        componentObserver.componentDidSetGaugeTrait(newGaugeTrait, oldGaugeTrait, this);
      }
    }
  }

  protected createGaugeView(): GaugeView | null {
    return GaugeView.create();
  }

  protected initGaugeView(gaugeView: GaugeView): void {
    // hook
  }

  protected attachGaugeView(gaugeView: GaugeView): void {
    this.title.setView(gaugeView.title.view);

    const gaugeTrait = this.gauge.trait;
    if (gaugeTrait !== null) {
      this.setTitleView(gaugeTrait.title.state, gaugeTrait);
    }

    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialComponent = dialFasteners[i]!.component;
      if (dialComponent !== null) {
        const dialView = dialComponent.dial.view;
        if (dialView !== null && dialView.parentView === null) {
          dialComponent.dial.injectView(gaugeView);
        }
      }
    }
  }

  protected detachGaugeView(gaugeView: GaugeView): void {
    this.title.setView(null);
  }

  protected willSetGaugeView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGaugeView !== void 0) {
        componentObserver.componentWillSetGaugeView(newGaugeView, oldGaugeView, this);
      }
    }
  }

  protected onSetGaugeView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
    if (oldGaugeView !== null) {
      this.detachGaugeView(oldGaugeView);
    }
    if (newGaugeView !== null) {
      this.attachGaugeView(newGaugeView);
      this.initGaugeView(newGaugeView);
    }
  }

  protected didSetGaugeView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetGaugeView !== void 0) {
        componentObserver.componentDidSetGaugeView(newGaugeView, oldGaugeView, this);
      }
    }
  }

  protected themeGaugeView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, gaugeView: GaugeView): void {
    // hook
  }

  protected createTitleView(title: GaugeTitle, gaugeTrait: GaugeTrait): GraphicsView | string | null {
    if (typeof title === "function") {
      return title(gaugeTrait);
    } else {
      return title;
    }
  }

  protected setTitleView(title: GaugeTitle | null, gaugeTrait: GaugeTrait): void {
    const gaugeView = this.gauge.view;
    if (gaugeView !== null) {
      const titleView = title !== null ? this.createTitleView(title, gaugeTrait) : null;
      gaugeView.title.setView(titleView);
    }
  }

  protected initTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected attachTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected detachTitleView(titleView: GraphicsView): void {
    // hook
  }

  protected willSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGaugeTitleView !== void 0) {
        componentObserver.componentWillSetGaugeTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  protected onSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    if (oldTitleView !== null) {
      this.detachTitleView(oldTitleView);
    }
    if (newTitleView !== null) {
      this.attachTitleView(newTitleView);
      this.initTitleView(newTitleView);
    }
  }

  protected didSetTitleView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetGaugeTitleView !== void 0) {
        componentObserver.componentWillSetGaugeTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  /** @hidden */
  static GaugeFastener = ComponentViewTrait.define<GaugeComponent, GaugeView, GaugeTrait>({
    viewType: GaugeView,
    observeView: true,
    willSetView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
      this.owner.willSetGaugeView(newGaugeView, oldGaugeView);
    },
    onSetView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
      this.owner.onSetGaugeView(newGaugeView, oldGaugeView);
    },
    didSetView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
      this.owner.didSetGaugeView(newGaugeView, oldGaugeView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, gaugeView: GaugeView): void {
      this.owner.themeGaugeView(theme, mood, timing, gaugeView);
    },
    viewDidSetGaugeTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.title.setView(newTitleView);
    },
    createView(): GaugeView | null {
      return this.owner.createGaugeView();
    },
    traitType: GaugeTrait,
    observeTrait: true,
    willSetTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
      this.owner.willSetGaugeTrait(newGaugeTrait, oldGaugeTrait);
    },
    onSetTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
      this.owner.onSetGaugeTrait(newGaugeTrait, oldGaugeTrait);
    },
    didSetTrait(newGaugeTrait: GaugeTrait | null, oldGaugeTrait: GaugeTrait | null): void {
      this.owner.didSetGaugeTrait(newGaugeTrait, oldGaugeTrait);
    },
    traitDidSetGaugeTitle(newTitle: GaugeTitle | null, oldTitle: GaugeTitle | null, gaugeTrait: GaugeTrait): void {
      this.owner.setTitleView(newTitle, gaugeTrait);
    },
    traitWillSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, targetTrait: Trait): void {
      if (oldDialTrait !== null) {
        this.owner.removeDialTrait(oldDialTrait);
      }
    },
    traitDidSetDial(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null, targetTrait: Trait): void {
      if (newDialTrait !== null) {
        this.owner.insertDialTrait(newDialTrait, targetTrait);
      }
    },
  });

  @ComponentViewTrait<GaugeComponent, GaugeView, GaugeTrait>({
    extends: GaugeComponent.GaugeFastener,
  })
  readonly gauge!: ComponentViewTrait<this, GaugeView, GaugeTrait>;

  @ComponentView<GaugeComponent, GraphicsView>({
    key: true,
    willSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.willSetTitleView(newTitleView, oldTitleView);
    },
    onSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.onSetTitleView(newTitleView, oldTitleView);
    },
    didSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.didSetTitleView(newTitleView, oldTitleView);
    },
  })
  readonly title!: ComponentView<this, GraphicsView>;

  insertDial(dialComponent: DialComponent, targetComponent: Component | null = null): void {
    const dialFasteners = this.dialFasteners as ComponentFastener<this, DialComponent>[];
    let targetIndex = dialFasteners.length;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.component === dialComponent) {
        return;
      } else if (dialFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const dialFastener = this.createDialFastener(dialComponent);
    dialFasteners.splice(targetIndex, 0, dialFastener);
    dialFastener.setComponent(dialComponent, targetComponent);
    if (this.isMounted()) {
      dialFastener.mount();
    }
  }

  removeDial(dialComponent: DialComponent): void {
    const dialFasteners = this.dialFasteners as ComponentFastener<this, DialComponent>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.component === dialComponent) {
        dialFastener.setComponent(null);
        if (this.isMounted()) {
          dialFastener.unmount();
        }
        dialFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createDial(dialTrait: DialTrait): DialComponent | null {
    return new DialComponent();
  }

  protected initDial(dialComponent: DialComponent, dialFastener: ComponentFastener<this, DialComponent>): void {
    const dialTrait = dialComponent.dial.trait;
    if (dialTrait !== null) {
      this.initDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialComponent.dial.view;
    if (dialView !== null) {
      this.initDialView(dialView, dialFastener);
    }
  }

  protected attachDial(dialComponent: DialComponent, dialFastener: ComponentFastener<this, DialComponent>): void {
    const dialTrait = dialComponent.dial.trait;
    if (dialTrait !== null) {
      this.attachDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialComponent.dial.view;
    if (dialView !== null) {
      this.attachDialView(dialView, dialFastener);
    }
  }

  protected detachDial(dialComponent: DialComponent, dialFastener: ComponentFastener<this, DialComponent>): void {
    const dialTrait = dialComponent.dial.trait;
    if (dialTrait !== null) {
      this.detachDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialComponent.dial.view;
    if (dialView !== null) {
      this.detachDialView(dialView, dialFastener);
    }
  }

  protected willSetDial(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null,
                        dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDial !== void 0) {
        componentObserver.componentWillSetDial(newDialComponent, oldDialComponent, dialFastener);
      }
    }
  }

  protected onSetDial(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null,
                      dialFastener: ComponentFastener<this, DialComponent>): void {
    if (oldDialComponent !== null) {
      this.detachDial(oldDialComponent, dialFastener);
    }
    if (newDialComponent !== null) {
      this.attachDial(newDialComponent, dialFastener);
      this.initDial(newDialComponent, dialFastener);
    }
  }

  protected didSetDial(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null,
                        dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDial !== void 0) {
        componentObserver.componentDidSetDial(newDialComponent, oldDialComponent, dialFastener);
      }
    }
  }

  insertDialTrait(dialTrait: DialTrait, targetTrait: Trait | null = null): void {
    const dialFasteners = this.dialFasteners as ComponentFastener<this, DialComponent>[];
    let targetComponent: DialComponent | null = null;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialComponent = dialFasteners[i]!.component;
      if (dialComponent !== null) {
        if (dialComponent.dial.trait === dialTrait) {
          return;
        } else if (dialComponent.dial.trait === targetTrait) {
          targetComponent = dialComponent;
        }
      }
    }
    const dialComponent = this.createDial(dialTrait);
    if (dialComponent !== null) {
      dialComponent.dial.setTrait(dialTrait);
      this.insertChildComponent(dialComponent, targetComponent);
      if (dialComponent.dial.view === null) {
        const dialView = this.createDialView(dialComponent);
        let targetView: DialView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.dial.view;
        }
        const gaugeView = this.gauge.view;
        if (gaugeView !== null) {
          dialComponent.dial.injectView(gaugeView, dialView, targetView, null);
        } else {
          dialComponent.dial.setView(dialView, targetView);
        }
      }
    }
  }

  removeDialTrait(dialTrait: DialTrait): void {
    const dialFasteners = this.dialFasteners as ComponentFastener<this, DialComponent>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      const dialComponent = dialFastener.component;
      if (dialComponent !== null && dialComponent.dial.trait === dialTrait) {
        dialFastener.setComponent(null);
        if (this.isMounted()) {
          dialFastener.unmount();
        }
        dialFasteners.splice(i, 1);
        dialComponent.remove();
        return;
      }
    }
  }

  protected initDialTrait(dialTrait: DialTrait, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected attachDialTrait(dialTrait: DialTrait, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected detachDialTrait(dialTrait: DialTrait, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected willSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                             dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialTrait !== void 0) {
        componentObserver.componentWillSetDialTrait(newDialTrait, oldDialTrait, dialFastener);
      }
    }
  }

  protected onSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                           dialFastener: ComponentFastener<this, DialComponent>): void {
    if (oldDialTrait !== null) {
      this.detachDialTrait(oldDialTrait, dialFastener);
    }
    if (newDialTrait !== null) {
      this.attachDialTrait(newDialTrait, dialFastener);
      this.initDialTrait(newDialTrait, dialFastener);
    }
  }

  protected didSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                            dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialTrait !== void 0) {
        componentObserver.componentDidSetDialTrait(newDialTrait, oldDialTrait, dialFastener);
      }
    }
  }

  protected createDialView(dialComponent: DialComponent): DialView | null {
    return dialComponent.dial.createView();
  }

  protected initDialView(dialView: DialView, dialFastener: ComponentFastener<this, DialComponent>): void {
    const labelView = dialView.label.view;
    if (labelView !== null) {
      this.initDialLabelView(labelView, dialFastener);
    }
    const legendView = dialView.legend.view;
    if (legendView !== null) {
      this.initDialLegendView(legendView, dialFastener);
    }
  }

  protected attachDialView(dialView: DialView, dialFastener: ComponentFastener<this, DialComponent>): void {
    const labelView = dialView.label.view;
    if (labelView !== null) {
      this.attachDialLabelView(labelView, dialFastener);
    }
    const legendView = dialView.legend.view;
    if (legendView !== null) {
      this.attachDialLegendView(legendView, dialFastener);
    }
  }

  protected detachDialView(dialView: DialView, dialFastener: ComponentFastener<this, DialComponent>): void {
    const labelView = dialView.label.view;
    if (labelView !== null) {
      this.detachDialLabelView(labelView, dialFastener);
    }
    const legendView = dialView.legend.view;
    if (legendView !== null) {
      this.detachDialLegendView(legendView, dialFastener);
    }
    dialView.remove();
  }

  protected willSetDialView(newDialView: DialView | null, oldDialView: DialView | null,
                            dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialView !== void 0) {
        componentObserver.componentWillSetDialView(newDialView, oldDialView, dialFastener);
      }
    }
  }

  protected onSetDialView(newDialView: DialView | null, oldDialView: DialView | null,
                          dialFastener: ComponentFastener<this, DialComponent>): void {
    if (oldDialView !== null) {
      this.detachDialView(oldDialView, dialFastener);
    }
    if (newDialView !== null) {
      this.attachDialView(newDialView, dialFastener);
      this.initDialView(newDialView, dialFastener);
    }
  }

  protected didSetDialView(newDialView: DialView | null, oldDialView: DialView | null,
                           dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialView !== void 0) {
        componentObserver.componentDidSetDialView(newDialView, oldDialView, dialFastener);
      }
    }
  }

  protected willSetDialValue(newValue: number, oldValue: number,
                             dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialValue !== void 0) {
        componentObserver.componentWillSetDialValue(newValue, oldValue, dialFastener);
      }
    }
  }

  protected onSetDialValue(newValue: number, oldValue: number,
                           dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected didSetDialValue(newValue: number, oldValue: number,
                            dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialValue !== void 0) {
        componentObserver.componentDidSetDialValue(newValue, oldValue, dialFastener);
      }
    }
  }

  protected willSetDialLimit(newLimit: number, oldLimit: number,
                             dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialLimit !== void 0) {
        componentObserver.componentWillSetDialLimit(newLimit, oldLimit, dialFastener);
      }
    }
  }

  protected onSetDialLimit(newLimit: number, oldLimit: number,
                           dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected didSetDialLimit(newLimit: number, oldLimit: number,
                            dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialLimit !== void 0) {
        componentObserver.componentDidSetDialLimit(newLimit, oldLimit, dialFastener);
      }
    }
  }

  protected initDialLabelView(labelView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected attachDialLabelView(labelView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected detachDialLabelView(labelView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected willSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                 dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialLabelView !== void 0) {
        componentObserver.componentWillSetDialLabelView(newLabelView, oldLabelView, dialFastener);
      }
    }
  }

  protected onSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                               dialFastener: ComponentFastener<this, DialComponent>): void {
    if (oldLabelView !== null) {
      this.detachDialLabelView(oldLabelView, dialFastener);
    }
    if (newLabelView !== null) {
      this.attachDialLabelView(newLabelView, dialFastener);
      this.initDialLabelView(newLabelView, dialFastener);
    }
  }

  protected didSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialLabelView !== void 0) {
        componentObserver.componentDidSetDialLabelView(newLabelView, oldLabelView, dialFastener);
      }
    }
  }

  protected initDialLegendView(legendView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected attachDialLegendView(legendView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected detachDialLegendView(legendView: GraphicsView, dialFastener: ComponentFastener<this, DialComponent>): void {
    // hook
  }

  protected willSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                  dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetDialLegendView !== void 0) {
        componentObserver.componentWillSetDialLegendView(newLegendView, oldLegendView, dialFastener);
      }
    }
  }

  protected onSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                dialFastener: ComponentFastener<this, DialComponent>): void {
    if (oldLegendView !== null) {
      this.detachDialLegendView(oldLegendView, dialFastener);
    }
    if (newLegendView !== null) {
      this.attachDialLegendView(newLegendView, dialFastener);
      this.initDialLegendView(newLegendView, dialFastener);
    }
  }

  protected didSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                 dialFastener: ComponentFastener<this, DialComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetDialLegendView !== void 0) {
        componentObserver.componentDidSetDialLegendView(newLegendView, oldLegendView, dialFastener);
      }
    }
  }

  @ComponentProperty({type: Timing, state: true})
  readonly dialTiming!: ComponentProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DialFastener = ComponentFastener.define<GaugeComponent, DialComponent>({
    type: DialComponent,
    child: false,
    observe: true,
    willSetComponent(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null): void {
      this.owner.willSetDial(newDialComponent, oldDialComponent, this);
    },
    onSetComponent(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null): void {
      this.owner.onSetDial(newDialComponent, oldDialComponent, this);
    },
    didSetComponent(newDialComponent: DialComponent | null, oldDialComponent: DialComponent | null): void {
      this.owner.didSetDial(newDialComponent, oldDialComponent, this);
    },
    componentWillSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.willSetDialTrait(newDialTrait, oldDialTrait, this);
    },
    componentDidSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.onSetDialTrait(newDialTrait, oldDialTrait, this);
      this.owner.didSetDialTrait(newDialTrait, oldDialTrait, this);
    },
    componentWillSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.willSetDialView(newDialView, oldDialView, this);
    },
    componentDidSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.onSetDialView(newDialView, oldDialView, this);
      this.owner.didSetDialView(newDialView, oldDialView, this);
    },
    componentWillSetDialValue(newValue: number, oldValue: number): void {
      this.owner.willSetDialValue(newValue, oldValue, this);
    },
    componentDidSetDialValue(newValue: number, oldValue: number): void {
      this.owner.onSetDialValue(newValue, oldValue, this);
      this.owner.didSetDialValue(newValue, oldValue, this);
    },
    componentWillSetDialLimit(newLimit: number, oldLimit: number): void {
      this.owner.willSetDialLimit(newLimit, oldLimit, this);
    },
    componentDidSetDialLimit(newLimit: number, oldLimit: number): void {
      this.owner.onSetDialLimit(newLimit, oldLimit, this);
      this.owner.didSetDialLimit(newLimit, oldLimit, this);
    },
    componentWillSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetDialLabelView(newLabelView, oldLabelView, this);
    },
    componentDidSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetDialLabelView(newLabelView, oldLabelView, this);
      this.owner.didSetDialLabelView(newLabelView, oldLabelView, this);
    },
    componentWillSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetDialLegendView(newLegendView, oldLegendView, this);
    },
    componentDidSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetDialLegendView(newLegendView, oldLegendView, this);
      this.owner.didSetDialLegendView(newLegendView, oldLegendView, this);
    },
  });

  protected createDialFastener(dialComponent: DialComponent): ComponentFastener<this, DialComponent> {
    return new GaugeComponent.DialFastener(this, dialComponent.key, "dial");
  }

  /** @hidden */
  readonly dialFasteners!: ReadonlyArray<ComponentFastener<this, DialComponent>>;

  protected getDialastener(dialTrait: DialTrait): ComponentFastener<this, DialComponent> | null {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      const dialComponent = dialFastener.component;
      if (dialComponent !== null && dialComponent.dial.trait === dialTrait) {
        return dialFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.mount();
    }
  }

  /** @hidden */
  protected unmountDialFasteners(): void {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      dialFastener.unmount();
    }
  }

  protected detectDialComponent(component: Component): DialComponent | null {
    return component instanceof DialComponent ? component : null;
  }

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const dialComponent = this.detectDialComponent(childComponent);
    if (dialComponent !== null) {
      this.insertDial(dialComponent, targetComponent);
    }
  }

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const dialComponent = this.detectDialComponent(childComponent);
    if (dialComponent !== null) {
      this.removeDial(dialComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountDialFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountDialFasteners();
    super.unmountComponentFasteners();
  }
}
