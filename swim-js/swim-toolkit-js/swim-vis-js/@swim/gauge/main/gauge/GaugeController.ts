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
import type {GraphicsView} from "@swim/graphics";
import {
  Controller,
  ControllerProperty,
  ControllerView,
  ControllerViewTrait,
  ControllerFastener,
  CompositeController,
} from "@swim/controller";
import type {DialView} from "../dial/DialView";
import type {DialTrait} from "../dial/DialTrait";
import {DialController} from "../dial/DialController";
import {GaugeView} from "./GaugeView";
import {GaugeTitle, GaugeTrait} from "./GaugeTrait";
import type {GaugeControllerObserver} from "./GaugeControllerObserver";

export class GaugeController extends CompositeController {
  constructor() {
    super();
    this.dialFasteners = [];
  }

  override readonly controllerObservers!: ReadonlyArray<GaugeControllerObserver>;

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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGaugeTrait !== void 0) {
        controllerObserver.controllerWillSetGaugeTrait(newGaugeTrait, oldGaugeTrait, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGaugeTrait !== void 0) {
        controllerObserver.controllerDidSetGaugeTrait(newGaugeTrait, oldGaugeTrait, this);
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
      const dialController = dialFasteners[i]!.controller;
      if (dialController !== null) {
        const dialView = dialController.dial.view;
        if (dialView !== null && dialView.parentView === null) {
          dialController.dial.injectView(gaugeView);
        }
      }
    }
  }

  protected detachGaugeView(gaugeView: GaugeView): void {
    this.title.setView(null);
  }

  protected willSetGaugeView(newGaugeView: GaugeView | null, oldGaugeView: GaugeView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGaugeView !== void 0) {
        controllerObserver.controllerWillSetGaugeView(newGaugeView, oldGaugeView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGaugeView !== void 0) {
        controllerObserver.controllerDidSetGaugeView(newGaugeView, oldGaugeView, this);
      }
    }
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetGaugeTitleView !== void 0) {
        controllerObserver.controllerWillSetGaugeTitleView(newTitleView, oldTitleView, this);
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
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetGaugeTitleView !== void 0) {
        controllerObserver.controllerDidSetGaugeTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  /** @hidden */
  static GaugeFastener = ControllerViewTrait.define<GaugeController, GaugeView, GaugeTrait>({
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

  @ControllerViewTrait<GaugeController, GaugeView, GaugeTrait>({
    extends: GaugeController.GaugeFastener,
  })
  readonly gauge!: ControllerViewTrait<this, GaugeView, GaugeTrait>;

  @ControllerView<GaugeController, GraphicsView>({
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
  readonly title!: ControllerView<this, GraphicsView>;

  insertDial(dialController: DialController, targetController: Controller | null = null): void {
    const dialFasteners = this.dialFasteners as ControllerFastener<this, DialController>[];
    let targetIndex = dialFasteners.length;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.controller === dialController) {
        return;
      } else if (dialFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const dialFastener = this.createDialFastener(dialController);
    dialFasteners.splice(targetIndex, 0, dialFastener);
    dialFastener.setController(dialController, targetController);
    if (this.isMounted()) {
      dialFastener.mount();
    }
  }

  removeDial(dialController: DialController): void {
    const dialFasteners = this.dialFasteners as ControllerFastener<this, DialController>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      if (dialFastener.controller === dialController) {
        dialFastener.setController(null);
        if (this.isMounted()) {
          dialFastener.unmount();
        }
        dialFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createDial(dialTrait: DialTrait): DialController | null {
    return new DialController();
  }

  protected initDial(dialController: DialController, dialFastener: ControllerFastener<this, DialController>): void {
    const dialTrait = dialController.dial.trait;
    if (dialTrait !== null) {
      this.initDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialController.dial.view;
    if (dialView !== null) {
      this.initDialView(dialView, dialFastener);
    }
  }

  protected attachDial(dialController: DialController, dialFastener: ControllerFastener<this, DialController>): void {
    const dialTrait = dialController.dial.trait;
    if (dialTrait !== null) {
      this.attachDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialController.dial.view;
    if (dialView !== null) {
      this.attachDialView(dialView, dialFastener);
    }
  }

  protected detachDial(dialController: DialController, dialFastener: ControllerFastener<this, DialController>): void {
    const dialTrait = dialController.dial.trait;
    if (dialTrait !== null) {
      this.detachDialTrait(dialTrait, dialFastener);
    }
    const dialView = dialController.dial.view;
    if (dialView !== null) {
      this.detachDialView(dialView, dialFastener);
    }
  }

  protected willSetDial(newDialController: DialController | null, oldDialController: DialController | null,
                        dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDial !== void 0) {
        controllerObserver.controllerWillSetDial(newDialController, oldDialController, dialFastener);
      }
    }
  }

  protected onSetDial(newDialController: DialController | null, oldDialController: DialController | null,
                      dialFastener: ControllerFastener<this, DialController>): void {
    if (oldDialController !== null) {
      this.detachDial(oldDialController, dialFastener);
    }
    if (newDialController !== null) {
      this.attachDial(newDialController, dialFastener);
      this.initDial(newDialController, dialFastener);
    }
  }

  protected didSetDial(newDialController: DialController | null, oldDialController: DialController | null,
                        dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDial !== void 0) {
        controllerObserver.controllerDidSetDial(newDialController, oldDialController, dialFastener);
      }
    }
  }

  insertDialTrait(dialTrait: DialTrait, targetTrait: Trait | null = null): void {
    const dialFasteners = this.dialFasteners as ControllerFastener<this, DialController>[];
    let targetController: DialController | null = null;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialController = dialFasteners[i]!.controller;
      if (dialController !== null) {
        if (dialController.dial.trait === dialTrait) {
          return;
        } else if (dialController.dial.trait === targetTrait) {
          targetController = dialController;
        }
      }
    }
    const dialController = this.createDial(dialTrait);
    if (dialController !== null) {
      dialController.dial.setTrait(dialTrait);
      this.insertChildController(dialController, targetController);
      if (dialController.dial.view === null) {
        const dialView = this.createDialView(dialController);
        let targetView: DialView | null = null;
        if (targetController !== null) {
          targetView = targetController.dial.view;
        }
        const gaugeView = this.gauge.view;
        if (gaugeView !== null) {
          dialController.dial.injectView(gaugeView, dialView, targetView, null);
        } else {
          dialController.dial.setView(dialView, targetView);
        }
      }
    }
  }

  removeDialTrait(dialTrait: DialTrait): void {
    const dialFasteners = this.dialFasteners as ControllerFastener<this, DialController>[];
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      const dialController = dialFastener.controller;
      if (dialController !== null && dialController.dial.trait === dialTrait) {
        dialFastener.setController(null);
        if (this.isMounted()) {
          dialFastener.unmount();
        }
        dialFasteners.splice(i, 1);
        dialController.remove();
        return;
      }
    }
  }

  protected initDialTrait(dialTrait: DialTrait, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected attachDialTrait(dialTrait: DialTrait, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected detachDialTrait(dialTrait: DialTrait, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected willSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                             dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialTrait !== void 0) {
        controllerObserver.controllerWillSetDialTrait(newDialTrait, oldDialTrait, dialFastener);
      }
    }
  }

  protected onSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                           dialFastener: ControllerFastener<this, DialController>): void {
    if (oldDialTrait !== null) {
      this.detachDialTrait(oldDialTrait, dialFastener);
    }
    if (newDialTrait !== null) {
      this.attachDialTrait(newDialTrait, dialFastener);
      this.initDialTrait(newDialTrait, dialFastener);
    }
  }

  protected didSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null,
                            dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialTrait !== void 0) {
        controllerObserver.controllerDidSetDialTrait(newDialTrait, oldDialTrait, dialFastener);
      }
    }
  }

  protected createDialView(dialController: DialController): DialView | null {
    return dialController.dial.createView();
  }

  protected initDialView(dialView: DialView, dialFastener: ControllerFastener<this, DialController>): void {
    const labelView = dialView.label.view;
    if (labelView !== null) {
      this.initDialLabelView(labelView, dialFastener);
    }
    const legendView = dialView.legend.view;
    if (legendView !== null) {
      this.initDialLegendView(legendView, dialFastener);
    }
  }

  protected attachDialView(dialView: DialView, dialFastener: ControllerFastener<this, DialController>): void {
    const labelView = dialView.label.view;
    if (labelView !== null) {
      this.attachDialLabelView(labelView, dialFastener);
    }
    const legendView = dialView.legend.view;
    if (legendView !== null) {
      this.attachDialLegendView(legendView, dialFastener);
    }
  }

  protected detachDialView(dialView: DialView, dialFastener: ControllerFastener<this, DialController>): void {
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
                            dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialView !== void 0) {
        controllerObserver.controllerWillSetDialView(newDialView, oldDialView, dialFastener);
      }
    }
  }

  protected onSetDialView(newDialView: DialView | null, oldDialView: DialView | null,
                          dialFastener: ControllerFastener<this, DialController>): void {
    if (oldDialView !== null) {
      this.detachDialView(oldDialView, dialFastener);
    }
    if (newDialView !== null) {
      this.attachDialView(newDialView, dialFastener);
      this.initDialView(newDialView, dialFastener);
    }
  }

  protected didSetDialView(newDialView: DialView | null, oldDialView: DialView | null,
                           dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialView !== void 0) {
        controllerObserver.controllerDidSetDialView(newDialView, oldDialView, dialFastener);
      }
    }
  }

  protected willSetDialValue(newValue: number, oldValue: number,
                             dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialValue !== void 0) {
        controllerObserver.controllerWillSetDialValue(newValue, oldValue, dialFastener);
      }
    }
  }

  protected onSetDialValue(newValue: number, oldValue: number,
                           dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected didSetDialValue(newValue: number, oldValue: number,
                            dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialValue !== void 0) {
        controllerObserver.controllerDidSetDialValue(newValue, oldValue, dialFastener);
      }
    }
  }

  protected willSetDialLimit(newLimit: number, oldLimit: number,
                             dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLimit !== void 0) {
        controllerObserver.controllerWillSetDialLimit(newLimit, oldLimit, dialFastener);
      }
    }
  }

  protected onSetDialLimit(newLimit: number, oldLimit: number,
                           dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected didSetDialLimit(newLimit: number, oldLimit: number,
                            dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLimit !== void 0) {
        controllerObserver.controllerDidSetDialLimit(newLimit, oldLimit, dialFastener);
      }
    }
  }

  protected initDialLabelView(labelView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected attachDialLabelView(labelView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected detachDialLabelView(labelView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected willSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                 dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLabelView !== void 0) {
        controllerObserver.controllerWillSetDialLabelView(newLabelView, oldLabelView, dialFastener);
      }
    }
  }

  protected onSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                               dialFastener: ControllerFastener<this, DialController>): void {
    if (oldLabelView !== null) {
      this.detachDialLabelView(oldLabelView, dialFastener);
    }
    if (newLabelView !== null) {
      this.attachDialLabelView(newLabelView, dialFastener);
      this.initDialLabelView(newLabelView, dialFastener);
    }
  }

  protected didSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLabelView !== void 0) {
        controllerObserver.controllerDidSetDialLabelView(newLabelView, oldLabelView, dialFastener);
      }
    }
  }

  protected initDialLegendView(legendView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected attachDialLegendView(legendView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected detachDialLegendView(legendView: GraphicsView, dialFastener: ControllerFastener<this, DialController>): void {
    // hook
  }

  protected willSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                  dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetDialLegendView !== void 0) {
        controllerObserver.controllerWillSetDialLegendView(newLegendView, oldLegendView, dialFastener);
      }
    }
  }

  protected onSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                dialFastener: ControllerFastener<this, DialController>): void {
    if (oldLegendView !== null) {
      this.detachDialLegendView(oldLegendView, dialFastener);
    }
    if (newLegendView !== null) {
      this.attachDialLegendView(newLegendView, dialFastener);
      this.initDialLegendView(newLegendView, dialFastener);
    }
  }

  protected didSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                 dialFastener: ControllerFastener<this, DialController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetDialLegendView !== void 0) {
        controllerObserver.controllerDidSetDialLegendView(newLegendView, oldLegendView, dialFastener);
      }
    }
  }

  @ControllerProperty({type: Timing, state: true})
  readonly dialTiming!: ControllerProperty<this, Timing | boolean | undefined, AnyTiming>;

  /** @hidden */
  static DialFastener = ControllerFastener.define<GaugeController, DialController>({
    type: DialController,
    child: false,
    observe: true,
    willSetController(newDialController: DialController | null, oldDialController: DialController | null): void {
      this.owner.willSetDial(newDialController, oldDialController, this);
    },
    onSetController(newDialController: DialController | null, oldDialController: DialController | null): void {
      this.owner.onSetDial(newDialController, oldDialController, this);
    },
    didSetController(newDialController: DialController | null, oldDialController: DialController | null): void {
      this.owner.didSetDial(newDialController, oldDialController, this);
    },
    controllerWillSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.willSetDialTrait(newDialTrait, oldDialTrait, this);
    },
    controllerDidSetDialTrait(newDialTrait: DialTrait | null, oldDialTrait: DialTrait | null): void {
      this.owner.onSetDialTrait(newDialTrait, oldDialTrait, this);
      this.owner.didSetDialTrait(newDialTrait, oldDialTrait, this);
    },
    controllerWillSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.willSetDialView(newDialView, oldDialView, this);
    },
    controllerDidSetDialView(newDialView: DialView | null, oldDialView: DialView | null): void {
      this.owner.onSetDialView(newDialView, oldDialView, this);
      this.owner.didSetDialView(newDialView, oldDialView, this);
    },
    controllerWillSetDialValue(newValue: number, oldValue: number): void {
      this.owner.willSetDialValue(newValue, oldValue, this);
    },
    controllerDidSetDialValue(newValue: number, oldValue: number): void {
      this.owner.onSetDialValue(newValue, oldValue, this);
      this.owner.didSetDialValue(newValue, oldValue, this);
    },
    controllerWillSetDialLimit(newLimit: number, oldLimit: number): void {
      this.owner.willSetDialLimit(newLimit, oldLimit, this);
    },
    controllerDidSetDialLimit(newLimit: number, oldLimit: number): void {
      this.owner.onSetDialLimit(newLimit, oldLimit, this);
      this.owner.didSetDialLimit(newLimit, oldLimit, this);
    },
    controllerWillSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetDialLabelView(newLabelView, oldLabelView, this);
    },
    controllerDidSetDialLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetDialLabelView(newLabelView, oldLabelView, this);
      this.owner.didSetDialLabelView(newLabelView, oldLabelView, this);
    },
    controllerWillSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetDialLegendView(newLegendView, oldLegendView, this);
    },
    controllerDidSetDialLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetDialLegendView(newLegendView, oldLegendView, this);
      this.owner.didSetDialLegendView(newLegendView, oldLegendView, this);
    },
  });

  protected createDialFastener(dialController: DialController): ControllerFastener<this, DialController> {
    return new GaugeController.DialFastener(this, dialController.key, "dial");
  }

  /** @hidden */
  readonly dialFasteners: ReadonlyArray<ControllerFastener<this, DialController>>;

  protected getDialastener(dialTrait: DialTrait): ControllerFastener<this, DialController> | null {
    const dialFasteners = this.dialFasteners;
    for (let i = 0, n = dialFasteners.length; i < n; i += 1) {
      const dialFastener = dialFasteners[i]!;
      const dialController = dialFastener.controller;
      if (dialController !== null && dialController.dial.trait === dialTrait) {
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

  protected detectDialController(controller: Controller): DialController | null {
    return controller instanceof DialController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const dialController = this.detectDialController(childController);
    if (dialController !== null) {
      this.insertDial(dialController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const dialController = this.detectDialController(childController);
    if (dialController !== null) {
      this.removeDial(dialController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountDialFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountDialFasteners();
    super.unmountControllerFasteners();
  }
}
