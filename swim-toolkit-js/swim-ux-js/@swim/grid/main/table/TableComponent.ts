// Copyright 2015-2021 Swim inc.
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
import {View} from "@swim/view";
import type {HtmlView} from "@swim/dom";
import {Component, ComponentViewTrait, ComponentFastener, CompositeComponent} from "@swim/component";
import type {TableLayout} from "../layout/TableLayout";
import type {ColLayout} from "../layout/ColLayout";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import type {CellComponent} from "../cell/CellComponent";
import type {ColView} from "../col/ColView";
import type {ColTrait} from "../col/ColTrait";
import {ColComponent} from "../col/ColComponent";
import type {RowView} from "../row/RowView";
import type {RowTrait} from "../row/RowTrait";
import {RowComponent} from "../row/RowComponent";
import {TableView} from "./TableView";
import {TableTrait} from "./TableTrait";
import type {TableComponentObserver} from "./TableComponentObserver";

export class TableComponent extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "colFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "rowFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<TableComponentObserver>;

  protected layoutTable(tableLayout: TableLayout, tableView: TableView): void {
    tableView.layout.setState(tableLayout, View.Intrinsic);
  }

  protected initTableTrait(tableTrait: TableTrait): void {
    const tableLayout = tableTrait.layout.state;
    if (tableLayout !== null) {
      const tableView = this.table.view;
      if (tableView !== null) {
        this.layoutTable(tableLayout, tableView);
      }
    }
  }

  protected attachTableTrait(tableTrait: TableTrait): void {
    const colFasteners = tableTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.insertColTrait(colTrait);
      }
    }

    const rowFasteners = tableTrait.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        this.insertRowTrait(rowTrait);
      }
    }
  }

  protected detachTableTrait(tableTrait: TableTrait): void {
    const rowFasteners = tableTrait.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowTrait = rowFasteners[i]!.trait;
      if (rowTrait !== null) {
        this.removeRowTrait(rowTrait);
      }
    }

    const colFasteners = tableTrait.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colTrait = colFasteners[i]!.trait;
      if (colTrait !== null) {
        this.removeColTrait(colTrait);
      }
    }
  }

  protected willSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTableTrait !== void 0) {
        componentObserver.componentWillSetTableTrait(newTableTrait, oldTableTrait, this);
      }
    }
  }

  protected onSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    if (oldTableTrait !== null) {
      this.detachTableTrait(oldTableTrait);
    }
    if (newTableTrait !== null) {
      this.attachTableTrait(newTableTrait);
      this.initTableTrait(newTableTrait);
    }
  }

  protected didSetTableTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTableTrait !== void 0) {
        componentObserver.componentDidSetTableTrait(newTableTrait, oldTableTrait, this);
      }
    }
  }

  protected willSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTableLayout !== void 0) {
        componentObserver.componentWillSetTableLayout(newTableLayout, oldTableLayout, this);
      }
    }
  }

  protected onSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    // hook
  }

  protected didSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTableLayout !== void 0) {
        componentObserver.componentDidSetTableLayout(newTableLayout, oldTableLayout, this);
      }
    }
  }

  protected createTableView(): TableView | null {
    return TableView.create();
  }

  protected initTableView(tableView: TableView): void {
    const tableTrait = this.table.trait;
    if (tableTrait !== null) {
      const tableLayout = tableTrait.layout.state;
      if (tableLayout !== null) {
        this.layoutTable(tableLayout, tableView);
      }
    }
  }

  protected attachTableView(tableView: TableView): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowComponent = rowFasteners[i]!.component;
      if (rowComponent !== null) {
        const rowView = rowComponent.row.view;
        if (rowView !== null && rowView.parentView === null) {
          rowComponent.row.injectView(tableView);
        }
      }
    }
  }

  protected detachTableView(tableView: TableView): void {
    // hook
  }

  protected willSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetTableView !== void 0) {
        componentObserver.componentWillSetTableView(newTableView, oldTableView, this);
      }
    }
  }

  protected onSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    if (oldTableView !== null) {
      this.detachTableView(oldTableView);
    }
    if (newTableView !== null) {
      this.attachTableView(newTableView);
      this.initTableView(newTableView);
    }
  }

  protected didSetTableView(newTableView: TableView | null, oldTableView: TableView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetTableView !== void 0) {
        componentObserver.componentDidSetTableView(newTableView, oldTableView, this);
      }
    }
  }

  protected themeTableView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, tableView: TableView): void {
    // hook
  }

  /** @hidden */
  static TableFastener = ComponentViewTrait.define<TableComponent, TableView, TableTrait>({
    viewType: TableView,
    observeView: true,
    willSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.willSetTableView(newTableView, oldTableView);
    },
    onSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.onSetTableView(newTableView, oldTableView);
    },
    didSetView(newTableView: TableView | null, oldTableView: TableView | null): void {
      this.owner.didSetTableView(newTableView, oldTableView);
    },
    viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, tableView: TableView): void {
      this.owner.themeTableView(theme, mood, timing, tableView);
    },
    createView(): TableView | null {
      return this.owner.createTableView();
    },
    traitType: TableTrait,
    observeTrait: true,
    willSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.willSetTableTrait(newTableTrait, oldTableTrait);
    },
    onSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.onSetTableTrait(newTableTrait, oldTableTrait);
    },
    didSetTrait(newTableTrait: TableTrait | null, oldTableTrait: TableTrait | null): void {
      this.owner.didSetTableTrait(newTableTrait, oldTableTrait);
    },
    traitWillSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.willSetTableLayout(newTableLayout, oldTableLayout);
    },
    traitDidSetTableLayout(newTableLayout: TableLayout | null, oldTableLayout: TableLayout | null): void {
      this.owner.onSetTableLayout(newTableLayout, oldTableLayout);
      this.owner.didSetTableLayout(newTableLayout, oldTableLayout);
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
    traitWillSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait): void {
      if (oldRowTrait !== null) {
        this.owner.removeRowTrait(oldRowTrait);
      }
    },
    traitDidSetRow(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null, targetTrait: Trait): void {
      if (newRowTrait !== null) {
        this.owner.insertRowTrait(newRowTrait, targetTrait);
      }
    },
  });

  @ComponentViewTrait<TableComponent, TableView, TableTrait>({
    extends: TableComponent.TableFastener,
  })
  readonly table!: ComponentViewTrait<this, TableView, TableTrait>;

  insertCol(colComponent: ColComponent, targetComponent: Component | null = null): void {
    const colFasteners = this.colFasteners as ComponentFastener<this, ColComponent>[];
    let targetIndex = colFasteners.length;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.component === colComponent) {
        return;
      } else if (colFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const colFastener = this.createColFastener(colComponent);
    colFasteners.splice(targetIndex, 0, colFastener);
    colFastener.setComponent(colComponent, targetComponent);
    if (this.isMounted()) {
      colFastener.mount();
    }
  }

  removeCol(colComponent: ColComponent): void {
    const colFasteners = this.colFasteners as ComponentFastener<this, ColComponent>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      if (colFastener.component === colComponent) {
        colFastener.setComponent(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createCol(colTrait: ColTrait): ColComponent | null {
    return new ColComponent();
  }

  protected initCol(colComponent: ColComponent, colFastener: ComponentFastener<this, ColComponent>): void {
    const colTrait = colComponent.col.trait;
    if (colTrait !== null) {
      this.initColTrait(colTrait, colFastener);
    }
    const colView = colComponent.col.view;
    if (colView !== null) {
      this.initColView(colView, colFastener);
    }
  }

  protected attachCol(colComponent: ColComponent, colFastener: ComponentFastener<this, ColComponent>): void {
    const colTrait = colComponent.col.trait;
    if (colTrait !== null) {
      this.attachColTrait(colTrait, colFastener);
    }
    const colView = colComponent.col.view;
    if (colView !== null) {
      this.attachColView(colView, colFastener);
    }
  }

  protected detachCol(colComponent: ColComponent, colFastener: ComponentFastener<this, ColComponent>): void {
    const colTrait = colComponent.col.trait;
    if (colTrait !== null) {
      this.detachColTrait(colTrait, colFastener);
    }
    const colView = colComponent.col.view;
    if (colView !== null) {
      this.detachColView(colView, colFastener);
    }
  }

  protected willSetCol(newColComponent: ColComponent | null, oldColComponent: ColComponent | null,
                       colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCol !== void 0) {
        componentObserver.componentWillSetCol(newColComponent, oldColComponent, colFastener);
      }
    }
  }

  protected onSetCol(newColComponent: ColComponent | null, oldColComponent: ColComponent | null,
                     colFastener: ComponentFastener<this, ColComponent>): void {
    if (oldColComponent !== null) {
      this.detachCol(oldColComponent, colFastener);
    }
    if (newColComponent !== null) {
      this.attachCol(newColComponent, colFastener);
      this.initCol(newColComponent, colFastener);
    }
  }

  protected didSetCol(newColComponent: ColComponent | null, oldColComponent: ColComponent | null,
                      colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCol !== void 0) {
        componentObserver.componentDidSetCol(newColComponent, oldColComponent, colFastener);
      }
    }
  }

  insertColTrait(colTrait: ColTrait, targetTrait: Trait | null = null): void {
    const colFasteners = this.colFasteners as ComponentFastener<this, ColComponent>[];
    let targetComponent: ColComponent | null = null;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colComponent = colFasteners[i]!.component;
      if (colComponent !== null) {
        if (colComponent.col.trait === colTrait) {
          return;
        } else if (colComponent.col.trait === targetTrait) {
          targetComponent = colComponent;
        }
      }
    }
    const colComponent = this.createCol(colTrait);
    if (colComponent !== null) {
      this.insertChildComponent(colComponent, targetComponent);
      colComponent.col.setTrait(colTrait);
    }
  }

  removeColTrait(colTrait: ColTrait): void {
    const colFasteners = this.colFasteners as ComponentFastener<this, ColComponent>[];
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colComponent = colFastener.component;
      if (colComponent !== null && colComponent.col.trait === colTrait) {
        colFastener.setComponent(null);
        if (this.isMounted()) {
          colFastener.unmount();
        }
        colFasteners.splice(i, 1);
        colComponent.remove();
        return;
      }
    }
  }

  protected initColTrait(colTrait: ColTrait | null, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected attachColTrait(colTrait: ColTrait | null, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected detachColTrait(colTrait: ColTrait | null, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected willSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                            colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColTrait !== void 0) {
        componentObserver.componentWillSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected onSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                          colFastener: ComponentFastener<this, ColComponent>): void {
    if (oldColTrait !== null) {
      this.detachColTrait(oldColTrait, colFastener);
    }
    if (newColTrait !== null) {
      this.attachColTrait(oldColTrait, colFastener);
      this.initColTrait(newColTrait, colFastener);
    }
  }

  protected didSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null,
                           colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColTrait !== void 0) {
        componentObserver.componentDidSetColTrait(newColTrait, oldColTrait, colFastener);
      }
    }
  }

  protected willSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                             colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColLayout !== void 0) {
        componentObserver.componentWillSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected onSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                           colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected didSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null,
                            colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColLayout !== void 0) {
        componentObserver.componentDidSetColLayout(newColLayout, oldColLayout, colFastener);
      }
    }
  }

  protected createColView(colComponent: ColComponent): ColView | null {
    return colComponent.col.createView();
  }

  protected initColView(colView: ColView, colFastener: ComponentFastener<this, ColComponent>): void {
    const colHeaderView = colView.header.view;
    if (colHeaderView !== null) {
      this.initColHeaderView(colHeaderView, colFastener);
    }
  }

  protected attachColView(colView: ColView, colFastener: ComponentFastener<this, ColComponent>): void {
    const colHeaderView = colView.header.view;
    if (colHeaderView !== null) {
      this.attachColHeaderView(colHeaderView, colFastener);
    }
  }

  protected detachColView(colView: ColView, colFastener: ComponentFastener<this, ColComponent>): void {
    const colHeaderView = colView.header.view;
    if (colHeaderView !== null) {
      this.detachColHeaderView(colHeaderView, colFastener);
    }
    colView.remove();
  }

  protected willSetColView(newColView: ColView | null, oldColView: ColView | null,
                           colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColView !== void 0) {
        componentObserver.componentWillSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected onSetColView(newColView: ColView | null, oldColView: ColView | null,
                         colFastener: ComponentFastener<this, ColComponent>): void {
    if (oldColView !== null) {
      this.detachColView(oldColView, colFastener);
    }
    if (newColView !== null) {
      this.attachColView(newColView, colFastener);
      this.initColView(newColView, colFastener);
    }
  }

  protected didSetColView(newColView: ColView | null, oldColView: ColView | null,
                          colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColView !== void 0) {
        componentObserver.componentDidSetColView(newColView, oldColView, colFastener);
      }
    }
  }

  protected initColHeaderView(colHeaderView: HtmlView, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected attachColHeaderView(colHeaderView: HtmlView, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected detachColHeaderView(colHeaderView: HtmlView, colFastener: ComponentFastener<this, ColComponent>): void {
    // hook
  }

  protected willSetColHeaderView(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null,
                                 colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetColHeaderView !== void 0) {
        componentObserver.componentWillSetColHeaderView(newColHeaderView, oldColHeaderView, colFastener);
      }
    }
  }

  protected onSetColHeaderView(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null,
                               colFastener: ComponentFastener<this, ColComponent>): void {
    if (oldColHeaderView !== null) {
      this.detachColHeaderView(oldColHeaderView, colFastener);
    }
    if (newColHeaderView !== null) {
      this.attachColHeaderView(newColHeaderView, colFastener);
      this.initColHeaderView(newColHeaderView, colFastener);
    }
  }

  protected didSetColHeaderView(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null,
                                colFastener: ComponentFastener<this, ColComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetColHeaderView !== void 0) {
        componentObserver.componentDidSetColHeaderView(newColHeaderView, oldColHeaderView, colFastener);
      }
    }
  }

  /** @hidden */
  static ColFastener = ComponentFastener.define<TableComponent, ColComponent>({
    type: ColComponent,
    child: false,
    observe: true,
    willSetComponent(newColComponent: ColComponent | null, oldColComponent: ColComponent | null): void {
      this.owner.willSetCol(newColComponent, oldColComponent, this);
    },
    onSetComponent(newColComponent: ColComponent | null, oldColComponent: ColComponent | null): void {
      this.owner.onSetCol(newColComponent, oldColComponent, this);
    },
    didSetComponent(newColComponent: ColComponent | null, oldColComponent: ColComponent | null): void {
      this.owner.didSetCol(newColComponent, oldColComponent, this);
    },
    componentWillSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.willSetColTrait(newColTrait, oldColTrait, this);
    },
    componentDidSetColTrait(newColTrait: ColTrait | null, oldColTrait: ColTrait | null): void {
      this.owner.onSetColTrait(newColTrait, oldColTrait, this);
      this.owner.didSetColTrait(newColTrait, oldColTrait, this);
    },
    componentWillSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.willSetColLayout(newColLayout, oldColLayout, this);
    },
    componentDidSetColLayout(newColLayout: ColLayout | null, oldColLayout: ColLayout | null): void {
      this.owner.onSetColLayout(newColLayout, oldColLayout, this);
      this.owner.didSetColLayout(newColLayout, oldColLayout, this);
    },
    componentWillSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.willSetColView(newColView, oldColView, this);
    },
    componentDidSetColView(newColView: ColView | null, oldColView: ColView | null): void {
      this.owner.onSetColView(newColView, oldColView, this);
      this.owner.didSetColView(newColView, oldColView, this);
    },
    componentWillSetColHeaderView(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null): void {
      this.owner.willSetColHeaderView(newColHeaderView, oldColHeaderView, this);
    },
    componentDidSetColHeaderView(newColHeaderView: HtmlView | null, oldColHeaderView: HtmlView | null): void {
      this.owner.onSetColHeaderView(newColHeaderView, oldColHeaderView, this);
      this.owner.didSetColHeaderView(newColHeaderView, oldColHeaderView, this);
    },
  });

  protected createColFastener(colComponent: ColComponent): ComponentFastener<this, ColComponent> {
    return new TableComponent.ColFastener(this, colComponent.key, "col");
  }

  /** @hidden */
  readonly colFasteners!: ReadonlyArray<ComponentFastener<this, ColComponent>>;

  protected getColFastener(colTrait: ColTrait): ComponentFastener<this, ColComponent> | null {
    const colFasteners = this.colFasteners;
    for (let i = 0, n = colFasteners.length; i < n; i += 1) {
      const colFastener = colFasteners[i]!;
      const colComponent = colFastener.component;
      if (colComponent !== null && colComponent.col.trait === colTrait) {
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

  insertRow(rowComponent: RowComponent, targetComponent: Component | null = null): void {
    const rowFasteners = this.rowFasteners as ComponentFastener<this, RowComponent>[];
    let targetIndex = rowFasteners.length;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.component === rowComponent) {
        return;
      } else if (rowFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const rowFastener = this.createRowFastener(rowComponent);
    rowFasteners.splice(targetIndex, 0, rowFastener);
    rowFastener.setComponent(rowComponent, targetComponent);
    if (this.isMounted()) {
      rowFastener.mount();
    }
  }

  removeRow(rowComponent: RowComponent): void {
    const rowFasteners = this.rowFasteners as ComponentFastener<this, RowComponent>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      if (rowFastener.component === rowComponent) {
        rowFastener.setComponent(null);
        if (this.isMounted()) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createRow(rowTrait: RowTrait): RowComponent | null {
    return new RowComponent();
  }

  protected initRow(rowComponent: RowComponent, rowFastener: ComponentFastener<this, RowComponent>): void {
    const rowTrait = rowComponent.row.trait;
    if (rowTrait !== null) {
      this.initRowTrait(rowTrait, rowFastener);
    }
    const rowView = rowComponent.row.view;
    if (rowView !== null) {
      this.initRowView(rowView, rowFastener);
    }
  }

  protected attachRow(rowComponent: RowComponent, rowFastener: ComponentFastener<this, RowComponent>): void {
    const rowTrait = rowComponent.row.trait;
    if (rowTrait !== null) {
      this.attachRowTrait(rowTrait, rowFastener);
    }
    const rowView = rowComponent.row.view;
    if (rowView !== null) {
      this.attachRowView(rowView, rowFastener);
    }
  }

  protected detachRow(rowComponent: RowComponent, rowFastener: ComponentFastener<this, RowComponent>): void {
    const rowView = rowComponent.row.view;
    if (rowView !== null) {
      this.detachRowView(rowView, rowFastener);
    }
    const rowTrait = rowComponent.row.trait;
    if (rowTrait !== null) {
      this.detachRowTrait(rowTrait, rowFastener);
    }
  }

  protected willSetRow(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null,
                       rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetRow !== void 0) {
        componentObserver.componentWillSetRow(newRowComponent, oldRowComponent, rowFastener);
      }
    }
  }

  protected onSetRow(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null,
                     rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldRowComponent !== null) {
      this.detachRow(oldRowComponent, rowFastener);
    }
    if (newRowComponent !== null) {
      this.attachRow(newRowComponent, rowFastener);
      this.initRow(newRowComponent, rowFastener);
    }
  }

  protected didSetRow(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null,
                      rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetRow !== void 0) {
        componentObserver.componentDidSetRow(newRowComponent, oldRowComponent, rowFastener);
      }
    }
  }

  insertRowTrait(rowTrait: RowTrait, targetTrait: Trait | null = null): void {
    const rowFasteners = this.rowFasteners as ComponentFastener<this, RowComponent>[];
    let targetComponent: RowComponent | null = null;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowComponent = rowFasteners[i]!.component;
      if (rowComponent !== null) {
        if (rowComponent.row.trait === rowTrait) {
          return;
        } else if (rowComponent.row.trait === targetTrait) {
          targetComponent = rowComponent;
        }
      }
    }
    const rowComponent = this.createRow(rowTrait);
    if (rowComponent !== null) {
      rowComponent.row.setTrait(rowTrait);
      this.insertChildComponent(rowComponent, targetComponent);
      if (rowComponent.row.view === null) {
        const rowView = this.createRowView(rowComponent);
        let targetView: RowView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.row.view;
        }
        const tableView = this.table.view;
        if (tableView !== null) {
          rowComponent.row.injectView(tableView, rowView, targetView, null);
        } else {
          rowComponent.row.setView(rowView, targetView);
        }
      }
    }
  }

  removeRowTrait(rowTrait: RowTrait): void {
    const rowFasteners = this.rowFasteners as ComponentFastener<this, RowComponent>[];
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      const rowComponent = rowFastener.component;
      if (rowComponent !== null && rowComponent.row.trait === rowTrait) {
        rowFastener.setComponent(null);
        if (this.isMounted()) {
          rowFastener.unmount();
        }
        rowFasteners.splice(i, 1);
        rowComponent.remove();
        return;
      }
    }
  }

  protected initRowTrait(rowTrait: RowTrait | null, rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected attachRowTrait(rowTrait: RowTrait | null, rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected detachRowTrait(rowTrait: RowTrait | null, rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected willSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                            rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetRowTrait !== void 0) {
        componentObserver.componentWillSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
      }
    }
  }

  protected onSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                          rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldRowTrait !== null) {
      this.detachRowTrait(oldRowTrait, rowFastener);
    }
    if (newRowTrait !== null) {
      this.attachRowTrait(newRowTrait, rowFastener);
      this.initRowTrait(newRowTrait, rowFastener);
    }
  }

  protected didSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetRowTrait !== void 0) {
        componentObserver.componentDidSetRowTrait(newRowTrait, oldRowTrait, rowFastener);
      }
    }
  }

  protected createRowView(rowComponent: RowComponent): RowView | null {
    return rowComponent.row.createView();
  }

  protected initRowView(rowView: RowView, rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected attachRowView(rowView: RowView, rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected detachRowView(rowView: RowView, rowFastener: ComponentFastener<this, RowComponent>): void {
    rowView.remove();
  }

  protected willSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetRowView !== void 0) {
        componentObserver.componentWillSetRowView(newRowView, oldRowView, rowFastener);
      }
    }
  }

  protected onSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                         rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldRowView !== null) {
      this.detachRowView(oldRowView, rowFastener);
    }
    if (newRowView !== null) {
      this.attachRowView(newRowView, rowFastener);
      this.initRowView(newRowView, rowFastener);
    }
  }

  protected didSetRowView(newRowView: RowView | null, oldRowView: RowView | null,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetRowView !== void 0) {
        componentObserver.componentDidSetRowView(newRowView, oldRowView, rowFastener);
      }
    }
  }

  protected initCell(cellComponent: CellComponent, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                     rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.initCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.initCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected attachCell(cellComponent: CellComponent, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                       rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.attachCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.attachCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected detachCell(cellComponent: CellComponent, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                       rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.detachCellTrait(cellTrait, cellFastener, rowFastener);
    }
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.detachCellView(cellView, cellFastener, rowFastener);
    }
  }

  protected willSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                        cellFastener: ComponentFastener<RowComponent, CellComponent>,
                        rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCell !== void 0) {
        componentObserver.componentWillSetCell(newCellComponent, oldCellComponent, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                      cellFastener: ComponentFastener<RowComponent, CellComponent>,
                      rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldCellComponent !== null) {
      this.detachCell(oldCellComponent, cellFastener, rowFastener);
    }
    if (newCellComponent !== null) {
      this.attachCell(newCellComponent, cellFastener, rowFastener);
      this.initCell(newCellComponent, cellFastener, rowFastener);
    }
  }

  protected didSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                       cellFastener: ComponentFastener<RowComponent, CellComponent>,
                       rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCell !== void 0) {
        componentObserver.componentDidSetCell(newCellComponent, oldCellComponent, cellFastener, rowFastener);
      }
    }
  }

  protected initCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                          rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                            rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected detachCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                            rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                             cellFastener: ComponentFastener<RowComponent, CellComponent>,
                             rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellTrait !== void 0) {
        componentObserver.componentWillSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                           cellFastener: ComponentFastener<RowComponent, CellComponent>,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait, cellFastener, rowFastener);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(oldCellTrait, cellFastener, rowFastener);
      this.initCellTrait(newCellTrait, cellFastener, rowFastener);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                            cellFastener: ComponentFastener<RowComponent, CellComponent>,
                            rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellTrait !== void 0) {
        componentObserver.componentDidSetCellTrait(newCellTrait, oldCellTrait, cellFastener, rowFastener);
      }
    }
  }

  protected initCellView(cellView: CellView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                         rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.initCellContentView(cellContentView, cellFastener, rowFastener);
    }
  }

  protected attachCellView(cellView: CellView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.attachCellContentView(cellContentView, cellFastener, rowFastener);
    }
  }

  protected detachCellView(cellView: CellView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.detachCellContentView(cellContentView, cellFastener, rowFastener);
    }
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                            cellFastener: ComponentFastener<RowComponent, CellComponent>,
                            rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellView !== void 0) {
        componentObserver.componentWillSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                          cellFastener: ComponentFastener<RowComponent, CellComponent>,
                          rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView, cellFastener, rowFastener);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView, cellFastener, rowFastener);
      this.initCellView(newCellView, cellFastener, rowFastener);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                           cellFastener: ComponentFastener<RowComponent, CellComponent>,
                           rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellView !== void 0) {
        componentObserver.componentDidSetCellView(newCellView, oldCellView, cellFastener, rowFastener);
      }
    }
  }

  protected initCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected attachCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                  rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected detachCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                  rowFastener: ComponentFastener<this, RowComponent>): void {
    // hook
  }

  protected willSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                   cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                   rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellContentView !== void 0) {
        componentObserver.componentWillSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
      }
    }
  }

  protected onSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                 cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                 rowFastener: ComponentFastener<this, RowComponent>): void {
    if (oldCellContentView !== null) {
      this.detachCellContentView(oldCellContentView, cellFastener, rowFastener);
    }
    if (newCellContentView !== null) {
      this.attachCellContentView(newCellContentView, cellFastener, rowFastener);
      this.initCellContentView(newCellContentView, cellFastener, rowFastener);
    }
  }

  protected didSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                  cellFastener: ComponentFastener<RowComponent, CellComponent>,
                                  rowFastener: ComponentFastener<this, RowComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellContentView !== void 0) {
        componentObserver.componentDidSetCellContentView(newCellContentView, oldCellContentView, cellFastener, rowFastener);
      }
    }
  }

  /** @hidden */
  static RowFastener = ComponentFastener.define<TableComponent, RowComponent>({
    type: RowComponent,
    child: false,
    observe: true,
    willSetComponent(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null): void {
      this.owner.willSetRow(newRowComponent, oldRowComponent, this);
    },
    onSetComponent(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null): void {
      this.owner.onSetRow(newRowComponent, oldRowComponent, this);
    },
    didSetComponent(newRowComponent: RowComponent | null, oldRowComponent: RowComponent | null): void {
      this.owner.didSetRow(newRowComponent, oldRowComponent, this);
    },
    componentWillSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.willSetRowTrait(newRowTrait, oldRowTrait, this);
    },
    componentDidSetRowTrait(newRowTrait: RowTrait | null, oldRowTrait: RowTrait | null): void {
      this.owner.onSetRowTrait(newRowTrait, oldRowTrait, this);
      this.owner.didSetRowTrait(newRowTrait, oldRowTrait, this);
    },
    componentWillSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.willSetRowView(newRowView, oldRowView, this);
    },
    componentDidSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
      this.owner.onSetRowView(newRowView, oldRowView, this);
      this.owner.didSetRowView(newRowView, oldRowView, this);
    },
    componentWillSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                         cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.willSetCell(newCellComponent, oldCellComponent, cellFastener, this);
    },
    componentDidSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                        cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.onSetCell(newCellComponent, oldCellComponent, cellFastener, this);
      this.owner.didSetCell(newCellComponent, oldCellComponent, cellFastener, this);
    },
    componentWillSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                              cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
    },
    componentDidSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                             cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait, cellFastener, this);
    },
    componentWillSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                             cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.willSetCellView(newCellView, oldCellView, cellFastener, this);
    },
    componentDidSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                            cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.onSetCellView(newCellView, oldCellView, cellFastener, this);
      this.owner.didSetCellView(newCellView, oldCellView, cellFastener, this);
    },
    componentWillSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                    cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.willSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
    },
    componentDidSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                   cellFastener: ComponentFastener<RowComponent, CellComponent>): void {
      this.owner.onSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
      this.owner.didSetCellContentView(newCellContentView, oldCellContentView, cellFastener, this);
    },
  });

  protected createRowFastener(rowComponent: RowComponent): ComponentFastener<this, RowComponent> {
    return new TableComponent.RowFastener(this, rowComponent.key, "row");
  }

  /** @hidden */
  readonly rowFasteners!: ReadonlyArray<ComponentFastener<this, RowComponent>>;

  protected getRowFastener(rowTrait: RowTrait): ComponentFastener<this, RowComponent> | null {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      const rowComponent = rowFastener.component;
      if (rowComponent !== null && rowComponent.row.trait === rowTrait) {
        return rowFastener;
      }
    }
    return null;
  }

  /** @hidden */
  protected mountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.mount();
    }
  }

  /** @hidden */
  protected unmountRowFasteners(): void {
    const rowFasteners = this.rowFasteners;
    for (let i = 0, n = rowFasteners.length; i < n; i += 1) {
      const rowFastener = rowFasteners[i]!;
      rowFastener.unmount();
    }
  }

  protected detectRowComponent(component: Component): RowComponent | null {
    return component instanceof RowComponent ? component : null;
  }

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const rowComponent = this.detectRowComponent(childComponent);
    if (rowComponent !== null) {
      this.insertRow(rowComponent, targetComponent);
    }
  }

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const rowComponent = this.detectRowComponent(childComponent);
    if (rowComponent !== null) {
      this.removeRow(rowComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountColFasteners();
    this.mountRowFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountRowFasteners();
    this.unmountColFasteners();
    super.unmountComponentFasteners();
  }
}
