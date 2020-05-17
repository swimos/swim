// Copyright 2015-2020 SWIM.AI inc.
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

import {Ease, Tween, Transition} from "@swim/transition";
import {
  ViewContext,
  ViewFlags,
  View,
  ViewNode,
  ModalState,
  Modal,
  MemberAnimator,
  SvgView,
  HtmlView,
} from "@swim/view";
import {ActionButton} from "./ActionButton";
import {ActionItem} from "./ActionItem";
import {ActionStackObserver} from "./ActionStackObserver";
import {ActionStackController} from "./ActionStackController";
import {ActionStackGestureController} from "./ActionStackGestureController";

export type ActionStackState = "collapsed" | "expanding" | "expanded" | "collapsing";

export class ActionStack extends HtmlView implements Modal {
  /** @hidden */
  _stackState: ActionStackState;
  /** @hidden */
  _stackTransition: Transition<any>;
  /** @hidden */
  _buttonIcon: SvgView | HtmlView | null;
  /** @hidden */
  _buttonSpacing: number;
  /** @hidden */
  _itemSpacing: number;

  constructor(node: HTMLElement) {
    super(node);
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this._stackState = "collapsed";
    this._stackTransition = Transition.duration(250, Ease.cubicOut);
    this._buttonIcon = null;
    this._buttonSpacing = 36;
    this._itemSpacing = 20;
    this.initChildren();
  }

  protected initNode(node: HTMLElement): void {
    this.addClass("action-stack")
        .display("block")
        .position("relative")
        .width(56)
        .height(56)
        .opacity(1)
        .userSelect("none")
        .touchAction("none");
  }

  protected initChildren(): void {
    this.append(ActionButton, "button");
  }

  get viewController(): ActionStackController | null {
    return this._viewController;
  }

  get stackState(): ActionStackState {
    return this._stackState;
  }

  isExpanded(): boolean {
    return this._stackState === "expanded" || this._stackState === "expanding";
  }

  isCollapsed(): boolean {
    return this._stackState === "collapsed" || this._stackState === "collapsing";
  }

  @MemberAnimator(Number, {value: 0})
  stackPhase: MemberAnimator<this, number>; // 0 = collapsed; 1 = expanded

  get modalState(): ModalState {
    const stackState = this._stackState;
    if (stackState === "collapsed") {
      return "hidden";
    } else if (stackState === "expanding") {
      return "showing";
    } else if (stackState === "expanded") {
      return "shown";
    } else if (stackState === "collapsing") {
      return "hiding";
    } else {
      return void 0 as any; // unreachable
    }
  }

  get modalView(): View | null {
    return null;
  }

  showModal(tween?: Tween<any>): void {
    this.expand(tween);
  }

  hideModal(tween?: Tween<any>): void {
    this.collapse(tween);
  }

  get button(): ActionButton | null {
    const childView = this.getChildView("button");
    return childView instanceof ActionButton ? childView : null;
  }

  get buttonIcon(): SvgView | HtmlView | null {
    return this._buttonIcon;
  }

  setButtonIcon(buttonIcon: SvgView | HtmlView | null, tween?: Tween<any>, ccw?: boolean): void {
    this._buttonIcon = buttonIcon;
    const button = this.button;
    if (button !== null) {
      if (tween === void 0 || tween === true) {
        tween = this._stackTransition;
      } else if (tween === false) {
        tween = void 0;
      }
      button.setIcon(buttonIcon, tween, ccw);
    }
  }

