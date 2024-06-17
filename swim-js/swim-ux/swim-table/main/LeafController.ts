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
import {Property} from "@swim/component";
import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import type {ControllerObserver} from "@swim/controller";
import {Controller} from "@swim/controller";
import {TraitViewRef} from "@swim/controller";
import {TraitViewControllerSet} from "@swim/controller";
import {Hyperlink} from "@swim/controller";
import type {CellView} from "./CellView";
import {TextCellView} from "./TextCellView";
import type {CellTrait} from "./CellTrait";
import {CellController} from "./CellController";
import type {TextCellController} from "./TextCellController";
import type {IconCellController} from "./IconCellController";
import {LeafView} from "./LeafView";
import {LeafTrait} from "./LeafTrait";

/** @public */
export interface LeafControllerObserver<C extends LeafController = LeafController> extends ControllerObserver<C> {
  controllerWillAttachLeafTrait?(leafTrait: LeafTrait, controller: C): void;

  controllerDidDetachLeafTrait?(leafTrait: LeafTrait, controller: C): void;

  controllerWillAttachLeafView?(leafView: LeafView, controller: C): void;

  controllerDidDetachLeafView?(leafView: LeafView, controller: C): void;

  controllerWillHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidHighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerWillUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidUnhighlightLeafView?(leafView: LeafView, controller: C): void;

  controllerDidEnterLeafView?(leafView: LeafView, controller: C): void;

  controllerDidLeaveLeafView?(leafView: LeafView, controller: C): void;

  controllerDidPressLeafView?(input: PositionGestureInput, event: Event | null, leafView: LeafView, controller: C): void;

  controllerDidLongPressLeafView?(input: PositionGestureInput, leafView: LeafView, controller: C): void;

  controllerWillAttachCell?(cellController: CellController, controller: C): void;

  controllerDidDetachCell?(cellController: CellController, controller: C): void;

  controllerWillAttachCellTrait?(cellTrait: CellTrait, cellController: CellController, controller: C): void;

  controllerDidDetachCellTrait?(cellTrait: CellTrait, cellController: CellController, controller: C): void;

  controllerWillAttachCellView?(cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidDetachCellView?(cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidPressCellView?(input: PositionGestureInput, event: Event | null, cellView: CellView, cellController: CellController, controller: C): void;

  controllerDidLongPressCellView?(input: PositionGestureInput, cellView: CellView, cellController: CellController, controller: C): void;

  controllerWillAttachCellContentView?(cellContentView: HtmlView, cellController: CellController, controller: C): void;

  controllerDidDetachCellContentView?(cellContentView: HtmlView, cellController: CellController, controller: C): void;

  controllerDidSetCellIcon?(cellIcon: Graphics | null, cellController: CellController, controller: C): void;
}

/** @public */
export class LeafController extends Controller {
  declare readonly observerType?: Class<LeafControllerObserver>;

  @Property({valueType: Hyperlink, value: null})
  get hyperlink(): Property<this, Hyperlink | null> {
    return Property.getter();
  }

  @TraitViewRef({
    traitType: LeafTrait,
    observesTrait: true,
    willAttachTrait(leafTrait: LeafTrait): void {
      this.owner.callObservers("controllerWillAttachLeafTrait", leafTrait, this.owner);
    },
    didAttachTrait(leafTrait: LeafTrait): void {
      this.owner.cells.addTraits(leafTrait.cells.traits);
    },
    initTrait(leafTrait: LeafTrait): void {
      this.owner.hyperlink.bindInlet(leafTrait.hyperlink);
    },
    deinitTrait(leafTrait: LeafTrait): void {
      this.owner.hyperlink.unbindInlet(leafTrait.hyperlink);
    },
    willDetachTrait(leafTrait: LeafTrait): void {
      this.owner.cells.deleteTraits(leafTrait.cells.traits);
    },
    didDetachTrait(leafTrait: LeafTrait): void {
      this.owner.callObservers("controllerDidDetachLeafTrait", leafTrait, this.owner);
    },
    traitWillAttachCell(cellTrait: CellTrait, targetTrait: Trait | null): void {
      this.owner.cells.addTrait(cellTrait, targetTrait);
    },
    traitDidDetachCell(cellTrait: CellTrait): void {
      this.owner.cells.deleteTrait(cellTrait);
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
      leafView.hyperlink.bindInlet(this.owner.hyperlink);
    },
    didDetachView(leafView: LeafView): void {
      leafView.hyperlink.unbindInlet(this.owner.hyperlink);
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
  readonly leaf!: TraitViewRef<this, LeafTrait, LeafView> & Observes<LeafTrait> & Observes<LeafView>;

  getCell<F extends Class<CellController>>(key: string, cellControllerClass: F): InstanceType<F> | null;
  getCell(key: string): CellController | null;
  getCell(key: string, cellControllerClass?: Class<CellController>): CellController | null {
    if (cellControllerClass === void 0) {
      cellControllerClass = CellController;
    }
    const cellController = this.getChild(key);
    return cellController instanceof cellControllerClass ? cellController : null;
  }

  getOrCreateCell<F extends Class<Instance<F, CellController>> & Creatable<Instance<F, CellController>>>(key: string, cellControllerClass: F): InstanceType<F> {
    let cellController = this.getChild(key, cellControllerClass);
    if (cellController === null) {
      cellController = cellControllerClass.create();
      this.setChild(key, cellController);
    }
    return cellController!;
  }

  setCell(key: string, cellController: CellController | null): void {
    this.setChild(key, cellController);
  }

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

  setCellTrait(key: string, cellTrait: CellTrait | null): void {
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

  setCellView(key: string, cellView: CellView | null): void {
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

  @TraitViewControllerSet({
    controllerType: CellController,
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
    controllerDidSetCellIcon(cellIcon: Graphics | null, cellController: CellController): void {
      this.owner.callObservers("controllerDidSetCellIcon", cellIcon, cellController, this.owner);
    },
    createController(cellTrait?: CellTrait): CellController {
      if (cellTrait !== void 0) {
        return cellTrait.createCellController();
      } else {
        return super.createController();
      }
    },
  })
  readonly cells!: TraitViewControllerSet<this, CellTrait, CellView, CellController> & Observes<CellController> & Observes<TextCellController> & Observes<IconCellController> & {
    attachCellTrait(cellTrait: CellTrait, cellController: CellController): void;
    detachCellTrait(cellTrait: CellTrait, cellController: CellController): void;
    attachCellView(cellView: CellView, cellController: CellController): void;
    detachCellView(cellView: CellView, cellController: CellController): void;
    attachCellContentView(cellContentView: HtmlView, cellController: CellController): void;
    detachCellContentView(cellContentView: HtmlView, cellController: CellController): void;
  };
}
