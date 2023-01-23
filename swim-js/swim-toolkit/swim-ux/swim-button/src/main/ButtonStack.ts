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

import {Mutable, Class, Lazy, AnyTiming, Timing} from "@swim/util";
import {Affinity, FastenerClass, Property} from "@swim/component";
import {Length} from "@swim/math";
import {AnyPresence, Presence, PresenceAnimator} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {View, PositionGestureInput, PositionGesture} from "@swim/view";
import {StyleAnimator, ViewNode, HtmlView, ModalView} from "@swim/dom";
import {Graphics, VectorIcon} from "@swim/graphics";
import {FloatingButton} from "./FloatingButton";
import {ButtonItem} from "./ButtonItem";
import type {ButtonStackObserver} from "./ButtonStackObserver";

/** @public */
export class ButtonStack extends HtmlView implements ModalView {
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

  @PositionGesture<ButtonStack["gesture"]>({
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented && !this.owner.presence.presented) {
        const stackHeight = this.owner.stackHeight;
        const phase = Math.min(Math.max(0, -(input.y - input.y0) / (0.5 * stackHeight)), 1);
        this.owner.presence.setPhase(phase);
        if (phase > 0.1) {
          input.clearHoldTimer();
          if (!this.owner.presence.presenting) {
            this.owner.presence.setState(this.owner.presence.value.asPresenting());
          }
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!input.defaultPrevented) {
        const phase = this.owner.presence.getPhase();
        if (input.t - input.t0 < input.holdDelay) {
          if (phase < 0.1 || this.owner.presence.presented) {
            this.owner.presence.dismiss();
          } else {
            this.owner.presence.present();
          }
        } else {
          if (phase < 0.5) {
            this.owner.presence.dismiss();
          } else if (phase >= 0.5) {
            this.owner.presence.present();
          }
        }
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (input.buttons === 2) {
        this.owner.presence.toggle();
      } else {
        const phase = this.owner.presence.getPhase();
        if (phase < 0.1 || this.owner.presence.presented) {
          this.owner.presence.dismiss();
        } else {
          this.owner.presence.present();
        }
      }
    },
    didLongPress(input: PositionGestureInput): void {
      input.preventDefault();
      this.owner.presence.toggle();
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
  static readonly gesture: FastenerClass<ButtonStack["gesture"]>;

  /** @override */
  @PresenceAnimator<ButtonStack["presence"]>({
    value: Presence.dismissed(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    didSetValue(presence: Presence): void {
      this.owner.callObservers("viewDidSetPresence", presence, this.owner);
      this.owner.modality.setValue(presence.phase, Affinity.Intrinsic);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
      const button = this.owner.button;
      if (button instanceof FloatingButton) {
        const timing = this.timing;
        button.pushIcon(this.owner.closeIcon, timing !== null ? timing : void 0);
      }
      this.owner.modal.present();
    },
    didPresent(): void {
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
      const button = this.owner.button;
      if (button instanceof FloatingButton && button.iconCount > 1) {
        const timing = this.timing;
        button.popIcon(timing !== null ? timing : void 0);
      }
    },
    didDismiss(): void {
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly presence!: PresenceAnimator<this, Presence, AnyPresence>;

  /** @override */
  @Property<ButtonStack["modality"]>({
    valueType: Number,
    value: 0,
    didSetValue(modality: number): void {
      this.owner.callObservers("viewDidSetModality", modality, this.owner);
    },
  })
  readonly modality!: Property<this, number>;

  @ThemeAnimator({valueType: Number, value: 28, updateFlags: View.NeedsLayout})
  readonly buttonSpacing!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 20, updateFlags: View.NeedsLayout})
  readonly itemSpacing!: ThemeAnimator<this, number>;

  @StyleAnimator<ButtonStack["opacity"]>({
    extends: HtmlView.getFastenerClass("opacity"),
    didTransition(opacity: number | undefined): void {
      if (opacity === 1) {
        this.owner.didShowStack();
      } else if (opacity === 0) {
        this.owner.didHideStack();
      }
    },
  })
  override readonly opacity!: StyleAnimator<this, number | undefined>;

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
    this.addEventListener("click", this.onClick);
    this.addEventListener("contextmenu", this.onContextMenu);
  }

  protected override onUnmount(): void {
    this.removeEventListener("click", this.onClick);
    this.removeEventListener("contextmenu", this.onContextMenu);
    super.onUnmount();
  }

  protected override onLayout(): void {
    super.onLayout();
    this.layoutStack();
  }

  protected layoutStack(): void {
    const phase = this.presence.getPhase();
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
      button.presence.setState(Presence.presented(), Affinity.Intrinsic);
      if (this.presence.presented || this.presence.presenting) {
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
