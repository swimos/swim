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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import {Controller, TraitViewRef, TraitViewControllerRef} from "@swim/controller";
import {LeafController} from "../leaf/LeafController";
import {RowView} from "./RowView";
import {RowTrait} from "./RowTrait";
import type {RowControllerObserver} from "./RowControllerObserver";
import type {TableView} from "../table/TableView";
import type {TableTrait} from "../table/TableTrait";
import {TableController} from "../"; // forward import

/** @public */
export class RowController extends LeafController {
  override readonly observerType?: Class<RowControllerObserver>;

  @TraitViewRef<RowController["row"]>({
    traitType: RowTrait,
    observesTrait: true,
    initTrait(rowTrait: RowTrait): void {
      if (this.owner.leaf.trait === null) {
        this.owner.leaf.setTrait(rowTrait);
      }
      const treeTrait = rowTrait.tree.trait;
      if (treeTrait !== null) {
        this.owner.tree.setTrait(treeTrait);
      }
    },
    deinitTrait(rowTrait: RowTrait): void {
      const treeTrait = rowTrait.tree.trait;
      if (treeTrait !== null) {
        this.owner.tree.deleteTrait(treeTrait);
      }
      if (this.owner.leaf.trait === rowTrait) {
        this.owner.leaf.setTrait(null);
      }
    },
    willAttachTrait(rowTrait: RowTrait): void {
      this.owner.callObservers("controllerWillAttachRowTrait", rowTrait, this.owner);
    },
    didDetachTrait(rowTrait: RowTrait): void {
      this.owner.callObservers("controllerDidDetachRowTrait", rowTrait, this.owner);
    },
    traitWillAttachTree(treeTrait: TableTrait): void {
      this.owner.tree.setTrait(treeTrait);
    },
    traitDidDetachTree(treeTrait: TableTrait): void {
      this.owner.tree.deleteTrait(treeTrait);
    },
    viewType: RowView,
    observesView: true,
    initView(rowView: RowView): void {
      if (this.owner.leaf.view === null) {
        const leafView = rowView.leaf.insertView();
        this.owner.leaf.setView(leafView);
      }
      const treeController = this.owner.tree.controller;
      if (treeController !== null) {
        treeController.table.insertView(rowView);
      }
    },
    willAttachView(rowView: RowView): void {
      this.owner.callObservers("controllerWillAttachRowView", rowView, this.owner);
    },
    didDetachView(rowView: RowView): void {
      this.owner.callObservers("controllerDidDetachRowView", rowView, this.owner);
    },
    viewWillExpand(rowView: RowView): void {
      this.owner.callObservers("controllerWillExpandRowView", rowView, this.owner);
    },
    viewDidExpand(rowView: RowView): void {
      this.owner.callObservers("controllerDidExpandRowView", rowView, this.owner);
    },
    viewWillCollapse(rowView: RowView): void {
      this.owner.callObservers("controllerWillCollapseRowView", rowView, this.owner);
    },
    viewDidCollapse(rowView: RowView): void {
      this.owner.callObservers("controllerDidCollapseRowView", rowView, this.owner);
    },
    viewWillAttachTree(treeView: TableView): void {
      const treeController = this.owner.tree.controller;
      if (treeController !== null) {
        treeController.table.setView(treeView);
      }
    },
  })
  readonly row!: TraitViewRef<this, RowTrait, RowView> & Observes<RowTrait & RowView>;
  static readonly row: FastenerClass<RowController["row"]>;

  @TraitViewControllerRef<RowController["tree"]>({
    // avoid cyclic static reference to controllerType: TableController
    binds: true,
    observes: true,
    get parentView(): RowView | null {
      return this.owner.row.view;
    },
    getTraitViewRef(treeController: TableController): TraitViewRef<unknown, TableTrait, TableView> {
      return treeController.table;
    },
    initController(treeController: TableController): void {
      const treeTrait = treeController.table.trait;
      if (treeTrait !== null) {
        this.attachTreeTrait(treeTrait, treeController);
      }
      const treeView = treeController.table.view;
      if (treeView !== null) {
        this.attachTreeView(treeView, treeController);
      }
      const rowTrait = this.owner.row.trait;
      if (rowTrait !== null) {
        const treeTrait = rowTrait.tree.trait;
        if (treeTrait !== null) {
          treeController.table.setTrait(treeTrait);
        }
      }
    },
    deinitController(treeController: TableController): void {
      const treeTrait = treeController.table.trait;
      if (treeTrait !== null) {
        this.detachTreeTrait(treeTrait, treeController);
      }
      const treeView = treeController.table.view;
      if (treeView !== null) {
        this.detachTreeView(treeView, treeController);
      }
    },
    willAttachController(treeController: TableController): void {
      this.owner.callObservers("controllerWillAttachTree", treeController, this.owner);
    },
    didDetachController(treeController: TableController): void {
      this.owner.callObservers("controllerDidDetachTree", treeController, this.owner);
    },
    controllerWillAttachTreeTrait(treeTrait: TableTrait, treeController: TableController): void {
      this.owner.callObservers("controllerWillAttachTreeTrait", treeTrait, treeController, this.owner);
      this.attachTreeTrait(treeTrait, treeController);
    },
    controllerDidDetachTreeTrait(treeTrait: TableTrait, treeController: TableController): void {
      this.detachTreeTrait(treeTrait, treeController);
      this.owner.callObservers("controllerDidDetachTreeTrait", treeTrait, treeController, this.owner);
    },
    attachTreeTrait(treeTrait: TableTrait, treeController: TableController): void {
      // hook
    },
    detachTreeTrait(treeTrait: TableTrait, treeController: TableController): void {
      // hook
    },
    controllerWillAttachTableView(treeView: TableView, treeController: TableController): void {
      this.owner.callObservers("controllerWillAttachTreeView", treeView, treeController, this.owner);
      this.attachTreeView(treeView, treeController);
    },
    controllerDidDetachTableView(treeView: TableView, treeController: TableController): void {
      this.detachTreeView(treeView, treeController);
      this.owner.callObservers("controllerDidDetachTreeView", treeView, treeController, this.owner);
    },
    attachTreeView(treeView: TableView, treeController: TableController): void {
      // hook
    },
    detachTreeView(treeView: TableView, treeController: TableController): void {
      treeView.remove();
    },
    detectController(controller: Controller): TableController | null {
      return controller instanceof TableController ? controller : null;
    },
    createController(): TableController {
      return TableController.create();
    },
  })
  readonly tree!: TraitViewControllerRef<this, TableTrait, TableView, TableController> & Observes<TableController> & {
    attachTreeTrait(treeTrait: TableTrait, treeController: TableController): void;
    detachTreeTrait(treeTrait: TableTrait, treeController: TableController): void;
    attachTreeView(treeView: TableView, treeController: TableController): void;
    detachTreeView(treeView: TableView, treeController: TableController): void;
  };
  static readonly tree: FastenerClass<RowController["tree"]>;
}
