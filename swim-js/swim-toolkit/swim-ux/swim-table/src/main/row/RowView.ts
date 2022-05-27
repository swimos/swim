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

import type {Class, Instance, Timing, Creatable, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyExpansion, Expansion, ExpansionAnimator} from "@swim/style";
import {Look, ThemeConstraintAnimator} from "@swim/theme";
import {ViewFlags, View, ViewRef, PositionGestureInput} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import type {CellView} from "../cell/CellView";
import {LeafView} from "../leaf/LeafView";
import type {RowViewObserver} from "./RowViewObserver";
import {TableView} from "../"; // forward reference

/** @public */
export class RowView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initRow();
  }

  protected initRow(): void {
    this.addClass("row");
    this.position.setState("relative", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<RowViewObserver>;

  @Property({valueType: TableLayout, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  @Property<RowView["depth"]>({
    valueType: Number,
    value: 0,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(newDepth: number, oldDepth: number): void {
      const treeView = this.owner.tree.view;
      if (treeView !== null) {
        treeView.depth.setValue(newDepth + 1, Affinity.Intrinsic);
      }
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null, AnyLength | null>;

  @Property({valueType: Boolean, value: false, inherits: true})
  readonly hovers!: Property<this, boolean>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly glows!: Property<this, boolean>;

  getCell<F extends Class<CellView>>(key: string, cellViewClass: F): InstanceType<F> | null;
  getCell(key: string): CellView | null;
  getCell(key: string, cellViewClass?: Class<CellView>): CellView | null {
    const leafView = this.leaf.view;
    return leafView !== null ? leafView.getCell(key, cellViewClass!) : null;
  }

  getOrCreateCell<F extends Class<Instance<F, CellView>> & Creatable<Instance<F, CellView>>>(key: string, cellViewClass: F): InstanceType<F> {
    const leafView = this.leaf.insertView();
    if (leafView === null) {
      throw new Error("no leaf view");
    }
    return leafView.getOrCreateCell(key, cellViewClass);
  }

  setCell(key: string, cellView: CellView | null): void {
    const leafView = this.leaf.insertView();
    if (leafView === null) {
      throw new Error("no leaf view");
    }
    leafView.setCell(key, cellView);
  }

  @ViewRef<RowView["leaf"]>({
    viewType: LeafView,
    viewKey: true,
    binds: true,
    observes: true,
    initView(leafView: LeafView): void {
      leafView.display.setState("none", Affinity.Intrinsic);
      leafView.position.setState("absolute", Affinity.Intrinsic);
      leafView.left.setState(0, Affinity.Intrinsic);
      leafView.top.setState(0, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      leafView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
      leafView.zIndex.setState(1, Affinity.Intrinsic);
    },
    willAttachView(leafView: LeafView): void {
      this.owner.callObservers("viewWillAttachLeaf", leafView, this.owner);
    },
    didDetachView(leafView: LeafView): void {
      this.owner.callObservers("viewDidDetachLeaf", leafView, this.owner);
    },
    viewWillHighlight(leafView: LeafView): void {
      this.owner.callObservers("viewWillHighlightLeaf", leafView, this.owner);
    },
    viewDidHighlight(leafView: LeafView): void {
      this.owner.callObservers("viewDidHighlightLeaf", leafView, this.owner);
    },
    viewWillUnhighlight(leafView: LeafView): void {
      this.owner.callObservers("viewWillUnhighlightLeaf", leafView, this.owner);
    },
    viewDidUnhighlight(leafView: LeafView): void {
      this.owner.callObservers("viewDidUnhighlightLeaf", leafView, this.owner);
    },
    viewDidEnter(leafView: LeafView): void {
      this.owner.callObservers("viewDidEnterLeaf", leafView, this.owner);
    },
    viewDidLeave(leafView: LeafView): void {
      this.owner.callObservers("viewDidLeaveLeaf", leafView, this.owner);
    },
    viewDidPress(input: PositionGestureInput, event: Event | null, leafView: LeafView): void {
      this.owner.callObservers("viewDidPressLeaf", input, event, leafView, this.owner);
    },
    viewDidLongPress(input: PositionGestureInput, leafView: LeafView): void {
      this.owner.callObservers("viewDidLongPressLeaf", input, leafView, this.owner);
    },
  })
  readonly leaf!: ViewRef<this, LeafView> & Observes<LeafView>;
  static readonly leaf: FastenerClass<RowView["leaf"]>;

  @ViewRef<RowView["head"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(headView: HtmlView): void {
      headView.addClass("head");
      headView.display.setState("none", Affinity.Intrinsic);
      headView.position.setState("absolute", Affinity.Intrinsic);
      headView.left.setState(0, Affinity.Intrinsic);
      headView.top.setState(this.owner.rowHeight.state, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      headView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
      headView.height.setState(this.owner.rowSpacing.state, Affinity.Intrinsic);
      headView.backgroundColor.setLook(Look.accentColor, Affinity.Intrinsic);
      headView.opacity.setState(this.owner.disclosing.phase, Affinity.Intrinsic);
      headView.zIndex.setState(1, Affinity.Intrinsic);
    },
  })
  readonly head!: ViewRef<this, HtmlView>;
  static readonly head: FastenerClass<RowView["head"]>;

  @ViewRef<RowView["tree"]>({
    // avoid cyclic static reference to viewType: TableView
    viewKey: true,
    binds: true,
    initView(treeView: TableView): void {
      treeView.addClass("tree");
      treeView.display.setState(this.owner.disclosure.collapsed ? "none" : "block", Affinity.Intrinsic);
      treeView.position.setState("absolute", Affinity.Intrinsic);
      treeView.left.setState(0, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      treeView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
      treeView.zIndex.setState(0, Affinity.Intrinsic);
      treeView.depth.setValue(this.owner.depth.value + 1, Affinity.Intrinsic);
    },
    willAttachView(treeView: TableView): void {
      this.owner.callObservers("viewWillAttachTree", treeView, this.owner);
    },
    didDetachView(treeView: TableView): void {
      this.owner.callObservers("viewDidDetachTree", treeView, this.owner);
    },
    createView(): TableView {
      return TableView.create();
    },
  })
  readonly tree!: ViewRef<this, TableView>;
  static readonly tree: FastenerClass<RowView["tree"]>;

  @ViewRef<RowView["foot"]>({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(footView: HtmlView): void {
      footView.addClass("foot");
      footView.display.setState("none", Affinity.Intrinsic);
      footView.position.setState("absolute", Affinity.Intrinsic);
      footView.left.setState(0, Affinity.Intrinsic);
      footView.top.setState(this.owner.rowHeight.state, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      footView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
      footView.height.setState(this.owner.rowSpacing.state, Affinity.Intrinsic);
      footView.backgroundColor.setLook(Look.borderColor, Affinity.Intrinsic);
      footView.opacity.setState(this.owner.disclosing.phase, Affinity.Intrinsic);
      footView.zIndex.setState(1, Affinity.Intrinsic);
    },
  })
  readonly foot!: ViewRef<this, HtmlView>;
  static readonly foot: FastenerClass<RowView["foot"]>;

  @ExpansionAnimator<RowView["disclosure"]>({
    value: Expansion.collapsed(),
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willExpand(): void {
      this.owner.callObservers("viewWillExpand", this.owner);
      const treeView = this.owner.tree.view;
      if (treeView !== null) {
        treeView.display.setState("block", Affinity.Intrinsic);
      }
    },
    didExpand(): void {
      this.owner.callObservers("viewDidExpand", this.owner);
    },
    willCollapse(): void {
      this.owner.callObservers("viewWillCollapse", this.owner);
    },
    didCollapse(): void {
      const treeView = this.owner.tree.view;
      if (treeView !== null) {
        treeView.display.setState("none", Affinity.Intrinsic);
      }
      this.owner.callObservers("viewDidCollapse", this.owner);
    },
    didSetValue(newDisclosure: Expansion, oldDisclosure: Expansion): void {
      if (newDisclosure.direction !== 0) {
        this.owner.disclosing.setState(newDisclosure, Affinity.Intrinsic);
      } else {
        this.owner.disclosing.setState(null, Affinity.Intrinsic);
        this.owner.disclosing.setAffinity(Affinity.Transient);
      }
      const tableView = this.owner.getBase(TableView);
      if (tableView !== null) {
        tableView.requireUpdate(View.NeedsLayout);
      }
    },
  })
  readonly disclosure!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @ExpansionAnimator({value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly disclosing!: ExpansionAnimator<this, Expansion | null, AnyExpansion | null>;

  @Property<TableView["visibleFrame"]>({
    valueType: R2Box,
    value: null,
    inherits: true,
    init(): void {
      this.outletValue = null;
    },
    getOutletValue(outlet: Property<unknown, R2Box | null>): R2Box | null {
      return this.outletValue;
    },
    setOutletValue(newOutletValue: R2Box | null): void {
      const oldOutletValue = this.outletValue;
      if (!this.equalValues(newOutletValue, oldOutletValue)) {
        this.outletValue = newOutletValue;
        this.decohereOutlets();
      }
    },
  })
  readonly visibleFrame!: Property<this, R2Box | null> & {
    /** @internal */
    outletValue: R2Box | null,
    /** @internal */
    setOutletValue(newOutletValue: R2Box | null): void,
  };

  protected detectVisibleFrame(): R2Box {
    const xBleed = 0;
    const yBleed = this.rowHeight.getValueOr(Length.zero()).pxValue();
    const parentVisibleFrame = this.visibleFrame.value;
    if (parentVisibleFrame !== null) {
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

  protected override onProcess(processFlags: ViewFlags): void {
    super.onProcess(processFlags);
    const visibleFrame = this.detectVisibleFrame();
    this.visibleFrame.setOutletValue(visibleFrame);
  }

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected override onDisplay(displayFlags: ViewFlags): void {
    super.onDisplay(displayFlags);
    const visibleFrame = this.detectVisibleFrame();
    this.visibleFrame.setOutletValue(visibleFrame);
  }

  protected override onLayout(): void {
    super.onLayout();
    this.resizeRow();
    const leafView = this.leaf.view;
    if (leafView !== null) {
      this.layoutLeaf(leafView);
    }
  }

  protected resizeRow(): void {
    const oldLayout = !this.layout.derived ? this.layout.value : null;
    if (oldLayout !== null) {
      const superLayout = this.layout.inletValue;
      let width: Length | number | null = null;
      if (superLayout !== void 0 && superLayout !== null && superLayout.width !== null) {
        width = superLayout.width.pxValue();
      }
      if (width === null) {
        width = this.width.state;
        width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      }
      const newLayout = oldLayout.resized(width, 0, 0);
      this.layout.setValue(newLayout);
    }
  }

  protected layoutLeaf(leafView: LeafView): void {
    const layout = this.layout.value;
    const width = layout !== null ? layout.width : null;
    const timing = this.getLook(Look.timing);
    leafView.top.setState(0, timing, Affinity.Intrinsic);
    leafView.width.setState(width, Affinity.Intrinsic);
  }

  protected override didLayout(): void {
    this.layoutRow();
    super.didLayout();
  }

  protected layoutRow(): void {
    const layout = this.layout.value;
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
