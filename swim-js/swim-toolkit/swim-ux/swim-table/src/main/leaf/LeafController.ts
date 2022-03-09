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

import type {Class, Instance, ObserverType, Creatable} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {Controller, TraitViewRef, TraitViewControllerSet} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import {TextCellView} from "../cell/TextCellView";
import type {CellTrait} from "../cell/CellTrait";
import {CellController} from "../cell/CellController";
import type {TextCellController} from "../cell/TextCellController";
import type {IconCellController} from "../cell/IconCellController";
import {LeafView} from "./LeafView";
import {LeafTrait} from "./LeafTrait";
import type {LeafControllerObserver} from "./LeafControllerObserver";

/** @public */
export interface LeafControllerCellExt {
  attachCellTrait(cellTrait: CellTrait, cellController: CellController): void;
  detachCellTrait(cellTrait: CellTrait, cellController: CellController): void;
  attachCellView(cellView: CellView, cellController: CellController): void;
  detachCellView(cellView: CellView, cellController: CellController): void;
  attachCellContentView(cellContentView: HtmlView, cellController: CellController): void;
  detachCellContentView(cellContentView: HtmlView, cellController: CellController): void;
}

/** @public */
export class LeafController extends Controller {
  override readonly observerType?: Class<LeafControllerObserver>;

