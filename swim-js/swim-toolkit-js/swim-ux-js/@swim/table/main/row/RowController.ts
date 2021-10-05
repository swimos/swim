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
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import {TraitViewFastener, ControllerFastener, Controller} from "@swim/controller";
import {LeafController} from "../leaf/LeafController";
import {RowView} from "./RowView";
import {RowTrait} from "./RowTrait";
import type {RowControllerObserver} from "./RowControllerObserver";
import type {TableView} from "../table/TableView";
import type {TableTrait} from "../table/TableTrait";
import {TableController} from "../"; // forward import

export class RowController extends LeafController {
  override readonly observerType?: Class<RowControllerObserver>;

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetRowTrait !== void 0) {
        observer.controllerWillSetRowTrait(newRowTrait, oldRowTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetRowTrait !== void 0) {
        observer.controllerDidSetRowTrait(newRowTrait, oldRowTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetRowView !== void 0) {
        observer.controllerWillSetRowView(newRowView, oldRowView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetRowView !== void 0) {
        observer.controllerDidSetRowView(newRowView, oldRowView, this);
      }
    }
  }

  protected willExpandRowView(rowView: RowView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillExpandRowView !== void 0) {
        observer.controllerWillExpandRowView(rowView, this);
      }
    }
  }

  protected onExpandRowView(rowView: RowView): void {
    // hook
  }

  protected didExpandRowView(rowView: RowView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidExpandRowView !== void 0) {
        observer.controllerDidExpandRowView(rowView, this);
      }
    }
  }

  protected willCollapseRowView(rowView: RowView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillCollapseRowView !== void 0) {
        observer.controllerWillCollapseRowView(rowView, this);
      }
    }
  }

  protected onCollapseRowView(rowView: RowView): void {
    // hook
  }

  protected didCollapseRowView(rowView: RowView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidCollapseRowView !== void 0) {
        observer.controllerDidCollapseRowView(rowView, this);
      }
    }
  }

  /** @internal */
  static RowFastener = TraitViewFastener.define<RowController, RowTrait, RowView>({
    traitType: RowTrait,
    observesTrait: true,
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
    viewType: RowView,
    observesView: true,
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
  });

  @TraitViewFastener<RowController, RowTrait, RowView>({
    extends: RowController.RowFastener,
  })
  readonly row!: TraitViewFastener<this, RowTrait, RowView>;

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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTree !== void 0) {
        observer.controllerWillSetTree(newTreeController, oldTreeController, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTree !== void 0) {
        observer.controllerDidSetTree(newTreeController, oldTreeController, this);
      }
    }
  }

  protected insertTreeTrait(treeTrait: TableTrait, targetTrait: Trait | null = null): void {
    const children = this.children;
    let targetController: TableController | null = null;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const childController = children[i]!;
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
      this.insertChild(treeController, targetController);
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
    const children = this.children;
    for (let i = 0, n = children.length; i < n; i += 1) {
      const childController = children[i]!;
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTreeTrait !== void 0) {
        observer.controllerWillSetTreeTrait(newTreeTrait, oldTreeTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTreeTrait !== void 0) {
        observer.controllerDidSetTreeTrait(newTreeTrait, oldTreeTrait, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerWillSetTreeView !== void 0) {
        observer.controllerWillSetTreeView(newTreeView, oldTreeView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.controllerDidSetTreeView !== void 0) {
        observer.controllerDidSetTreeView(newTreeView, oldTreeView, this);
      }
    }
  }

  /** @internal */
  static TreeFastener = ControllerFastener.define<RowController, TableController>({
    // avoid cyclic reference to type: TableController
    child: true,
    observes: true,
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

  protected override onInsertChild(childController: Controller, targetController: Controller | null): void {
    super.onInsertChild(childController, targetController);
    const treeController = this.detectTreeController(childController);
    if (treeController !== null) {
      this.tree.setController(treeController, targetController);
    }
  }

  protected override onRemoveChild(childController: Controller): void {
    super.onRemoveChild(childController);
    const treeController = this.detectTreeController(childController);
    if (treeController !== null) {
      this.tree.setController(null);
    }
  }
}
