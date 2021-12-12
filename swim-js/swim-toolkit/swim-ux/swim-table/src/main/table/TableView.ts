// Copyright 2015-2021 Swim.inc
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
import {Affinity, MemberFastenerClass, Property} from "@swim/component";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyExpansion, Expansion} from "@swim/style";
import {
  Look,
  Feel,
  ThemeAnimator,
  ExpansionThemeAnimator,
  ThemeConstraintAnimator,
} from "@swim/theme";
import {
  ViewportInsets,
  PositionGestureInput,
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewRef,
  ViewSet,
} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyTableLayout, TableLayout} from "../layout/TableLayout";
import type {LeafView} from "../leaf/LeafView";
import {RowView} from "../row/RowView";
import {HeaderView} from "../header/HeaderView";
import type {TableViewContext} from "./TableViewContext";
import type {TableViewObserver} from "./TableViewObserver";

/** @public */
export class TableView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.visibleViews = [];
    this.visibleFrame = new R2Box(0, 0, window.innerWidth, window.innerHeight);
    this.initTable();
  }

  protected initTable(): void {
    this.addClass("table");
    this.position.setState("relative", Affinity.Intrinsic);
    this.backgroundColor.setLook(Look.backgroundColor, Affinity.Intrinsic);
  }

  override readonly observerType?: Class<TableViewObserver>;

  override readonly contextType?: Class<TableViewContext>;

  @Property({type: TableLayout, inherits: true, value: null, updateFlags: View.NeedsLayout})
  readonly layout!: Property<this, TableLayout | null, AnyTableLayout | null>;

  @Property({type: Object, inherits: true, value: null, updateFlags: View.NeedsLayout})
  readonly edgeInsets!: Property<this, ViewportInsets | null>;

  @Property<TableView, number>({
    type: Number,
    inherits: true,
    value: 0,
    updateFlags: View.NeedsLayout,
    didSetValue(newDepth: number, oldDepth: number): void {
      this.owner.modifyTheme(Feel.default, [[Feel.nested, newDepth !== 0 ? 1 : void 0]], false);
    },
  })
  readonly depth!: Property<this, number>;

  @ThemeConstraintAnimator({type: Length, inherits: true, value: Length.zero(), updateFlags: View.NeedsLayout})
  readonly rowSpacing!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @ThemeConstraintAnimator({type: Length, inherits: true, value: Length.px(24), updateFlags: View.NeedsLayout})
  readonly rowHeight!: ThemeConstraintAnimator<this, Length, AnyLength>;

  @Property({type: Boolean, inherits: true, value: false})
  readonly hovers!: Property<this, boolean>;

  @Property({type: Boolean, inherits: true, value: true})
  readonly glows!: Property<this, boolean>;

  @ThemeAnimator({type: Expansion, inherits: true, value: null})
  readonly disclosure!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  @ThemeAnimator({type: Expansion, inherits: true, value: null})
  readonly disclosing!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  @ThemeAnimator({type: Expansion, inherits: true, value: null, updateFlags: View.NeedsLayout})
  readonly stretch!: ExpansionThemeAnimator<this, Expansion | null, AnyExpansion | null>;

  @ViewRef<TableView, HeaderView>({
    key: true,
    type: HeaderView,
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
  static readonly header: MemberFastenerClass<TableView, "header">;

  @ViewSet<TableView, RowView>({
    type: RowView,
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
  readonly rows!: ViewSet<this, RowView>;
  static readonly rows: MemberFastenerClass<TableView, "rows">;

  /** @internal */
  readonly visibleViews: ReadonlyArray<View>;

  /** @internal */
  readonly visibleFrame: R2Box;

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

  override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeTable();
  }

  protected resizeTable(): void {
    const oldLayout = !this.layout.inherited ? this.layout.value : null;
    if (oldLayout !== null) {
      const superLayout = this.layout.superValue;
      let width: Length | number | null = null;
      if (superLayout !== void 0 && superLayout !== null && superLayout.width !== null) {
        width = superLayout.width.pxValue();
      }
      if (width === null) {
        width = this.width.state;
        width = width instanceof Length ? width.pxValue() : this.node.offsetWidth;
      }
      const edgeInsets = this.edgeInsets.value;
      let paddingLeft: Length | number | null = this.paddingLeft.state;
      paddingLeft = paddingLeft instanceof Length ? paddingLeft.pxValue(width) : 0;
      let paddingRight: Length | number | null = this.paddingRight.state;
      paddingRight = paddingRight instanceof Length ? paddingRight.pxValue(width) : 0;
      let left = edgeInsets !== null ? edgeInsets.insetLeft : 0;
      left += paddingLeft;
      let right = edgeInsets !== null ? edgeInsets.insetRight : 0;
      right += paddingRight;
      const newLayout = oldLayout.resized(width, left, right);
      this.layout.setValue(newLayout);
    }
  }

  protected processVisibleViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                processChild: (this: this, child: View, processFlags: ViewFlags,
                                               viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const child = visibleViews[i]!;
      processChild.call(this, child, processFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override processChildren(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     processChild: (this: this, child: View, processFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    if (!this.culled) {
      if ((processFlags & View.NeedsScroll) !== 0) {
        this.scrollChildViews(processFlags, viewContext, processChild);
      } else {
        this.processVisibleViews(processFlags, viewContext, processChild);
      }
    }
  }

  protected scrollChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                             processChild: (this: this, child: View, processFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    (viewContext as Mutable<ViewContextType<this>>).visibleFrame = visibleFrame;
    (this as Mutable<this>).visibleFrame = visibleFrame;

    type self = this;
    function scrollChildView(this: self, child: View, processFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
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
        processChild.call(this, child, processFlags, viewContext);
      }
    }
    super.processChildren(processFlags, viewContext, scrollChildView);
  }

  protected displayVisibleViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                               viewContext: ViewContextType<this>) => void): void {
    const visibleViews = this.visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const child = visibleViews[i]!;
      displayChild.call(this, child, displayFlags, viewContext);
      if ((child.flags & View.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~View.RemovingFlag);
        this.removeChild(child);
        continue;
      }
      i += 1;
    }
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    if ((displayFlags & View.NeedsLayout) !== 0) {
      this.layoutChildViews(displayFlags, viewContext, displayChild);
    } else {
      this.displayVisibleViews(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, child: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    this.resizeTable();
    const layout = this.layout.value;
    const width = layout !== null ? layout.width : null;
    const rowHeight = this.rowHeight.getValue();
    const rowSpacing = this.rowSpacing.getValue().pxValue(rowHeight.pxValue());
    const disclosingPhase = this.disclosing.getPhaseOr(1);

    const visibleViews = this.visibleViews as View[];
    visibleViews.length = 0;

    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    (viewContext as Mutable<ViewContextType<this>>).visibleFrame = visibleFrame;
    (this as Mutable<this>).visibleFrame = visibleFrame;

    let yValue = 0;
    let yState = 0;
    let rowIndex = 0;

    type self = this;
    function layoutChildView(this: self, child: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      if (child instanceof RowView || child instanceof HeaderView) {
        if (rowIndex !== 0) {
          yValue += rowSpacing * disclosingPhase;
          yState += rowSpacing;
        }
        if (child.top.hasAffinity(Affinity.Intrinsic)) {
          child.top.setInterpolatedValue(Length.px(yValue), Length.px(yState));
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
      displayChild.call(this, child, displayFlags, viewContext);
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
    super.displayChildren(displayFlags, viewContext, layoutChildView);

    if (this.height.hasAffinity(Affinity.Intrinsic)) {
      this.height.setInterpolatedValue(Length.px(yValue), Length.px(yState));
    }

    const disclosurePhase = this.disclosure.getPhaseOr(1);
    this.opacity.setState(disclosurePhase, Affinity.Intrinsic);
  }
}
