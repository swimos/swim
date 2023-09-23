// Copyright 2015-2023 Nstream, inc.
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
import {Feel} from "@swim/theme";
import {ThemeConstraintAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import {TableLayout} from "./TableLayout";
import type {LeafView} from "./LeafView";
import {RowView} from "./RowView";
import {HeaderView} from "./HeaderView";

/** @public */
export interface TableViewObserver<V extends TableView = TableView> extends HtmlViewObserver<V> {
  viewWillAttachHeader?(headerView: HeaderView, view: V): void;

  viewDidDetachHeader?(headerView: HeaderView, view: V): void;

  viewWillAttachRow?(rowView: RowView, targetView: View | null, view: V): void;

  viewDidDetachRow?(rowView: RowView, view: V): void;

  viewWillAttachLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidDetachLeaf?(leafView: LeafView, rowView: RowView): void;

  viewWillHighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidHighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewWillUnhighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidUnhighlightLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidEnterLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidLeaveLeaf?(leafView: LeafView, rowView: RowView): void;

  viewDidPressLeaf?(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowView: RowView): void;

  viewDidLongPressLeaf?(input: PositionGestureInput, leafView: LeafView, rowView: RowView): void;

  viewWillAttachTree?(treeView: TableView, rowView: RowView): void;

  viewDidDetachTree?(treeView: TableView, rowView: RowView): void;

  viewWillExpandRow?(rowView: RowView): void;

  viewDidExpandRow?(rowView: RowView): void;

  viewWillCollapseRow?(rowView: RowView): void;

  viewDidCollapseRow?(rowView: RowView): void;

  viewWillExpand?(view: V): void;

  viewDidExpand?(view: V): void;

  viewWillCollapse?(view: V): void;

  viewDidCollapse?(view: V): void;
}

/** @public */
export class TableView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.visibleViews = [];
    this.initTable();
  }

  protected initTable(): void {
    this.setIntrinsic<TableView>({
      classList: ["table"],
      style: {
        position: "relative",
        backgroundColor: Look.backgroundColor,
        boxSizing: "border-box",
      },
    });
  }

  declare readonly observerType?: Class<TableViewObserver>;

  @Property({valueType: TableLayout, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null>;

  @Property({
    valueType: Number,
    value: 0,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(newDepth: number, oldDepth: number): void {
      this.owner.modifyTheme(Feel.default, [[Feel.nested, newDepth !== 0 ? 1 : void 0]], false);
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.zero(), inherits: true, updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(24), inherits: true, updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length>;

  @Property({valueType: Boolean, value: false, inherits: true})
  readonly hovers!: Property<this, boolean>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly glows!: Property<this, boolean>;

  @ExpansionAnimator({
    value: Expansion.expanded(),
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    willExpand(): void {
      this.owner.callObservers("viewWillExpand", this.owner);
    },
    didExpand(): void {
      this.owner.callObservers("viewDidExpand", this.owner);
    },
    willCollapse(): void {
      this.owner.callObservers("viewWillCollapse", this.owner);
    },
    didCollapse(): void {
      this.owner.callObservers("viewDidCollapse", this.owner);
    },
    didSetValue(newExpansion: Expansion, oldExpansion: Expansion): void {
      if (newExpansion.phase !== 1) {
        this.owner.expanding.setIntrinsic(newExpansion);
      } else {
        this.owner.expanding.setAffinity(Affinity.Transient);
      }
      const tableView = this.owner.getRoot(TableView);
      if (tableView !== null) {
        tableView.requireUpdate(View.NeedsLayout);
      } else {
        this.owner.requireUpdate(View.NeedsLayout);
      }
    },
  })
  readonly expansion!: ExpansionAnimator<this, Expansion>;

  @ExpansionAnimator({value: Expansion.expanded(), inherits: true})
  readonly expanding!: ExpansionAnimator<this, Expansion | null>;

  @ExpansionAnimator({value: null, inherits: true})
  readonly disclosure!: ExpansionAnimator<this, Expansion | null>;

  @ExpansionAnimator({value: Expansion.expanded(), inherits: true})
  readonly disclosing!: ExpansionAnimator<this, Expansion | null>;

  @ExpansionAnimator({value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionAnimator<this, Expansion | null>;

  @ViewRef({
    viewType: HeaderView,
    viewKey: true,
    binds: true,
    initView(headerView: HeaderView): void {
      const layout = this.owner.layout.value;
      headerView.style.setIntrinsic({
        display: "none",
        position: "absolute",
        left: 0,
        top: null,
        width: layout !== null ? layout.width : null,
      });
      headerView.setCulled(true);
    },
    willAttachView(headerView: HeaderView): void {
      this.owner.callObservers("viewWillAttachHeader", headerView, this.owner);
    },
    didDetachView(headerView: HeaderView): void {
      this.owner.callObservers("viewDidDetachHeader", headerView, this.owner);
    },
    insertChild(parent: View, child: HeaderView, target: View | number | null, key: string | undefined): void {
      parent.prependChild(child, key);
    }
  })
  readonly header!: ViewRef<this, HeaderView>;

  getRow<F extends Class<RowView>>(key: string, rowViewClass: F): InstanceType<F> | null;
  getRow(key: string): RowView | null;
  getRow(key: string, rowViewClass?: Class<RowView>): RowView | null {
    if (rowViewClass === void 0) {
      rowViewClass = RowView;
    }
    const rowView = this.getChild(key);
    return rowView instanceof rowViewClass ? rowView : null;
  }

  getOrCreateRow<F extends Class<Instance<F, RowView>> & Creatable<Instance<F, RowView>>>(key: string, rowViewClass: F): InstanceType<F>;
  getOrCreateRow(key: string): RowView;
  getOrCreateRow(key: string, rowViewClass?: Class<RowView> & Creatable<RowView>): RowView {
    if (rowViewClass === void 0) {
      rowViewClass = RowView;
    }
    let rowView = this.getChild(key, rowViewClass);
    if (rowView === null) {
      rowView = rowViewClass.create();
      this.setChild(key, rowView);
    }
    return rowView!;
  }

  setRow(key: string, rowView: RowView | null): void {
    this.setChild(key, rowView);
  }

  @ViewSet({
    viewType: RowView,
    binds: true,
    observes: true,
    initView(rowView: RowView): void {
      const layout = this.owner.layout.value;
      rowView.style.setIntrinsic({
        display: "none",
        position: "absolute",
        left: 0,
        top: null,
        width: layout !== null ? layout.width : null,
      });
      rowView.setCulled(true);
    },
    willAttachView(rowView: RowView, target: View | null): void {
      this.owner.callObservers("viewWillAttachRow", rowView, target, this.owner);
    },
    didDetachView(rowView: RowView): void {
      this.owner.callObservers("viewDidDetachRow", rowView, this.owner);
    },
    viewWillAttachLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewWillAttachLeaf", leafView, rowView);
    },
    viewDidDetachLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidDetachLeaf", leafView, rowView);
    },
    viewDidEnterLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidEnterLeaf", leafView, rowView);
    },
    viewDidLeaveLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidLeaveLeaf", leafView, rowView);
    },
    viewDidPressLeaf(input: PositionGestureInput, event: Event | null, leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidPressLeaf", input, event, leafView, rowView);
    },
    viewDidLongPressLeaf(input: PositionGestureInput, leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidLongPressLeaf", input, leafView, rowView);
    },
    viewWillAttachTree(treeView: TableView, rowView: RowView): void {
      this.owner.callObservers("viewWillAttachTree", treeView, rowView);
    },
    viewDidDetachTree(treeView: TableView, rowView: RowView): void {
      this.owner.callObservers("viewDidDetachTree", treeView, rowView);
    },
    viewWillHighlightLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewWillHighlightLeaf", leafView, rowView);
    },
    viewDidHighlightLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidHighlightLeaf", leafView, rowView);
    },
    viewWillUnhighlightLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewWillUnhighlightLeaf", leafView, rowView);
    },
    viewDidUnhighlightLeaf(leafView: LeafView, rowView: RowView): void {
      this.owner.callObservers("viewDidUnhighlightLeaf", leafView, rowView);
    },
    viewWillExpand(rowView: RowView): void {
      this.owner.callObservers("viewWillExpandRow", rowView);
    },
    viewDidExpand(rowView: RowView): void {
      this.owner.callObservers("viewDidExpandRow", rowView);
    },
    viewWillCollapse(rowView: RowView): void {
      this.owner.callObservers("viewWillCollapseRow", rowView);
    },
    viewDidCollapse(rowView: RowView): void {
      this.owner.callObservers("viewDidCollapseRow", rowView);
    },
  })
  readonly rows!: ViewSet<this, RowView> & Observes<RowView>;

  /** @internal */
  readonly visibleViews: readonly View[];

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

  override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected override onResize(): void {
    super.onResize();
    this.resizeTable();
  }

  protected resizeTable(): void {
    const oldLayout = !this.layout.derived ? this.layout.value : null;
    if (oldLayout !== null) {
      const superLayout = this.layout.inletValue;
      let width: Length | number | null = null;
      if (superLayout !== void 0 && superLayout !== null && superLayout.width !== null) {
        width = superLayout.width.pxValue();
      }
      if (width === null) {
        width = this.style.width.pxState();
      }
      const edgeInsets = this.edgeInsets.value;
      const paddingLeft = this.style.paddingLeft.pxState();
      const paddingRight = this.style.paddingRight.pxState();
      let left = edgeInsets !== null ? edgeInsets.insetLeft : 0;
      left += paddingLeft;
      let right = edgeInsets !== null ? edgeInsets.insetRight : 0;
      right += paddingRight;
      const newLayout = oldLayout.resized(width, left, right);
      this.layout.set(newLayout);
    }
  }

  protected processVisibleViews(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const child = visibleViews[i]!;
      processChild.call(this, child, processFlags);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override processChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    if (!this.culled) {
      if ((processFlags & View.NeedsScroll) !== 0) {
        this.scrollChildren(processFlags, processChild);
      } else {
        this.processVisibleViews(processFlags, processChild);
      }
    }
  }

  protected scrollChildren(processFlags: ViewFlags, processChild: (this: this, child: View, processFlags: ViewFlags) => void): void {
    const rowHeight = this.rowHeight.getValue().pxValue();
    const rowSpacing = this.rowSpacing.getValue().pxValue(rowHeight);
    const expandingPhase = this.expanding.getPhaseOr(1);
    const disclosingPhase = this.disclosing.getPhaseOr(1);

    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame();
    this.visibleFrame.setOutletValue(visibleFrame);

    let yValue = 0;
    let yState = 0;
    let rowIndex = 0;

    type self = this;
    function scrollChild(this: self, child: View, processFlags: ViewFlags): void {
      if (child instanceof RowView || child instanceof HeaderView) {
        if (rowIndex !== 0) {
          if (child instanceof RowView) {
            yValue += rowSpacing * disclosingPhase * expandingPhase;
          } else {
            yValue += rowSpacing * disclosingPhase;
          }
          yState += rowSpacing;
        }
        if (child.style.top.hasAffinity(Affinity.Intrinsic)) {
          child.style.top.setInterpolatedValue(Length.px(yValue), Length.px(yState));
        }
      }
      let isVisible: boolean;
      if (child instanceof HtmlView) {
        const top = child.style.top.state;
        const height = child.style.height.state;
        if (top !== null && height !== null) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = disclosingPhase !== 0 && (child instanceof HeaderView || expandingPhase !== 0)
                   && yMin0 <= yMax1 && yMin1 <= yMax0 && yMin1 !== yMax1;
          child.style.display.setIntrinsic(isVisible ? "flex" : "none");
          child.setCulled(!isVisible);
        } else {
          isVisible = true;
        }
      } else {
        isVisible = true;
      }
      if (isVisible) {
        visibleViews.push(child);
        processChild.call(this, child, processFlags);
      }
      if (child instanceof RowView || child instanceof HeaderView) {
        if (child instanceof RowView) {
          yValue += child.style.height.pxValue() * disclosingPhase * expandingPhase;
        } else {
          yValue += child.style.height.pxValue() * disclosingPhase;
        }
        yState += child.style.height.pxState();
        rowIndex += 1;
      }
    }
    super.processChildren(processFlags, scrollChild);
  }

  protected displayVisibleViews(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const child = visibleViews[i]!;
      displayChild.call(this, child, displayFlags);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildren(displayFlags, displayChild);
    } else {
      this.displayVisibleViews(displayFlags, displayChild);
    }
  }

  protected layoutChildren(displayFlags: ViewFlags, displayChild: (this: this, child: View, displayFlags: ViewFlags) => void): void {
    this.rowHeight.recohere(this.updateTime);
    this.resizeTable();
    const layout = this.layout.value;
    const width = layout !== null ? layout.width : null;
    const rowHeight = this.rowHeight.getValue().pxValue();
    const rowSpacing = this.rowSpacing.getValue().pxValue(rowHeight);
    const expandingPhase = this.expanding.getPhaseOr(1);
    const disclosurePhase = this.disclosure.getPhaseOr(1);
    const disclosingPhase = this.disclosing.getPhaseOr(1);
    const timing = !this.disclosing.tweening ? this.getLook(Look.timing) : null;

    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame();
    this.visibleFrame.setOutletValue(visibleFrame);

    let yValue = 0;
    let yState = 0;
    let rowIndex = 0;

    type self = this;
    function layoutChild(this: self, child: View, displayFlags: ViewFlags): void {
      if (child instanceof RowView || child instanceof HeaderView) {
        if (rowIndex !== 0) {
          if (child instanceof RowView) {
            yValue += rowSpacing * disclosingPhase * expandingPhase;
          } else {
            yValue += rowSpacing * disclosingPhase;
          }
          yState += rowSpacing;
        }
        if (child.style.top.hasAffinity(Affinity.Intrinsic)) {
          if (yValue !== yState || child.style.display.value === "none") {
            child.style.top.setInterpolatedValue(Length.px(yValue), Length.px(yState));
          } else {
            child.style.top.setIntrinsic(yState, timing);
          }
        }
        child.style.width.setIntrinsic(width);
      }
      let isVisible: boolean;
      if (child instanceof HtmlView) {
        const top = child.style.top.state;
        const height = child.style.height.state;
        if (top !== null && height !== null) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = disclosingPhase !== 0 && (child instanceof HeaderView || expandingPhase !== 0)
                   && yMin0 <= yMax1 && yMin1 <= yMax0 && yMin1 !== yMax1;
        } else {
          isVisible = true;
        }
        if (child instanceof RowView) {
          child.style.opacity.setIntrinsic(disclosurePhase * expandingPhase);
        } else {
          child.style.opacity.setIntrinsic(disclosurePhase);
        }
        child.style.display.setIntrinsic(isVisible ? "flex" : "none");
        child.setCulled(!isVisible);
      } else {
        isVisible = true;
      }
      if (isVisible) {
        visibleViews.push(child);
      }
      displayChild.call(this, child, displayFlags);
      if (child instanceof RowView || child instanceof HeaderView) {
        if (child instanceof RowView) {
          yValue += child.style.height.pxValue() * disclosingPhase * expandingPhase;
        } else {
          yValue += child.style.height.pxValue() * disclosingPhase;
        }
        yState += child.style.height.pxState();
        rowIndex += 1;
      }
    }
    super.displayChildren(displayFlags, layoutChild);

    if (this.style.height.hasAffinity(Affinity.Intrinsic)) {
      this.style.height.setInterpolatedValue(Length.px(yValue), Length.px(yState));
    }
  }
}
