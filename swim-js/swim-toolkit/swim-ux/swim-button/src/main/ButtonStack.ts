// Copyright 2015-2022 Swim.inc
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

import {Mutable, Class, Lazy, AnyTiming, Timing} from "@swim/util";
import {Affinity, MemberFastenerClass} from "@swim/component";
import {Length} from "@swim/math";
import {AnyExpansion, Expansion, ExpansionAnimator} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {
  ModalOptions,
  ModalState,
  Modal,
  PositionGestureInput,
  PositionGesture,
  ViewContextType,
  View,
} from "@swim/view";
import {StyleAnimator, ViewNode, HtmlView} from "@swim/dom";
import {Graphics, VectorIcon} from "@swim/graphics";
import {FloatingButton} from "./FloatingButton";
import {ButtonItem} from "./ButtonItem";
import type {ButtonStackObserver} from "./ButtonStackObserver";

/** @public */
export class ButtonStack extends HtmlView implements Modal {
  constructor(node: HTMLElement) {
    super(node);
    this.stackHeight = 0;
    this.onClick = this.onClick.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.initButtonStack();
    this.initButton();
  }

  protected initButtonStack(): void {
    this.addClass("button-stack");
    this.display.setState("block", Affinity.Intrinsic);
    this.position.setState("relative", Affinity.Intrinsic);
    this.width.setState(56, Affinity.Intrinsic);
    this.height.setState(56, Affinity.Intrinsic);
    this.opacity.setState(1, Affinity.Intrinsic);
    this.userSelect.setState("none", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);
  }

  protected initButton(): void {
    const button = this.createButton();
    if (button !== null) {
      this.appendChild(button, "button");
    }
  }

  override readonly observerType?: Class<ButtonStackObserver>;

  /** @internal */
  readonly stackHeight: number;

  protected createButton(): HtmlView | null {
    return FloatingButton.create();
  }

