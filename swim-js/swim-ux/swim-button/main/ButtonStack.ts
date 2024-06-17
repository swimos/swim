// Copyright 2015-2024 Nstream, inc.
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
import type {Class} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import {NodeView} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import type {ModalView} from "@swim/dom";
import type {Graphics} from "@swim/graphics";
import {VectorIcon} from "@swim/graphics";
import {FloatingButton} from "./FloatingButton";
import {ButtonItem} from "./ButtonItem";
import type {ButtonStackObserver} from "./ButtonStackObserver";

/** @public */
export class ButtonStack extends HtmlView implements ModalView {
  constructor(node: HTMLElement) {
    super(node);
    this.initButtonStack();
  }

  protected initButtonStack(): void {
    this.setIntrinsic<ButtonStack>({
      classList: ["button-stack"],
      style: {
        display: "block",
        position: "relative",
        width: 56,
        height: 56,
        opacity: 1,
        userSelect: "none",
        cursor: "pointer",
      },
    });
    this.button.insertView();
  }

  declare readonly observerType?: Class<ButtonStackObserver>;

  /** @internal */
  @Property({valueType: Number, value: 0})
  readonly stackHeight!: Property<this, number>;

  @ThemeAnimator({valueType: Number, value: 28, updateFlags: View.NeedsLayout})
  readonly buttonSpacing!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 20, updateFlags: View.NeedsLayout})
  readonly itemSpacing!: ThemeAnimator<this, number>;

  @Animator({
    inherits: true,
    get parent(): Animator<any, number | undefined, any> {
      return this.owner.style.opacity;
    },
    didTransition(opacity: number | undefined): void {
      if (opacity === 1) {
        this.owner.didShowStack();
      } else if (opacity === 0) {
        this.owner.didHideStack();
      }
    },
  })
  readonly opacity!: Animator<this, number | undefined>;

  get closeIcon(): Graphics {
    return ButtonStack.closeIcon;
  }

  @ViewRef({
    viewType: FloatingButton,
    viewKey: true,
    binds: true,
    willAttachView(buttonView: FloatingButton, target: View | null): void {
      buttonView.presence.setIntrinsic(Presence.presented());
      if (this.owner.presence.presented || this.owner.presence.presenting) {
        buttonView.icon.push(this.owner.closeIcon);
      }
    },
    initView(buttonView: FloatingButton): void {
      buttonView.style.zIndex.setIntrinsic(0);
    },
  })
  readonly button!: ViewRef<this, FloatingButton>;

  @ViewSet({
    viewType: ButtonItem,
    binds: true,
    willAttachView(itemView: ButtonItem, target: View | null): void {
      itemView.style.setIntrinsic({
        position: "absolute",
        right: 8,
        bottom: 8,
        left: 8,
        zIndex: 0,
      });
    },
  })
  readonly items!: ViewSet<this, ButtonItem>;

  insertItem(item: ButtonItem, index?: number, key?: string): void {
    if (index === void 0) {
      index = this.node.childNodes.length - 1;
    }
    this.insertChild(item.node, this.node.childNodes[1 + index] || null, key);
  }

  removeItems(): void {
    const childNodes = this.node.childNodes;
    for (let i = childNodes.length - 1; i >= 0; i -= 1) {
      const childView = NodeView.get(childNodes[i]);
      if (childView instanceof ButtonItem) {
        this.removeChild(childView);
      }
    }
  }

  /** @override */
  @PresenceAnimator({
    value: Presence.dismissed(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    didSetValue(presence: Presence): void {
      this.owner.callObservers("viewDidSetPresence", presence, this.owner);
      this.owner.modality.setIntrinsic(presence.phase);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
      const buttonView = this.owner.button.view;
      if (buttonView !== null) {
        const timing = this.timing;
        buttonView.icon.push(this.owner.closeIcon, timing !== null ? timing : void 0);
      }
      this.owner.modal.present();
    },
    didPresent(): void {
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
      const buttonView = this.owner.button.view;
      if (buttonView !== null && buttonView.icons.viewCount > 1) {
        const timing = this.timing;
        buttonView.icon.pop(timing !== null ? timing : void 0);
      }
    },
    didDismiss(): void {
      this.owner.callObservers("viewDidDismiss", this.owner);
    },
  })
  readonly presence!: PresenceAnimator<this, Presence>;

  /** @override */
  @Property({
    valueType: Number,
    value: 0,
    didSetValue(modality: number): void {
      this.owner.callObservers("viewDidSetModality", modality, this.owner);
    },
  })
  readonly modality!: Property<this, number>;

  @PositionGesture({
    binds: true,
    viewKey: "button",
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.defaultPrevented || this.owner.presence.presented) {
        return;
      }
      const stackHeight = this.owner.stackHeight.value;
      const phase = Math.min(Math.max(0, -(input.y - input.y0) / (0.5 * stackHeight)), 1);
      this.owner.presence.setPhase(phase);
      if (phase > 0.1) {
        input.clearHoldTimer();
        if (!this.owner.presence.presenting) {
          this.owner.presence.set(this.owner.presence.value.asPresenting());
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (input.defaultPrevented) {
        return;
      }
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

  @EventHandler({
    eventType: "click",
    handle(event: MouseEvent): void {
      if (event.target === this.owner.button.view?.node) {
        event.stopPropagation();
      }
    },
  })
  readonly click!: EventHandler<this>;

  @EventHandler({
    eventType: "contextmenu",
    handle(event: MouseEvent): void {
      event.preventDefault();
    },
  })
  readonly contextmenu!: EventHandler<this>;

  protected override onLayout(): void {
    super.onLayout();
    this.layoutStack();
  }

  protected layoutStack(): void {
    const phase = this.presence.getPhase();
    const childNodes = this.node.childNodes;
    const childCount = childNodes.length;
    const buttonView = this.button.view;
    let zIndex = childCount - 1;
    let itemIndex = 0;
    let stackHeight = 0;
    let y: number;
    if (buttonView !== null) {
      buttonView.style.zIndex.setIntrinsic(childCount);
      y = buttonView.style.height.pxValue();
    } else {
      y = 0;
    }
    const buttonSpacing = this.buttonSpacing.value;
    const itemSpacing = this.itemSpacing.value;
    for (let i = 0; i < childCount; i += 1) {
      const childView = NodeView.get(childNodes[i]);
      if (childView instanceof ButtonItem) {
        if (itemIndex === 0) {
          stackHeight += buttonSpacing;
          y += buttonSpacing;
        } else {
          stackHeight += itemSpacing;
          y += itemSpacing;
        }
        const dy = childView.style.height.pxValue();
        childView.style.setIntrinsic({
          display: phase === 0 ? "none" : "flex",
          bottom: phase * y,
          zIndex,
        });
        y += dy;
        stackHeight += dy;
        itemIndex += 1;
        zIndex -= 1;
      }
    }
    this.stackHeight.set(stackHeight);
  }

  show(timing?: TimingLike | boolean): void {
    if (this.opacity.state !== 1) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }
      this.willShowStack();
      if (timing !== false) {
        this.opacity.setIntrinsic(1, timing);
      } else {
        this.opacity.setIntrinsic(1);
        this.didShowStack();
      }
    }
  }

  protected willShowStack(): void {
    this.callObservers("buttonStackWillShow", this);
    this.style.display.set("block");
  }

  protected didShowStack(): void {
    this.requireUpdate(View.NeedsLayout);
    this.callObservers("buttonStackDidShow", this);
  }

  hide(timing?: TimingLike | boolean): void {
    if (this.opacity.state !== 0) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }
      this.willHideStack();
      if (timing !== false) {
        this.opacity.setIntrinsic(0, timing);
      } else {
        this.opacity.setIntrinsic(0);
        this.didHideStack();
      }
    }
  }

  protected willHideStack(): void {
    this.callObservers("buttonStackWillHide", this);
  }

  protected didHideStack(): void {
    this.style.display.set("none");
    this.requireUpdate(View.NeedsLayout);
    this.callObservers("buttonStackDidHide", this);
  }

  @Lazy
  static get closeIcon(): Graphics {
    return VectorIcon.create(24, 24, "M19,6.4L17.6,5L12,10.6L6.4,5L5,6.4L10.6,12L5,17.6L6.4,19L12,13.4L17.6,19L19,17.6L13.4,12Z");
  }
}
