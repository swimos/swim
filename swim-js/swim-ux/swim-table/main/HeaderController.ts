// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Instance} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {Controller} from "@swim/controller";
import type {ControllerObserver} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import type {ColLayout} from "./ColLayout";
import type {ColView} from "./ColView";
import {TextColView} from "./TextColView";
import type {ColTrait} from "./ColTrait";
import {ColController} from "./ColController";
import type {TextColController} from "./TextColController";
import type {IconColController} from "./IconColController";
import {HeaderView} from "./HeaderView";
import {HeaderTrait} from "./HeaderTrait";

/** @public */
export interface HeaderControllerObserver<C extends HeaderController = HeaderController> extends ControllerObserver<C> {
  controllerWillAttachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerDidDetachHeaderTrait?(headerTrait: HeaderTrait, controller: C): void;

  controllerWillAttachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidDetachHeaderView?(headerView: HeaderView, controller: C): void;

  controllerDidPressHeaderView?(input: PositionGestureInput, event: Event | null, headerView: HeaderView, controller: C): void;

  controllerDidLongPressHeaderView?(input: PositionGestureInput, headerView: HeaderView, controller: C): void;

  controllerWillAttachCol?(colController: ColController, controller: C): void;

  controllerDidDetachCol?(colController: ColController, controller: C): void;

  controllerWillAttachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidDetachColTrait?(colTrait: ColTrait, colController: ColController, controller: C): void;

  controllerDidSetColLayout?(colLayout: ColLayout | null, colController: ColController, controller: C): void;

  controllerWillAttachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidDetachColView?(colView: ColView, colController: ColController, controller: C): void;

  controllerDidPressColView?(input: PositionGestureInput, event: Event | null, colView: ColView, colController: ColController, controller: C): void;

  controllerDidLongPressColView?(input: PositionGestureInput, colView: ColView, colController: ColController, controller: C): void;

  controllerWillAttachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidDetachColLabelView?(colLabelView: HtmlView, colController: ColController, controller: C): void;

  controllerDidSetColIcon?(colIcon: Graphics | null, colController: ColController, controller: C): void;
}

/** @public */
export class HeaderController extends Controller {
  declare readonly observerType?: Class<HeaderControllerObserver>;