  @TraitViewRef<LeafController, LeafTrait, LeafView>({
    traitType: LeafTrait,
    observesTrait: true,
    willAttachTrait(leafTrait: LeafTrait): void {
      this.owner.callObservers("controllerWillAttachLeafTrait", leafTrait, this.owner);
    },
    didAttachTrait(leafTrait: LeafTrait): void {
      const cellTraits = leafTrait.cells.traits;
      for (const traitId in cellTraits) {
        const cellTrait = cellTraits[traitId]!;
        this.owner.cells.addTraitController(cellTrait);
      }
    },
    willDetachTrait(leafTrait: LeafTrait): void {
      const cellTraits = leafTrait.cells.traits;
      for (const traitId in cellTraits) {
        const cellTrait = cellTraits[traitId]!;
        this.owner.cells.deleteTraitController(cellTrait);
      }
    },
    didDetachTrait(leafTrait: LeafTrait): void {
      this.owner.callObservers("controllerDidDetachLeafTrait", leafTrait, this.owner);
    },
    traitWillAttachCell(cellTrait: CellTrait, targetTrait: Trait | null): void {
      this.owner.cells.addTraitController(cellTrait, targetTrait);
    },
    traitDidDetachCell(cellTrait: CellTrait): void {
      this.owner.cells.deleteTraitController(cellTrait);
    },
    viewType: LeafView,
    observesView: true,
    initView(leafView: LeafView): void {
      const cellControllers = this.owner.cells.controllers;
      for (const controllerId in cellControllers) {
        const cellController = cellControllers[controllerId]!;
        const cellView = cellController.cell.view;
        if (cellView !== null && cellView.parent === null) {
          const cellTrait = cellController.cell.trait;
          if (cellTrait !== null) {
            cellController.cell.insertView(leafView, void 0, void 0, cellTrait.key);
          }
        }
      }
    },
    willAttachView(leafView: LeafView): void {
      this.owner.callObservers("controllerWillAttachLeafView", leafView, this.owner);
    },
    didDetachView(leafView: LeafView): void {
      this.owner.callObservers("controllerDidDetachLeafView", leafView, this.owner);
    },
    viewWillHighlight(leafView: LeafView): void {
      this.owner.callObservers("controllerWillHighlightLeafView", leafView, this.owner);
    },
    viewDidHighlight(leafView: LeafView): void {
      this.owner.callObservers("controllerDidHighlightLeafView", leafView, this.owner);
    },
    viewWillUnhighlight(leafView: LeafView): void {
      this.owner.callObservers("controllerWillUnhighlightLeafView", leafView, this.owner);
    },
    viewDidUnhighlight(leafView: LeafView): void {
      this.owner.callObservers("controllerDidUnhighlightLeafView", leafView, this.owner);
    },
    viewDidEnter(leafView: LeafView): void {
      this.owner.callObservers("controllerDidEnterLeafView", leafView, this.owner);
    },
    viewDidLeave(leafView: LeafView): void {
      this.owner.callObservers("controllerDidLeaveLeafView", leafView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
      this.owner.callObservers("controllerDidPressLeafView", input, event, leafView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, leafView: LeafView): void {
      this.owner.callObservers("controllerDidLongPressLeafView", input, leafView, this.owner);
    },
  })
  readonly leaf!: TraitViewRef<this, LeafTrait, LeafView>;
  static readonly leaf: MemberFastenerClass<LeafController, "leaf">;

  getCellTrait<F extends Class<CellTrait>>(key: string, cellTraitClass: F): InstanceType<F> | null;
  getCellTrait(key: string): CellTrait | null;
  getCellTrait(key: string, cellTraitClass?: Class<CellTrait>): CellTrait | null {
    const leafTrait = this.leaf.trait;
    return leafTrait !== null ? leafTrait.getCell(key, cellTraitClass!) : null;
  }

  getOrCreateCellTrait<F extends Class<Instance<F, CellTrait>> & Creatable<Instance<F, CellTrait>>>(key: string, cellTraitClass: F): InstanceType<F> {
    const leafTrait = this.leaf.trait;
    if (leafTrait === null) {
      throw new Error("no leaf trait");
    }
    return leafTrait.getOrCreateCell(key, cellTraitClass);
  }

  setCellTrait(key: string, cellTrait: CellTrait): void {
    const leafTrait = this.leaf.trait;
    if (leafTrait === null) {
      throw new Error("no leaf trait");
    }
    leafTrait.setCell(key, cellTrait);
  }

  getCellView<F extends Class<CellView>>(key: string, cellViewClass: F): InstanceType<F> | null;
  getCellView(key: string): CellView | null;
  getCellView(key: string, cellViewClass?: Class<CellView>): CellView | null {
    const leafView = this.leaf.view;
    return leafView !== null ? leafView.getCell(key, cellViewClass!) : null;
  }

  getOrCreateCellView<F extends Class<Instance<F, CellView>> & Creatable<Instance<F, CellView>>>(key: string, cellViewClass: F): InstanceType<F> {
    let leafView = this.leaf.view;
    if (leafView === null) {
      leafView = this.leaf.createView();
      if (leafView === null) {
        throw new Error("no leaf view");
      }
      this.leaf.setView(leafView);
    }
    return leafView.getOrCreateCell(key, cellViewClass);
  }

  setCellView(key: string, cellView: CellView): void {
    let leafView = this.leaf.view;
    if (leafView === null) {
      leafView = this.leaf.createView();
      if (leafView === null) {
        throw new Error("no leaf view");
      }
      this.leaf.setView(leafView);
    }
    leafView.setCell(key, cellView);
  }

  @TraitViewControllerSet<LeafController, CellTrait, CellView, CellController, LeafControllerCellExt & ObserverType<CellController | TextCellController | IconCellController>>({
    implements: true,
    type: CellController,
    binds: true,
    observes: true,
    get parentView(): LeafView | null {
      return this.owner.leaf.view;
    },
    getTraitViewRef(cellController: CellController): TraitViewRef<unknown, CellTrait, CellView> {
      return cellController.cell;
    },
    willAttachController(cellController: CellController): void {
      this.owner.callObservers("controllerWillAttachCell", cellController, this.owner);
    },
    didAttachController(cellController: CellController): void {
      const cellTrait = cellController.cell.trait;
      if (cellTrait !== null) {
        this.attachCellTrait(cellTrait, cellController);
      }
      const cellView = cellController.cell.view;
      if (cellView !== null) {
        this.attachCellView(cellView, cellController);
      }
    },
    willDetachController(cellController: CellController): void {
      const cellView = cellController.cell.view;
      if (cellView !== null) {
        this.detachCellView(cellView, cellController);
      }
      const cellTrait = cellController.cell.trait;
      if (cellTrait !== null) {
        this.detachCellTrait(cellTrait, cellController);
      }
    },
    didDetachController(cellController: CellController): void {
      this.owner.callObservers("controllerDidDetachCell", cellController, this.owner);
    },
    controllerWillAttachCellTrait(cellTrait: CellTrait, cellController: CellController): void {
      this.owner.callObservers("controllerWillAttachCellTrait", cellTrait, cellController, this.owner);
      this.attachCellTrait(cellTrait, cellController);
    },
    controllerDidDetachCellTrait(cellTrait: CellTrait, cellController: CellController): void {
      this.detachCellTrait(cellTrait, cellController);
      this.owner.callObservers("controllerDidDetachCellTrait", cellTrait, cellController, this.owner);
    },
    attachCellTrait(cellTrait: CellTrait, cellController: CellController): void {
      // hook
    },
    detachCellTrait(cellTrait: CellTrait, cellController: CellController): void {
      // hook
    },
    controllerWillAttachCellView(cellView: CellView, cellController: CellController): void {
      this.owner.callObservers("controllerWillAttachCellView", cellView, cellController, this.owner);
      this.attachCellView(cellView, cellController);
    },
    controllerDidDetachCellView(cellView: CellView, cellController: CellController): void {
      this.detachCellView(cellView, cellController);
      this.owner.callObservers("controllerDidDetachCellView", cellView, cellController, this.owner);
    },
    attachCellView(cellView: CellView, cellController: CellController): void {
      if (cellView instanceof TextCellView) {
        const cellContentView = cellView.content.view;
        if (cellContentView !== null) {
          this.attachCellContentView(cellContentView, cellController);
        }
      }
    },
    detachCellView(cellView: CellView, cellController: CellController): void {
      if (cellView instanceof TextCellView) {
        const cellContentView = cellView.content.view;
        if (cellContentView !== null) {
          this.detachCellContentView(cellContentView, cellController);
        }
      }
      cellView.remove();
    },
    controllerDidPressCellView(input: PositionGestureInput, event: Event | null, cellView: CellView, cellController: CellController): void {
      this.owner.callObservers("controllerDidPressCellView", input, event, cellView, cellController, this.owner);
    },
    controllerDidLongPressCellView(input: PositionGestureInput, cellView: CellView, cellController: CellController): void {
      this.owner.callObservers("controllerDidLongPressCellView", input, cellView, cellController, this.owner);
    },
    controllerWillAttachCellContentView(contentView: HtmlView, cellController: CellController): void {
      this.attachCellContentView(contentView, cellController);
      this.owner.callObservers("controllerWillAttachCellContentView", contentView, cellController, this.owner);
    },
    controllerDidDetachCellContentView(contentView: HtmlView, cellController: CellController): void {
      this.owner.callObservers("controllerDidDetachCellContentView", contentView, cellController, this.owner);
      this.detachCellContentView(contentView, cellController);
    },
    attachCellContentView(cellContentView: HtmlView, cellController: CellController): void {
      // hook
    },
    detachCellContentView(cellContentView: HtmlView, cellController: CellController): void {
      // hook
    },
    controllerWillSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController): void {
      this.owner.callObservers("controllerWillSetCellIcon", newCellIcon, oldCellIcon, cellController, this.owner);
    },
    controllerDidSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null, cellController: CellController): void {
      this.owner.callObservers("controllerDidSetCellIcon", newCellIcon, oldCellIcon, cellController, this.owner);
    },
    createController(cellTrait?: CellTrait): CellController {
      if (cellTrait !== void 0) {
        return CellController.fromTrait(cellTrait);
      } else {
        return TraitViewControllerSet.prototype.createController.call(this);
      }
    },
  })
  readonly cells!: TraitViewControllerSet<this, CellTrait, CellView, CellController>;
  static readonly cells: MemberFastenerClass<LeafController, "cells">;
}
