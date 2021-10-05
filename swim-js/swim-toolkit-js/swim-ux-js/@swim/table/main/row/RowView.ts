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

import type {Mutable, Class} from "@swim/util";
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {
  Look,
  ThemeAnimator,
  ExpansionThemeAnimator,
  ThemeConstraintAnimator,
} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewFastener,
  PositionGestureInput,
} from "@swim/view";
import {HtmlViewClass, HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import type {CellView} from "../cell/CellView";
import {LeafView} from "../leaf/LeafView";
import type {RowViewObserver} from "./RowViewObserver";
import type {TableViewContext} from "../table/TableViewContext";
import {TableView} from "../"; // forward reference

export class RowView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.visibleFrame = new R2Box(0, 0, window.innerWidth, window.innerHeight);
    this.initRow();
  }

  protected initRow(): void {
    this.addClass("row");
    this.position.setState("relative", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<RowViewObserver>;

  override readonly contextType?: Class<TableViewContext>;

  @Property({type: TableLayout, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  protected didSetDepth(newDepth: number, oldDepth: number): void {
    const treeView = this.tree.view;
    if (treeView !== null) {
      treeView.depth.setState(newDepth + 1, Affinity.Intrinsic);
    }
  }

  @Property<RowView, number>({
    type: Number,
    inherits: true,
    state: 0,
    updateFlags: View.NeedsLayout,
    didSetState(newDepth: number, oldDepth: number): void {
      this.owner.didSetDepth(newDepth, oldDepth);
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeConstraintAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Boolean, inherits: true, state: false})
  readonly hovers!: Property<this, boolean>;

  @Property({type: Boolean, inherits: true, state: true})
  readonly glows!: Property<this, boolean>;

  getCell(key: string): CellView | null;
  getCell<V extends CellView>(key: string, cellViewClass: Class<V>): V | null;
  getCell(key: string, cellViewClass?: Class<CellView>): CellView | null {
    const leafView = this.leaf.view;
    return leafView !== null ? leafView.getCell(key, cellViewClass!) : null;
  }

  getOrCreateCell<V extends CellView>(key: string, cellViewClass: HtmlViewClass<V>): V {
    const leafView = this.leaf.injectView();
    if (leafView === null) {
      throw new Error("no leaf view");
    }
    return leafView.getOrCreateCell(key, cellViewClass);
  }

  setCell(key: string, cellView: CellView): void {
    const leafView = this.leaf.injectView();
    if (leafView === null) {
      throw new Error("no leaf view");
    }
    leafView.setCell(key, cellView);
  }

  protected createLeaf(): LeafView | null {
    return LeafView.create();
  }

  protected initLeaf(leafView: LeafView): void {
    leafView.display.setState("none", Affinity.Intrinsic);
    leafView.position.setState("absolute", Affinity.Intrinsic);
    leafView.left.setState(0, Affinity.Intrinsic);
    leafView.top.setState(0, Affinity.Intrinsic);
    const layout = this.layout.state;
    leafView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
    leafView.zIndex.setState(1, Affinity.Intrinsic);
  }

  protected attachLeaf(leafView: LeafView): void {
    // hook
  }

  protected detachLeaf(leafView: LeafView): void {
    // hook
  }

  protected willSetLeaf(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetLeaf !== void 0) {
        observer.viewWillSetLeaf(newLeafView, oldLeafView, this);
      }
    }
  }

  protected onSetLeaf(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    if (oldLeafView !== null) {
      this.detachLeaf(oldLeafView);
    }
    if (newLeafView !== null) {
      this.attachLeaf(newLeafView);
      this.initLeaf(newLeafView);
    }
  }

  protected didSetLeaf(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetLeaf !== void 0) {
        observer.viewDidSetLeaf(newLeafView, oldLeafView, this);
      }
    }
  }

  protected willHighlightLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillHighlightLeaf !== void 0) {
        observer.viewWillHighlightLeaf(leafView, this);
      }
    }
  }

  protected onHighlightLeaf(leafView: LeafView): void {
    // hook
  }

  protected didHighlightLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidHighlightLeaf !== void 0) {
        observer.viewDidHighlightLeaf(leafView, this);
      }
    }
  }

  protected willUnhighlightLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillUnhighlightLeaf !== void 0) {
        observer.viewWillUnhighlightLeaf(leafView, this);
      }
    }
  }

  protected onUnhighlightLeaf(leafView: LeafView): void {
    // hook
  }

  protected didUnhighlightLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidUnhighlightLeaf !== void 0) {
        observer.viewDidUnhighlightLeaf(leafView, this);
      }
    }
  }

  protected onEnterLeaf(leafView: LeafView): void {
    // hook
  }

  protected didEnterLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidEnterLeaf !== void 0) {
        observer.viewDidEnterLeaf(leafView, this);
      }
    }
  }

  protected onLeaveLeaf(leafView: LeafView): void {
    // hook
  }

  protected didLeaveLeaf(leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidLeaveLeaf !== void 0) {
        observer.viewDidLeaveLeaf(leafView, this);
      }
    }
  }

  protected onPressLeaf(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
    // hook
  }

  protected didPressLeaf(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidPressLeaf !== void 0) {
        observer.viewDidPressLeaf(input, event, leafView, this);
      }
    }
  }

  protected onLongPressLeaf(input: PositionGestureInput, leafView: LeafView): void {
    // hook
  }

  protected didLongPressLeaf(input: PositionGestureInput, leafView: LeafView): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidLongPressLeaf !== void 0) {
        observer.viewDidLongPressLeaf(input, leafView, this);
      }
    }
  }

  @ViewFastener<RowView, LeafView>({
    key: true,
    type: LeafView,
    child: true,
    observes: true,
    willSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.willSetLeaf(newLeafView, oldLeafView);
    },
    onSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.onSetLeaf(newLeafView, oldLeafView);
    },
    didSetView(newLeafView: LeafView | null, oldLeafView: LeafView | null): void {
      this.owner.didSetLeaf(newLeafView, oldLeafView);
    },
    viewWillHighlight(leafView: LeafView): void {
      this.owner.willHighlightLeaf(leafView);
      this.owner.onHighlightLeaf(leafView);
    },
    viewDidHighlight(leafView: LeafView): void {
      this.owner.didHighlightLeaf(leafView);
    },
    viewWillUnhighlight(leafView: LeafView): void {
      this.owner.willUnhighlightLeaf(leafView);
    },
    viewDidUnhighlight(leafView: LeafView): void {
      this.owner.onUnhighlightLeaf(leafView);
      this.owner.didUnhighlightLeaf(leafView);
    },
    viewDidEnter(leafView: LeafView): void {
      this.owner.onEnterLeaf(leafView);
      this.owner.didEnterLeaf(leafView);
    },
    viewDidLeave(leafView: LeafView): void {
      this.owner.onLeaveLeaf(leafView);
      this.owner.didLeaveLeaf(leafView);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
      this.owner.onPressLeaf(input, event, leafView);
      this.owner.didPressLeaf(input, event, leafView);
    },
    viewDidLongPress(input: PositionGestureInput, leafView: LeafView): void {
      this.owner.onLongPressLeaf(input, leafView);
      this.owner.didLongPressLeaf(input, leafView);
    },
    createView(): LeafView | null {
      return this.owner.createLeaf();
    },
  })
  readonly leaf!: ViewFastener<this, LeafView>;

  protected initHead(headView: HtmlView): void {
    headView.addClass("head");
    headView.display.setState("none", Affinity.Intrinsic);
    headView.position.setState("absolute", Affinity.Intrinsic);
    headView.left.setState(0, Affinity.Intrinsic);
    headView.top.setState(this.rowHeight.state, Affinity.Intrinsic);
    const layout = this.layout.state;
    headView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
    headView.height.setState(this.rowSpacing.state, Affinity.Intrinsic);
    headView.backgroundColor.setLook(Look.accentColor, Affinity.Intrinsic);
    headView.opacity.setState(this.disclosing.phase, Affinity.Intrinsic);
    headView.zIndex.setState(1, Affinity.Intrinsic);
  }

  protected attachHead(headView: HtmlView): void {
    // hook
  }

  protected detachHead(headView: HtmlView): void {
    // hook
  }

  protected willSetHead(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
    // hook
  }

  protected onSetHead(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
    if (oldHeadView !== null) {
      this.detachHead(oldHeadView);
    }
    if (newHeadView !== null) {
      this.attachHead(newHeadView);
      this.initHead(newHeadView);
    }
  }

  protected didSetHead(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
    // hook
  }

  @ViewFastener<RowView, HtmlView>({
    key: true,
    type: HtmlView,
    child: true,
    willSetView(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
      this.owner.willSetHead(newHeadView, oldHeadView);
    },
    onSetView(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
      this.owner.onSetHead(newHeadView, oldHeadView);
    },
    didSetView(newHeadView: HtmlView | null, oldHeadView: HtmlView | null): void {
      this.owner.didSetHead(newHeadView, oldHeadView);
    },
  })
  readonly head!: ViewFastener<this, HtmlView>;

  protected createTree(): TableView | null {
    return TableView.create();
  }

  protected initTree(treeView: TableView): void {
    treeView.addClass("tree");
    treeView.display.setState(this.disclosure.collapsed ? "none" : "block", Affinity.Intrinsic);
    treeView.position.setState("absolute", Affinity.Intrinsic);
    treeView.left.setState(0, Affinity.Intrinsic);
    const layout = this.layout.state;
    treeView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
    treeView.zIndex.setState(0, Affinity.Intrinsic);
    treeView.depth.setState(this.depth.state + 1, Affinity.Intrinsic);
  }

  protected attachTree(treeView: TableView): void {
    // hook
  }

  protected detachTree(treeView: TableView): void {
    // hook
  }

  protected willSetTree(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetTree !== void 0) {
        observer.viewWillSetTree(newTreeView, oldTreeView, this);
      }
    }
  }

  protected onSetTree(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    if (oldTreeView !== null) {
      this.detachTree(oldTreeView);
    }
    if (newTreeView !== null) {
      this.attachTree(newTreeView);
      this.initTree(newTreeView);
    }
  }

  protected didSetTree(newTreeView: TableView | null, oldTreeView: TableView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetTree !== void 0) {
        observer.viewDidSetTree(newTreeView, oldTreeView, this);
      }
    }
  }

  @ViewFastener<RowView, TableView>({
    key: true,
    // avoid cyclic reference to type: TableView
    child: true,
    willSetView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.willSetTree(newTreeView, oldTreeView);
    },
    onSetView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.onSetTree(newTreeView, oldTreeView);
    },
    didSetView(newTreeView: TableView | null, oldTreeView: TableView | null): void {
      this.owner.didSetTree(newTreeView, oldTreeView);
    },
    createView(): TableView | null {
      return this.owner.createTree();
    },
  })
  readonly tree!: ViewFastener<this, TableView>;

  protected initFoot(footView: HtmlView): void {
    footView.addClass("foot");
    footView.display.setState("none", Affinity.Intrinsic);
    footView.position.setState("absolute", Affinity.Intrinsic);
    footView.left.setState(0, Affinity.Intrinsic);
    footView.top.setState(this.rowHeight.state, Affinity.Intrinsic);
    const layout = this.layout.state;
    footView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
    footView.height.setState(this.rowSpacing.state, Affinity.Intrinsic);
    footView.backgroundColor.setLook(Look.borderColor, Affinity.Intrinsic);
    footView.opacity.setState(this.disclosing.phase, Affinity.Intrinsic);
    footView.zIndex.setState(1, Affinity.Intrinsic);
  }

  protected attachFoot(footView: HtmlView): void {
    // hook
  }

  protected detachFoot(footView: HtmlView): void {
    // hook
  }

  protected willSetFoot(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
    // hook
  }

  protected onSetFoot(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
    if (oldFootView !== null) {
      this.detachFoot(oldFootView);
    }
    if (newFootView !== null) {
      this.attachFoot(newFootView);
      this.initFoot(newFootView);
    }
  }

  protected didSetFoot(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
    // hook
  }

  @ViewFastener<RowView, HtmlView>({
    key: true,
    type: HtmlView,
    child: true,
    willSetView(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
      this.owner.willSetFoot(newFootView, oldFootView);
    },
    onSetView(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
      this.owner.onSetFoot(newFootView, oldFootView);
    },
    didSetView(newFootView: HtmlView | null, oldFootView: HtmlView | null): void {
      this.owner.didSetFoot(newFootView, oldFootView);
    },
  })
  readonly foot!: ViewFastener<this, HtmlView>;

  protected willExpand(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillExpand !== void 0) {
        observer.viewWillExpand(this);
      }
    }

    const treeView = this.tree.view;
    if (treeView !== null) {
      treeView.display.setState("block", Affinity.Intrinsic);
    }
  }

  protected onExpand(): void {
    // hook
  }

  protected didExpand(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidExpand !== void 0) {
        observer.viewDidExpand(this);
      }
    }
  }

  protected willCollapse(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillCollapse !== void 0) {
        observer.viewWillCollapse(this);
      }
    }
  }

  protected onCollapse(): void {
    // hook
  }

  protected didCollapse(): void {
    const treeView = this.tree.view;
    if (treeView !== null) {
      treeView.display.setState("none", Affinity.Intrinsic);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidCollapse !== void 0) {
        observer.viewDidCollapse(this);
      }
    }
  }

  protected didSetDisclosure(newDisclosure: Expansion, oldDisclosure: Expansion): void {
    if (newDisclosure.direction !== 0) {
      this.disclosing.setState(newDisclosure, Affinity.Intrinsic);
    } else {
      this.disclosing.setState(null, Affinity.Intrinsic);
      this.disclosing.setAffinity(Affinity.Transient);
    }
    const tableView = this.getBase(TableView);
    if (tableView !== null) {
      tableView.requireUpdate(View.NeedsLayout);
    }
  }

  @ThemeAnimator<RowView, Expansion>({
    type: Expansion,
    state: Expansion.collapsed(),
    willExpand(): void {
      this.owner.willExpand();
      this.owner.onExpand();
    },
    didExpand(): void {
      this.owner.didExpand();
    },
    willCollapse(): void {
      this.owner.willCollapse();
    },
    didCollapse(): void {
      this.owner.onCollapse();
      this.owner.didCollapse();
    },
    didSetValue(newDisclosure: Expansion, oldDisclosure: Expansion): void {
      this.owner.didSetDisclosure(newDisclosure, oldDisclosure);
    },
  })
  readonly disclosure!: ExpansionThemeAnimator<this, Expansion, AnyExpansion>;

  @ThemeAnimator({type: Expansion, inherits: true, state: null, updateFlags: View.NeedsLayout})
  readonly disclosing!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  /** @internal */
  readonly visibleFrame!: R2Box;

  protected detectVisibleFrame(viewContext: ViewContext): R2Box {
    const xBleed = 0;
    const yBleed = this.rowHeight.getValueOr(Length.zero()).pxValue();
    const parentVisibleFrame = (viewContext as TableViewContext).visibleFrame as R2Box | undefined;
    if (parentVisibleFrame !== void 0) {
      let left: Length | number | null = this.left.state;
      left = left instanceof Length ? left.pxValue() : 0;
      let top: Length | number | null = this.top.state;
      top = top instanceof Length ? top.pxValue() : 0;
      return new R2Box(parentVisibleFrame.xMin - left - xBleed, parentVisibleFrame.yMin - top - yBleed,
                       parentVisibleFrame.xMax - left + xBleed, parentVisibleFrame.yMax - top + yBleed);
    } else {
      const bounds = this.node.getBoundingClientRect();
      const xMin = -bounds.x - xBleed;
      const yMin = -bounds.y - yBleed;
      const xMax = window.innerWidth - bounds.x + xBleed;
      const yMax = window.innerHeight - bounds.y + yBleed;
      return new R2Box(xMin, yMin, xMax, yMax);
    }
  }

  override extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const treeViewContext = Object.create(viewContext);
    treeViewContext.visibleFrame = this.visibleFrame;
    return treeViewContext;
  }

  protected override onProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    super.onProcess(processFlags, viewContext);
    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    (this as Mutable<this>).visibleFrame = visibleFrame;
    (viewContext as Mutable<ViewContextType<this>>).visibleFrame = this.visibleFrame;
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected override onDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    super.onDisplay(displayFlags, viewContext);
    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    (this as Mutable<this>).visibleFrame = visibleFrame;
    (viewContext as Mutable<ViewContextType<this>>).visibleFrame = this.visibleFrame;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.resizeRow();
    const leafView = this.leaf.view;
    if (leafView !== null) {
      this.layoutLeaf(leafView);
    }
  }

  protected resizeRow(): void {
    const oldLayout = !this.layout.inherited ? this.layout.state : null;
    if (oldLayout !== null) {
      const superLayout = this.layout.superState;
      let width: Length | number | null = null;
      if (superLayout !== void 0 && superLayout !== null && superLayout.width !== null) {
        width = superLayout.width.pxValue();
      }
      if (width === null) {
        width = this.width.state;
        width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      }
      const newLayout = oldLayout.resized(width, 0, 0);
      this.layout.setState(newLayout);
    }
  }

  protected layoutLeaf(leafView: LeafView): void {
    const layout = this.layout.state;
    const width = layout !== null ? layout.width : null;
    const timing = this.getLook(Look.timing);
    leafView.top.setState(0, timing, Affinity.Intrinsic);
    leafView.width.setState(width, Affinity.Intrinsic);
  }

  protected override didLayout(viewContext: ViewContextType<this>): void {
    this.layoutRow();
    super.didLayout(viewContext);
  }

  protected layoutRow(): void {
    const layout = this.layout.state;
    const width = layout !== null ? layout.width : null;
    const rowSpacing = this.rowSpacing.getValueOr(Length.zero()).pxValue();
    const disclosure = this.disclosure.getValue();
    const disclosingPhase = this.disclosing.getPhaseOr(1);

    let leafHeightValue: Length | number | null = 0;
    let leafHeightState: Length | number | null = 0;
    const leafView = this.leaf.view;
    if (leafView !== null) {
      leafView.width.setState(width, Affinity.Intrinsic);
      leafView.display.setState("flex", Affinity.Intrinsic);
      leafHeightValue = leafView.height.value;
      leafHeightValue = leafHeightValue instanceof Length ? leafHeightValue.pxValue() : leafView.node.offsetHeight;
      leafHeightState = leafView.height.state;
      leafHeightState = leafHeightState instanceof Length ? leafHeightState.pxValue() : leafHeightValue;
    }

    const headView = this.head.view;
    if (headView !== null) {
      if (!disclosure.collapsed) {
        headView.top.setState(leafHeightValue, Affinity.Intrinsic);
        headView.width.setState(width, Affinity.Intrinsic);
        headView.height.setState(rowSpacing * disclosingPhase, Affinity.Intrinsic);
        headView.opacity.setState(disclosingPhase, Affinity.Intrinsic);
        headView.display.setState("block", Affinity.Intrinsic);
      } else {
        headView.display.setState("none", Affinity.Intrinsic);
      }
    }

    let treeHeightValue: Length | number | null = 0;
    let treeHeightState: Length | number | null = 0;
    const treeView = this.tree.view;
    if (treeView !== null) {
      if (!disclosure.collapsed) {
        treeView.top.setState((leafHeightValue + rowSpacing) * disclosingPhase, Affinity.Intrinsic);
        treeView.width.setState(width, Affinity.Intrinsic);
        treeView.display.setState("block", Affinity.Intrinsic);
        treeHeightValue = treeView.height.value;
        treeHeightValue = treeHeightValue instanceof Length ? treeHeightValue.pxValue() : treeView.node.offsetHeight;
        treeHeightValue += rowSpacing;
        treeHeightState = treeView.height.state;
        treeHeightState = treeHeightState instanceof Length ? treeHeightState.pxValue() : treeHeightValue;
        treeHeightState += rowSpacing;
      } else {
        treeView.display.setState("none", Affinity.Intrinsic);
      }
    }

    const footView = this.foot.view;
    if (footView !== null) {
      if (!disclosure.collapsed) {
        footView.top.setState(leafHeightValue + treeHeightValue, Affinity.Intrinsic);
        footView.width.setState(width, Affinity.Intrinsic);
        footView.height.setState(rowSpacing * disclosingPhase, Affinity.Intrinsic);
        footView.opacity.setState(disclosingPhase, Affinity.Intrinsic);
        footView.display.setState("block", Affinity.Intrinsic);
      } else {
        footView.display.setState("none", Affinity.Intrinsic);
      }
    }

    if (this.height.hasAffinity(Affinity.Intrinsic)) {
      const heightValue = leafHeightValue + treeHeightValue * disclosingPhase;
      const heightState = leafHeightState + treeHeightState;
      this.height.setInterpolatedValue(Length.px(heightValue), Length.px(heightState));
    }
  }

  protected override onCull(): void {
    super.onCull();
    this.display.setState("none", Affinity.Intrinsic);
  }

  protected override onUncull(): void {
    super.onUncull();
    this.display.setState("block", Affinity.Intrinsic);
  }
}
