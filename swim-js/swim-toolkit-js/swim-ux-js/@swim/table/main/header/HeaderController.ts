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

import type {TraitConstructor, TraitClass, Trait} from "@swim/model";
import type {ViewClass, View} from "@swim/view";
import type {NodeViewConstructor, HtmlView} from "@swim/dom";
import {
  Controller,
  ControllerViewTrait,
  ControllerFastener,
  CompositeController,
} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import {ColController} from "../col/ColController";
import {HeaderView} from "./HeaderView";
import {HeaderTrait} from "./HeaderTrait";
import type {HeaderControllerObserver} from "./HeaderControllerObserver";

export class HeaderController extends CompositeController {
  constructor() {
    super();
    Object.defineProperty(this, "colFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly controllerObservers!: ReadonlyArray<HeaderControllerObserver>;

  protected initHeaderTrait(headerTrait: HeaderTrait): void {
    // hook
  }

  protected attachHeaderTrait(headerTrait: HeaderTrait): void {
    const colFasteners = headerTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.insertColTrait(colTrait);
      }
    }
  }

  protected detachHeaderTrait(headerTrait: HeaderTrait): void {
    const colFasteners = headerTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.removeColTrait(colTrait);
      }
    }
  }

  protected willSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetHeaderTrait !== void 0) {
        controllerObserver.controllerWillSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
      }
    }
  }

  protected onSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    if (oldHeaderTrait !== null) {
      this.detachHeaderTrait(oldHeaderTrait);
    }
    if (newHeaderTrait !== null) {
      this.attachHeaderTrait(newHeaderTrait);
      this.initHeaderTrait(newHeaderTrait);
    }
  }

  protected didSetHeaderTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetHeaderTrait !== void 0) {
        controllerObserver.controllerDidSetHeaderTrait(newHeaderTrait, oldHeaderTrait, this);
      }
    }
  }

  protected createHeaderView(): HeaderView | null {
    return HeaderView.create();
  }

  protected initHeaderView(headerView: HeaderView): void {
    // hook
  }

  protected attachHeaderView(headerView: HeaderView): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colController = colFasteners[i]!.controller;
      if (colController !== null) {
        const colView = colController.col.view;
        if (colView !== null && colView.parentView === null) {
          const colTrait = colController.col.trait;
          if (colTrait !== null) {
            colController.col.injectView(headerView, void 0, void 0, colTrait.key);
          }
        }
      }
    }
  }

  protected detachHeaderView(headerView: HeaderView): void {
    // hook
  }

  protected willSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetHeaderView !== void 0) {
        controllerObserver.controllerWillSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  protected onSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    if (oldHeaderView !== null) {
      this.detachHeaderView(oldHeaderView);
    }
    if (newHeaderView !== null) {
      this.attachHeaderView(newHeaderView);
      this.initHeaderView(newHeaderView);
    }
  }

  protected didSetHeaderView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetHeaderView !== void 0) {
        controllerObserver.controllerDidSetHeaderView(newHeaderView, oldHeaderView, this);
      }
    }
  }

  /** @hidden */
  static HeaderFastener = ControllerViewTrait.define<HeaderController, HeaderView, HeaderTrait>({
    viewType: HeaderView,
    observeView: true,
    willSetView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
      this.owner.willSetHeaderView(newHeaderView, oldHeaderView);
    },
    onSetView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
      this.owner.onSetHeaderView(newHeaderView, oldHeaderView);
    },
    didSetView(newHeaderView: HeaderView | null, oldHeaderView: HeaderView | null): void {
      this.owner.didSetHeaderView(newHeaderView, oldHeaderView);
    },
    createView(): HeaderView | null {
      return this.owner.createHeaderView();
    },
    insertView(parentView: View, childView: HeaderView, targetView: View | null, key: string | undefined): void {
      parentView.prependChildView(childView, key);
    },
    traitType: HeaderTrait,
    observeTrait: true,
    willSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
      this.owner.willSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
    },
    onSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
      this.owner.onSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
    },
    didSetTrait(newHeaderTrait: HeaderTrait | null, oldHeaderTrait: HeaderTrait | null): void {
      this.owner.didSetHeaderTrait(newHeaderTrait, oldHeaderTrait);
    },
    traitWillSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait): void {
      if (oldColTrait !== null) {
        this.owner.removeColTrait(oldColTrait);
      }
    },
    traitDidSetCol(newColTrait: ColTrait | null, oldColTrait: ColTrait | null, targetTrait: Trait): void {
      if (newColTrait !== null) {
        this.owner.insertColTrait(newColTrait, targetTrait);
      }
    },
  });

  @ControllerViewTrait<HeaderController, HeaderView, HeaderTrait>({
    extends: HeaderController.HeaderFastener,
  })
  readonly header!: ControllerViewTrait<this, HeaderView, HeaderTrait>;

  insertCol(colController: ColController, targetController: Controller | null = null): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    let targetIndex = colFasteners.length;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.controller === colController) {
        return;
      } else if (colFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const colFastener = this.createColFastener(colController);
    colFasteners.splice(targetIndex, 0, colFastener);
    colFastener.setController(colController, targetController);
    if (this.isMounted()) {
      colFastener.mount();
    }
  }

  removeCol(colController: ColController): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.controller === colController) {
        colFastener.setController(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createCol(colTrait: ColTrait): ColController | null {
    return new ColController();
  }

  protected initCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.initColTrait(colTrait, colFastener);
    }
    const colView = colController.col.view;
    if (colView !== null) {
      this.initColView(colView, colFastener);
    }
  }

  protected attachCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.attachColTrait(colTrait, colFastener);
    }
    const colView = colController.col.view;
    if (colView !== null) {
      this.attachColView(colView, colFastener);
    }
  }

  protected detachCol(colController: ColController, colFastener: ControllerFastener<this, ColController>): void {
    const colView = colController.col.view;
    if (colView !== null) {
      this.detachColView(colView, colFastener);
    }
    const colTrait = colController.col.trait;
    if (colTrait !== null) {
      this.detachColTrait(colTrait, colFastener);
    }
  }

  protected willSetCol(newColController: ColController | null, oldColController: ColController | null,
                       colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCol !== void 0) {
        controllerObserver.controllerWillSetCol(newColController, oldColController, colFastener);
      }
    }
  }

  protected onSetCol(newColController: ColController | null, oldColController: ColController | null,
                     colFastener: ControllerFastener<this, ColController>): void {
    if (oldColController !== null) {
      this.detachCol(oldColController, colFastener);
    }
    if (newColController !== null) {
      this.attachCol(newColController, colFastener);
      this.initCol(newColController, colFastener);
    }
  }

  protected didSetCol(newColController: ColController | null, oldColController: ColController | null,
                      colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCol !== void 0) {
        controllerObserver.controllerDidSetCol(newColController, oldColController, colFastener);
      }
    }
  }

  getColTrait(key: string): ColTrait | null;
  getColTrait<R extends ColTrait>(key: string, colTraitClass: TraitClass<R>): R | null;
  getColTrait(key: string, colTraitClass?: TraitClass<ColTrait>): ColTrait | null {
    const headerTrait = this.header.trait;
    return headerTrait !== null ? headerTrait.getCol(key, colTraitClass!) : null;
  }

  getOrCreateColTrait(key: string): ColTrait;
  getOrCreateColTrait<R extends ColTrait>(key: string, colTraitConstructor: TraitConstructor<R>): R;
  getOrCreateColTrait(key: string, colTraitConstructor?: TraitConstructor<ColTrait>): ColTrait {
    const headerTrait = this.header.trait;
    if (headerTrait === null) {
      throw new Error("no header trait");
    }
    return headerTrait.getOrCreateCol(key, colTraitConstructor!);
  }

  setColTrait(key: string, colTrait: ColTrait): void {
    const headerTrait = this.header.trait;
    if (headerTrait === null) {
      throw new Error("no header trait");
    }
    headerTrait.setCol(key, colTrait);
  }

  insertColTrait(colTrait: ColTrait, targetTrait: Trait | null = null): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    let targetController: ColController | null = null;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colController = colFasteners[i]!.controller;
      if (colController !== null) {
        if (colController.col.trait === colTrait) {
          return;
        } else if (colController.col.trait === targetTrait) {
          targetController = colController;
        }
      }
    }
    const colController = this.createCol(colTrait);
    if (colController !== null) {
      colController.col.setTrait(colTrait);
      this.insertChildController(colController, targetController, colTrait.key);
      if (colController.col.view === null) {
        const colView = this.createColView(colController);
        let targetView: ColView | null = null;
        if (targetController !== null) {
          targetView = targetController.col.view;
        }
        const headerView = this.header.view;
        if (headerView !== null) {
          colController.col.injectView(headerView, colView, targetView, colTrait.key);
        } else {
          colController.col.setView(colView, targetView);
        }
      }
    }
  }

  removeColTrait(colTrait: ColTrait): void {
    const colFasteners = this.colFasteners as ControllerFastener<this, ColController>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colController = colFastener.controller;
      if (colController !== null && colController.col.trait === colTrait) {
        colFastener.setController(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        colController.remove();
        return;
      }
    }
  }

  protected initColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected detachColTrait(colTrait: ColTrait | null, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                            colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColTrait !== void 0) {
        controllerObserver.controllerWillSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected onSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                          colFastener: ControllerFastener<this, ColController>): void {
    if (oldColTrait !== null) {
      this.detachColTrait(oldColTrait, colFastener);
    }
    if (newColTrait !== null) {
      this.attachColTrait(oldColTrait, colFastener);
      this.initColTrait(newColTrait, colFastener);
    }
  }

  protected didSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColTrait !== void 0) {
        controllerObserver.controllerDidSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  getColView(key: string): ColView | null;
  getColView<V extends ColView>(key: string, colViewClass: ViewClass<V>): V | null;
  getColView(key: string, colViewClass?: ViewClass<ColView>): ColView | null {
    const headerView = this.header.view;
    return headerView !== null ? headerView.getCol(key, colViewClass!) : null;
  }

  getOrCreateColView(key: string): ColView;
  getOrCreateColView<V extends ColView>(key: string, colViewConstructor: NodeViewConstructor<V>): V;
  getOrCreateColView(key: string, colViewConstructor?: NodeViewConstructor<ColView>): ColView {
    let headerView = this.header.view;
    if (headerView === null) {
      headerView = this.header.createView();
      if (headerView === null) {
        throw new Error("no header view");
      }
      this.header.setView(headerView);
    }
    return headerView.getOrCreateCol(key, colViewConstructor!);
  }

  setColView(key: string, colView: ColView): void {
    let headerView = this.header.view;
    if (headerView === null) {
      headerView = this.header.createView();
      if (headerView === null) {
        throw new Error("no header view");
      }
      this.header.setView(headerView);
    }
    headerView.setCol(key, colView);
  }

  protected createColView(colController: ColController): ColView | null {
    return colController.col.createView();
  }

  protected initColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.initColLabelView(colLabelView, colFastener);
    }
  }

  protected attachColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.attachColLabelView(colLabelView, colFastener);
    }
  }

  protected detachColView(colView: ColView, colFastener: ControllerFastener<this, ColController>): void {
    const colLabelView = colView.label.view;
    if (colLabelView !== null) {
      this.detachColLabelView(colLabelView, colFastener);
    }
    colView.remove();
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColView !== void 0) {
        controllerObserver.controllerWillSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected onSetColView(newColView: ColView | null, oldColView: ColView | null,
                         colFastener: ControllerFastener<this, ColController>): void {
    if (oldColView !== null) {
      this.detachColView(oldColView, colFastener);
    }
    if (newColView !== null) {
      this.attachColView(newColView, colFastener);
      this.initColView(newColView, colFastener);
    }
  }

  protected didSetColView(newColView: ColView | null, oldColView: ColView | null,
                          colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColView !== void 0) {
        controllerObserver.controllerDidSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected willSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                             colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColLayout !== void 0) {
        controllerObserver.controllerWillSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected didSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                            colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColLayout !== void 0) {
        controllerObserver.controllerDidSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected initColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected attachColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected detachColLabelView(colLabelView: HtmlView, colFastener: ControllerFastener<this, ColController>): void {
    // hook
  }

  protected willSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                                colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetColLabelView !== void 0) {
        controllerObserver.controllerWillSetColLabelView(newColLabelView, oldColLabelView, colFastener);
      }
    }
  }

  protected onSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                              colFastener: ControllerFastener<this, ColController>): void {
    if (oldColLabelView !== null) {
      this.detachColLabelView(oldColLabelView, colFastener);
    }
    if (newColLabelView !== null) {
      this.attachColLabelView(newColLabelView, colFastener);
      this.initColLabelView(newColLabelView, colFastener);
    }
  }

  protected didSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null,
                               colFastener: ControllerFastener<this, ColController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetColLabelView !== void 0) {
        controllerObserver.controllerDidSetColLabelView(newColLabelView, oldColLabelView, colFastener);
      }
    }
  }

  /** @hidden */
  static ColFastener = ControllerFastener.define<HeaderController, ColController>({
    type: ColController,
    child: false,
    observe: true,
    willSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.willSetCol(newColController, oldColController, this);
    },
    onSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.onSetCol(newColController, oldColController, this);
    },
    didSetController(newColController: ColController | null, oldColController: ColController | null): void {
      this.owner.didSetCol(newColController, oldColController, this);
    },
    controllerWillSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.willSetColTrait(newColTrait, oldColTrait, this);
    },
    controllerDidSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.onSetColTrait(newColTrait, oldColTrait, this);
      this.owner.didSetColTrait(newColTrait, oldColTrait, this);
    },
    controllerWillSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.willSetColView(newColView, oldColView, this);
    },
    controllerDidSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.onSetColView(newColView, oldColView, this);
      this.owner.didSetColView(newColView, oldColView, this);
    },
    controllerWillSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.willSetColLayout(newColLayout, oldColLayout, this);
    },
    controllerDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
      this.owner.didSetColLayout(newColLayout, oldColLayout, this);
    },
    controllerWillSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null): void {
      this.owner.willSetColLabelView(newColLabelView, oldColLabelView, this);
    },
    controllerDidSetColLabelView(newColLabelView: HtmlView | null, oldColLabelView: HtmlView | null): void {
      this.owner.onSetColLabelView(newColLabelView, oldColLabelView, this);
      this.owner.didSetColLabelView(newColLabelView, oldColLabelView, this);
    },
  });

  protected createColFastener(colController: ColController): ControllerFastener<this, ColController> {
    return new HeaderController.ColFastener(this, colController.key, "col");
  }

  /** @hidden */
  readonly colFasteners!: ReadonlyArray<ControllerFastener<this, ColController>>;

  protected getColFastener(colTrait: ColTrait): ControllerFastener<this, ColController> | null {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colController = colFastener.controller;
      if (colController !== null && colController.col.trait === colTrait) {
        return colFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.mount();
    }
  }

  /** @hidden */
  protected unmountColFasteners(): void {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      colFastener.unmount();
    }
  }

  protected detectColController(controller: Controller): ColController | null {
    return controller instanceof ColController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const colController = this.detectColController(childController);
    if (colController !== null) {
      this.insertCol(colController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const colController = this.detectColController(childController);
    if (colController !== null) {
      this.removeCol(colController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountColFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountColFasteners();
    super.unmountControllerFasteners();
  }
}