  protected createCloseIcon(): SvgView {
    const icon = SvgView.create("svg").width(24).height(24).viewBox("0 0 24 24");
    icon.append("path").d("M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    return icon;
  }

  get items(): ReadonlyArray<ActionItem> {
    const childNodes = this._node.childNodes;
    const childViews = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ActionItem) {
        childViews.push(childView);
      }
    }
    return childViews;
  }

  insertItem(item: ActionItem, index?: number, key?: string): void {
    if (index === void 0) {
      index = this.node.childNodes.length - 1;
    }
    this.insertChildNode(item.node, this.node.childNodes[1 + index] || null, key);
  }

  removeItems(): void {
    const childNodes = this._node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ActionItem) {
        this.removeChild(childView);
      }
    }
  }

  protected onMount(): void {
    super.onMount();
    this.on("click", this.onClick);
    this.on("contextmenu", this.onContextMenu);
  }

  protected onUnmount(): void {
    this.off("click", this.onClick);
    this.off("contextmenu", this.onContextMenu);
    super.onUnmount();
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onLayout(viewContext: ViewContext): void {
    super.onLayout(viewContext);
    const phase = this.stackPhase.value!;
    const childNodes = this._node.childNodes;
    const childCount = childNodes.length;
    const buttonHeight = 56;
    const itemHeight = 48;
    let itemIndex = 0;
    let zIndex = childCount - 1;
    for (let i = 0; i < childCount; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ActionItem) {
        const bottom = buttonHeight + this._buttonSpacing + itemIndex * (itemHeight + this._itemSpacing);
        childView.display(phase === 0 ? "none" : "flex")
                 .bottom(phase * bottom)
                 .zIndex(zIndex);
        itemIndex += 1;
        zIndex -= 1;
      }
      const button = this.button;
      if (button !== null) {
        button.zIndex(childCount);
      }
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof ActionButton) {
      this.onInsertButton(childView);
    } else if (childView instanceof ActionItem) {
      this.onInsertItem(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof ActionButton) {
      this.onRemoveButton(childView);
    } else if (childView instanceof ActionItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertButton(button: ActionButton): void {
    if (this.isCollapsed && this._buttonIcon !== null) {
      button.setIcon(this._buttonIcon);
    } else if (this.isExpanded()) {
      button.setIcon(this.createCloseIcon());
    }
    button.zIndex(0);
    button.addViewObserver(new ActionStackGestureController(this) as any);
  }

  protected onRemoveButton(button: ActionButton): void {
    // hook
  }

  protected onInsertItem(item: ActionItem): void {
    item.position("absolute").right(4).bottom(4).left(4).zIndex(0);
  }

  protected onRemoveItem(item: ActionItem): void {
    // hook
  }

  expand(tween?: Tween<any>): void {
    if (this.isCollapsed() || this.stackPhase.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this._stackTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willExpand();
      if (tween !== null) {
        this.button!.setIcon(this.createCloseIcon(), tween);
        if (this.stackPhase.value !== 1) {
          this.stackPhase.setState(1, tween.onEnd(this.didExpand.bind(this)));
        } else {
          setTimeout(this.didExpand.bind(this));
        }
      } else {
        this.button!.setIcon(this.createCloseIcon());
        this.stackPhase.setState(1);
        this.requireUpdate(View.NeedsLayout);
        this.didExpand();
      }
    }
  }

  protected willExpand(): void {
    this.willObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackWillExpand !== void 0) {
        viewObserver.actionStackWillExpand(this);
      }
    });
    this._stackState = "expanding";
  }

  protected didExpand(): void {
    this._stackState = "expanded";
    this.didObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackDidExpand !== void 0) {
        viewObserver.actionStackDidExpand(this);
      }
    });
  }

  collapse(tween?: Tween<any>): void {
    if (this.isExpanded() || this.stackPhase.value !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this._stackTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willCollapse();
      if (tween !== null) {
        this.button!.setIcon(this._buttonIcon, tween, true);
        if (this.stackPhase.value !== 0) {
          this.stackPhase.setState(0, tween.onEnd(this.didCollapse.bind(this)));
        } else {
          setTimeout(this.didCollapse.bind(this));
        }
      } else {
        this.button!.setIcon(this._buttonIcon);
        this.stackPhase.setState(0);
        this.requireUpdate(View.NeedsLayout);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(): void {
    this.willObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackWillCollapse !== void 0) {
        viewObserver.actionStackWillCollapse(this);
      }
    });
    this._stackState = "collapsing";
  }

  protected didCollapse(): void {
    this._stackState = "collapsed";
    this.didObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackDidCollapse !== void 0) {
        viewObserver.actionStackDidCollapse(this);
      }
    });
  }

  toggle(tween?: Tween<any>): void {
    const stackState = this._stackState;
    if (stackState === "collapsed" || stackState === "collapsing") {
      this.expand(tween);
    } else if (stackState === "expanded" || stackState === "expanding") {
      this.collapse(tween);
    }
  }

  show(tween?: Tween<any>): void {
    if (this.opacity.state !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this._stackTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willShow();
      if (tween !== null) {
        this.opacity(1, tween.onEnd(this.didShow.bind(this)));
      } else {
        this.opacity(1);
        this.requireUpdate(View.NeedsLayout);
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.willObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackWillShow !== void 0) {
        viewObserver.actionStackWillShow(this);
      }
    });
    this.display("block");
  }

  protected didShow(): void {
    this.didObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackDidShow !== void 0) {
        viewObserver.actionStackDidShow(this);
      }
    });
  }

  hide(tween?: Tween<any>): void {
    if (this.opacity.state !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this._stackTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      if (tween !== null) {
        this.opacity(0, tween.onEnd(this.didHide.bind(this)));
      } else {
        this.opacity(0);
        this.requireUpdate(View.NeedsLayout);
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.willObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackWillHide !== void 0) {
        viewObserver.actionStackWillHide(this);
      }
    });
  }

  protected didHide(): void {
    this.display("none");
    this.didObserve(function (viewObserver: ActionStackObserver): void {
      if (viewObserver.actionStackDidHide !== void 0) {
        viewObserver.actionStackDidHide(this);
      }
    });
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}
