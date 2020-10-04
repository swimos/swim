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

import {Length} from "@swim/length";
import {Tween, Transition} from "@swim/transition";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  ViewNode,
  ViewNodeType,
  SvgView,
  HtmlView,
} from "@swim/view";
import {PositionGestureInput, PositionGesture, PositionGestureDelegate} from "@swim/gesture";
import {Look, ThemedHtmlView} from "@swim/theme";
import {ModalOptions, ModalState, Modal} from "@swim/modal";
import {FloatingButton} from "./FloatingButton";
import {ButtonItem} from "./ButtonItem";
import {ButtonStackObserver} from "./ButtonStackObserver";
import {ButtonStackController} from "./ButtonStackController";

export type ButtonStackState = "collapsed" | "expanding" | "expanded" | "collapsing";

export class ButtonStack extends ThemedHtmlView implements Modal, PositionGestureDelegate {
  /** @hidden */
  _stackState: ButtonStackState;
  /** @hidden */
  _buttonIcon: SvgView | HtmlView | null;
  /** @hidden */
  _buttonSpacing: number;
  /** @hidden */
  _itemSpacing: number;
  /** @hidden */
  _stackHeight: number;
  /** @hidden */
  _gesture: PositionGesture<HtmlView> | null;

  constructor(node: HTMLElement) {
    super(node);
    this.onContextMenu = this.onContextMenu.bind(this);
    this._stackState = "collapsed";
    this._buttonIcon = null;
    this._buttonSpacing = 28;
    this._itemSpacing = 20;
    this._stackHeight = 0;
    this._gesture = null;
    this.initChildren();
  }

  protected initNode(node: ViewNodeType<this>): void {
    this.addClass("button-stack");
    this.display.setAutoState("block");
    this.position.setAutoState("relative");
    this.width.setAutoState(56);
    this.height.setAutoState(56);
    this.opacity.setAutoState(1);
    this.userSelect.setAutoState("none");
    this.cursor.setAutoState("pointer");
  }

  protected initChildren(): void {
    const button = this.createButton();
    if (button !== null) {
      this.append(button, "button");
    }
  }

  protected createButton(): HtmlView | null {
    return HtmlView.create(FloatingButton);
  }

  // @ts-ignore
  declare readonly viewController: ButtonStackController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<ButtonStackObserver>;

  get stackState(): ButtonStackState {
    return this._stackState;
  }

  isExpanded(): boolean {
    return this._stackState === "expanded" || this._stackState === "expanding";
  }

  isCollapsed(): boolean {
    return this._stackState === "collapsed" || this._stackState === "collapsing";
  }

  @ViewAnimator({type: Number, state: 0})
  stackPhase: ViewAnimator<this, number>; // 0 = collapsed; 1 = expanded

  get modalView(): View | null {
    return null;
  }

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

  get modality(): boolean | number {
    return this.stackPhase.getValue();
  }

  showModal(options: ModalOptions, tween?: Tween<any>): void {
    this.expand(tween);
  }

  hideModal(tween?: Tween<any>): void {
    this.collapse(tween);
  }

  get button(): HtmlView | null {
    const childView = this.getChildView("button");
    return childView instanceof HtmlView ? childView : null;
  }

  get buttonIcon(): SvgView | HtmlView | null {
    return this._buttonIcon;
  }

