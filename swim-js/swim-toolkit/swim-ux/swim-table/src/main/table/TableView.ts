// Copyright 2015-2023 Swim.inc
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

import type {Class, Instance, Creatable, Observes} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyExpansion, Expansion, ExpansionAnimator} from "@swim/style";
import {Look, Feel, ThemeConstraintAnimator} from "@swim/theme";
import {ViewFlags, View, ViewRef, ViewSet, PositionGestureInput} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import type {LeafView} from "../leaf/LeafView";
import {RowView} from "../row/RowView";
import {HeaderView} from "../header/HeaderView";
import type {TableViewObserver} from "./TableViewObserver";

/** @public */
export class TableView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.visibleViews = [];
    this.initTable();
  }

  protected initTable(): void {
    this.addClass("table");
    this.position.setState("relative", Affinity.Intrinsic);
    this.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
    this.boxSizing.setState("border-box", Affinity.Intrinsic);
  }

  override readonly observerType?: Class<TableViewObserver>;

  @Property({valueType: TableLayout, value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  @Property<TableView["depth"]>({
    valueType: Number,
    value: 0,
    inherits: true,
    updateFlags: View.NeedsLayout,
    didSetValue(newDepth: number, oldDepth: number): void {
      this.owner.modifyTheme(Feel.default, [[Feel.nested, newDepth !== 0 ? 1 : void 0]], false);
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.zero(), inherits: true, updateFlags: View.NeedsScroll})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ThemeConstraintAnimator({valueType: Length, value: Length.px(24), inherits: true, updateFlags: View.NeedsScroll})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @Property({valueType: Boolean, value: false, inherits: true})
  readonly hovers!: Property<this, boolean>;

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly glows!: Property<this, boolean>;

  @ExpansionAnimator({value: null, inherits: true})
  readonly disclosure!: ExpansionAnimator<this, Expansion | null, AnyExpansion | null>;

  @ExpansionAnimator({value: null, inherits: true})
  readonly disclosing!: ExpansionAnimator<this, Expansion | null, AnyExpansion | null>;

  @ExpansionAnimator({value: null, inherits: true, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionAnimator<this, Expansion | null, AnyExpansion | null>;

  @ViewRef<TableView["header"]>({
    viewType: HeaderView,
    viewKey: true,
    binds: true,
    initView(headerView: HeaderView): void {
      headerView.display.setState("none", Affinity.Intrinsic);
      headerView.position.setState("absolute", Affinity.Intrinsic);
      headerView.left.setState(0, Affinity.Intrinsic);
      headerView.top.setState(null, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      headerView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
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
  static readonly header: FastenerClass<TableView["header"]>;

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

  @ViewSet<TableView["rows"]>({
    viewType: RowView,
    binds: true,
    observes: true,
    initView(rowView: RowView): void {
      rowView.display.setState("none", Affinity.Intrinsic);
      rowView.position.setState("absolute", Affinity.Intrinsic);
      rowView.left.setState(0, Affinity.Intrinsic);
      rowView.top.setState(null, Affinity.Intrinsic);
      const layout = this.owner.layout.value;
      rowView.width.setState(layout !== null ? layout.width : null, Affinity.Intrinsic);
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
  static readonly rows: FastenerClass<TableView["rows"]>;

  /** @internal */
  readonly visibleViews: ReadonlyArray<View>;

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
        width = this.width.pxState();
      }
      const edgeInsets = this.edgeInsets.value;
      const paddingLeft = this.paddingLeft.pxState();
      const paddingRight = this.paddingRight.pxState();
      let left = edgeInsets !== null ? edgeInsets.insetLeft : 0;
      left += paddingLeft;
      let right = edgeInsets !== null ? edgeInsets.insetRight : 0;
      right += paddingRight;
      const newLayout = oldLayout.resized(width, left, right);
      this.layout.setValue(newLayout);
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
    const rowHeight = this.rowHeight.getValue();
    const rowSpacing = this.rowSpacing.getValue().pxValue(rowHeight.pxValue());
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
          yValue += rowSpacing * disclosingPhase;
          yState += rowSpacing;
        }
        if (child.top.hasAffinity(Affinity.Intrinsic)) {
          child.top.setInterpolatedValue(Length.px(yValue), Length.px(yState));
        }
      }
      let isVisible: boolean;
      if (child instanceof HtmlView) {
        const top = child.top.state;
        const height = child.height.state;
        if (top instanceof Length && height instanceof Length) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = yMin0 <= yMax1 && yMin1 <= yMax0;
          child.display.setState(isVisible ? "flex" : "none", Affinity.Intrinsic);
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
        let heightValue: Length | number | null = child.height.value;
        heightValue = heightValue instanceof Length ? heightValue.pxValue() : child.node.offsetHeight;
        let heightState: Length | number | null = child.height.state;
        heightState = heightState instanceof Length ? heightState.pxValue() : heightValue;
        yValue += heightValue * disclosingPhase;
        yState += heightState;
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
    this.resizeTable();
    const layout = this.layout.value;
    const width = layout !== null ? layout.width : null;
    const rowHeight = this.rowHeight.getValue();
    const rowSpacing = this.rowSpacing.getValue().pxValue(rowHeight.pxValue());
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
          yValue += rowSpacing * disclosingPhase;
          yState += rowSpacing;
        }
        if (child.top.hasAffinity(Affinity.Intrinsic)) {
          if (child.top.pxValue() === 0 || yValue !== yState) {
            child.top.setInterpolatedValue(Length.px(yValue), Length.px(yState));
          } else {
            child.top.setState(yState, timing, Affinity.Intrinsic);
          }
        }
        child.width.setState(width, Affinity.Intrinsic);
      }
      let isVisible: boolean;
      if (child instanceof HtmlView) {
        const top = child.top.state;
        const height = child.height.state;
        if (top instanceof Length && height instanceof Length) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = yMin0 <= yMax1 && yMin1 <= yMax0;
        } else {
          isVisible = true;
        }
        child.display.setState(isVisible ? "flex" : "none", Affinity.Intrinsic);
        child.setCulled(!isVisible);
      } else {
        isVisible = true;
      }
      if (isVisible) {
        visibleViews.push(child);
      }
      displayChild.call(this, child, displayFlags);
      if (child instanceof RowView || child instanceof HeaderView) {
        let heightValue: Length | number | null = child.height.value;
        heightValue = heightValue instanceof Length ? heightValue.pxValue() : child.node.offsetHeight;
        let heightState: Length | number | null = child.height.state;
        heightState = heightState instanceof Length ? heightState.pxValue() : heightValue;
        yValue += heightValue * disclosingPhase;
        yState += heightState;
        rowIndex += 1;
      }
    }
    super.displayChildren(displayFlags, layoutChild);

    if (this.height.hasAffinity(Affinity.Intrinsic)) {
      this.height.setInterpolatedValue(Length.px(yValue), Length.px(yState));
    }

    const disclosurePhase = this.disclosure.getPhaseOr(1);
    this.opacity.setState(disclosurePhase, Affinity.Intrinsic);
  }
}
