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
import {Transition} from "@swim/transition";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewEdgeInsets,
  ViewScope,
  ViewAnimator,
} from "@swim/view";
import {ViewNodeType, HtmlViewConstructor, HtmlView} from "@swim/dom";
import {
  Look,
  Feel,
  MoodVector,
  ThemeMatrix,
  ThemedHtmlViewInit,
  ThemedHtmlView,
} from "@swim/theme";
import {AnyTreeSeed, TreeSeed} from "./TreeSeed";
import {TreeViewContext} from "./TreeViewContext";
import {AnyTreeLimb, TreeLimb, TreeLimbState} from "./TreeLimb";
import {AnyTreeStem, TreeStem} from "./TreeStem";
import {TreeViewObserver} from "./TreeViewObserver";
import {TreeViewController} from "./TreeViewController";

export type AnyTreeView = TreeView | TreeViewInit | HTMLElement;

export interface TreeViewInit extends ThemedHtmlViewInit {
  viewController?: TreeViewController;
  limbSpacing?: number;

  seed?: AnyTreeSeed;
  stem?: AnyTreeStem;
  limbs?: AnyTreeLimb[];
  depth?: number;
}

export class TreeView extends ThemedHtmlView {
  /** @hidden */
  readonly _visibleViews: View[];
  /** @hidden */
  _visibleFrame: BoxR2;

  constructor(node: HTMLElement) {
    super(node);
    this._visibleViews = [];
    this._visibleFrame = new BoxR2(0, 0, window.innerWidth, window.innerHeight);
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("tree");
    this.display.setAutoState("block");
    this.position.setAutoState("relative");
    this.opacity.setAutoState(0);
  }

  // @ts-ignore
  declare readonly viewController: TreeViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<TreeViewObserver>;

  // @ts-ignore
  declare readonly viewContext: TreeViewContext;

  initView(init: TreeViewInit): void {
    super.initView(init);
    if (init.limbSpacing !== void 0) {
      this.limbSpacing(init.limbSpacing);
    }

    if (init.seed !== void 0) {
      this.seed(init.seed);
    }
    if (init.stem !== void 0) {
      this.setStem(init.stem);
    }
    if (init.limbs !== void 0) {
      this.addLimbs(init.limbs);
    }
    if (init.depth !== void 0) {
      this.depth(init.depth);
    }
  }

  get stem(): TreeStem | null {
    const childView = this.getChildView("stem");
    return childView instanceof TreeStem ? childView : null;
  }

  setStem(stem: AnyTreeStem | null): void {
    if (stem !== null) {
      stem = TreeStem.fromAny(stem);
    }
    this.setChildView("stem", stem);
  }

  addLimb(limb: AnyTreeLimb, key?: string): TreeLimb {
    if (key === void 0 && "key" in limb) {
      key = limb.key;
    }
    limb = TreeLimb.fromAny(limb);
    this.appendChildView(limb, key);
    return limb;
  }

  addLimbs(limbs: ReadonlyArray<AnyTreeLimb>): void {
    for (let i = 0, n = limbs.length; i < n; i += 1) {
      this.addLimb(limbs[i]);
    }
  }

  @ViewScope({type: TreeSeed, inherit: true})
  seed: ViewScope<this, TreeSeed | undefined, AnyTreeSeed | undefined>;

  @ViewScope<TreeView, number>({
    type: Number,
    state: 0,
    onUpdate(depth: number): void {
      this.view.onUpdateDepth(depth);
    },
  })
  depth: ViewScope<this, number>;

  @ViewScope({type: Object, inherit: true})
  edgeInsets: ViewScope<this, ViewEdgeInsets | undefined>;

  @ViewScope({type: Number, state: 2})
  limbSpacing: ViewScope<this, number>;

  @ViewScope({type: String, inherit: true})
  disclosureState: ViewScope<this, TreeLimbState | undefined>;