  setButtonIcon(buttonIcon: SvgView | HtmlView | null, tween?: Tween<any>, ccw?: boolean): void {
    this._buttonIcon = buttonIcon;
    const button = this.button;
    if (button instanceof FloatingButton) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      button.setIcon(buttonIcon, tween, ccw);
    }
  }

  protected createCloseIcon(): SvgView {
    const icon = SvgView.create("svg").width(24).height(24).viewBox("0 0 24 24");
    icon.append("path")
        .fill(this.getLook(Look.backgroundColor))
        .d("M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    return icon;
  }

  get items(): ReadonlyArray<ButtonItem> {
    const childNodes = this._node.childNodes;
    const childViews = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        childViews.push(childView);
      }
    }
    return childViews;
  }

  insertItem(item: ButtonItem, index?: number, key?: string): void {
    if (index === void 0) {
      index = this.node.childNodes.length - 1;
    }
    this.insertChildNode(item.node, this.node.childNodes[1 + index] || null, key);
  }

  removeItems(): void {
    const childNodes = this._node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        this.removeChild(childView);
      }
    }
  }

  protected onMount(): void {
    super.onMount();
    this.on("contextmenu", this.onContextMenu);
  }

  protected onUnmount(): void {
    this.off("contextmenu", this.onContextMenu);
    super.onUnmount();
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutStack();
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0) {
      modalManager.updateModality();
    }
  }

  protected layoutStack(): void {
    const phase = this.stackPhase.getValue();
    const childNodes = this._node.childNodes;
    const childCount = childNodes.length;
    const button = this.button;
    let zIndex = childCount - 1;
    let itemIndex = 0;
    let stackHeight = 0;
    let y: number;
    if (button !== null) {
      button.zIndex.setAutoState(childCount);
      const buttonHeight = button !== null ? button.height.value : void 0;
      y = buttonHeight instanceof Length
        ? buttonHeight.pxValue()
        : button._node.offsetHeight;
    } else {
      y = 0;
    }
    for (let i = 0; i < childCount; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        if (itemIndex === 0) {
          stackHeight += this._buttonSpacing;
          y += this._buttonSpacing;
        } else {
          stackHeight += this._itemSpacing;
          y += this._itemSpacing;
        }
        const itemHeight = childView.height.value;
        const dy = itemHeight instanceof Length
                 ? itemHeight.pxValue()
                 : childView._node.offsetHeight;
        childView.display.setAutoState(phase === 0 ? "none" : "flex");
        childView.bottom.setAutoState(phase * y);
        childView.zIndex.setAutoState(zIndex);
        y += dy;
        stackHeight += dy;
        itemIndex += 1;
        zIndex -= 1;
      }
    }
    this._stackHeight = stackHeight;
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onInsertButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onInsertItem(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onRemoveButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertButton(button: HtmlView): void {
    this._gesture = new PositionGesture(button, this);
    button.addViewObserver(this._gesture);
    if (button instanceof FloatingButton) {
      button.stackPhase.setAutoState(1);
      if (this.isCollapsed && this._buttonIcon !== null) {
        button.setIcon(this._buttonIcon);
      } else if (this.isExpanded()) {
        button.setIcon(this.createCloseIcon());
      }
    }
    button.zIndex.setAutoState(0);
  }

  protected onRemoveButton(button: HtmlView): void {
    button.removeViewObserver(this._gesture!);
    this._gesture = null;
  }

  protected onInsertItem(item: ButtonItem): void {
    item.position.setAutoState("absolute");
    item.right.setAutoState(8);
    item.bottom.setAutoState(8);
    item.left.setAutoState(8);
    item.zIndex.setAutoState(0);
  }

  protected onRemoveItem(item: ButtonItem): void {
    // hook
  }

  expand(tween?: Tween<any>): void {
    if (this._stackState !== "expanded" || this.stackPhase.value !== 1) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      if (this._stackState !== "expanding") {
        this.willExpand();
        const button = this.button;
        if (button instanceof FloatingButton) {
          button.setIcon(this.createCloseIcon(), tween);
        }
      }
      if (tween !== null) {
        if (this.stackPhase.value !== 1) {
          this.stackPhase.setAutoState(1, tween.onEnd(this.didExpand.bind(this)));
        } else {
          setTimeout(this.didExpand.bind(this));
        }
      } else {
        this.stackPhase.setAutoState(1);
        this.didExpand();
      }
    }
  }

  protected willExpand(): void {
    this._stackState = "expanding";
    this.willObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackWillExpand !== void 0) {
        viewObserver.buttonStackWillExpand(this);
      }
    });
  }

  protected didExpand(): void {
    this._stackState = "expanded";
    this.requireUpdate(View.NeedsLayout);
    this.didObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackDidExpand !== void 0) {
        viewObserver.buttonStackDidExpand(this);
      }
    });
  }

  collapse(tween?: Tween<any>): void {
    if (this._stackState !== "collapsed" || this.stackPhase.value !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      if (this._stackState !== "collapsing") {
        this.willCollapse();
        const button = this.button;
        if (button instanceof FloatingButton) {
          button.setIcon(this._buttonIcon, tween, true);
        }
      }
      if (tween !== null) {
        if (this.stackPhase.value !== 0) {
          this.stackPhase.setAutoState(0, tween.onEnd(this.didCollapse.bind(this)));
        } else {
          setTimeout(this.didCollapse.bind(this));
        }
      } else {
        this.stackPhase.setAutoState(0);
        this.didCollapse();
      }
    }
  }

  protected willCollapse(): void {
    this._stackState = "collapsing";
    this.willObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackWillCollapse !== void 0) {
        viewObserver.buttonStackWillCollapse(this);
      }
    });
  }

  protected didCollapse(): void {
    this._stackState = "collapsed";
    this.requireUpdate(View.NeedsLayout);
    this.didObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackDidCollapse !== void 0) {
        viewObserver.buttonStackDidCollapse(this);
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
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willShow();
      if (tween !== null) {
        this.opacity.setAutoState(1, tween.onEnd(this.didShow.bind(this)));
      } else {
        this.opacity.setAutoState(1);
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.willObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackWillShow !== void 0) {
        viewObserver.buttonStackWillShow(this);
      }
    });
    this.display("block");
  }

  protected didShow(): void {
    this.requireUpdate(View.NeedsLayout);
    this.didObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackDidShow !== void 0) {
        viewObserver.buttonStackDidShow(this);
      }
    });
  }

  hide(tween?: Tween<any>): void {
    if (this.opacity.state !== 0) {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      if (tween !== null) {
        this.opacity.setAutoState(0, tween.onEnd(this.didHide.bind(this)));
      } else {
        this.opacity.setAutoState(0);
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.willObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackWillHide !== void 0) {
        viewObserver.buttonStackWillHide(this);
      }
    });
  }

  protected didHide(): void {
    this.display("none");
    this.requireUpdate(View.NeedsLayout);
    this.didObserve(function (viewObserver: ButtonStackObserver): void {
      if (viewObserver.buttonStackDidHide !== void 0) {
        viewObserver.buttonStackDidHide(this);
      }
    });
  }

  didBeginPress(input: PositionGestureInput, event: Event | null): void {
    // hook
  }

  didHoldPress(input: PositionGestureInput): void {
    input.preventDefault();
    this.toggle();
  }

  didMovePress(input: PositionGestureInput, event: Event | null): void {
    if (!input.defaultPrevented && this._stackState !== "expanded") {
      const stackHeight = this._stackHeight;
      const stackPhase = Math.min(Math.max(0, -(input.y - input.y0) / (0.5 * stackHeight)), 1);
      this.stackPhase.setAutoState(stackPhase);
      this.requireUpdate(View.NeedsLayout);
      if (stackPhase > 0.1) {
        input.clearHoldTimer();
        if (this._stackState === "collapsed") {
          this.willExpand();
          const button = this.button;
          if (button instanceof FloatingButton) {
            button.setIcon(this.createCloseIcon(), true);
          }
        }
      }
    }
  }

  didEndPress(input: PositionGestureInput, event: Event | null): void {
    if (!input.defaultPrevented) {
      if (event !== null) {
        event.stopPropagation();
      }
      const stackPhase = this.stackPhase.getValue();
      if (input.t - input.t0 < input.holdDelay) {
        if (stackPhase < 0.1 || this.stackState === "expanded") {
          this.collapse();
        } else {
          this.expand();
        }
      } else {
        if (stackPhase < 0.5) {
          this.collapse();
        } else if (stackPhase >= 0.5) {
          this.expand();
        }
      }
    }
  }

  didCancelPress(input: PositionGestureInput, event: Event | null): void {
    if (input.buttons === 2) {
      this.toggle();
    } else {
      const stackPhase = this.stackPhase.getValue();
      if (stackPhase < 0.1 || this.stackState === "expanded") {
        this.collapse();
      } else {
        this.expand();
      }
    }
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}
