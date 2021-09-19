// Copyright 2015-2021 Swim Inc.
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

import {Lazy} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {Length} from "@swim/math";
import {Expansion} from "@swim/style";
import {Look} from "@swim/theme";
import {
  ViewContextType,
  View,
  ModalOptions,
  ModalState,
  Modal,
  ViewAnimator,
  ExpansionViewAnimator,
  PositionGestureInput,
  PositionGesture,
} from "@swim/view";
import {StyleAnimator, ViewNode, HtmlView} from "@swim/dom";
import {Graphics, VectorIcon} from "@swim/graphics";
import {FloatingButton} from "./FloatingButton";
import {ButtonItem} from "./ButtonItem";
import type {ButtonStackObserver} from "./ButtonStackObserver";

export class ButtonStack extends HtmlView implements Modal {
  constructor(node: HTMLElement) {
    super(node);
    Object.defineProperty(this, "stackHeight", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.initButtonStack();
    this.initButton();
  }

  protected initButtonStack(): void {
    this.addClass("button-stack");
    this.display.setState("block", View.Intrinsic);
    this.position.setState("relative", View.Intrinsic);
    this.width.setState(56, View.Intrinsic);
    this.height.setState(56, View.Intrinsic);
    this.opacity.setState(1, View.Intrinsic);
    this.userSelect.setState("none", View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);
  }

  protected initButton(): void {
    const button = this.createButton();
    if (button !== null) {
      this.append(button, "button");
    }
  }

  override readonly viewObservers!: ReadonlyArray<ButtonStackObserver>;

  /** @hidden */
  readonly stackHeight!: number;

  protected createButton(): HtmlView | null {
    return FloatingButton.create();
  }

  /** @hidden */
  static Gesture = PositionGesture.define<ButtonStack, HtmlView>({
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && !this.owner.disclosure.isExpanded()) {
        const stackHeight = this.owner.stackHeight;
        const phase = Math.min(Math.max(0, -(input.y - input.y0) / (0.5 * stackHeight)), 1);
        this.owner.disclosure.setPhase(phase);
        if (phase > 0.1) {
          input.clearHoldTimer();
          if (!this.owner.disclosure.isExpanding()) {
            this.owner.disclosure.setState(this.owner.disclosure.value.expanding());
          }
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented) {
        const phase = this.owner.disclosure.getPhase();
        if (input.t - input.t0 < input.holdDelay) {
          if (phase < 0.1 || this.owner.disclosure.isExpanded()) {
            this.owner.disclosure.collapse();
          } else {
            this.owner.disclosure.expand();
          }
        } else {
          if (phase < 0.5) {
            this.owner.disclosure.collapse();
          } else if (phase >= 0.5) {
            this.owner.disclosure.expand();
          }
        }
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (input.buttons === 2) {
        this.owner.disclosure.toggle();
      } else {
        const phase = this.owner.disclosure.getPhase();
        if (phase < 0.1 || this.owner.disclosure.isExpanded()) {
          this.owner.disclosure.collapse();
        } else {
          this.owner.disclosure.expand();
        }
      }
    },
    didLongPress(input: PositionGestureInput): void {
      input.preventDefault();
      this.owner.disclosure.toggle();
    },
  });

  @PositionGesture<ButtonStack, HtmlView>({
    extends: ButtonStack.Gesture,
  })
  readonly gesture!: PositionGesture<this, HtmlView>;

  @ViewAnimator<ButtonStack, Expansion>({
    type: Expansion,
    state: Expansion.collapsed(),
    updateFlags: View.NeedsLayout,
    willExpand(): void {
      this.owner.willExpand();
      this.owner.onExpand();
    },
    didExpand(): void {
      this.owner.didExpand();
    },
    willCollapse(): void {
      this.owner.willCollapse();
      this.owner.onCollapse();
    },
    didCollapse(): void {
      this.owner.didCollapse();
    },
  })
  readonly disclosure!: ExpansionViewAnimator<this>;

  @ViewAnimator({type: Number, state: 28, updateFlags: View.NeedsLayout})
  readonly buttonSpacing!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 20, updateFlags: View.NeedsLayout})
  readonly itemSpacing!: ViewAnimator<this, number>;

  @StyleAnimator<ButtonStack, number | undefined>({
    propertyNames: "opacity",
    type: Number,
    onEnd(opacity: number | undefined): void {
      if (opacity === 1) {
        this.owner.didShow();
      } else if (opacity === 0) {
        this.owner.didHide();
      }
    },
  })
  override readonly opacity!: StyleAnimator<this, number | undefined>;

  get modalView(): View | null {
    return null;
  }

  get modalState(): ModalState {
    return this.disclosure.modalState!;
  }

  get modality(): boolean | number {
    return this.disclosure.phase!;
  }

  showModal(options: ModalOptions, timing?: AnyTiming | boolean): void {
    this.disclosure.expand(timing);
  }

  hideModal(timing?: AnyTiming | boolean): void {
    this.disclosure.collapse(timing);
  }

  get button(): HtmlView | null {
    const childView = this.getChildView("button");
    return childView instanceof HtmlView ? childView : null;
  }

  get closeIcon(): Graphics {
    return ButtonStack.closeIcon;
  }

  get items(): ReadonlyArray<ButtonItem> {
    const childNodes = this.node.childNodes;
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
    const childNodes = this.node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        this.removeChild(childView);
      }
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.on("click", this.onClick);
    this.on("contextmenu", this.onContextMenu);
  }

  protected override onUnmount(): void {
    this.off("click", this.onClick);
    this.off("contextmenu", this.onContextMenu);
    super.onUnmount();
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutStack();
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0 && modalManager !== null) {
      modalManager.updateModality();
    }
  }

  protected layoutStack(): void {
    const phase = this.disclosure.getPhase();
    const childNodes = this.node.childNodes;
    const childCount = childNodes.length;
    const button = this.button;
    let zIndex = childCount - 1;
    let itemIndex = 0;
    let stackHeight = 0;
    let y: number;
    if (button !== null) {
      button.zIndex.setState(childCount, View.Intrinsic);
      const buttonHeight = button !== null ? button.height.value : void 0;
      y = buttonHeight instanceof Length
        ? buttonHeight.pxValue()
        : button.node.offsetHeight;
    } else {
      y = 0;
    }
    const buttonSpacing = this.buttonSpacing.value;
    const itemSpacing = this.itemSpacing.value;
    for (let i = 0; i < childCount; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        if (itemIndex === 0) {
          stackHeight += buttonSpacing;
          y += buttonSpacing;
        } else {
          stackHeight += itemSpacing;
          y += itemSpacing;
        }
        const itemHeight = childView.height.value;
        const dy = itemHeight instanceof Length
                 ? itemHeight.pxValue()
                 : childView.node.offsetHeight;
        childView.display.setState(phase === 0 ? "none" : "flex", View.Intrinsic);
        childView.bottom.setState(phase * y, View.Intrinsic);
        childView.zIndex.setState(zIndex, View.Intrinsic);
        y += dy;
        stackHeight += dy;
        itemIndex += 1;
        zIndex -= 1;
      }
    }
    Object.defineProperty(this, "stackHeight", {
      value: stackHeight,
      enumerable: true,
      configurable: true,
    });
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onInsertButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onInsertItem(childView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onRemoveButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertButton(button: HtmlView): void {
    this.gesture.setView(button);
    if (button instanceof FloatingButton) {
      button.disclosure.setState(Expansion.expanded(), View.Intrinsic);
      if (this.disclosure.isExpanded() || this.disclosure.isExpanding()) {
        button.pushIcon(this.closeIcon);
      }
    }
    button.zIndex.setState(0, View.Intrinsic);
  }

  protected onRemoveButton(button: HtmlView): void {
    this.gesture.setView(null);
  }

  protected onInsertItem(item: ButtonItem): void {
    item.position.setState("absolute", View.Intrinsic);
    item.right.setState(8, View.Intrinsic);
    item.bottom.setState(8, View.Intrinsic);
    item.left.setState(8, View.Intrinsic);
    item.zIndex.setState(0, View.Intrinsic);
  }

  protected onRemoveItem(item: ButtonItem): void {
    // hook
  }

  protected willExpand(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackWillExpand !== void 0) {
        viewObserver.buttonStackWillExpand(this);
      }
    }
  }

  protected onExpand(): void {
    const button = this.button;
    if (button instanceof FloatingButton) {
      const timing = this.disclosure.timing;
      button.pushIcon(this.closeIcon, timing !== null ? timing : void 0);
    }

    this.modalService.presentModal(this);
  }

  protected didExpand(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackDidExpand !== void 0) {
        viewObserver.buttonStackDidExpand(this);
      }
    }
  }

  protected willCollapse(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackWillCollapse !== void 0) {
        viewObserver.buttonStackWillCollapse(this);
      }
    }
  }

  protected onCollapse(): void {
    this.modalService.dismissModal(this);

    const button = this.button;
    if (button instanceof FloatingButton && button.iconCount > 1) {
      const timing = this.disclosure.timing;
      button.popIcon(timing !== null ? timing : void 0);
    }
  }

  protected didCollapse(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackDidCollapse !== void 0) {
        viewObserver.buttonStackDidCollapse(this);
      }
    }
  }

  show(timing?: AnyTiming | boolean): void {
    if (this.opacity.state !== 1) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willShow();
      if (timing !== false) {
        this.opacity.setState(1, timing, View.Intrinsic);
      } else {
        this.opacity.setState(1, View.Intrinsic);
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackWillShow !== void 0) {
        viewObserver.buttonStackWillShow(this);
      }
    }

    this.display("block");
  }

  protected didShow(): void {
    this.requireUpdate(View.NeedsLayout);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackDidShow !== void 0) {
        viewObserver.buttonStackDidShow(this);
      }
    }
  }

  hide(timing?: AnyTiming | boolean): void {
    if (this.opacity.state !== 0) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.willHide();
      if (timing !== false) {
        this.opacity.setState(0, timing, View.Intrinsic);
      } else {
        this.opacity.setState(0, View.Intrinsic);
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackWillHide !== void 0) {
        viewObserver.buttonStackWillHide(this);
      }
    }
  }

  protected didHide(): void {
    this.display("none");
    this.requireUpdate(View.NeedsLayout);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.buttonStackDidHide !== void 0) {
        viewObserver.buttonStackDidHide(this);
      }
    }
  }

  protected onClick(event: MouseEvent): void {
    if (event.target === this.button?.node) {
      event.stopPropagation();
    }
  }

  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  @Lazy
  static get closeIcon(): Graphics {
    return VectorIcon.create(24, 24, "M19,6.4L17.6,5L12,10.6L6.4,5L5,6.4L10.6,12L5,17.6L6.4,19L12,13.4L17.6,19L19,17.6L13.4,12Z");
  }
}