  @ViewAnimator({type: Number, inherit: true})
  disclosurePhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  @ViewAnimator({type: Number, inherit: true})
  disclosingPhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const key = childView.key;
    if (key === "stem" && childView instanceof TreeStem) {
      this.onInsertStem(childView);
    } else if (childView instanceof TreeLimb) {
      this.onInsertLimb(childView);
    } else if (key === "topBranch" && childView instanceof HtmlView) {
      this.onInsertTopBranch(childView);
    } else if (key === "bottomBranch" && childView instanceof HtmlView) {
      this.onInsertBottomBranch(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const key = childView.key;
    if (key === "stem" && childView instanceof TreeStem) {
      this.onRemoveStem(childView);
    } else if (childView instanceof TreeLimb) {
      this.onRemoveLimb(childView);
    } else if (key === "topBranch" && childView instanceof HtmlView) {
      this.onRemoveTopBranch(childView);
    } else if (key === "bottomBranch" && childView instanceof HtmlView) {
      this.onRemoveBottomBranch(childView);
    }
    const visibleViews = this._visibleViews;
    const visibleIndex = visibleViews.indexOf(childView);
    if (visibleIndex >= 0) {
      visibleViews.splice(visibleIndex, 1);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertStem(stem: TreeStem): void {
    stem.position.setAutoState("absolute");
    stem.left.setAutoState(0);
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    stem.width.setAutoState(width);
    stem.visibility.setAutoState("hidden");
  }

  protected onRemoveStem(stem: TreeStem): void {
    // hook
  }

  protected onInsertLimb(limb: TreeLimb): void {
    limb.position.setAutoState("absolute");
    limb.left.setAutoState(0);
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    limb.width.setAutoState(width);
    limb.depth.setAutoState(this.depth.state + 1);
    limb.visibility.setAutoState("hidden");
  }

  protected onRemoveLimb(limb: TreeLimb): void {
    // hook
  }

  protected onInsertTopBranch(topBranch: HtmlView): void {
    topBranch.addClass("branch-top");
    topBranch.position.setAutoState("absolute");
    topBranch.top.setAutoState(0);
    topBranch.left.setAutoState(0);
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    topBranch.width.setAutoState(width);
    topBranch.visibility.setAutoState("hidden");
  }

  protected onRemoveTopBranch(topBranch: HtmlView): void {
    // hook
  }

  protected onInsertBottomBranch(bottomBranch: HtmlView): void {
    bottomBranch.addClass("branch-bottom");
    bottomBranch.position.setAutoState("absolute");
    bottomBranch.bottom.setAutoState(0);
    bottomBranch.left.setAutoState(0);
    const seed = this.seed.state;
    const width = seed !== void 0 && seed._width !== null ? seed._width : void 0;
    bottomBranch.width.setAutoState(width);
    bottomBranch.visibility.setAutoState("hidden");
  }

  protected onRemoveBottomBranch(bottomBranch: HtmlView): void {
    // hook
  }

  protected onUpdateDepth(depth: number): void {
    this.modifyTheme(Feel.default, [Feel.nested, depth !== 0 ? 1 : void 0]);
  }

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    const depth = this.depth.state;
    if (depth !== void 0 && depth !== 0) {
      let superTheme = this.theme.superState;
      if (superTheme === void 0) {
        superTheme = theme;
      }
      const limbView = this.parentView;
      const leafView = limbView instanceof TreeLimb ? limbView.leaf : null;
      const leafMood = leafView !== null ? leafView.moodModifier.state : void 0;
      const superMood = leafMood !== void 0 ? leafMood.transform(mood) : mood;

      const backgroundColor = theme.inner(mood, Look.backgroundColor);
      this.backgroundColor.setAutoState(backgroundColor, transition);

      const accentColor = superTheme.inner(superMood, Look.accentColor);
      const borderColor = superTheme.inner(superMood, Look.borderColor);
      const limbSpacing = this.limbSpacing.getState();

      let bottomBranch = this.getChildView("bottomBranch") as HtmlView | null;
      if (bottomBranch === null) {
        bottomBranch = this.prepend("div", "bottomBranch");
      }
      bottomBranch.height.setAutoState(limbSpacing / 2, transition);
      bottomBranch.backgroundColor.setAutoState(borderColor, transition);
      bottomBranch.zIndex.setAutoState(1000 - depth);

      let topBranch = this.getChildView("topBranch") as HtmlView | null;
      if (topBranch === null) {
        topBranch = this.prepend("div", "topBranch");
      }
      topBranch.height.setAutoState(limbSpacing, transition);
      topBranch.backgroundColor.setAutoState(accentColor, transition);
      topBranch.zIndex.setAutoState(1000 - depth);
    } else {
      this.removeChildView("topBranch");
      this.removeChildView("bottomBranch");
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

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsResize) !== 0 && targetView instanceof TreeLimb) {
      additionalFlags |= View.NeedsResize;
    }
    if ((updateFlags & View.NeedsLayout) !== 0 && targetView instanceof TreeLimb) {
      additionalFlags |= View.NeedsLayout;
    }
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & View.NeedsResize) !== 0) {
      processFlags |= View.NeedsScroll;
    }
    return processFlags;
  }

  protected onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.resizeTree();
  }

  protected resizeTree(): void {
    const oldSeed = this.seed.ownState;
    if (oldSeed !== void 0) {
      const superSeed = this.seed.superState;
      let width: number | undefined;
      if (superSeed !== void 0 && superSeed._width !== null) {
        width = superSeed._width.pxValue();
      }
      if (width === void 0) {
        const treeWidth = this.width.state;
        width = treeWidth instanceof Length
              ? treeWidth.pxValue()
              : this._node.offsetWidth;
      }
      const edgeInsets = this.edgeInsets.state;
      const left = edgeInsets !== void 0 ? edgeInsets.insetLeft : 0;
      const right = edgeInsets !== void 0 ? edgeInsets.insetRight : 0;
      const spacing = this.limbSpacing.getState();
      const newSeed = oldSeed.resized(width, left, right, spacing);
      this.seed.setState(newSeed);
    }
  }

  protected onScroll(viewContext: ViewContextType<this>): void {
    super.onScroll(viewContext);
    this._viewFlags |= View.NeedsScroll; // defer to display pass
    this.requireUpdate(View.NeedsDisplay);
  }

  protected onChange(viewContext: ViewContextType<this>): void {
    super.onChange(viewContext);
    this._viewFlags |= View.NeedsChange; // defer to display pass
    this.requireUpdate(View.NeedsDisplay);
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    const disclosurePhase = this.disclosurePhase.value;
    this.opacity.setAutoState(disclosurePhase !== void 0 ? disclosurePhase : 1);
  }

  protected processChildViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    if (!this.isCulled()) {
      this.processVisibleViews(processFlags, viewContext, callback);
    }
  }

  protected processVisibleViews(processFlags: ViewFlags, viewContext: ViewContextType<this>,
                                callback?: (this: this, childView: View) => void): void {
    const visibleViews = this._visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const childView = visibleViews[i];
      this.processChildView(childView, processFlags, viewContext);
      if (callback !== void 0) {
        callback.call(this, childView);
      }
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              callback?: (this: this, childView: View) => void): void {
    const needsScroll = (displayFlags & View.NeedsScroll) !== 0;
    const needsChange = (displayFlags & View.NeedsChange) !== 0;
    const needsLayout = (displayFlags & View.NeedsLayout) !== 0;
    const depth = needsChange ? this.depth.getState() : void 0;
    const disclosingPhase = needsLayout ? this.disclosingPhase.getValueOr(1) : void 0;
    let seed: TreeSeed | undefined;
    let width: Length | undefined;
    if (needsLayout) {
      seed = this.seed.state;
      if (seed !== void 0 && seed._width === null) {
        this.resizeTree();
      }
      seed = this.seed.state;
      if (seed !== void 0 && seed._width !== null) {
        width = seed._width;
      }
    }
    const limbSpacing = needsLayout ? this.limbSpacing.getState() : 0;
    let y = limbSpacing;
    const visibleViews = this._visibleViews;
    let visibleFrame: BoxR2;
    if (needsScroll || needsLayout) {
      visibleViews.length = 0;
      visibleFrame = this.detectVisibleFrame(Object.getPrototypeOf(viewContext));
      (viewContext as any).visibleFrame = visibleFrame;
      this._visibleFrame = visibleFrame;
    } else {
      visibleFrame = viewContext.visibleFrame;
    }
    function layoutChildView(this: TreeView, childView: View): void {
      if (needsChange && childView instanceof TreeLimb) {
        const subtree = childView.subtree;
        if (subtree !== null) {
          subtree.depth.setAutoState(depth! + 1);
        }
      }
      if (needsLayout && childView instanceof HtmlView) {
        if (childView instanceof TreeLimb || childView instanceof TreeStem) {
          const childHeight = childView.height.value;
          const dy = childHeight instanceof Length
                   ? childHeight.pxValue()
                   : childView._node.offsetHeight;
          childView.top.setAutoState(y * disclosingPhase!);
          y += dy * disclosingPhase!;
        }
        childView.width.setAutoState(width);
      }
      if ((needsScroll || needsLayout) && childView instanceof HtmlView) {
        const top = childView.top.state;
        const height = childView.height.state;
        let isVisible: boolean;
        if (top instanceof Length && height instanceof Length) {
          const yMin0 = visibleFrame.yMin;
          const yMax0 = visibleFrame.yMax;
          const yMin1 = top.pxValue();
          const yMax1 = yMin1 + height.pxValue();
          isVisible = yMin0 <= yMax1 && yMin1 <= yMax0;
        } else {
          isVisible = true;
        }
        childView.setCulled(!isVisible);
        childView.visibility.setAutoState(isVisible ? "visible" : "hidden");
        if (isVisible) {
          visibleViews.push(childView);
          if (callback !== void 0) {
            callback.call(this, childView);
          }
        }
      } else if (callback !== void 0) {
        callback.call(this, childView);
      }
    }
    if (needsScroll || needsLayout) {
      super.displayChildViews(displayFlags, viewContext, layoutChildView);
    } else {
      this.displayVisibleViews(displayFlags, viewContext, needsChange ? layoutChildView : callback);
    }
    if (needsLayout) {
      this.height.setAutoState(y);
      const disclosurePhase = this.disclosurePhase.value;
      this.opacity.setAutoState(disclosurePhase !== void 0 ? disclosurePhase : 1);
    }
    if (needsChange) {
      this._viewFlags &= ~View.NeedsChange;
    }
    if (needsScroll) {
      this._viewFlags &= ~View.NeedsScroll;
    }
  }

  protected displayVisibleViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                callback?: (this: this, childView: View) => void): void {
    const visibleViews = this._visibleViews;
    let i = 0;
    while (i < visibleViews.length) {
      const childView = visibleViews[i];
      this.displayChildView(childView, displayFlags, viewContext);
      if (callback !== void 0) {
        callback.call(this, childView);
      }
      if ((childView.viewFlags & View.RemovingFlag) !== 0) {
        childView.setViewFlags(childView.viewFlags & ~View.RemovingFlag);
        this.removeChildView(childView);
        continue;
      }
      i += 1;
    }
  }

  static fromInit(init: TreeViewInit): TreeView {
    const view = TreeView.create();
    view.initView(init);
    return view;
  }

  static fromAny<S extends HtmlViewConstructor<InstanceType<S>>>(this: S, value: InstanceType<S> | HTMLElement): InstanceType<S>;
  static fromAny(value: AnyTreeView): TreeView;
  static fromAny(value: AnyTreeView): TreeView {
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
