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
import {Component,ComponentViewTrait, ComponentFastener, CompositeComponent} from "@swim/component";
import type {CellView} from "../cell/CellView";
import type {CellTrait} from "../cell/CellTrait";
import {CellComponent} from "../cell/CellComponent";
import {RowView} from "./RowView";
import {RowTrait} from "./RowTrait";
import type {RowComponentObserver} from "./RowComponentObserver";

export class RowComponent extends CompositeComponent {
  constructor() {
    super();
    Object.defineProperty(this, "cellFasteners", {
      value: [],
      enumerable: true,
    });
  }

  override readonly componentObservers!: ReadonlyArray<RowComponentObserver>;

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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetRowTrait !== void 0) {
        componentObserver.componentWillSetRowTrait(newRowTrait, oldRowTrait, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetRowTrait !== void 0) {
        componentObserver.componentDidSetRowTrait(newRowTrait, oldRowTrait, this);
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
      const cellComponent = cellFasteners[i]!.component;
      if (cellComponent !== null) {
        const cellView = cellComponent.cell.view;
        if (cellView !== null && cellView.parentView === null) {
          const cellTrait = cellComponent.cell.trait;
          if (cellTrait !== null) {
            cellComponent.cell.injectView(rowView, void 0, void 0, cellTrait.key);
          }
        }
      }
    }
  }

  protected detachRowView(rowView: RowView): void {
    // hook
  }

  protected willSetRowView(newRowView: RowView | null, oldRowView: RowView | null): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetRowView !== void 0) {
        componentObserver.componentWillSetRowView(newRowView, oldRowView, this);
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
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetRowView !== void 0) {
        componentObserver.componentDidSetRowView(newRowView, oldRowView, this);
      }
    }
  }

  protected themeRowView(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, rowView: RowView): void {
    // hook
  }

  /** @hidden */
  static RowFastener = ComponentViewTrait.define<RowComponent, RowView, RowTrait>({
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

  @ComponentViewTrait<RowComponent, RowView, RowTrait>({
    extends: RowComponent.RowFastener,
  })
  readonly row!: ComponentViewTrait<this, RowView, RowTrait>;

  insertCell(cellComponent: CellComponent, targetComponent: Component | null = null): void {
    const cellFasteners = this.cellFasteners as ComponentFastener<this, CellComponent>[];
    let targetIndex = cellFasteners.length;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.component === cellComponent) {
        return;
      } else if (cellFastener.component === targetComponent) {
        targetIndex = i;
      }
    }
    const cellFastener = this.createCellFastener(cellComponent);
    cellFasteners.splice(targetIndex, 0, cellFastener);
    cellFastener.setComponent(cellComponent, targetComponent);
    if (this.isMounted()) {
      cellFastener.mount();
    }
  }

  removeCell(cellComponent: CellComponent): void {
    const cellFasteners = this.cellFasteners as ComponentFastener<this, CellComponent>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      if (cellFastener.component === cellComponent) {
        cellFastener.setComponent(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected createCell(cellTrait: CellTrait): CellComponent | null {
    return new CellComponent();
  }

  protected initCell(cellComponent: CellComponent, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.initCellTrait(cellTrait, cellFastener);
    }
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.initCellView(cellView, cellFastener);
    }
  }

  protected attachCell(cellComponent: CellComponent, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.attachCellTrait(cellTrait, cellFastener);
    }
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.attachCellView(cellView, cellFastener);
    }
  }

  protected detachCell(cellComponent: CellComponent, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellView = cellComponent.cell.view;
    if (cellView !== null) {
      this.detachCellView(cellView, cellFastener);
    }
    const cellTrait = cellComponent.cell.trait;
    if (cellTrait !== null) {
      this.detachCellTrait(cellTrait, cellFastener);
    }
  }

  protected willSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                        cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCell !== void 0) {
        componentObserver.componentWillSetCell(newCellComponent, oldCellComponent, cellFastener);
      }
    }
  }

  protected onSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                      cellFastener: ComponentFastener<this, CellComponent>): void {
    if (oldCellComponent !== null) {
      this.detachCell(oldCellComponent, cellFastener);
    }
    if (newCellComponent !== null) {
      this.attachCell(newCellComponent, cellFastener);
      this.initCell(newCellComponent, cellFastener);
    }
  }

  protected didSetCell(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null,
                       cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCell !== void 0) {
        componentObserver.componentDidSetCell(newCellComponent, oldCellComponent, cellFastener);
      }
    }
  }

  insertCellTrait(cellTrait: CellTrait, targetTrait: Trait | null = null): void {
    const cellFasteners = this.cellFasteners as ComponentFastener<this, CellComponent>[];
    let targetComponent: CellComponent | null = null;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellComponent = cellFasteners[i]!.component;
      if (cellComponent !== null) {
        if (cellComponent.cell.trait === cellTrait) {
          return;
        } else if (cellComponent.cell.trait === targetTrait) {
          targetComponent = cellComponent;
        }
      }
    }
    const cellComponent = this.createCell(cellTrait);
    if (cellComponent !== null) {
      cellComponent.cell.setTrait(cellTrait);
      this.insertChildComponent(cellComponent, targetComponent, cellTrait.key);
      if (cellComponent.cell.view === null) {
        const cellView = this.createCellView(cellComponent);
        let targetView: CellView | null = null;
        if (targetComponent !== null) {
          targetView = targetComponent.cell.view;
        }
        const rowView = this.row.view;
        if (rowView !== null) {
          cellComponent.cell.injectView(rowView, cellView, targetView, cellTrait.key);
        } else {
          cellComponent.cell.setView(cellView, targetView);
        }
      }
    }
  }

  removeCellTrait(cellTrait: CellTrait): void {
    const cellFasteners = this.cellFasteners as ComponentFastener<this, CellComponent>[];
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      const cellComponent = cellFastener.component;
      if (cellComponent !== null && cellComponent.cell.trait === cellTrait) {
        cellFastener.setComponent(null);
        if (this.isMounted()) {
          cellFastener.unmount();
        }
        cellFasteners.splice(i, 1);
        cellComponent.remove();
        return;
      }
    }
  }

  protected initCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected attachCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected detachCellTrait(cellTrait: CellTrait | null, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected willSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                             cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellTrait !== void 0) {
        componentObserver.componentWillSetCellTrait(newCellTrait, oldCellTrait, cellFastener);
      }
    }
  }

  protected onSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                           cellFastener: ComponentFastener<this, CellComponent>): void {
    if (oldCellTrait !== null) {
      this.detachCellTrait(oldCellTrait, cellFastener);
    }
    if (newCellTrait !== null) {
      this.attachCellTrait(oldCellTrait, cellFastener);
      this.initCellTrait(newCellTrait, cellFastener);
    }
  }

  protected didSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null,
                            cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellTrait !== void 0) {
        componentObserver.componentDidSetCellTrait(newCellTrait, oldCellTrait, cellFastener);
      }
    }
  }

  protected createCellView(cellComponent: CellComponent): CellView | null {
    return cellComponent.cell.createView();
  }

  protected initCellView(cellView: CellView, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.initCellContentView(cellContentView, cellFastener);
    }
  }

  protected attachCellView(cellView: CellView, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.attachCellContentView(cellContentView, cellFastener);
    }
  }

  protected detachCellView(cellView: CellView, cellFastener: ComponentFastener<this, CellComponent>): void {
    const cellContentView = cellView.content.view;
    if (cellContentView !== null) {
      this.detachCellContentView(cellContentView, cellFastener);
    }
    cellView.remove();
  }

  protected willSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                            cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellView !== void 0) {
        componentObserver.componentWillSetCellView(newCellView, oldCellView, cellFastener);
      }
    }
  }

  protected onSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                          cellFastener: ComponentFastener<this, CellComponent>): void {
    if (oldCellView !== null) {
      this.detachCellView(oldCellView, cellFastener);
    }
    if (newCellView !== null) {
      this.attachCellView(newCellView, cellFastener);
      this.initCellView(newCellView, cellFastener);
    }
  }

  protected didSetCellView(newCellView: CellView | null, oldCellView: CellView | null,
                           cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellView !== void 0) {
        componentObserver.componentDidSetCellView(newCellView, oldCellView, cellFastener);
      }
    }
  }

  protected initCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected attachCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected detachCellContentView(cellContentView: HtmlView, cellFastener: ComponentFastener<this, CellComponent>): void {
    // hook
  }

  protected willSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                   cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentWillSetCellContentView !== void 0) {
        componentObserver.componentWillSetCellContentView(newCellContentView, oldCellContentView, cellFastener);
      }
    }
  }

  protected onSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                 cellFastener: ComponentFastener<this, CellComponent>): void {
    if (oldCellContentView !== null) {
      this.detachCellContentView(oldCellContentView, cellFastener);
    }
    if (newCellContentView !== null) {
      this.attachCellContentView(newCellContentView, cellFastener);
      this.initCellContentView(newCellContentView, cellFastener);
    }
  }

  protected didSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null,
                                  cellFastener: ComponentFastener<this, CellComponent>): void {
    const componentObservers = this.componentObservers;
    for (let i = 0, n = componentObservers.length; i < n; i += 1) {
      const componentObserver = componentObservers[i]!;
      if (componentObserver.componentDidSetCellContentView !== void 0) {
        componentObserver.componentDidSetCellContentView(newCellContentView, oldCellContentView, cellFastener);
      }
    }
  }

  /** @hidden */
  static CellFastener = ComponentFastener.define<RowComponent, CellComponent>({
    type: CellComponent,
    child: false,
    observe: true,
    willSetComponent(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null): void {
      this.owner.willSetCell(newCellComponent, oldCellComponent, this);
    },
    onSetComponent(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null): void {
      this.owner.onSetCell(newCellComponent, oldCellComponent, this);
    },
    didSetComponent(newCellComponent: CellComponent | null, oldCellComponent: CellComponent | null): void {
      this.owner.didSetCell(newCellComponent, oldCellComponent, this);
    },
    componentWillSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.willSetCellTrait(newCellTrait, oldCellTrait, this);
    },
    componentDidSetCellTrait(newCellTrait: CellTrait | null, oldCellTrait: CellTrait | null): void {
      this.owner.onSetCellTrait(newCellTrait, oldCellTrait, this);
      this.owner.didSetCellTrait(newCellTrait, oldCellTrait, this);
    },
    componentWillSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.willSetCellView(newCellView, oldCellView, this);
    },
    componentDidSetCellView(newCellView: CellView | null, oldCellView: CellView | null): void {
      this.owner.onSetCellView(newCellView, oldCellView, this);
      this.owner.didSetCellView(newCellView, oldCellView, this);
    },
    componentWillSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.willSetCellContentView(newCellContentView, oldCellContentView, this);
    },
    componentDidSetCellContentView(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null): void {
      this.owner.onSetCellContentView(newCellContentView, oldCellContentView, this);
      this.owner.didSetCellContentView(newCellContentView, oldCellContentView, this);
    },
  });

  protected createCellFastener(cellComponent: CellComponent): ComponentFastener<this, CellComponent> {
    return new RowComponent.CellFastener(this, cellComponent.key, "cell");
  }

  /** @hidden */
  readonly cellFasteners!: ReadonlyArray<ComponentFastener<this, CellComponent>>;

  protected getCellFastener(cellTrait: CellTrait): ComponentFastener<this, CellComponent> | null {
    const cellFasteners = this.cellFasteners;
    for (let i = 0, n = cellFasteners.length; i < n; i += 1) {
      const cellFastener = cellFasteners[i]!;
      const cellComponent = cellFastener.component;
      if (cellComponent !== null && cellComponent.cell.trait === cellTrait) {
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

  protected detectCellComponent(component: Component): CellComponent | null {
    return component instanceof CellComponent ? component : null;
  }

  protected override onInsertChildComponent(childComponent: Component, targetComponent: Component | null): void {
    super.onInsertChildComponent(childComponent, targetComponent);
    const cellComponent = this.detectCellComponent(childComponent);
    if (cellComponent !== null) {
      this.insertCell(cellComponent, targetComponent);
    }
  }

  protected override onRemoveChildComponent(childComponent: Component): void {
    super.onRemoveChildComponent(childComponent);
    const cellComponent = this.detectCellComponent(childComponent);
    if (cellComponent !== null) {
      this.removeCell(cellComponent);
    }
  }

  /** @hidden */
  protected override mountComponentFasteners(): void {
    super.mountComponentFasteners();
    this.mountCellFasteners();
  }

  /** @hidden */
  protected override unmountComponentFasteners(): void {
    this.unmountCellFasteners();
    super.unmountComponentFasteners();
  }
}
