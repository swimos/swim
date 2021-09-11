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

import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {
  Controller,
  ControllerObserverType,
  ControllerViewTrait,
  ControllerFastener,
  CompositeController,
} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import {TextCellView} from "../cell/TextCellView";
import type {CellTrait} from "../cell/CellTrait";
import {CellController} from "../cell/CellController";
import type {TextCellController} from "../cell/TextCellController";
import type {IconCellController} from "../cell/IconCellController";
import {LeafView} from "./LeafView";
import {LeafTrait} from "./LeafTrait";
import type {LeafControllerObserver} from "./LeafControllerObserver";

export class LeafController extends CompositeController {
  constructor() {
    super();
    Object.defineProperty(this, "cellFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly controllerObservers!: ReadonlyArray<LeafControllerObserver>;

  protected initLeafTrait(leafTrait: LeafTrait): void {
    // hook
  }

  protected attachLeafTrait(leafTrait: LeafTrait): void {
    const cellFasteners = leafTrait.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        this.insertCellTrait(cellTrait);
      }
    }
  }

  protected detachLeafTrait(leafTrait: LeafTrait): void {
    const cellFasteners = leafTrait.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        this.removeCellTrait(cellTrait);
      }
    }
  }

  protected willSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeafTrait !== void 0) {
        controllerObserver.controllerWillSetLeafTrait(newLeafTrait, oldLeafTrait, this);
      }
    }
  }

  protected onSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
    if (oldLeafTrait !== null) {
      this.detachLeafTrait(oldLeafTrait);
    }
    if (newLeafTrait !== null) {
      this.attachLeafTrait(newLeafTrait);
      this.initLeafTrait(newLeafTrait);
    }
  }

  protected didSetLeafTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeafTrait !== void 0) {
        controllerObserver.controllerDidSetLeafTrait(newLeafTrait, oldLeafTrait, this);
      }
    }
  }

  protected createLeafView(): LeafView | null {
    return LeafView.create();
  }

  protected initLeafView(leafView: LeafView): void {
    // hook
  }

  protected attachLeafView(leafView: LeafView): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellController = cellFasteners[i]!.controller;
      if (cellController !== null) {
        const cellView = cellController.cell.view;
        if (cellView !== null && cellView.parentView === null) {
          const cellTrait = cellController.cell.trait;
          if (cellTrait !== null) {
            cellController.cell.injectView(leafView, void 0, void 0, cellTrait.key);
          }
        }
      }
    }
  }

  protected detachLeafView(leafView: LeafView): void {
    // hook
  }

  protected willSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetLeafView !== void 0) {
        controllerObserver.controllerWillSetLeafView(newLeafView, oldLeafView, this);
      }
    }
  }

  protected onSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    if (oldLeafView !== null) {
      this.detachLeafView(oldLeafView);
    }
    if (newLeafView !== null) {
      this.attachLeafView(newLeafView);
      this.initLeafView(newLeafView);
    }
  }

  protected didSetLeafView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetLeafView !== void 0) {
        controllerObserver.controllerDidSetLeafView(newLeafView, oldLeafView, this);
      }
    }
  }

  protected willHighlightLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillHighlightLeafView !== void 0) {
        controllerObserver.controllerWillHighlightLeafView(leafView, this);
      }
    }
  }

  protected onHighlightLeafView(leafView: LeafView): void {
    // hook
  }

  protected didHighlightLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidHighlightLeafView !== void 0) {
        controllerObserver.controllerDidHighlightLeafView(leafView, this);
      }
    }
  }

  protected willUnhighlightLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillUnhighlightLeafView !== void 0) {
        controllerObserver.controllerWillUnhighlightLeafView(leafView, this);
      }
    }
  }

  protected onUnhighlightLeafView(leafView: LeafView): void {
    // hook
  }

  protected didUnhighlightLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidUnhighlightLeafView !== void 0) {
        controllerObserver.controllerDidUnhighlightLeafView(leafView, this);
      }
    }
  }

  protected onEnterLeafView(leafView: LeafView): void {
    // hook
  }

  protected didEnterLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidEnterLeafView !== void 0) {
        controllerObserver.controllerDidEnterLeafView(leafView, this);
      }
    }
  }

  protected onLeaveLeafView(leafView: LeafView): void {
    // hook
  }

  protected didLeaveLeafView(leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidLeaveLeafView !== void 0) {
        controllerObserver.controllerDidLeaveLeafView(leafView, this);
      }
    }
  }

  protected onPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
    // hook
  }

  protected didPressLeafView(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidPressLeafView !== void 0) {
        controllerObserver.controllerDidPressLeafView(input, event, leafView, this);
      }
    }
  }

  protected onLongPressLeafView(input: PositionGestureInput, leafView: LeafView): void {
    // hook
  }

  protected didLongPressLeafView(input: PositionGestureInput, leafView: LeafView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidLongPressLeafView !== void 0) {
        controllerObserver.controllerDidLongPressLeafView(input, leafView, this);
      }
    }
  }

  /** @hidden */
  static LeafFastener = ControllerViewTrait.define<LeafController, LeafView, LeafTrait>({
    viewType: LeafView,
    observeView: true,
    willSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.willSetLeafView(newLeafView, oldLeafView);
    },
    onSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.onSetLeafView(newLeafView, oldLeafView);
    },
    didSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.didSetLeafView(newLeafView, oldLeafView);
    },
    viewWillHighlight(leafView: LeafView): void {
      this.owner.willHighlightLeafView(leafView);
      this.owner.onHighlightLeafView(leafView);
    },
    viewDidHighlight(leafView: LeafView): void {
      this.owner.didHighlightLeafView(leafView);
    },
    viewWillUnhighlight(leafView: LeafView): void {
      this.owner.willUnhighlightLeafView(leafView);
    },
    viewDidUnhighlight(leafView: LeafView): void {
      this.owner.onUnhighlightLeafView(leafView);
      this.owner.didUnhighlightLeafView(leafView);
    },
    viewDidEnter(leafView: LeafView): void {
      this.owner.onEnterLeafView(leafView);
      this.owner.didEnterLeafView(leafView);
    },
    viewDidLeave(leafView: LeafView): void {
      this.owner.onLeaveLeafView(leafView);
      this.owner.didLeaveLeafView(leafView);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
      this.owner.onPressLeafView(input, event, leafView);
      this.owner.didPressLeafView(input, event, leafView);
    },
    viewDidLongPress(input: PositionGestureInput, leafView: LeafView): void {
      this.owner.onLongPressLeafView(input, leafView);
      this.owner.didLongPressLeafView(input, leafView);
    },
    createView(): LeafView | null {
      return this.owner.createLeafView();
    },
    traitType: LeafTrait,
    observeTrait: true,
    willSetTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
      this.owner.willSetLeafTrait(newLeafTrait, oldLeafTrait);
    },
    onSetTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
      this.owner.onSetLeafTrait(newLeafTrait, oldLeafTrait);
    },
    didSetTrait(newLeafTrait: LeafTrait | null, oldLeafTrait: LeafTrait | null): void {
      this.owner.didSetLeafTrait(newLeafTrait, oldLeafTrait);
    },
    traitWillSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, targetTrait: Trait): void {
      if (oldCellTrait !== null) {
        this.owner.removeCellTrait(oldCellTrait);
      }
    },
    traitDidSetCell(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null, targetTrait: Trait): void {
      if (newCellTrait !== null) {
        this.owner.insertCellTrait(newCellTrait, targetTrait);
      }
    },
  });

  @ControllerViewTrait<LeafController, LeafView, LeafTrait>({
    extends: LeafController.LeafFastener,
  })
  readonly leaf!: ControllerViewTrait<this, LeafView, LeafTrait>;

  insertCell(cellController: CellController, targetController: Controller | null = null): void {
    const cellFasteners = this.cellFasteners as ControllerFastener<this, CellController>[];
    let targetIndex = cellFasteners.length;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.controller === cellController) {
        return;
      } else if (cellFastener.controller === targetController) {
        targetIndex = i;
      }
    }
    const cellFastener = this.createCellFastener(cellController);
    cellFasteners.splice(targetIndex, 0, cellFastener);
    cellFastener.setController(cellController, targetController);
    if (this.isMounted()) {
      cellFastener.mount();
    }
  }

  removeCell(cellController: CellController): void {
    const cellFasteners = this.cellFasteners as ControllerFastener<this, CellController>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.controller === cellController) {
        cellFastener.setController(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createCell(cellTrait: CellTrait): CellController | null {
    return CellController.createCell(cellTrait);
  }

  protected initCell(cellController: CellController, cellFastener: ControllerFastener<this, CellController>): void {
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.initCellTrait(cellTrait, cellFastener);
    }
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.initCellView(cellView, cellFastener);
    }
  }

  protected attachCell(cellController: CellController, cellFastener: ControllerFastener<this, CellController>): void {
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.attachCellTrait(cellTrait, cellFastener);
    }
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.attachCellView(cellView, cellFastener);
    }
  }

  protected detachCell(cellController: CellController, cellFastener: ControllerFastener<this, CellController>): void {
    const cellView = cellController.cell.view;
    if (cellView !== null) {
      this.detachCellView(cellView, cellFastener);
    }
    const cellTrait = cellController.cell.trait;
    if (cellTrait !== null) {
      this.detachCellTrait(cellTrait, cellFastener);
    }
  }

  protected willSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                        cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCell !== void 0) {
        controllerObserver.controllerWillSetCell(newCellController, oldCellController, cellFastener);
      }
    }
  }

  protected onSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                      cellFastener: ControllerFastener<this, CellController>): void {
    if (oldCellController !== null) {
      this.detachCell(oldCellController, cellFastener);
    }
    if (newCellController !== null) {
      this.attachCell(newCellController, cellFastener);
      this.initCell(newCellController, cellFastener);
    }
  }

  protected didSetCell(newCellController: CellController | null, oldCellController: CellController | null,
                       cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCell !== void 0) {
        controllerObserver.controllerDidSetCell(newCellController, oldCellController, cellFastener);
      }
    }
  }

  insertCellTrait(cellTrait: CellTrait, targetTrait: Trait | null = null): void {
    const cellFasteners = this.cellFasteners as ControllerFastener<this, CellController>[];
    let targetController: CellController | null = null;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellController = cellFasteners[i]!.controller;
      if (cellController !== null) {
        if (cellController.cell.trait === cellTrait) {
          return;
        } else if (cellController.cell.trait === targetTrait) {
          targetController = cellController;
        }
      }
    }
    const cellController = this.createCell(cellTrait);
    if (cellController !== null) {
      cellController.cell.setTrait(cellTrait);
      this.insertChildController(cellController, targetController, cellTrait.key);
      if (cellController.cell.view === null) {
        const cellView = this.createCellView(cellController);
        let targetView: CellView | null = null;
        if (targetController !== null) {
          targetView = targetController.cell.view;
        }
        const leafView = this.leaf.view;
        if (leafView !== null) {
          cellController.cell.injectView(leafView, cellView, targetView, cellTrait.key);
        } else {
          cellController.cell.setView(cellView, targetView);
        }
      }
    }
  }

  removeCellTrait(cellTrait: CellTrait): void {
    const cellFasteners = this.cellFasteners as ControllerFastener<this, CellController>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      const cellController = cellFastener.controller;
      if (cellController !== null && cellController.cell.trait === cellTrait) {
        cellFastener.setController(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        cellController.remove();
        return;
      }
    }
  }

  protected initCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected detachCellTrait(cellTrait: CellTrait | null, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                             cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellTrait !== void 0) {
        controllerObserver.controllerWillSetCellTrait(newCellTrait, oldCellTrait, cellFastener);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                           cellFastener: ControllerFastener<this, CellController>): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait, cellFastener);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(oldCellTrait, cellFastener);
      this.initCellTrait(newCellTrait, cellFastener);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                            cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellTrait !== void 0) {
        controllerObserver.controllerDidSetCellTrait(newCellTrait, oldCellTrait, cellFastener);
      }
    }
  }

  protected createCellView(cellController: CellController): CellView | null {
    return cellController.cell.createView();
  }

  protected initCellView(cellView: CellView, cellFastener: ControllerFastener<this, CellController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.initCellContentView(cellContentView, cellFastener);
      }
    }
  }

  protected attachCellView(cellView: CellView, cellFastener: ControllerFastener<this, CellController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.attachCellContentView(cellContentView, cellFastener);
      }
    }
  }

  protected detachCellView(cellView: CellView, cellFastener: ControllerFastener<this, CellController>): void {
    if (cellView instanceof TextCellView) {
      const cellContentView = cellView.content.view;
      if (cellContentView !== null) {
        this.detachCellContentView(cellContentView, cellFastener);
      }
    }
    cellView.remove();
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                            cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellView !== void 0) {
        controllerObserver.controllerWillSetCellView(newCellView, oldCellView, cellFastener);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                          cellFastener: ControllerFastener<this, CellController>): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView, cellFastener);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView, cellFastener);
      this.initCellView(newCellView, cellFastener);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                           cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellView !== void 0) {
        controllerObserver.controllerDidSetCellView(newCellView, oldCellView, cellFastener);
      }
    }
  }

  protected didPressCellView(input: PositionGestureInput, event: Event | null, cellView: CellView,
                             cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidPressCellView !== void 0) {
        controllerObserver.controllerDidPressCellView(input, event, cellView, cellFastener);
      }
    }
  }

  protected didLongPressCellView(input: PositionGestureInput, cellView: CellView,
                                 cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidLongPressCellView !== void 0) {
        controllerObserver.controllerDidLongPressCellView(input, cellView, cellFastener);
      }
    }
  }

  protected initCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected attachCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected detachCellContentView(cellContentView: HtmlView, cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected willSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                   cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellContentView !== void 0) {
        controllerObserver.controllerWillSetCellContentView(newCellContentView, oldCellContentView, cellFastener);
      }
    }
  }

  protected onSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                 cellFastener: ControllerFastener<this, CellController>): void {
    if (oldCellContentView !== null) {
      this.detachCellContentView(oldCellContentView, cellFastener);
    }
    if (newCellContentView !== null) {
      this.attachCellContentView(newCellContentView, cellFastener);
      this.initCellContentView(newCellContentView, cellFastener);
    }
  }

  protected didSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                  cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellContentView !== void 0) {
        controllerObserver.controllerDidSetCellContentView(newCellContentView, oldCellContentView, cellFastener);
      }
    }
  }

  protected willSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                            cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetCellIcon !== void 0) {
        controllerObserver.controllerWillSetCellIcon(newCellIcon, oldCellIcon, cellFastener);
      }
    }
  }

  protected onSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                          cellFastener: ControllerFastener<this, CellController>): void {
    // hook
  }

  protected didSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null,
                           cellFastener: ControllerFastener<this, CellController>): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetCellIcon !== void 0) {
        controllerObserver.controllerDidSetCellIcon(newCellIcon, oldCellIcon, cellFastener);
      }
    }
  }

  /** @hidden */
  static CellFastener = ControllerFastener.define<LeafController, CellController, never, ControllerObserverType<CellController | TextCellController | IconCellController>>({
    type: CellController,
    child: false,
    observe: true,
    willSetController(newCellController: CellController | null, oldCellController: CellController | null): void {
      this.owner.willSetCell(newCellController, oldCellController, this);
    },
    onSetController(newCellController: CellController | null, oldCellController: CellController | null): void {
      this.owner.onSetCell(newCellController, oldCellController, this);
    },
    didSetController(newCellController: CellController | null, oldCellController: CellController | null): void {
      this.owner.didSetCell(newCellController, oldCellController, this);
    },
    controllerWillSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait, this);
    },
    controllerDidSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait, this);
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait, this);
    },
    controllerWillSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.willSetCellView(newCellView, oldCellView, this);
    },
    controllerDidSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.onSetCellView(newCellView, oldCellView, this);
      this.owner.didSetCellView(newCellView, oldCellView, this);
    },
    controllerDidPressCellView(input: PositionGestureInput, event: Event | null, cellView: CellView): void {
      this.owner.didPressCellView(input, event, cellView, this);
    },
    controllerDidLongPressCellView(input: PositionGestureInput, cellView: CellView): void {
      this.owner.didLongPressCellView(input, cellView, this);
    },
    controllerWillSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.willSetCellContentView(newCellContentView, oldCellContentView, this);
    },
    controllerDidSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.onSetCellContentView(newCellContentView, oldCellContentView, this);
      this.owner.didSetCellContentView(newCellContentView, oldCellContentView, this);
    },
    controllerWillSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null): void {
      this.owner.willSetCellIcon(newCellIcon, oldCellIcon, this);
    },
    controllerDidSetCellIcon(newCellIcon: Graphics | null, oldCellIcon: Graphics | null): void {
      this.owner.onSetCellIcon(newCellIcon, oldCellIcon, this);
      this.owner.didSetCellIcon(newCellIcon, oldCellIcon, this);
    },
  });

  protected createCellFastener(cellController: CellController): ControllerFastener<this, CellController> {
    return new LeafController.CellFastener(this, cellController.key, "cell");
  }

  /** @hidden */
  readonly cellFasteners!: ReadonlyArray<ControllerFastener<this, CellController>>;

  protected getCellFastener(cellTrait: CellTrait): ControllerFastener<this, CellController> | null {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      const cellController = cellFastener.controller;
      if (cellController !== null && cellController.cell.trait === cellTrait) {
        return cellFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.mount();
    }
  }

  /** @hidden */
  protected unmountCellFasteners(): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      cellFastener.unmount();
    }
  }

  protected detectCellController(controller: Controller): CellController | null {
    return controller instanceof CellController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const cellController = this.detectCellController(childController);
    if (cellController !== null) {
      this.insertCell(cellController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const cellController = this.detectCellController(childController);
    if (cellController !== null) {
      this.removeCell(cellController);
    }
  }

  /** @hidden */
  protected override mountControllerFasteners(): void {
    super.mountControllerFasteners();
    this.mountCellFasteners();
  }

  /** @hidden */
  protected override unmountControllerFasteners(): void {
    this.unmountCellFasteners();
    super.unmountControllerFasteners();
  }
}