  @PositionGesture<ButtonStack, HtmlView>({
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && !this.owner.disclosure.expanded) {
        const stackHeight = this.owner.stackHeight;
        const phase = Math.min(Math.max(0, -(input.y - input.y0) / (0.5 * stackHeight)), 1);
        this.owner.disclosure.setPhase(phase);
        if (phase > 0.1) {
          input.clearHoldTimer();
          if (!this.owner.disclosure.expanding) {
            this.owner.disclosure.setState(this.owner.disclosure.value.asExpanding());
          }
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented) {
        const phase = this.owner.disclosure.getPhase();
        if (input.t - input.t0 < input.holdDelay) {
          if (phase < 0.1 || this.owner.disclosure.expanded) {
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
        if (phase < 0.1 || this.owner.disclosure.expanded) {
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
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
  static readonly gesture: MemberFastenerClass<ButtonStack, "gesture">;

  @ExpansionAnimator<ButtonStack, Expansion, AnyExpansion>({
    type: Expansion,
    value: Expansion.collapsed(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
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
  readonly disclosure!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @ThemeAnimator({type: Number, value: 28, updateFlags: View.NeedsLayout})
  readonly buttonSpacing!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, value: 20, updateFlags: View.NeedsLayout})
  readonly itemSpacing!: ThemeAnimator<this, number>;

  @StyleAnimator<ButtonStack, number | undefined>({
    propertyNames: "opacity",
    type: Number,
    didTransition(opacity: number | undefined): void {
      if (opacity === 1) {
        this.owner.didShowStack();
      } else if (opacity === 0) {
        this.owner.didHideStack();
      }
    },
  })
  override readonly opacity!: StyleAnimator<this, number | undefined>;

  get modalView(): View | null {
    return null;
  }

  get modalState(): ModalState {
    return this.disclosure.modalState! as ModalState;
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
    const childView = this.getChild("button");
    return childView instanceof HtmlView ? childView : null;
  }

  get closeIcon(): Graphics {
    return ButtonStack.closeIcon;
  }

  get items(): ReadonlyArray<ButtonItem> {
    const childNodes = this.node.childNodes;
    const children = [];
    for (let i = 0, n = childNodes.length; i < n; i += 1) {
      const childView = (childNodes[i] as ViewNode).view;
      if (childView instanceof ButtonItem) {
        children.push(childView);
      }
    }
    return children;
  }

  insertItem(item: ButtonItem, index?: number, key?: string): void {
    if (index === void 0) {
      index = this.node.childNodes.length - 1;
    }
    this.insertChild(item.node, this.node.childNodes[1 + index] || null, key);
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
    const modalService = this.modalProvider.service;
    if (modalService !== void 0 && modalService !== null) {
      modalService.updateModality();
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
      button.zIndex.setState(childCount, Affinity.Intrinsic);
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
        childView.display.setState(phase === 0 ? "none" : "flex", Affinity.Intrinsic);
        childView.bottom.setState(phase * y, Affinity.Intrinsic);
        childView.zIndex.setState(zIndex, Affinity.Intrinsic);
        y += dy;
        stackHeight += dy;
        itemIndex += 1;
        zIndex -= 1;
      }
    }
    (this as Mutable<this>).stackHeight = stackHeight;
  }

  protected override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onInsertButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onInsertItem(childView);
    }
  }

  protected override onRemoveChild(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof HtmlView) {
      this.onRemoveButton(childView);
    } else if (childView instanceof ButtonItem) {
      this.onRemoveItem(childView);
    }
    super.onRemoveChild(childView);
  }

  protected onInsertButton(button: HtmlView): void {
    this.gesture.setView(button);
    if (button instanceof FloatingButton) {
      button.disclosure.setState(Expansion.expanded(), Affinity.Intrinsic);
      if (this.disclosure.expanded || this.disclosure.expanding) {
        button.pushIcon(this.closeIcon);
      }
    }
    button.zIndex.setState(0, Affinity.Intrinsic);
  }

  protected onRemoveButton(button: HtmlView): void {
    this.gesture.setView(null);
  }

  protected onInsertItem(item: ButtonItem): void {
    item.position.setState("absolute", Affinity.Intrinsic);
    item.right.setState(8, Affinity.Intrinsic);
    item.bottom.setState(8, Affinity.Intrinsic);
    item.left.setState(8, Affinity.Intrinsic);
    item.zIndex.setState(0, Affinity.Intrinsic);
  }

  protected onRemoveItem(item: ButtonItem): void {
    // hook
  }

  protected willExpand(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackWillExpand !== void 0) {
        observer.buttonStackWillExpand(this);
      }
    }
  }

  protected onExpand(): void {
    const button = this.button;
    if (button instanceof FloatingButton) {
      const timing = this.disclosure.timing;
      button.pushIcon(this.closeIcon, timing !== null ? timing : void 0);
    }

    this.modalProvider.presentModal(this);
  }

  protected didExpand(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackDidExpand !== void 0) {
        observer.buttonStackDidExpand(this);
      }
    }
  }

  protected willCollapse(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackWillCollapse !== void 0) {
        observer.buttonStackWillCollapse(this);
      }
    }
  }

  protected onCollapse(): void {
    this.modalProvider.dismissModal(this);

    const button = this.button;
    if (button instanceof FloatingButton && button.iconCount > 1) {
      const timing = this.disclosure.timing;
      button.popIcon(timing !== null ? timing : void 0);
    }
  }

  protected didCollapse(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackDidCollapse !== void 0) {
        observer.buttonStackDidCollapse(this);
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
      this.willShowStack();
      if (timing !== false) {
        this.opacity.setState(1, timing, Affinity.Intrinsic);
      } else {
        this.opacity.setState(1, Affinity.Intrinsic);
        this.didShowStack();
      }
    }
  }

  protected willShowStack(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackWillShow !== void 0) {
        observer.buttonStackWillShow(this);
      }
    }

    this.display("block");
  }

  protected didShowStack(): void {
    this.requireUpdate(View.NeedsLayout);

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackDidShow !== void 0) {
        observer.buttonStackDidShow(this);
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
      this.willHideStack();
      if (timing !== false) {
        this.opacity.setState(0, timing, Affinity.Intrinsic);
      } else {
        this.opacity.setState(0, Affinity.Intrinsic);
        this.didHideStack();
      }
    }
  }

  protected willHideStack(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackWillHide !== void 0) {
        observer.buttonStackWillHide(this);
      }
    }
  }

  protected didHideStack(): void {
    this.display("none");
    this.requireUpdate(View.NeedsLayout);

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.buttonStackDidHide !== void 0) {
        observer.buttonStackDidHide(this);
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
