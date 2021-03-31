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

import {AnyTiming, Timing} from "@swim/mapping";
import {Length, BoxR2} from "@swim/math";
import {Look} from "@swim/theme";
import {ViewContextType, ViewContext, ViewFlags, View, ViewProperty, ViewAnimator} from "@swim/view";
import {HtmlViewConstructor, HtmlViewInit, HtmlView} from "@swim/dom";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import type {TreeViewContext} from "./TreeViewContext";
import {AnyTreeLeaf, TreeLeaf} from "./TreeLeaf";
import type {TreeLimbObserver} from "./TreeLimbObserver";
import type {TreeLimbController} from "./TreeLimbController";
import {AnyTreeView, TreeView} from "./TreeView";

export type AnyTreeLimb = TreeLimb | TreeLimbInit | HTMLElement;

export interface TreeLimbInit extends HtmlViewInit {
  viewController?: TreeLimbController;
  expanded?: boolean;

  leaf?: AnyTreeLeaf;
  subtree?: AnyTreeView;
}

export type TreeLimbState = "collapsed" | "expanding" | "expanded" | "collapsing";

export class TreeLimb extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "visibleFrame", {
      value: new BoxR2(0, 0, window.innerWidth, window.innerHeight),
      enumerable: true,
      configurable: true,
    });
    this.initLimb();
  }

  protected initLimb(): void {
    this.addClass("tree-limb");
    this.position.setState("relative", View.Intrinsic);
  }

  declare readonly viewController: TreeLimbController | null;

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
    const disclosureState = this.disclosureState.getStateOr("expanded");
    return disclosureState === "expanded" || disclosureState === "expanding";
  }

  isCollapsed(): boolean {
    const disclosureState = this.disclosureState.getStateOr("expanded");
    return disclosureState === "collapsed" || disclosureState === "collapsing";
  }

  @ViewProperty({type: TreeSeed, state: null, inherit: true})
  declare seed: ViewProperty<this, TreeSeed | null, AnyTreeSeed | null>;

  @ViewProperty<TreeLimb, number>({
    type: Number,
    state: 0,
    didSetState(depth: number): void {
      this.owner.onUpdateDepth(depth);
    },
  })
  declare depth: ViewProperty<this, number>;

  @ViewProperty({type: String, state: "collapsed"})
  declare disclosureState: ViewProperty<this, TreeLimbState>;

  @ViewAnimator<TreeLimb, number>({
    type: Number,
    state: 0,
    didSetValue(newValue: number, oldValue: number): void {
      this.owner.descendantDidSetDisclosurePhase(this.owner, newValue);
    },
    onEnd(disclosurePhase: number): void {
      const disclosureState = this.owner.disclosureState.getStateOr("expanded");
      if (disclosureState === "expanding" && disclosurePhase === 1) {
        this.owner.didExpand();
      } else if (disclosureState === "collapsing" && disclosurePhase === 0) {
        this.owner.didCollapse();
      }
    },
  })
  declare disclosurePhase: ViewAnimator<this, number>; // 0 = collapsed; 1 = expanded

  @ViewAnimator({type: Number, inherit: true, updateFlags: View.NeedsLayout})
  declare disclosingPhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  @ViewProperty({type: Number, inherit: true})
  declare limbSpacing: ViewProperty<this, number | undefined>;

  expand(timing?: AnyTiming | boolean): void {
    const disclosurePhase = this.disclosurePhase.value;
    if (this.isCollapsed() || disclosurePhase !== 1) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willExpand(timing);
      if (timing !== false) {
        if (disclosurePhase !== 1) {
          this.disclosurePhase.setState(1, timing, View.Intrinsic);
          this.disclosingPhase.setState(this.disclosurePhase.value, View.Intrinsic);
          this.disclosingPhase.setState(1, timing, View.Intrinsic);
        } else {
          this.didExpand();
        }
      } else {
        this.disclosurePhase.setState(1, View.Intrinsic);
        this.disclosingPhase.setState(1, View.Intrinsic);
        this.didExpand();
      }
    }
  }

  protected willExpand(timing: AnyTiming | boolean): void {
    this.disclosureState.setState("expanding", View.Intrinsic);
    this.requireUpdate(View.NeedsResize | View.NeedsChange | View.NeedsLayout);

    const viewController = this.viewController;
    if (viewController !== null && viewController.limbWillExpand !== void 0) {
      viewController.limbWillExpand(this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.limbWillExpand !== void 0) {
        viewObserver.limbWillExpand(this);
      }
    }

    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.display.setState("block", View.Intrinsic);
    }
  }

  protected didExpand(): void {
    this.disclosureState.setState("expanded", View.Intrinsic);
    this.disclosingPhase.setInherited(true);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.limbDidExpand !== void 0) {
        viewObserver.limbDidExpand(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.limbDidExpand !== void 0) {
      viewController.limbDidExpand(this);
    }
  }

  collapse(timing?: AnyTiming | boolean): void {
    const disclosurePhase = this.disclosurePhase.value;
    if (this.isExpanded() || disclosurePhase !== 0) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willCollapse(timing);
      if (timing !== false) {
        if (disclosurePhase !== 0) {
          this.disclosurePhase.setState(0, timing, View.Intrinsic);
          this.disclosingPhase.setState(this.disclosurePhase.value, View.Intrinsic);
          this.disclosingPhase.setState(0, timing, View.Intrinsic);
        } else {
          this.didCollapse();
        }
      } else {
        this.disclosurePhase.setState(0, View.Intrinsic);
        this.disclosingPhase.setState(0, View.Intrinsic);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(timing: AnyTiming | boolean): void {
    this.disclosureState.setState("collapsing", View.Intrinsic);

    const viewController = this.viewController;
    if (viewController !== null && viewController.limbWillCollapse !== void 0) {
      viewController.limbWillCollapse(this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.limbWillCollapse !== void 0) {
        viewObserver.limbWillCollapse(this);
      }
    }

    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.height.setState(0, timing, View.Intrinsic);
    }
  }

  protected didCollapse(): void {
    this.disclosureState.setState("collapsed", View.Intrinsic);
    this.disclosingPhase.setInherited(true);
    this.requireUpdate(View.NeedsResize | View.NeedsLayout);
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.display.setState("none", View.Intrinsic);
    }

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.limbDidCollapse !== void 0) {
        viewObserver.limbDidCollapse(this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.limbDidCollapse !== void 0) {
      viewController.limbDidCollapse(this);
    }
  }

  toggle(timing?: AnyTiming | boolean): void {
    const disclosureState = this.disclosureState.getStateOr("collapsed");
    if (disclosureState === "collapsed" || disclosureState === "collapsing") {
      this.expand(timing);
    } else if (disclosureState === "expanded" || disclosureState === "expanding") {
      this.collapse(timing);
    }
  }

  protected onCull(): void {
    super.onCull();
    this.display.setState("none", View.Intrinsic);
  }

  protected onUncull(): void {
    super.onUncull();
    this.display.setState("block", View.Intrinsic);
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
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
    leaf.position.setState("absolute", View.Intrinsic);
  }

  protected onRemoveLeaf(leaf: TreeLeaf): void {
    // hook
  }

  protected onInsertSubtree(subtree: TreeView): void {
    subtree.display.setState(this.isExpanded() ? "block" : "none", View.Intrinsic);
    subtree.position.setState("absolute", View.Intrinsic);
    subtree.left.setState(0, View.Intrinsic);
    const seed = this.seed.state;
    const width = seed !== null ? seed.width : null;
    subtree.width.setState(width, View.Intrinsic);
    subtree.depth.setState(this.depth.state, View.Intrinsic);
  }

  protected onRemoveSubtree(subtree: TreeView): void {
    // hook
  }

  protected onUpdateDepth(depth: number): void {
    const subtree = this.subtree;
    if (subtree !== null) {
      subtree.depth.setState(depth, View.Intrinsic);
    }
  }

  /** @hidden */
  descendantDidSetDisclosurePhase(descendantView: HtmlView, disclosurePhase: number): void {
    this.requireUpdate(View.NeedsLayout);
    const parentView = this.parentView;
    if (parentView instanceof TreeView) {
      parentView.descendantDidSetDisclosurePhase(descendantView, disclosurePhase);
    }
  }

  /** @hidden */
  declare readonly visibleFrame: BoxR2;

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
      const {x, y} = this.node.getBoundingClientRect();
      return new BoxR2(-x - xBleed,
                       -y - yBleed,
                       window.innerWidth - x + xBleed,
                       window.innerHeight - y + yBleed);
    }
  }

  extendViewContext(viewContext: ViewContext): ViewContextType<this> {
    const treeViewContext = Object.create(viewContext);
    treeViewContext.visibleFrame = this.visibleFrame;
    return treeViewContext;
  }

  protected onProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    super.onProcess(processFlags, viewContext);
    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    Object.defineProperty(this, "visibleFrame", {
      value: visibleFrame,
      enumerable: true,
      configurable: true,
    });
    (viewContext as any).visibleFrame = this.visibleFrame;
  }

  protected onDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): void {
    super.onDisplay(displayFlags, viewContext);
    const visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
    Object.defineProperty(this, "visibleFrame", {
      value: visibleFrame,
      enumerable: true,
      configurable: true,
    });
    (viewContext as any).visibleFrame = this.visibleFrame;
    this.setViewFlags(this.viewFlags & ~View.NeedsScroll);
  }

  protected didLayout(viewContext: ViewContextType<this>): void {
    this.layoutLimb();
    super.didLayout(viewContext);
  }

  protected layoutLimb(): void {
    const disclosureState = this.disclosureState.getStateOr("expanded");
    const disclosingPhase = disclosureState === "expanded" ? this.disclosingPhase.getValueOr(1) : 1;
    const seed = this.seed.state;
    const width = seed !== null ? seed.width : null;
    const limbSpacing = this.limbSpacing.getStateOr(0);
    let yValue = 0;
    let yState = yValue
    const leaf = this.leaf;
    if (leaf !== null) {
      if (leaf.top.isPrecedent(View.Intrinsic)) {
        leaf.top.setIntermediateValue(Length.px(yValue * disclosingPhase), Length.px(yState));
      }
      leaf.width.setState(width, View.Intrinsic);
      let heightValue: Length | number | null = leaf.height.value;
      heightValue = heightValue instanceof Length ? heightValue.pxValue() : leaf.node.offsetHeight;
      let heightState: Length | number | null = leaf.height.state;
      heightState = heightState instanceof Length ? heightState.pxValue() : heightValue;
      yValue += heightValue * disclosingPhase;
      yState += heightState;
    }
    const subtree = this.subtree;
    if (subtree !== null && disclosureState !== "collapsed") {
      if (subtree.top.isPrecedent(View.Intrinsic)) {
        subtree.top.setIntermediateValue(Length.px(yValue * disclosingPhase), Length.px(yState));
      }
      subtree.width.setState(width, View.Intrinsic);
      let heightValue: Length | number | null = subtree.height.value;
      heightValue = heightValue instanceof Length ? heightValue.pxValue() : subtree.node.offsetHeight;
      let heightState: Length | number | null = subtree.height.state;
      heightState = heightState instanceof Length ? heightState.pxValue() : heightValue;
      yValue += heightValue * disclosingPhase;
      if (disclosureState !== "collapsing") {
        yState += heightState;
      } else {
        yState += limbSpacing;
      }
    } else {
      yValue += limbSpacing * disclosingPhase;
      yState += limbSpacing;
    }
    if (this.height.isPrecedent(View.Intrinsic)) {
      this.height.setIntermediateValue(Length.px(yValue), Length.px(yState));
    }
  }

  static fromInit(init: TreeLimbInit): TreeLimb {
    const view = TreeLimb.create();
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeLimb): TreeLimb;
  static fromAny(value: AnyTreeLimb): TreeLimb {
    if (value instanceof this) {
      return value;
    } else if (value instanceof HTMLElement) {
      return this.fromNode(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
