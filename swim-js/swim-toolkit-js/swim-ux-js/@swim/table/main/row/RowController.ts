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
import type {View} from "@swim/view";
import {Controller, ControllerViewTrait, ControllerFastener} from "@swim/controller";
import {LeafController} from "../leaf/LeafController";
import {RowView} from "./RowView";
import {RowTrait} from "./RowTrait";
import type {RowControllerObserver} from "./RowControllerObserver";
import type {TableView} from "../table/TableView";
import type {TableTrait} from "../table/TableTrait";
import {TableController} from "../"; // forward import

export class RowController extends LeafController {
  override readonly controllerObservers!: ReadonlyArray<RowControllerObserver>;

  protected initRowTrait(rowTrait: RowTrait): void {
    // hook
  }

  protected attachRowTrait(rowTrait: RowTrait): void {
    if (this.leaf.trait === null) {
      this.leaf.setTrait(rowTrait);
    }
    const treeTrait = rowTrait.tree.trait;
    if (treeTrait !== null) {
      this.insertTreeTrait(treeTrait);
    }
  }

  protected detachRowTrait(rowTrait: RowTrait): void {
    const treeTrait = rowTrait.tree.trait;
    if (treeTrait !== null) {
      this.removeTreeTrait(treeTrait);
    }
    if (this.leaf.trait === rowTrait) {
      this.leaf.setTrait(null);
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
    if (this.leaf.view === null) {
      const leafView = rowView.leaf.injectView();
      this.leaf.setView(leafView);
    }
    const treeController = this.tree.controller;
    if (treeController !== null) {
      treeController.table.injectView(rowView);
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

  protected willExpandRowView(rowView: RowView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillExpandRowView !== void 0) {
        controllerObserver.controllerWillExpandRowView(rowView, this);
      }
    }
  }

  protected onExpandRowView(rowView: RowView): void {
    // hook
  }

  protected didExpandRowView(rowView: RowView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidExpandRowView !== void 0) {
        controllerObserver.controllerDidExpandRowView(rowView, this);
      }
    }
  }

  protected willCollapseRowView(rowView: RowView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillCollapseRowView !== void 0) {
        controllerObserver.controllerWillCollapseRowView(rowView, this);
      }
    }
  }

  protected onCollapseRowView(rowView: RowView): void {
    // hook
  }

  protected didCollapseRowView(rowView: RowView): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidCollapseRowView !== void 0) {
        controllerObserver.controllerDidCollapseRowView(rowView, this);
      }
    }
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
    viewWillExpand(rowView: RowView): void {
      this.owner.willExpandRowView(rowView);
      this.owner.onExpandRowView(rowView);
    },
    viewDidExpand(rowView: RowView): void {
      this.owner.didExpandRowView(rowView);
    },
    viewWillCollapse(rowView: RowView): void {
      this.owner.willCollapseRowView(rowView);
    },
    viewDidCollapse(rowView: RowView): void {
      this.owner.onCollapseRowView(rowView);
      this.owner.didCollapseRowView(rowView);
    },
    viewDidSetTree(newTreeView: TableView | null, oldTreeView: TableView | null, targetView: View | null): void {
      const treeController = this.owner.tree.controller;
      if (treeController !== null) {
        treeController.table.setView(newTreeView);
      }
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
    traitWillSetTree(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
      if (oldTreeTrait !== null) {
        this.owner.removeTreeTrait(oldTreeTrait);
      }
    },
    traitDidSetTree(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null, targetTrait: Trait | null): void {
      if (newTreeTrait !== null) {
        this.owner.insertTreeTrait(newTreeTrait, targetTrait);
      }
    },
  });

  @ControllerViewTrait<RowController, RowView, RowTrait>({
    extends: RowController.RowFastener,
  })
  readonly row!: ControllerViewTrait<this, RowView, RowTrait>;

  protected createTree(treeTrait: TableTrait): TableController | null {
    return new TableController();
  }

  protected initTree(treeController: TableController): void {
    const rowTrait = this.row.trait;
    if (rowTrait !== null) {
      const treeTrait = rowTrait.tree.trait;
      if (treeTrait !== null) {
        treeController.table.setTrait(treeTrait);
      }
    }

    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.initTreeTrait(treeTrait);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.initTreeView(treeView);
    }
  }

  protected attachTree(treeController: TableController): void {
    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.attachTreeTrait(treeTrait);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.attachTreeView(treeView);
    }
  }

  protected detachTree(treeController: TableController): void {
    const treeTrait = treeController.table.trait;
    if (treeTrait !== null) {
      this.detachTreeTrait(treeTrait);
    }
    const treeView = treeController.table.view;
    if (treeView !== null) {
      this.detachTreeView(treeView);
    }
  }

  protected willSetTree(newTreeController: TableController | null, oldTreeController: TableController | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTree !== void 0) {
        controllerObserver.controllerWillSetTree(newTreeController, oldTreeController, this);
      }
    }
  }

  protected onSetTree(newTreeController: TableController | null, oldTreeController: TableController | null): void {
    if (oldTreeController !== null) {
      this.detachTree(oldTreeController);
    }
    if (newTreeController !== null) {
      this.attachTree(newTreeController);
      this.initTree(newTreeController);
    }
  }

  protected didSetTree(newTreeController: TableController | null, oldTreeController: TableController | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTree !== void 0) {
        controllerObserver.controllerDidSetTree(newTreeController, oldTreeController, this);
      }
    }
  }

  protected insertTreeTrait(treeTrait: TableTrait, targetTrait: Trait | null = null): void {
    const childControllers = this.childControllers;
    let targetController: TableController | null = null;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof TableController) {
        if (childController.table.trait === treeTrait) {
          return;
        } else if (childController.table.trait === targetTrait) {
          targetController = childController;
        }
      }
    }
    const treeController = this.createTree(treeTrait);
    if (treeController instanceof TableController) {
      treeController.table.setTrait(treeTrait);
      this.tree.setController(treeController, targetController);
      this.insertChildController(treeController, targetController);
      if (treeController.table.view === null) {
        const treeView = treeController.table.createView();
        let targetView: TableView | null = null;
        if (targetController !== null) {
          targetView = targetController.table.view;
        }
        const rowView = this.row.view;
        if (rowView !== null) {
          treeController.table.injectView(rowView, treeView, targetView, null);
        } else {
          treeController.table.setView(treeView, targetView);
        }
      }
    }
  }

  protected removeTreeTrait(treeTrait: TableTrait): void {
    const childControllers = this.childControllers;
    for (let i = 0, n = childControllers.length; i < n; i += 1) {
      const childController = childControllers[i]!;
      if (childController instanceof TableController && childController.table.trait === treeTrait) {
        this.tree.setController(null);
        childController.remove();
        return;
      }
    }
  }

  protected initTreeTrait(treeTrait: TableTrait): void {
    // hook
  }

  protected attachTreeTrait(treeTrait: TableTrait): void {
    // hook
  }

  protected detachTreeTrait(treeTrait: TableTrait): void {
    // hook
  }

  protected willSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTreeTrait !== void 0) {
        controllerObserver.controllerWillSetTreeTrait(newTreeTrait, oldTreeTrait, this);
      }
    }
  }

  protected onSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
    if (oldTreeTrait !== null) {
      this.detachTreeTrait(oldTreeTrait);
    }
    if (newTreeTrait !== null) {
      this.attachTreeTrait(newTreeTrait);
      this.initTreeTrait(newTreeTrait);
    }
  }

  protected didSetTreeTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTreeTrait !== void 0) {
        controllerObserver.controllerDidSetTreeTrait(newTreeTrait, oldTreeTrait, this);
      }
    }
  }

  protected initTreeView(treeView: TableView): void {
    // hook
  }

  protected attachTreeView(treeView: TableView): void {
    // hook
  }

  protected detachTreeView(treeView: TableView): void {
    treeView.remove();
  }

  protected willSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerWillSetTreeView !== void 0) {
        controllerObserver.controllerWillSetTreeView(newTreeView, oldTreeView, this);
      }
    }
  }

  protected onSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    if (oldTreeView !== null) {
      this.detachTreeView(oldTreeView);
    }
    if (newTreeView !== null) {
      this.attachTreeView(newTreeView);
      this.initTreeView(newTreeView);
    }
  }

  protected didSetTreeView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    const controllerObservers = this.controllerObservers;
    for (let i = 0, n = controllerObservers.length; i < n; i += 1) {
      const controllerObserver = controllerObservers[i]!;
      if (controllerObserver.controllerDidSetTreeView !== void 0) {
        controllerObserver.controllerDidSetTreeView(newTreeView, oldTreeView, this);
      }
    }
  }

  /** @hidden */
  static TreeFastener = ControllerFastener.define<RowController, TableController>({
    // avoid cyclic reference to type: TableController
    observe: true,
    willSetController(newTreeController: TableController | null, oldTreeController: TableController | null): void {
      this.owner.willSetTree(newTreeController, oldTreeController);
    },
    onSetController(newTreeController: TableController | null, oldTreeController: TableController | null): void {
      this.owner.onSetTree(newTreeController, oldTreeController);
    },
    didSetController(newTreeController: TableController | null, oldTreeController: TableController | null): void {
      this.owner.didSetTree(newTreeController, oldTreeController);
    },
    controllerWillSetTableTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
      this.owner.willSetTreeTrait(newTreeTrait, oldTreeTrait);
    },
    controllerDidSetTableTrait(newTreeTrait: TableTrait | null, oldTreeTrait: TableTrait | null): void {
      this.owner.onSetTreeTrait(newTreeTrait, oldTreeTrait);
      this.owner.didSetTreeTrait(newTreeTrait, oldTreeTrait);
    },
    controllerWillSetTableView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.willSetTreeView(newTreeView, oldTreeView);
    },
    controllerDidSetTableView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.onSetTreeView(newTreeView, oldTreeView);
      this.owner.didSetTreeView(newTreeView, oldTreeView);
    },
  });

  @ControllerFastener<RowController, TableController>({
    extends: RowController.TreeFastener,
  })
  readonly tree!: ControllerFastener<this, TableController>;

  protected detectTreeController(controller: Controller): TableController | null {
    return controller instanceof TableController ? controller : null;
  }

  protected override onInsertChildController(childController: Controller, targetController: Controller | null): void {
    super.onInsertChildController(childController, targetController);
    const treeController = this.detectTreeController(childController);
    if (treeController !== null) {
      this.tree.setController(treeController, targetController);
    }
  }

  protected override onRemoveChildController(childController: Controller): void {
    super.onRemoveChildController(childController);
    const treeController = this.detectTreeController(childController);
    if (treeController !== null) {
      this.tree.setController(null);
    }
  }
}
