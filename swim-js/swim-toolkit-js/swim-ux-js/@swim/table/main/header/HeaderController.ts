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

import type {Class} from "@swim/util";
import type {MemberFastenerClass} from "@swim/fastener";
import type {TraitConstructor, TraitClass, Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {HtmlViewClass, HtmlView} from "@swim/dom";
import {GenericController, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {ColLayout} from "../layout/ColLayout";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import {ColController} from "../col/ColController";
import {HeaderView} from "./HeaderView";
import {HeaderTrait} from "./HeaderTrait";
import type {HeaderControllerObserver} from "./HeaderControllerObserver";

/** @internal */
export type HeaderControllerColExt = {
  attachColTrait(colTrait: ColTrait, colController: ColController): void;
  detachColTrait(colTrait: ColTrait, colController: ColController): void;
  attachColView(colView: ColView, colController: ColController): void;
  detachColView(colView: ColView, colController: ColController): void;
  attachColLabelView(colLabelView: HtmlView, colController: ColController): void;
  detachColLabelView(colLabelView: HtmlView, colController: ColController): void;
};

export class HeaderController extends GenericController {
  override readonly observerType?: Class<HeaderControllerObserver>;

  @TraitViewRef<HeaderController, HeaderTrait, HeaderView>({
    traitType: HeaderTrait,
    observesTrait: true,
    initTrait(headerTrait: HeaderTrait): void {
      const colTraits = headerTrait.cols.traits;
      for (const traitId in colTraits) {
        const colTrait = colTraits[traitId]!;
        this.owner.cols.addTrait(colTrait);
      }
    },
    deinitTrait(headerTrait: HeaderTrait): void {
      const colTraits = headerTrait.cols.traits;
      for (const traitId in colTraits) {
        const colTrait = colTraits[traitId]!;
        this.owner.cols.deleteTrait(colTrait);
      }
    },
    willAttachTrait(headerTrait: HeaderTrait): void {
      this.owner.callObservers("controllerWillAttachHeaderTrait", headerTrait, this.owner);
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
    willAttachView(headerView: HeaderView): void {
      this.owner.callObservers("controllerWillAttachHeaderView", headerView, this.owner);
    },
    didDetachView(headerView: HeaderView): void {
      this.owner.callObservers("controllerDidDetachHeaderView", headerView, this.owner);
    },
    insertChildView(parent: View, childView: HeaderView, targetView: View | null, key: string | undefined): void {
      parent.prependChild(childView, key);
    },
  })
  readonly header!: TraitViewRef<this, HeaderTrait, HeaderView>;
  static readonly header: MemberFastenerClass<HeaderController, "header">;

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

  getColView(key: string): ColView | null;
  getColView<V extends ColView>(key: string, colViewClass: Class<V>): V | null;
  getColView(key: string, colViewClass?: Class<ColView>): ColView | null {
    const headerView = this.header.view;
    return headerView !== null ? headerView.getCol(key, colViewClass!) : null;
  }

  getOrCreateColView(key: string): ColView;
  getOrCreateColView<V extends ColView>(key: string, colViewClass: HtmlViewClass<V>): V;
  getOrCreateColView(key: string, colViewClass?: HtmlViewClass<ColView>): ColView {
    let headerView = this.header.view;
    if (headerView === null) {
      headerView = this.header.createView();
      if (headerView === null) {
        throw new Error("no header view");
      }
      this.header.setView(headerView);
    }
    return headerView.getOrCreateCol(key, colViewClass!);
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

  @TraitViewControllerSet<HeaderController, ColTrait, ColView, ColController, HeaderControllerColExt>({
    type: ColController,
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
    attachColView(colView: ColView, colController: ColController): void {
      const colLabelView = colView.label.view;
      if (colLabelView !== null) {
        this.attachColLabelView(colLabelView, colController);
      }
    },
    detachColView(colView: ColView, colController: ColController): void {
      const colLabelView = colView.label.view;
      if (colLabelView !== null) {
        this.detachColLabelView(colLabelView, colController);
      }
      colView.remove();
    },
    controllerWillSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerWillSetColLayout", newColLayout, oldColLayout, colController, this.owner);
    },
    controllerDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null, colController: ColController): void {
      this.owner.callObservers("controllerDidSetColLayout", newColLayout, oldColLayout, colController, this.owner);
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
  })
  readonly cols!: TraitViewControllerSet<this, ColTrait, ColView, ColController>;
  static readonly cols: MemberFastenerClass<HeaderController, "cols">;
}
