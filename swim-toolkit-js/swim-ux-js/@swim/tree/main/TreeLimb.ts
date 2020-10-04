// Copyright 2015-2020 Swim inc.
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

import {BoxR2} from "@swim/math";
import {Length} from "@swim/length";
import {Tween, Transition} from "@swim/transition";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewScope,
  ViewAnimator,
  ViewNodeType,
  HtmlView,
} from "@swim/view";
import {Look, ThemedHtmlViewInit, ThemedHtmlView} from "@swim/theme";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import {TreeViewContext} from "./TreeViewContext";
import {AnyTreeLeaf, TreeLeaf} from "./TreeLeaf";
import {TreeLimbObserver} from "./TreeLimbObserver";
import {TreeLimbController} from "./TreeLimbController";
import {AnyTreeView, TreeView} from "./TreeView";

export type AnyTreeLimb = TreeLimb | TreeLimbInit;

export interface TreeLimbInit extends ThemedHtmlViewInit {
  viewController?: TreeLimbController;
  expanded?: boolean;

  leaf?: AnyTreeLeaf;
  subtree?: AnyTreeView;
}

export type TreeLimbState = "collapsed" | "expanding" | "expanded" | "collapsing";

export class TreeLimb extends ThemedHtmlView {
  /** @hidden */
  _visibleFrame: BoxR2;

  constructor(node: HTMLElement) {
    super(node);
    this._visibleFrame = new BoxR2(0, 0, window.innerWidth, window.innerHeight);
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree-limb");
    this.position.setAutoState("relative");
  }

  // @ts-ignore
  declare readonly viewController: TreeLimbController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeLimbObserver>;

  // @ts-ignore
  declare readonly viewContext: TreeViewContext;

  initView(init: TreeLimbInit): void {
    super.initView(init);
    if (init.expanded === true) {
      this.expand();
    } else if (init.expanded === false) {
      this.collapse();
    }

    if (init.leaf !== void 0) {
      this.setLeaf(init.leaf);
    }
    if (init.subtree !== void 0) {
      this.setSubtree(init.subtree);
    }
  }

  get leaf(): TreeLeaf | null {
    const childView = this.getChildView("leaf");
    return childView instanceof TreeLeaf ? childView : null;
  }

  setLeaf(leaf: AnyTreeLeaf | null): void {
    if (leaf !== null) {
      leaf = TreeLeaf.fromAny(leaf);
    }
    this.setChildView("leaf", leaf);
  }

  get subtree(): TreeView | null {
    const childView = this.getChildView("subtree");
    return childView instanceof TreeView ? childView : null;
  }

  setSubtree(subtree: AnyTreeView | null): void {
    if (subtree !== null) {
      subtree = TreeView.fromAny(subtree);
    }
    this.setChildView("subtree", subtree);
  }

  isExpanded(): boolean {
    const disclosureState = this.disclosureState.state;
    return disclosureState === "expanded" || disclosureState === "expanding";
  }

  isCollapsed(): boolean {
    const disclosureState = this.disclosureState.state;
    return disclosureState === "collapsed" || disclosureState === "collapsing";
  }

  @ViewScope({type: TreeSeed, inherit: true})
  seed: ViewScope<this, TreeSeed | undefined, AnyTreeSeed | undefined>;

  @ViewScope<TreeLimb, number>({
    type: Number,
    state: 0,
    onUpdate(depth: number): void {
      this.view.onUpdateDepth(depth);
    },
  })
  depth: ViewScope<this, number>;

  @ViewScope({type: String, state: "collapsed"})
  disclosureState: ViewScope<this, TreeLimbState>;

  @ViewAnimator({type: Number, state: 0})
  disclosurePhase: ViewAnimator<this, number>; // 0 = collapsed; 1 = expanded

  @ViewAnimator({type: Number, inherit: true})
  disclosingPhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  @ViewScope({type: Number, inherit: true})
  limbSpacing: ViewScope<this, number | undefined>;

