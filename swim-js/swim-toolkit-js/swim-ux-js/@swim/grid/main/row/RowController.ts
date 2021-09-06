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

import type {Timing} from "@swim/mapping";
import type {Trait} from "@swim/model";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {HtmlView} from "@swim/dom";
import {Controller, ControllerViewTrait, ControllerFastener, CompositeController} from "@swim/controller";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import {CellController} from "../cell/CellController";
import {RowView} from "./RowView";
import {RowTrait} from "./RowTrait";
import type {RowControllerObserver} from "./RowControllerObserver";

export class RowController extends CompositeController {
  constructor() {
    super();
    Object.defineProperty(this, "cellFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly controllerObservers!: ReadonlyArray<RowControllerObserver>;

  protected initRowTrait(rowTrait: RowTrait): void {
    // hook
  }

  protected attachRowTrait(rowTrait: RowTrait): void {
    const cellFasteners = rowTrait.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        this.insertCellTrait(cellTrait);
      }
    }
  }

  protected detachRowTrait(rowTrait: RowTrait): void {
    const cellFasteners = rowTrait.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellTrait = cellFasteners[i]!.trait;
      if (cellTrait !== null) {
        this.removeCellTrait(cellTrait);
      }
    }
  }

  protected willSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRowTrait !== void 0) {
        controllerObserver.controllerWillSetRowTrait(newRowTrait, oldRowTrait, this);
      }
    }
  }

  protected onSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
    if (oldRowTrait !== null) {
      this.detachRowTrait(oldRowTrait);
    }
    if (newRowTrait !== null) {
      this.attachRowTrait(newRowTrait);
      this.initRowTrait(newRowTrait);
    }
  }

  protected didSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRowTrait !== void 0) {
        controllerObserver.controllerDidSetRowTrait(newRowTrait, oldRowTrait, this);
      }
    }
  }

  protected createRowView(): RowView | null {
    return RowView.create();
  }

  protected initRowView(rowView: RowView): void {
    // hook
  }

  protected attachRowView(rowView: RowView): void {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellController = cellFasteners[i]!.controller;
      if (cellController !== null) {
        const cellView = cellController.cell.view;
        if (cellView !== null && cellView.parentView === null) {
          const cellTrait = cellController.cell.trait;
          if (cellTrait !== null) {
            cellController.cell.injectView(rowView, void 0, void 0, cellTrait.key);
          }
        }
      }
    }
  }

  protected detachRowView(rowView: RowView): void {
    // hook
  }

  protected willSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetRowView !== void 0) {
        controllerObserver.controllerWillSetRowView(newRowView, oldRowView, this);
      }
    }
  }

  protected onSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
    if (oldRowView !== null) {
      this.detachRowView(oldRowView);
    }
    if (newRowView !== null) {
      this.attachRowView(newRowView);
      this.initRowView(newRowView);
    }
  }

  protected didSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetRowView !== void 0) {
        controllerObserver.controllerDidSetRowView(newRowView, oldRowView, this);
      }
    }
  }

  protected themeRowView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, rowView: RowView): void {
    // hook
  }

  /** @hidden */
  static RowFastener = ControllerViewTrait.define<RowController, RowView, RowTrait>({
    viewType: RowView,
    observeView: true,
    willSetView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.willSetRowView(newRowView, oldRowView);
    },
    onSetView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.onSetRowView(newRowView, oldRowView);
    },
    didSetView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.didSetRowView(newRowView, oldRowView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, rowView: RowView): void {
      this.owner.themeRowView(theme, mood, timing, rowView);
    },
    createView(): RowView | null {
      return this.owner.createRowView();
    },
    traitType: RowTrait,
    observeTrait: true,
    willSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.willSetRowTrait(newRowTrait, oldRowTrait);
    },
    onSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.onSetRowTrait(newRowTrait, oldRowTrait);
    },
    didSetTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.didSetRowTrait(newRowTrait, oldRowTrait);
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

  @ControllerViewTrait<RowController, RowView, RowTrait>({
    extends: RowController.RowFastener,
  })
  readonly row!: ControllerViewTrait<this, RowView, RowTrait>;

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
    return new CellController();
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
        const rowView = this.row.view;
        if (rowView !== null) {
          cellController.cell.injectView(rowView, cellView, targetView, cellTrait.key);
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
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.initCellContentView(cellContentView, cellFastener);
    }
  }

  protected attachCellView(cellView: CellView, cellFastener: ControllerFastener<this, CellController>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.attachCellContentView(cellContentView, cellFastener);
    }
  }

  protected detachCellView(cellView: CellView, cellFastener: ControllerFastener<this, CellController>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.detachCellContentView(cellContentView, cellFastener);
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

  /** @hidden */
  static CellFastener = ControllerFastener.define<RowController, CellController>({
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
    controllerWillSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.willSetCellContentView(newCellContentView, oldCellContentView, this);
    },
    controllerDidSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.onSetCellContentView(newCellContentView, oldCellContentView, this);
      this.owner.didSetCellContentView(newCellContentView, oldCellContentView, this);
    },
  });

  protected createCellFastener(cellController: CellController): ControllerFastener<this, CellController> {
    return new RowController.CellFastener(this, cellController.key, "cell");
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
