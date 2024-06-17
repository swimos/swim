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
import type {Timing} from "@swim/util";
import type {Creatable} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import {R2Box} from "@swim/math";
import {Expansion} from "@swim/style";
import {ExpansionAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeConstraintAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {TableLayout} from "./TableLayout";
import type {CellView} from "./CellView";
import {LeafView} from "./LeafView";
import {TableView} from "./"; // forward reference

/** @public */
export interface RowViewObserver<V extends RowView = RowView> extends HtmlViewObserver<V> {
  viewWillAttachLeaf?(leafView: LeafView, view: V): void;

  viewDidDetachLeaf?(leafView: LeafView, view: V): void;

  viewWillHighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidHighlightLeaf?(leafView: LeafView, view: V): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, view: V): void;

  viewDidEnterLeaf?(leafView: LeafView, view: V): void;

  viewDidLeaveLeaf?(leafView: LeafView, view: V): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, view: V): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, view: V): void;

  viewWillAttachTree?(treeView: TableView, view: V): void;

  viewDidDetachTree?(treeView: TableView, view: V): void;

  viewWillExpand?(view: V): void;

  viewDidExpand?(view: V): void;

  viewWillCollapse?(view: V): void;

  viewDidCollapse?(view: V): void;
}

/** @public */
export class RowView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initRow();
  }

  protected initRow(): void {
    this.setIntrinsic<RowView>({
      classList: ["row"],
      style: {
        position: "relative",
      },
    });
  }

  declare readonly observerType?: Class<RowViewObserver>;

  @Property({valueType: TableLayout, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null>;

  @Property({
    valueType: Number,
    value: 0,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(newDepth: number, oldDepth: number): void {
      const treeView = this.owner.tree.view;
      if (treeView !== null) {
        treeView.depth.setIntrinsic(newDepth + 1);
      }
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length | null>;

  @ThemeConstraintAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length | null>;

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

  @ViewRef({
    viewType: LeafView,
    viewKey: true,
    binds: true,
    observes: true,
    initView(leafView: LeafView): void {
      const layout = this.owner.layout.value;
      leafView.style.setIntrinsic({
        display: "none",
        position: "absolute",
        left: 0,
        top: 0,
        width: layout !== null ? layout.width : null,
        zIndex: 1,
      });
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

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(headView: HtmlView): void {
      const layout = this.owner.layout.value;
      headView.setIntrinsic({
        classList: ["head"],
        style: {
          display: "none",
          position: "absolute",
          left: 0,
          top: this.owner.rowHeight.state,
          width: layout !== null ? layout.width : null,
          height: this.owner.rowSpacing.state,
          backgroundColor: Look.accentColor,
          opacity: this.owner.disclosing.getPhaseOr(1) * this.owner.expanding.getPhaseOr(1),
          zIndex: 1,
        },
      });
    },
  })
  readonly head!: ViewRef<this, HtmlView>;

  @ViewRef({
    get viewType(): typeof TableView {
      return TableView;
    },
    viewKey: true,
    binds: true,
    initView(treeView: TableView): void {
      const layout = this.owner.layout.value;
      treeView.setIntrinsic({
        classList: ["tree"],
        style: {
          display: this.owner.disclosure.collapsed ? "none" : "block",
          position: "absolute",
          left: 0,
          width: layout !== null ? layout.width : null,
          zIndex: 0,
        },
      });
      treeView.depth.setIntrinsic(this.owner.depth.value + 1);
    },
    willAttachView(treeView: TableView): void {
      this.owner.callObservers("viewWillAttachTree", treeView, this.owner);
    },
    didDetachView(treeView: TableView): void {
      this.owner.callObservers("viewDidDetachTree", treeView, this.owner);
    },
  })
  readonly tree!: ViewRef<this, TableView>;

  @ViewRef({
    viewType: HtmlView,
    viewKey: true,
    binds: true,
    initView(footView: HtmlView): void {
      const layout = this.owner.layout.value;
      footView.setIntrinsic({
        classList: ["foot"],
        style: {
          display: "none",
          position: "absolute",
          left: 0,
          top: this.owner.rowHeight.state,
          width: layout !== null ? layout.width : null,
          height: this.owner.rowSpacing.state,
          backgroundColor: Look.borderColor,
          opacity: this.owner.disclosing.getPhaseOr(1) * this.owner.expanding.getPhaseOr(1),
          zIndex: 1,
        },
      });
    },
  })
  readonly foot!: ViewRef<this, HtmlView>;

  @ExpansionAnimator({value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly expansion!: ExpansionAnimator<this, Expansion | null>;

  @ExpansionAnimator({value: Expansion.expanded(), inherits: true, updateFlags: View.NeedsLayout})
  readonly expanding!: ExpansionAnimator<this, Expansion | null>;

  @ExpansionAnimator({
    value: Expansion.collapsed(),
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willExpand(): void {
      this.owner.callObservers("viewWillExpand", this.owner);
      const treeView = this.owner.tree.view;
      if (treeView !== null) {
        treeView.style.display.setIntrinsic("block");
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
        treeView.style.display.setIntrinsic("none");
      }
      this.owner.callObservers("viewDidCollapse", this.owner);
    },
    didSetValue(newDisclosure: Expansion, oldDisclosure: Expansion): void {
      if (newDisclosure.direction !== 0) {
        this.owner.disclosing.setIntrinsic(newDisclosure);
      } else {
        this.owner.disclosing.setAffinity(Affinity.Transient);
      }
      const tableView = this.owner.getRoot(TableView);
      if (tableView !== null) {
        tableView.requireUpdate(View.NeedsLayout);
      }
    },
  })
  readonly disclosure!: ExpansionAnimator<this, Expansion>;

  @ExpansionAnimator({value: Expansion.collapsed(), inherits: true, updateFlags: View.NeedsLayout})
  readonly disclosing!: ExpansionAnimator<this, Expansion | null>;

  @Property({
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
      const left = this.style.left.pxState();
      const top = this.style.top.pxState();
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
    this.rowHeight.recohere(this.updateTime);
    super.onLayout();
    this.resizeRow();
    const leafView = this.leaf.view;
    if (leafView !== null) {
      this.layoutLeaf(leafView);
    }
  }

  protected resizeRow(): void {
    const oldLayout = !this.layout.derived ? this.layout.value : null;
    if (oldLayout === null) {
      return;
    }
    const superLayout = this.layout.inletValue;
    let width: number;
    if (superLayout !== void 0 && superLayout !== null && superLayout.width !== null) {
      width = superLayout.width.pxValue();
    } else {
      width = this.style.width.pxState();
    }
    const newLayout = oldLayout.resized(width, 0, 0);
    this.layout.set(newLayout);
  }

  protected layoutLeaf(leafView: LeafView): void {
    const layout = this.layout.value;
    const width = layout !== null ? layout.width : null;
    const timing = this.getLook(Look.timing);
    leafView.style.top.setIntrinsic(0, timing);
    leafView.style.width.setIntrinsic(width);
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
    const disclosingPhase = this.disclosing.getPhaseOr(1) * this.expanding.getPhaseOr(1);

    let leafHeightValue = 0;
    let leafHeightState = 0;
    const leafView = this.leaf.view;
    if (leafView !== null) {
      leafView.style.width.setIntrinsic(width);
      leafView.style.display.setIntrinsic("flex");
      leafHeightValue = leafView.style.height.pxValue();
      leafHeightState = leafView.style.height.pxState();
    }

    const headView = this.head.view;
    if (headView !== null) {
      if (!disclosure.collapsed) {
        headView.style.top.setIntrinsic(leafHeightValue);
        headView.style.width.setIntrinsic(width);
        headView.style.height.setIntrinsic(rowSpacing);
        headView.style.opacity.setIntrinsic(disclosingPhase);
        headView.style.display.setIntrinsic("block");
      } else {
        headView.style.display.setIntrinsic("none");
      }
    }

    let treeHeightValue = 0;
    let treeHeightState = 0;
    const treeView = this.tree.view;
    if (treeView !== null) {
      if (!disclosure.collapsed) {
        treeView.style.top.setIntrinsic(leafHeightValue + rowSpacing * disclosingPhase);
        treeView.style.width.setIntrinsic(width);
        treeView.style.display.setIntrinsic("block");
        treeHeightValue = treeView.style.height.pxValue();
        treeHeightValue += rowSpacing * disclosingPhase;
        treeHeightState = treeView.style.height.pxState();
        treeHeightState += rowSpacing;
      } else {
        treeView.style.display.setIntrinsic("none");
      }
    }

    const footView = this.foot.view;
    if (footView !== null) {
      if (!disclosure.collapsed) {
        footView.style.top.setIntrinsic(leafHeightValue + treeHeightValue);
        footView.style.width.setIntrinsic(width);
        footView.style.height.setIntrinsic(rowSpacing);
        footView.style.opacity.setIntrinsic(disclosingPhase);
        footView.style.display.setIntrinsic("block");
      } else {
        footView.style.display.setIntrinsic("none");
      }
    }

    if (this.style.height.hasAffinity(Affinity.Intrinsic)) {
      const heightValue = leafHeightValue + treeHeightValue;
      const heightState = leafHeightState + treeHeightState;
      this.style.height.setInterpolatedValue(Length.px(heightValue), Length.px(heightState));
    }
  }

  protected override onCull(): void {
    super.onCull();
    this.style.display.setIntrinsic("none");
  }

  protected override onUncull(): void {
    super.onUncull();
    this.style.display.setIntrinsic("block");
  }
}