  expand(tween?: Tween<any>): void {
    const disclosurePhase = this.disclosurePhase.value;
    if (this.isCollapsed() || disclosurePhase !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willExpand(tween);
      if (tween !== null) {
        if (disclosurePhase !== 1) {
          this.disclosurePhase.setState(1, tween.onEnd(this.didExpand.bind(this, tween)));
          this.disclosingPhase.setState(this.disclosurePhase.value);
          this.disclosingPhase.setState(1, tween);
        } else {
          setTimeout(this.didExpand.bind(this, tween));
        }
      } else {
        this.disclosurePhase.setState(1);
        this.disclosingPhase.setState(1);
        this.didExpand(tween);
      }
    }
  }

  protected willExpand(tween: Tween<any>): void {
    this.willObserve(function (viewObserver: TreeLimbObserver): void {
      if (viewObserver.limbWillExpand !== void 0) {
        viewObserver.limbWillExpand(this);
      }
    });
    this.disclosureState.setAutoState("expanding");
    this.requireUpdate(View.NeedsResize | View.NeedsChange | View.NeedsLayout);
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.display.setAutoState("block");
    }
  }

  protected didExpand(tween: Tween<any>): void {
    this.disclosureState.setAutoState("expanded");
    this.disclosingPhase.setInherited(true);
    this.didObserve(function (viewObserver: TreeLimbObserver): void {
      if (viewObserver.limbDidExpand !== void 0) {
        viewObserver.limbDidExpand(this);
      }
    });
  }

  collapse(tween?: Tween<any>): void {
    const disclosurePhase = this.disclosurePhase.value;
    if (this.isExpanded() || disclosurePhase !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willCollapse(tween);
      if (tween !== null) {
        if (disclosurePhase !== 0) {
          this.disclosurePhase.setState(0, tween.onEnd(this.didCollapse.bind(this, tween)));
          this.disclosingPhase.setState(this.disclosurePhase.value);
          this.disclosingPhase.setState(0, tween);
        } else {
          setTimeout(this.didCollapse.bind(this, tween));
        }
      } else {
        this.disclosurePhase.setState(0);
        this.disclosingPhase.setState(0);
        this.didCollapse(tween);
      }
    }
  }

  protected willCollapse(tween: Tween<any>): void {
    this.willObserve(function (viewObserver: TreeLimbObserver): void {
      if (viewObserver.limbWillCollapse !== void 0) {
        viewObserver.limbWillCollapse(this);
      }
    });
    this.disclosureState.setAutoState("collapsing");
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.height.setAutoState(0, tween);
    }
  }

  protected didCollapse(tween: Tween<any>): void {
    this.disclosureState.setAutoState("collapsed");
    this.disclosingPhase.setInherited(true);
    this.requireUpdate(View.NeedsResize | View.NeedsLayout);
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.display.setAutoState("none");
    }
    this.didObserve(function (viewObserver: TreeLimbObserver): void {
      if (viewObserver.limbDidCollapse !== void 0) {
        viewObserver.limbDidCollapse(this);
      }
    });
  }

  toggle(tween?: Tween<any>): void {
    const disclosureState = this.disclosureState.getStateOr("collapsed");
    if (disclosureState === "collapsed" || disclosureState === "collapsing") {
      this.expand(tween);
    } else if (disclosureState === "expanded" || disclosureState === "expanding") {
      this.collapse(tween);
    }
  }

  protected onCull(): void {
    super.onCull();
    this.display.setAutoState("none");
  }

  protected onUncull(): void {
    super.onUncull();
    this.display.setAutoState("block");
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    if (childView.key === "leaf" && childView instanceof TreeLeaf) {
      this.onInsertLeaf(childView);
    } else if (childView.key === "subtree" && childView instanceof TreeView) {
      this.onInsertSubtree(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView.key === "leaf" && childView instanceof TreeLeaf) {
      this.onRemoveLeaf(childView);
    } else if (childView.key === "subtree" && childView instanceof TreeView) {
      this.onRemoveSubtree(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertLeaf(leaf: TreeLeaf): void {
    leaf.position.setAutoState("absolute");
  }

  protected onRemoveLeaf(leaf: TreeLeaf): void {
    // hook
  }

  protected onInsertSubtree(subtree: TreeView): void {
    subtree.display.setAutoState(this.isExpanded() ? "block" : "none");
    subtree.position.setAutoState("absolute");
    subtree.left.setAutoState(0);
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    subtree.width.setAutoState(width);
    subtree.depth.setAutoState(this.depth.state);
  }

  protected onRemoveSubtree(subtree: TreeView): void {
    // hook
  }

  protected onUpdateDepth(depth: number): void {
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.depth.setAutoState(depth);
    }
  }

  protected detectVisibleFrame(viewContext: ViewContext): BoxR2 {
    const xBleed = 0;
    const yBleed = 64;
    const parentVisibleFrame = (viewContext as TreeViewContext).visibleFrame as BoxR2 | undefined;
    if (parentVisibleFrame !== void 0) {
      const left = this.left.state;
      const x = left instanceof Length ? left.pxValue() : 0;
      const top = this.top.state;
      const y = top instanceof Length ? top.pxValue() : 0;
      return new BoxR2(parentVisibleFrame.xMin - x - xBleed, parentVisibleFrame.yMin - y - yBleed,
                       parentVisibleFrame.xMax - x + xBleed, parentVisibleFrame.yMax - y + yBleed);
    } else {
      const {x, y} = this._node.getBoundingClientRect();
      return new BoxR2(-x - xBleed,
                       -y - yBleed,
                       window.innerWidth - x + xBleed,
                       window.innerHeight - y + yBleed);
    }
  }

  extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const treeViewContext = Object.create(viewContext);
    treeViewContext.visibleFrame = this._visibleFrame;
    return treeViewContext;
  }

  protected onScroll(viewContext: ViewContextType<this>): void {
    super.onScroll(viewContext);
    this._viewFlags |= View.NeedsScroll; // defer to display pass
    this.requireUpdate(View.NeedsDisplay);
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    if (this.disclosingPhase.isUpdated()) {
      this.requireUpdate(View.NeedsLayout);
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const needsScroll = (displayFlags & View.NeedsScroll) !== 0;
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    if (needsScroll || needsLayout) {
      this._visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
      (viewContext as any).visibleFrame = this._visibleFrame;
    }
    super.displayChildViews(displayFlags, viewContext, callback);
    if (needsLayout) {
      this.layoutLimb();
    }
    if (needsScroll) {
      this._viewFlags &= ~View.NeedsScroll;
    }
  }

  protected layoutLimb(): void {
    const disclosingPhase = this.disclosureState.state === "expanded"
                          ? this.disclosingPhase.getValueOr(1)
                          : 1;
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    const limbSpacing = this.limbSpacing.getStateOr(0);
    let y = 0;
    const leaf = this.leaf;
    if (leaf !== null) {
      const leafHeight = leaf.height.value;
      const dy = leafHeight instanceof Length
               ? leafHeight.pxValue()
               : leaf._node.offsetHeight;
      leaf.top.setAutoState(y * disclosingPhase);
      leaf.width.setAutoState(width !== void 0 ? width.pxValue() : void 0);
      y += dy * disclosingPhase;
    }
    const subtree = this.subtree;
    if (subtree !== null && this.disclosureState.state !== "collapsed") {
      const subtreeHeight = subtree.height.value;
      const dy = subtreeHeight instanceof Length
               ? subtreeHeight.pxValue()
               : subtree._node.offsetHeight;
      subtree.top.setAutoState(y * disclosingPhase);
      subtree.width.setAutoState(width);
      y += dy * disclosingPhase;
    } else {
      y += limbSpacing * disclosingPhase;
    }
    this.height.setAutoState(y);
  }

  static fromAny(limb: AnyTreeLimb): TreeLimb {
    if (limb instanceof TreeLimb) {
      return limb;
    } else if (typeof limb === "object" && limb !== null) {
      return TreeLimb.fromInit(limb);
    }
    throw new TypeError("" + limb);
  }

  static fromInit(init: TreeLimbInit): TreeLimb {
    const view = HtmlView.create(TreeLimb);
    view.initView(init);
    return view;
  }

  static readonly uncullFlags: ViewFlags = ThemedHtmlView.uncullFlags | View.NeedsLayout;
}