  @TraitViewRef({
    traitType: HeaderTrait,
    observesTrait: true,
    willAttachTrait(headerTrait: HeaderTrait): void {
      this.owner.callObservers("controllerWillAttachHeaderTrait", headerTrait, this.owner);
    },
    didAttachTrait(headerTrait: HeaderTrait): void {
      this.owner.cols.addTraits(headerTrait.cols.traits);
    },
    willDetachTrait(headerTrait: HeaderTrait): void {
      this.owner.cols.deleteTraits(headerTrait.cols.traits);
    },
    didDetachTrait(headerTrait: HeaderTrait): void {
      this.owner.callObservers("controllerDidDetachHeaderTrait", headerTrait, this.owner);
    },
    traitWillAttachCol(colTrait: ColTrait, targetTrait: Trait): void {
      this.owner.cols.addTrait(colTrait, targetTrait);
    },
    traitDidDetachCol(colTrait: ColTrait): void {
      this.owner.cols.deleteTrait(colTrait);
    },
    viewType: HeaderView,
    observesView: true,
    initView(headerView: HeaderView): void {
      const colControllers = this.owner.cols.controllers;
      for (const controllerId in colControllers) {
        const colController = colControllers[controllerId]!;
        const colView = colController.col.view;
        if (colView !== null && colView.parent === null) {
          const colTrait = colController.col.trait;
          if (colTrait !== null) {
            colController.col.insertView(headerView, void 0, void 0, colTrait.key);
          }
        }
      }
    },
    insertChildView(parent: View, childView: HeaderView, targetView: View | null, key: string | undefined): void {
      parent.prependChild(childView, key);
    },
    willAttachView(headerView: HeaderView): void {
      this.owner.callObservers("controllerWillAttachHeaderView", headerView, this.owner);
    },
    didDetachView(headerView: HeaderView): void {
      this.owner.callObservers("controllerDidDetachHeaderView", headerView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, headerView: HeaderView): void {
      this.owner.callObservers("controllerDidPressHeaderView", input, event, headerView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, headerView: HeaderView): void {
      this.owner.callObservers("controllerDidLongPressHeaderView", input, headerView, this.owner);
    },
  })
  readonly header!: TraitViewRef<this, HeaderTrait, HeaderView> & Observes<HeaderTrait> & Observes<HeaderView>;

  getCol<F extends Class<ColController>>(key: string, colControllerClass: F): InstanceType<F> | null;
  getCol(key: string): ColController | null;
  getCol(key: string, colControllerClass?: Class<ColController>): ColController | null {
    if (colControllerClass === void 0) {
      colControllerClass = ColController;
    }
    const colController = this.getChild(key);
    return colController instanceof colControllerClass ? colController : null;
  }

  getOrCreateCol<F extends Class<Instance<F, ColController>> & Creatable<Instance<F, ColController>>>(key: string, colControllerClass: F): InstanceType<F> {
    let colController = this.getChild(key, colControllerClass);
    if (colController === null) {
      colController = colControllerClass.create();
      this.setChild(key, colController);
    }
    return colController!;
  }

  setCol(key: string, colController: ColController | null): void {
    this.setChild(key, colController);
  }

  getColTrait<F extends Class<ColTrait>>(key: string, colTraitClass: F): InstanceType<F> | null;
  getColTrait(key: string): ColTrait | null;
  getColTrait(key: string, colTraitClass?: Class<ColTrait>): ColTrait | null {
    const headerTrait = this.header.trait;
    return headerTrait !== null ? headerTrait.getCol(key, colTraitClass!) : null;
  }

  getOrCreateColTrait<F extends Class<Instance<F, ColTrait>> & Creatable<Instance<F, ColTrait>>>(key: string, colTraitClass: F): InstanceType<F> {
    const headerTrait = this.header.trait;
    if (headerTrait === null) {
      throw new Error("no header trait");
    }
    return headerTrait.getOrCreateCol(key, colTraitClass);
  }

  setColTrait(key: string, colTrait: ColTrait | null): void {
    const headerTrait = this.header.trait;
    if (headerTrait === null) {
      throw new Error("no header trait");
    }
    headerTrait.setCol(key, colTrait);
  }

  getColView<F extends Class<ColView>>(key: string, colViewClass: F): InstanceType<F> | null;
  getColView(key: string): ColView | null;
  getColView(key: string, colViewClass?: Class<ColView>): ColView | null {
    const headerView = this.header.view;
    return headerView !== null ? headerView.getCol(key, colViewClass!) : null;
  }

  getOrCreateColView<F extends Class<Instance<F, ColView>> & Creatable<Instance<F, ColView>>>(key: string, colViewClass: F): InstanceType<F> {
    let headerView = this.header.view;
    if (headerView === null) {
      headerView = this.header.createView();
      if (headerView === null) {
        throw new Error("no header view");
      }
      this.header.setView(headerView);
    }
    return headerView.getOrCreateCol(key, colViewClass);
  }

  setColView(key: string, colView: ColView | null): void {
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

  @TraitViewControllerSet({
    controllerType: ColController,
    binds: true,
    observes: true,
    get parentView(): HeaderView | null {
      return this.owner.header.view;
    },
    getTraitViewRef(colController: ColController): TraitViewRef<unknown, ColTrait, ColView> {
      return colController.col;
    },
    willAttachController(colController: ColController): void {
      this.owner.callObservers("controllerWillAttachCol", colController, this.owner);
    },
    didAttachController(colController: ColController): void {
      const colTrait = colController.col.trait;
      if (colTrait !== null) {
        this.attachColTrait(colTrait, colController);
      }
      const colView = colController.col.view;
      if (colView !== null) {
        this.attachColView(colView, colController);
      }
    },
    willDetachController(colController: ColController): void {
      const colView = colController.col.view;
      if (colView !== null) {
        this.detachColView(colView, colController);
      }
      const colTrait = colController.col.trait;
      if (colTrait !== null) {
        this.detachColTrait(colTrait, colController);
      }
    },
    didDetachController(colController: ColController): void {
      this.owner.callObservers("controllerDidDetachCol", colController, this.owner);
    },
    controllerWillAttachColTrait(colTrait: ColTrait, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColTrait", colTrait, colController, this.owner);
      this.attachColTrait(colTrait, colController);
    },
    controllerDidDetachColTrait(colTrait: ColTrait, colController: ColController): void {
      this.detachColTrait(colTrait, colController);
      this.owner.callObservers("controllerDidDetachColTrait", colTrait, colController, this.owner);
    },
    attachColTrait(colTrait: ColTrait, colController: ColController): void {
      // hook
    },
    detachColTrait(colTrait: ColTrait, colController: ColController): void {
      // hook
    },
    controllerWillAttachColView(colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColView", colView, colController, this.owner);
      this.attachColView(colView, colController);
    },
    controllerDidDetachColView(colView: ColView, colController: ColController): void {
      this.detachColView(colView, colController);
      this.owner.callObservers("controllerDidDetachColView", colView, colController, this.owner);
    },
    controllerDidSetColLayout(colLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColLayout", colLayout, colController, this.owner);
    },
    attachColView(colView: ColView, colController: ColController): void {
      if (colView instanceof TextColView) {
        const colLabelView = colView.label.view;
        if (colLabelView !== null) {
          this.attachColLabelView(colLabelView, colController);
        }
      }
    },
    detachColView(colView: ColView, colController: ColController): void {
      if (colView instanceof TextColView) {
        const colLabelView = colView.label.view;
        if (colLabelView !== null) {
          this.detachColLabelView(colLabelView, colController);
        }
      }
      colView.remove();
    },
    controllerDidPressColView(input: PositionGestureInput, event: Event | null, colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerDidPressColView", input, event, colView, colController, this.owner);
    },
    controllerDidLongPressColView(input: PositionGestureInput, colView: ColView, colController: ColController): void {
      this.owner.callObservers("controllerDidLongPressColView", input, colView, colController, this.owner);
    },
    controllerWillAttachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      this.owner.callObservers("controllerWillAttachColLabelView", colLabelView, colController, this.owner);
      this.attachColLabelView(colLabelView, colController);
    },
    controllerDidDetachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      this.detachColLabelView(colLabelView, colController);
      this.owner.callObservers("controllerDidDetachColLabelView", colLabelView, colController, this.owner);
    },
    attachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      // hook
    },
    detachColLabelView(colLabelView: HtmlView, colController: ColController): void {
      // hook
    },
    controllerDidSetColIcon(colIcon: Graphics | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColIcon", colIcon, colController, this.owner);
    },
    createController(colTrait?: ColTrait): ColController {
      if (colTrait !== void 0) {
        return colTrait.createColController();
      } else {
        return super.createController();
      }
    },
  })
  readonly cols!: TraitViewControllerSet<this, ColTrait, ColView, ColController> & Observes<ColController> & Observes<TextColController> & Observes<IconColController> & {
    attachColTrait(colTrait: ColTrait, colController: ColController): void;
    detachColTrait(colTrait: ColTrait, colController: ColController): void;
    attachColView(colView: ColView, colController: ColController): void;
    detachColView(colView: ColView, colController: ColController): void;
    attachColLabelView(colLabelView: HtmlView, colController: ColController): void;
    detachColLabelView(colLabelView: HtmlView, colController: ColController): void;
  };
}
