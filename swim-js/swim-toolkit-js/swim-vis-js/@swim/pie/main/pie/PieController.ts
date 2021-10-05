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
import {Property} from "@swim/fastener";
import type {Trait} from "@swim/model";
import {ViewFastener} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import {TraitViewFastener, ControllerFastener, Controller, GenericController} from "@swim/controller";
import type {SliceView} from "../slice/SliceView";
import type {SliceTrait} from "../slice/SliceTrait";
import {SliceController} from "../slice/SliceController";
import {PieView} from "./PieView";
import {PieTitle, PieTrait} from "./PieTrait";
import type {PieControllerObserver} from "./PieControllerObserver";

export class PieController extends GenericController {
  constructor() {
    super();
    this.sliceFasteners = [];
  }

  override readonly observerType?: Class<PieControllerObserver>;

  protected initPieTrait(pieTrait: PieTrait): void {
    // hook
  }

  protected attachPieTrait(pieTrait: PieTrait): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      this.setTitleView(pieTrait.title.state, pieTrait);
    }

    const sliceFasteners = pieTrait.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        this.insertSliceTrait(sliceTrait);
      }
    }
  }

  protected detachPieTrait(pieTrait: PieTrait): void {
    const sliceFasteners = pieTrait.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceTrait = sliceFasteners[i]!.trait;
      if (sliceTrait !== null) {
        this.removeSliceTrait(sliceTrait);
      }
    }

    const pieView = this.pie.view;
    if (pieView !== null) {
      this.setTitleView(null, pieTrait);
    }
  }

  protected willSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPieTrait !== void 0) {
        observer.controllerWillSetPieTrait(newPieTrait, oldPieTrait, this);
      }
    }
  }

  protected onSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    if (oldPieTrait !== null) {
      this.detachPieTrait(oldPieTrait);
    }
    if (newPieTrait !== null) {
      this.attachPieTrait(newPieTrait);
      this.initPieTrait(newPieTrait);
    }
  }

  protected didSetPieTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPieTrait !== void 0) {
        observer.controllerDidSetPieTrait(newPieTrait, oldPieTrait, this);
      }
    }
  }

  protected createPieView(): PieView | null {
    return PieView.create();
  }

  protected initPieView(pieView: PieView): void {
    // hook
  }

  protected attachPieView(pieView: PieView): void {
    this.title.setView(pieView.title.view);

    const pieTrait = this.pie.trait;
    if (pieTrait !== null) {
      this.setTitleView(pieTrait.title.state, pieTrait);
    }

    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceController = sliceFasteners[i]!.controller;
      if (sliceController !== null) {
        const sliceView = sliceController.slice.view;
        if (sliceView !== null && sliceView.parent === null) {
          sliceController.slice.injectView(pieView);
        }
      }
    }
  }

  protected detachPieView(pieView: PieView): void {
    this.title.setView(null);
  }

  protected willSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPieView !== void 0) {
        observer.controllerWillSetPieView(newPieView, oldPieView, this);
      }
    }
  }

  protected onSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    if (oldPieView !== null) {
      this.detachPieView(oldPieView);
    }
    if (newPieView !== null) {
      this.attachPieView(newPieView);
      this.initPieView(newPieView);
    }
  }

  protected didSetPieView(newPieView: PieView | null, oldPieView: PieView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPieView !== void 0) {
        observer.controllerDidSetPieView(newPieView, oldPieView, this);
      }
    }
  }

  protected createTitleView(title: PieTitle, pieTrait: PieTrait): GraphicsView | string | null {
    if (typeof title === "function") {
      return title(pieTrait);
    } else {
      return title;
    }
  }

  protected setTitleView(title: PieTitle | null, pieTrait: PieTrait): void {
    const pieView = this.pie.view;
    if (pieView !== null) {
      const titleView = title !== null ? this.createTitleView(title, pieTrait) : null;
      pieView.title.setView(titleView);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetPieTitleView !== void 0) {
        observer.controllerWillSetPieTitleView(newTitleView, oldTitleView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetPieTitleView !== void 0) {
        observer.controllerDidSetPieTitleView(newTitleView, oldTitleView, this);
      }
    }
  }

  /** @internal */
  static PieFastener = TraitViewFastener.define<PieController, PieTrait, PieView>({
    traitType: PieTrait,
    observesTrait: true,
    willSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.willSetPieTrait(newPieTrait, oldPieTrait);
    },
    onSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.onSetPieTrait(newPieTrait, oldPieTrait);
    },
    didSetTrait(newPieTrait: PieTrait | null, oldPieTrait: PieTrait | null): void {
      this.owner.didSetPieTrait(newPieTrait, oldPieTrait);
    },
    traitDidSetPieTitle(newTitle: PieTitle | null, oldTitle: PieTitle | null, pieTrait: PieTrait): void {
      this.owner.setTitleView(newTitle, pieTrait);
    },
    traitWillSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait): void {
      if (oldSliceTrait !== null) {
        this.owner.removeSliceTrait(oldSliceTrait);
      }
    },
    traitDidSetSlice(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null, targetTrait: Trait): void {
      if (newSliceTrait !== null) {
        this.owner.insertSliceTrait(newSliceTrait, targetTrait);
      }
    },
    viewType: PieView,
    observesView: true,
    willSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.willSetPieView(newPieView, oldPieView);
    },
    onSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.onSetPieView(newPieView, oldPieView);
    },
    didSetView(newPieView: PieView | null, oldPieView: PieView | null): void {
      this.owner.didSetPieView(newPieView, oldPieView);
    },
    viewDidSetPieTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.title.setView(newTitleView);
    },
    createView(): PieView | null {
      return this.owner.createPieView();
    },
  });

  @TraitViewFastener<PieController, PieTrait, PieView>({
    extends: PieController.PieFastener,
  })
  readonly pie!: TraitViewFastener<this, PieTrait, PieView>;

  @ViewFastener<PieController, GraphicsView>({
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
  readonly title!: ViewFastener<this, GraphicsView>;

  insertSlice(sliceController: SliceController, targetController: Controller | null = null): void {
    const sliceFasteners = this.sliceFasteners as ControllerFastener<this, SliceController>[];
    let targetIndex = sliceFasteners.length;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.controller === sliceController) {
        return;
      } else if (sliceFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const sliceFastener = this.createSliceFastener(sliceController);
    sliceFasteners.splice(targetIndex, 0, sliceFastener);
    sliceFastener.setController(sliceController, targetController);
    if (this.mounted) {
      sliceFastener.mount();
    }
  }

  removeSlice(sliceController: SliceController): void {
    const sliceFasteners = this.sliceFasteners as ControllerFastener<this, SliceController>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.controller === sliceController) {
        sliceFastener.setController(null);
        if (this.mounted) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createSlice(sliceTrait: SliceTrait): SliceController | null {
    return new SliceController();
  }

  protected initSlice(sliceController: SliceController, sliceFastener: ControllerFastener<this, SliceController>): void {
    const sliceTrait = sliceController.slice.trait;
    if (sliceTrait !== null) {
      this.initSliceTrait(sliceTrait, sliceFastener);
    }
    const sliceView = sliceController.slice.view;
    if (sliceView !== null) {
      this.initSliceView(sliceView, sliceFastener);
    }
  }

  protected attachSlice(sliceController: SliceController, sliceFastener: ControllerFastener<this, SliceController>): void {
    const sliceTrait = sliceController.slice.trait;
    if (sliceTrait !== null) {
      this.attachSliceTrait(sliceTrait, sliceFastener);
    }
    const sliceView = sliceController.slice.view;
    if (sliceView !== null) {
      this.attachSliceView(sliceView, sliceFastener);
    }
  }

  protected detachSlice(sliceController: SliceController, sliceFastener: ControllerFastener<this, SliceController>): void {
    const sliceView = sliceController.slice.view;
    if (sliceView !== null) {
      this.detachSliceView(sliceView, sliceFastener);
    }
    const sliceTrait = sliceController.slice.trait;
    if (sliceTrait !== null) {
      this.detachSliceTrait(sliceTrait, sliceFastener);
    }
  }

  protected willSetSlice(newSliceController: SliceController | null, oldSliceController: SliceController | null,
                         sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSlice !== void 0) {
        observer.controllerWillSetSlice(newSliceController, oldSliceController, sliceFastener);
      }
    }
  }

  protected onSetSlice(newSliceController: SliceController | null, oldSliceController: SliceController | null,
                       sliceFastener: ControllerFastener<this, SliceController>): void {
    if (oldSliceController !== null) {
      this.detachSlice(oldSliceController, sliceFastener);
    }
    if (newSliceController !== null) {
      this.attachSlice(newSliceController, sliceFastener);
      this.initSlice(newSliceController, sliceFastener);
    }
  }

  protected didSetSlice(newSliceController: SliceController | null, oldSliceController: SliceController | null,
                        sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSlice !== void 0) {
        observer.controllerDidSetSlice(newSliceController, oldSliceController, sliceFastener);
      }
    }
  }

  insertSliceTrait(sliceTrait: SliceTrait, targetTrait: Trait | null = null): void {
    const sliceFasteners = this.sliceFasteners as ControllerFastener<this, SliceController>[];
    let targetController: SliceController | null = null;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceController = sliceFasteners[i]!.controller;
      if (sliceController !== null) {
        if (sliceController.slice.trait === sliceTrait) {
          return;
        } else if (sliceController.slice.trait === targetTrait) {
          targetController = sliceController;
        }
      }
    }
    const sliceController = this.createSlice(sliceTrait);
    if (sliceController !== null) {
      sliceController.slice.setTrait(sliceTrait);
      this.insertChild(sliceController, targetController);
      if (sliceController.slice.view === null) {
        const sliceView = this.createSliceView(sliceController);
        let targetView: SliceView | null = null;
        if (targetController !== null) {
          targetView = targetController.slice.view;
        }
        const pieView = this.pie.view;
        if (pieView !== null) {
          sliceController.slice.injectView(pieView, sliceView, targetView, null);
        } else {
          sliceController.slice.setView(sliceView, targetView);
        }
      }
    }
  }

  removeSliceTrait(sliceTrait: SliceTrait): void {
    const sliceFasteners = this.sliceFasteners as ControllerFastener<this, SliceController>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      const sliceController = sliceFastener.controller;
      if (sliceController !== null && sliceController.slice.trait === sliceTrait) {
        sliceFastener.setController(null);
        if (this.mounted) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        sliceController.remove();
        return;
      }
    }
  }

  protected initSliceTrait(sliceTrait: SliceTrait, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected attachSliceTrait(sliceTrait: SliceTrait, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected detachSliceTrait(sliceTrait: SliceTrait, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected willSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                              sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceTrait !== void 0) {
        observer.controllerWillSetSliceTrait(newSliceTrait, oldSliceTrait, sliceFastener);
      }
    }
  }

  protected onSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                            sliceFastener: ControllerFastener<this, SliceController>): void {
    if (oldSliceTrait !== null) {
      this.detachSliceTrait(oldSliceTrait, sliceFastener);
    }
    if (newSliceTrait !== null) {
      this.attachSliceTrait(newSliceTrait, sliceFastener);
      this.initSliceTrait(newSliceTrait, sliceFastener);
    }
  }

  protected didSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null,
                             sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceTrait !== void 0) {
        observer.controllerDidSetSliceTrait(newSliceTrait, oldSliceTrait, sliceFastener);
      }
    }
  }

  protected createSliceView(sliceController: SliceController): SliceView | null {
    return sliceController.slice.createView();
  }

  protected initSliceView(sliceView: SliceView, sliceFastener: ControllerFastener<this, SliceController>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.initSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.initSliceLegendView(legendView, sliceFastener);
    }
  }

  protected attachSliceView(sliceView: SliceView, sliceFastener: ControllerFastener<this, SliceController>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.attachSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.attachSliceLegendView(legendView, sliceFastener);
    }
  }

  protected detachSliceView(sliceView: SliceView, sliceFastener: ControllerFastener<this, SliceController>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.detachSliceLabelView(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.detachSliceLegendView(legendView, sliceFastener);
    }
    sliceView.remove();
  }

  protected willSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                             sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceView !== void 0) {
        observer.controllerWillSetSliceView(newSliceView, oldSliceView, sliceFastener);
      }
    }
  }

  protected onSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                           sliceFastener: ControllerFastener<this, SliceController>): void {
    if (oldSliceView !== null) {
      this.detachSliceView(oldSliceView, sliceFastener);
    }
    if (newSliceView !== null) {
      this.attachSliceView(newSliceView, sliceFastener);
      this.initSliceView(newSliceView, sliceFastener);
    }
  }

  protected didSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                            sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceView !== void 0) {
        observer.controllerDidSetSliceView(newSliceView, oldSliceView, sliceFastener);
      }
    }
  }

  protected willSetSliceValue(newValue: number, oldValue: number,
                              sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceValue !== void 0) {
        observer.controllerWillSetSliceValue(newValue, oldValue, sliceFastener);
      }
    }
  }

  protected onSetSliceValue(newValue: number, oldValue: number,
                            sliceFastener: ControllerFastener<this, SliceController>): void {
    if (newValue === 0) {
      const sliceController = sliceFastener.controller;
      if (sliceController !== null) {
        const sliceTrait = sliceController.slice.trait;
        if (sliceTrait !== null) {
          this.removeSliceTrait(sliceTrait);
        }
      }
    }
  }

  protected didSetSliceValue(newValue: number, oldValue: number,
                             sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceValue !== void 0) {
        observer.controllerDidSetSliceValue(newValue, oldValue, sliceFastener);
      }
    }
  }

  protected initSliceLabelView(labelView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected attachSliceLabelView(labelView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected detachSliceLabelView(labelView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected willSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                  sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceLabelView !== void 0) {
        observer.controllerWillSetSliceLabelView(newLabelView, oldLabelView, sliceFastener);
      }
    }
  }

  protected onSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                sliceFastener: ControllerFastener<this, SliceController>): void {
    if (oldLabelView !== null) {
      this.detachSliceLabelView(oldLabelView, sliceFastener);
    }
    if (newLabelView !== null) {
      this.attachSliceLabelView(newLabelView, sliceFastener);
      this.initSliceLabelView(newLabelView, sliceFastener);
    }
  }

  protected didSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                                 sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceLabelView !== void 0) {
        observer.controllerDidSetSliceLabelView(newLabelView, oldLabelView, sliceFastener);
      }
    }
  }

  protected initSliceLegendView(legendView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected attachSliceLegendView(legendView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected detachSliceLegendView(legendView: GraphicsView, sliceFastener: ControllerFastener<this, SliceController>): void {
    // hook
  }

  protected willSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                   sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetSliceLegendView !== void 0) {
        observer.controllerWillSetSliceLegendView(newLegendView, oldLegendView, sliceFastener);
      }
    }
  }

  protected onSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                 sliceFastener: ControllerFastener<this, SliceController>): void {
    if (oldLegendView !== null) {
      this.detachSliceLegendView(oldLegendView, sliceFastener);
    }
    if (newLegendView !== null) {
      this.attachSliceLegendView(newLegendView, sliceFastener);
      this.initSliceLegendView(newLegendView, sliceFastener);
    }
  }

  protected didSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                                  sliceFastener: ControllerFastener<this, SliceController>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetSliceLegendView !== void 0) {
        observer.controllerDidSetSliceLegendView(newLegendView, oldLegendView, sliceFastener);
      }
    }
  }

  @Property({type: Timing, state: true})
  readonly sliceTiming!: Property<this, Timing | boolean | undefined, AnyTiming>;

  /** @internal */
  static SliceFastener = ControllerFastener.define<PieController, SliceController>({
    type: SliceController,
    child: false,
    observes: true,
    willSetController(newSliceController: SliceController | null, oldSliceController: SliceController | null): void {
      this.owner.willSetSlice(newSliceController, oldSliceController, this);
    },
    onSetController(newSliceController: SliceController | null, oldSliceController: SliceController | null): void {
      this.owner.onSetSlice(newSliceController, oldSliceController, this);
    },
    didSetController(newSliceController: SliceController | null, oldSliceController: SliceController | null): void {
      this.owner.didSetSlice(newSliceController, oldSliceController, this);
    },
    controllerWillSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.willSetSliceTrait(newSliceTrait, oldSliceTrait, this);
    },
    controllerDidSetSliceTrait(newSliceTrait: SliceTrait | null, oldSliceTrait: SliceTrait | null): void {
      this.owner.onSetSliceTrait(newSliceTrait, oldSliceTrait, this);
      this.owner.didSetSliceTrait(newSliceTrait, oldSliceTrait, this);
    },
    controllerWillSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.willSetSliceView(newSliceView, oldSliceView, this);
    },
    controllerDidSetSliceView(newSliceView: SliceView | null, oldSliceView: SliceView | null): void {
      this.owner.onSetSliceView(newSliceView, oldSliceView, this);
      this.owner.didSetSliceView(newSliceView, oldSliceView, this);
    },
    controllerWillSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.willSetSliceValue(newValue, oldValue, this);
    },
    controllerDidSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.onSetSliceValue(newValue, oldValue, this);
      this.owner.didSetSliceValue(newValue, oldValue, this);
    },
    controllerWillSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetSliceLabelView(newLabelView, oldLabelView, this);
    },
    controllerDidSetSliceLabelView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetSliceLabelView(newLabelView, oldLabelView, this);
      this.owner.didSetSliceLabelView(newLabelView, oldLabelView, this);
    },
    controllerWillSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetSliceLegendView(newLegendView, oldLegendView, this);
    },
    controllerDidSetSliceLegendView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetSliceLegendView(newLegendView, oldLegendView, this);
      this.owner.didSetSliceLegendView(newLegendView, oldLegendView, this);
    },
  });

  protected createSliceFastener(sliceController: SliceController): ControllerFastener<this, SliceController> {
    return PieController.SliceFastener.create(this, sliceController.key ?? "slice");
  }

  /** @internal */
  readonly sliceFasteners: ReadonlyArray<ControllerFastener<this, SliceController>>;

  protected getSliceFastener(sliceTrait: SliceTrait): ControllerFastener<this, SliceController> | null {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      const sliceController = sliceFastener.controller;
      if (sliceController !== null && sliceController.slice.trait === sliceTrait) {
        return sliceFastener;
      }
    }
    return null;
  }

  /** @internal */
  protected mountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.mount();
    }
  }

  /** @internal */
  protected unmountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.unmount();
    }
  }

  protected detectSliceController(controller: Controller): SliceController | null {
    return controller instanceof SliceController ? controller : null;
  }

  protected override onInsertChild(childController: Controller, targetController: Controller | null): void {
    super.onInsertChild(childController, targetController);
    const sliceController = this.detectSliceController(childController);
    if (sliceController !== null) {
      this.insertSlice(sliceController, targetController);
    }
  }

  protected override onRemoveChild(childController: Controller): void {
    super.onRemoveChild(childController);
    const sliceController = this.detectSliceController(childController);
    if (sliceController !== null) {
      this.removeSlice(sliceController);
    }
  }

  /** @internal */
  protected override mountFasteners(): void {
    super.mountFasteners();
    this.mountSliceFasteners();
  }

  /** @internal */
  protected override unmountFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountFasteners();
  }
}
