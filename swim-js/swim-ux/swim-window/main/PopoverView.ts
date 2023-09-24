// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Length} from "@swim/math";
import type {R2BoxLike} from "@swim/math";
import {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import {HtmlView} from "@swim/dom";
import type {ModalViewObserver} from "@swim/dom";
import type {ModalView} from "@swim/dom";

/** @public */
export type PopoverPlacement = "none" | "above" | "below" | "over" | "top" | "bottom" | "right" | "left";

/** @public */
export interface PopoverViewObserver<V extends PopoverView = PopoverView> extends HtmlViewObserver<V>, ModalViewObserver<V> {
  popoverWillAttachSource?(sourceView: View, view: V): void;

  popoverDidDetachSource?(sourceView: View, view: V): void;

  popoverWillPlace?(placement: PopoverPlacement, view: V): void;

  popoverDidPlace?(placement: PopoverPlacement, view: V): void;
}

/** @public */
export class PopoverView extends HtmlView implements ModalView {
  constructor(node: HTMLElement) {
    super(node);
    this.sourceFrame = null;
    this.currentPlacement = "none";
    this.initArrow();
  }

  declare readonly observerType?: Class<PopoverViewObserver>;

  protected initArrow(): void {
    const arrow = this.createArrow();
    if (arrow !== null) {
      this.prependChild(arrow, "arrow");
    }
  }

  protected createArrow(): HtmlView | null {
    return HtmlView.fromTag("div").setIntrinsic({
      classList: ["popover-arrow"],
      style: {
        display: "none",
        position: "absolute",
        width: 0,
        height: 0,
      },
    });
  }

  @Animator({
    inherits: true,
    get parent(): Animator<any, Color | null, any> {
      return this.owner.style.backgroundColor;
    },
    didSetValue(backgroundColor: Color): void {
      this.owner.place();
    },
  })
  readonly backgroundColor!: Animator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero()})
  readonly placementGap!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(10)})
  readonly arrowWidth!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(8)})
  readonly arrowHeight!: ThemeAnimator<this, Length>;

  @ViewRef({
    observes: true,
    willAttachView(sourceView: View): void {
      this.owner.callObservers("popoverWillAttachSource", sourceView, this.owner);
    },
    didAttachView(sourceView: View): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    didDetachView(sourceView: View): void {
      this.owner.callObservers("popoverDidDetachSource", sourceView, this.owner);
    },
    viewDidMount(view: View): void {
      this.owner.place();
    },
    viewDidResize(view: View): void {
      this.owner.place();
    },
    viewDidScroll(view: View): void {
      this.owner.place();
    },
    viewDidAnimate(view: View): void {
      this.owner.place();
    },
    viewDidLayout(view: View): void {
      this.owner.place();
    },
    viewDidProject(view: View): void {
      this.owner.place();
    },
    viewDidSetAttribute(name: string, value: unknown, view: HtmlView): void {
      this.owner.place();
    },
    viewDidSetStyle(name: string, value: unknown, priority: string | undefined, view: HtmlView): void {
      this.owner.place();
    },
  })
  readonly source!: ViewRef<this, View> & Observes<HtmlView>;

  /** @override */
  @PresenceAnimator({
    value: Presence.dismissed(),
    updateFlags: View.NeedsLayout,
    get transition(): Timing | boolean | null {
      return this.owner.getLookOr(Look.timing, null);
    },
    didSetValue(presence: Presence): void {
      const phase = presence.phase;
      const placement = this.owner.currentPlacement;
      if (placement === "above") {
        this.owner.style.setIntrinsic({
          marginTop: (1 - phase) * -this.owner.node.clientHeight,
          opacity: void 0,
        });
      } else if (placement === "below") {
        this.owner.style.setIntrinsic({
          marginTop: (1 - phase) * this.owner.node.clientHeight,
          opacity: void 0,
        });
      } else {
        this.owner.style.setIntrinsic({
          marginTop: null,
          opacity: phase,
        });
      }
      this.owner.callObservers("viewDidSetPresence", presence, this.owner);
    },
    willPresent(): void {
      this.owner.callObservers("viewWillPresent", this.owner);
      this.owner.place();
      this.owner.style.visibility.setIntrinsic("visible");
    },
    didPresent(): void {
      this.owner.style.setIntrinsic({
        marginTop: null,
        opacity: void 0,
        pointerEvents: "auto",
      });
      this.owner.callObservers("viewDidPresent", this.owner);
    },
    willDismiss(): void {
      this.owner.callObservers("viewWillDismiss", this.owner);
      this.owner.style.pointerEvents.setIntrinsic("none");
    },
    didDismiss(): void {
      this.owner.style.setIntrinsic({
        marginTop: null,
        opacity: void 0,
        visibility: "hidden",
      });
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

  @Property({
    value: ["top", "bottom", "right", "left"],
    didSetValue(placement: readonly PopoverPlacement[]): void {
      this.owner.place();
    },
    equalValues(a: readonly PopoverPlacement[], b: readonly PopoverPlacement[]): boolean {
      return Arrays.equal(a, b);
    },
  })
  readonly placement!: Property<this, readonly PopoverPlacement[]>;

  /** @internal */
  readonly currentPlacement: PopoverPlacement;

  @Property({
    valueType: R2Box,
    value: null,
    didSetValue(placementFrame: R2Box | null): void {
      this.owner.place();
    },
    fromLike(value: R2BoxLike | null): R2Box | null {
      return value !== null ? R2Box.fromLike(value) : null;
    },
  })
  readonly placementFrame!: Property<this, R2Box | null>;

  @Property({
    valueType: Boolean,
    value: false,
    didSetValue(dropdown: boolean): void {
      this.owner.place();
    }
  })
  readonly dropdown!: Property<this, boolean>;

  protected override needsProcess(processFlags: ViewFlags): ViewFlags {
    if ((processFlags & (View.NeedsScroll | View.NeedsAnimate)) !== 0) {
      this.requireUpdate(View.NeedsLayout);
    }
    return processFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.place();
  }

  /** @internal */
  readonly sourceFrame: R2Box | null;

  place(force: boolean = false): PopoverPlacement {
    const sourceView = this.source.view;
    const oldSourceFrame = this.sourceFrame;
    const newSourceFrame = sourceView !== null ? sourceView.popoverFrame : null;
    if (newSourceFrame === null || this.placement.value.length === 0 ||
        (!force && newSourceFrame.equals(oldSourceFrame))) {
      return "none";
    }
    (this as Mutable<this>).sourceFrame = null;
    const placement = this.placePopover(sourceView!, newSourceFrame);
    const arrow = this.getChild("arrow");
    if (arrow instanceof HtmlView) {
      this.placeArrow(sourceView!, newSourceFrame, arrow, placement);
    }
    return placement;
  }

  /** @internal */
  protected placePopover(sourceView: View, sourceFrame: R2Box): PopoverPlacement {
    const node = this.node;
    const parent = node.offsetParent;
    if (parent === null) {
      return "none";
    }
    const popoverWidth = node.clientWidth;
    const popoverHeight = node.clientHeight;

    // offsetParent bounds in client coordinates
    const parentBounds = parent.getBoundingClientRect();
    const parentLeft = parentBounds.left;
    const parentTop = parentBounds.top;

    // source bounds in offsetParent coordinates (transformed from page coordinates)
    const sourceLeft = sourceFrame.left - window.pageXOffset - parentLeft;
    const sourceRight = sourceFrame.right - window.pageXOffset - parentLeft;
    const sourceTop = sourceFrame.top - window.pageYOffset - parentTop;
    const sourceBottom = sourceFrame.bottom - window.pageYOffset - parentTop;
    const sourceWidth = sourceFrame.width;
    const sourceHeight = sourceFrame.height;
    const sourceX = sourceLeft + sourceWidth / 2;
    const sourceY = sourceTop + sourceHeight / 2;

    // placement frame in offsetParent coordinates (transformed from client coordinates)
    const placementFrame = this.placementFrame.value;
    const placementLeft = (placementFrame !== null ? placementFrame.left : 0);
    const placementRight = (placementFrame !== null ? placementFrame.right : window.innerWidth) - parentLeft;
    const placementTop = (placementFrame !== null ? placementFrame.top : 0);
    const placementBottom = (placementFrame !== null ? placementFrame.bottom : window.innerHeight) - parentTop;

    // source bound margins relative to placement bounds
    const marginLeft = sourceLeft - placementLeft - window.pageXOffset;
    const marginRight = placementRight - sourceLeft - sourceWidth;
    const marginTop = sourceTop - placementTop - window.pageYOffset;
    const marginBottom = placementBottom - sourceTop - sourceHeight;

    const dropdown = this.dropdown.value;
    const arrowHeight = this.arrowHeight.getValue().pxValue();
    const placementGap = this.placementGap.getValue().pxValue();

    let placement: PopoverPlacement | undefined;
    const allowedPlacement = this.placement.value;
    for (let i = 0; i < allowedPlacement.length; i += 1) { // first fit
      const p = allowedPlacement[i]!;
      if (p === "above" || p === "below" || p === "over") {
        placement = p;
        break;
      } else if (p === "top" && popoverHeight + arrowHeight + placementGap <= marginTop) {
        placement = p;
        break;
      } else if (p === "bottom" && popoverHeight + arrowHeight + placementGap <= marginBottom) {
        placement = p;
        break;
      } else if (p === "left" && popoverWidth + arrowHeight + placementGap <= marginLeft) {
        placement = p;
        break;
      } else if (p === "right" && popoverWidth + arrowHeight + placementGap <= marginRight) {
        placement = p;
        break;
      }
    }
    if (placement === void 0) {
      placement = "none";
      for (let i = 0; i < allowedPlacement.length; i += 1) { // best fit
        const p = allowedPlacement[i]!;
        if (p === "top" && marginTop >= marginBottom) {
          placement = p;
          break;
        } else if (p === "bottom" && marginBottom >= marginTop) {
          placement = p;
          break;
        } else if (p === "left" && marginLeft >= marginRight) {
          placement = p;
          break;
        } else if (p === "right" && marginRight >= marginLeft) {
          placement = p;
          break;
        }
      }
    }

    let left = node.offsetLeft;
    let top = node.offsetTop;
    let right: number | null = null;
    let bottom: number | null = null;

    const oldWidth = this.style.width.pxValue();
    const oldHeight = this.style.height.pxValue();
    let width: number | null = oldWidth;
    let height: number | null = oldHeight;

    const oldMaxWidth = this.style.maxWidth.pxState();
    const oldMaxHeight = this.style.maxHeight.pxState();
    let maxWidth: number | null = oldMaxWidth;
    let maxHeight: number | null = oldMaxHeight;

    if (placement === "above") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round((placementFrame !== null ? placementFrame.width : window.innerWidth) - placementRight);
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = null;
      maxWidth = null;
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "below") {
      left = Math.round(placementLeft);
      top = Math.round(placementBottom - popoverHeight);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = null;
      maxWidth = null;
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "over") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      bottom = Math.round(placementBottom - (placementFrame !== null ? placementFrame.height : window.innerHeight));
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = Math.round(Math.max(0, placementBottom - placementTop));
      maxWidth = null;
      maxHeight = null;
    } else if (placement === "top" && !dropdown) {
      if (sourceX - popoverWidth / 2 <= placementLeft) {
        left = Math.round(placementLeft);
      } else if (sourceX + popoverWidth / 2 >= placementRight) {
        left = Math.round(placementRight - popoverWidth);
      } else {
        left = Math.round(sourceX - popoverWidth / 2);
      }
      top = Math.round(Math.max(placementTop, sourceTop - (popoverHeight + arrowHeight + placementGap)));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, sourceBottom - placementTop));
    } else if (placement === "bottom" && !dropdown) {
      if (sourceX - popoverWidth / 2 <= placementLeft) {
        left = Math.round(placementLeft);
      } else if (sourceX + popoverWidth / 2 >= placementRight) {
        left = Math.round(placementRight - popoverWidth);
      } else {
        left = Math.round(sourceX - popoverWidth / 2);
      }
      top = Math.round(Math.max(placementTop, sourceBottom + arrowHeight + placementGap));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - sourceTop));
    } else if (placement === "left" && !dropdown) {
      left = Math.round(Math.max(placementLeft, sourceLeft - (popoverWidth + arrowHeight + placementGap)));
      if (sourceY - popoverHeight / 2 <= placementTop) {
        top = Math.round(placementTop);
      } else if (sourceY + popoverHeight / 2 >= placementBottom) {
        top = Math.round(placementBottom - popoverHeight);
      } else {
        top = Math.round(sourceY - popoverHeight / 2);
      }
      maxWidth = Math.round(Math.max(0, sourceRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "right" && !dropdown) {
      left = Math.round(Math.max(placementLeft, sourceRight + arrowHeight + placementGap));
      if (sourceY - popoverHeight / 2 <= placementTop) {
        top = Math.round(placementTop);
      } else if (sourceY + popoverHeight / 2 >= placementBottom) {
        top = Math.round(placementBottom - popoverHeight);
      } else {
        top = Math.round(sourceY - popoverHeight / 2);
      }
      maxWidth = Math.round(Math.max(0, placementRight - sourceLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "top" && dropdown) {
      left = Math.max(placementLeft, sourceLeft);
      top = Math.round(Math.max(placementTop, sourceTop - (popoverHeight + placementGap)));
      width = Math.round(Math.max(0, Math.min(sourceWidth, placementRight - sourceLeft)));
      height = null;
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, sourceBottom - placementTop));
    } else if (placement === "bottom" && dropdown) {
      left = Math.max(placementLeft, sourceLeft);
      top = Math.round(Math.max(placementTop, sourceBottom + placementGap));
      width = Math.round(Math.max(0, Math.min(sourceWidth, placementRight - sourceLeft)));
      height = null;
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - sourceTop));
    } else if (placement === "left" && dropdown) {
      left = Math.round(Math.max(placementLeft, sourceLeft - (popoverWidth + placementGap)));
      top = Math.max(placementTop, sourceTop);
      width = null;
      height = Math.round(Math.max(0, Math.min(sourceHeight, placementBottom - sourceTop)));
      maxWidth = Math.round(Math.max(0, sourceRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "right" && dropdown) {
      left = Math.round(Math.max(placementLeft, sourceRight + placementGap));
      top = Math.max(placementTop, sourceTop);
      width = null;
      height = Math.round(Math.max(0, Math.min(sourceHeight, placementBottom - sourceTop)));
      maxWidth = Math.round(Math.max(0, placementRight - sourceLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    }

    if (placement !== "none" && (left !== node.offsetLeft && this.style.left.hasAffinity(Affinity.Intrinsic)
                              || top !== node.offsetTop && this.style.top.hasAffinity(Affinity.Intrinsic)
                              || width !== oldWidth && this.style.width.hasAffinity(Affinity.Intrinsic)
                              || height !== oldHeight && this.style.height.hasAffinity(Affinity.Intrinsic)
                              || maxWidth !== oldMaxWidth && this.style.maxWidth.hasAffinity(Affinity.Intrinsic)
                              || maxHeight !== oldMaxHeight && this.style.maxHeight.hasAffinity(Affinity.Intrinsic))) {
      this.willPlacePopover(placement);
      this.style.setIntrinsic({
        position: "absolute",
        left, right,
        top, bottom,
        width, height,
        maxWidth, maxHeight,
      });
      this.onPlacePopover(placement);
      this.didPlacePopover(placement);
    }

    (this as Mutable<this>).currentPlacement = placement;
    return placement;
  }

  protected willPlacePopover(placement: PopoverPlacement): void {
    this.callObservers("popoverWillPlace", placement, this);
  }

  protected onPlacePopover(placement: PopoverPlacement): void {
    // hook
  }

  protected didPlacePopover(placement: PopoverPlacement): void {
    this.callObservers("popoverDidPlace", placement, this);
  }

  /** @internal */
  protected placeArrow(sourceView: View, sourceFrame: R2Box, arrow: HtmlView,
                       placement: PopoverPlacement): void {
    const node = this.node;
    const parent = node.offsetParent;
    if (parent === null) {
      return;
    }

    // offsetParent bounds in client coordinates
    const parentBounds = parent.getBoundingClientRect();
    const parentLeft = parentBounds.left;
    const parentTop = parentBounds.top;

    // source bounds in offsetParent coordinates (transformed from page coordinates)
    const sourceLeft = sourceFrame.left - window.pageXOffset - parentLeft;
    const sourceTop = sourceFrame.top - window.pageYOffset - parentTop;
    const sourceWidth = sourceFrame.width;
    const sourceHeight = sourceFrame.height;
    const sourceX = sourceLeft + sourceWidth / 2;
    const sourceY = sourceTop + sourceHeight / 2;

    const offsetLeft = node.offsetLeft;
    const offsetRight = offsetLeft + node.clientWidth;
    const offsetTop = node.offsetTop;
    const offsetBottom = offsetTop + node.clientHeight;

    let backgroundColor = this.style.backgroundColor.value;
    if (backgroundColor === null) {
      backgroundColor = Color.transparent();
    }
    const borderRadius = this.style.borderRadius.get();
    const radius = borderRadius instanceof Length ? borderRadius.pxValue() : 0;

    const arrowWidth = this.arrowWidth.getValue().pxValue();
    const arrowHeight = this.arrowHeight.getValue().pxValue();

    const arrowXMin = offsetLeft + radius + arrowWidth / 2;
    const arrowXMax = offsetRight - radius - arrowWidth / 2;
    const arrowYMin = offsetTop + radius + arrowWidth / 2;
    const arrowYMax = offsetBottom - radius - arrowWidth / 2;

    arrow.style.setIntrinsic({
      top: null,
      right: null,
      bottom: null,
      left: null,
      borderWidth: null,
      borderStyle: void 0,
      borderColor: null,
      borderLeftWidth: null,
      borderLeftStyle: void 0,
      borderLeftColor: null,
      borderRightWidth: null,
      borderRightStyle: void 0,
      borderRightColor: null,
      borderTopWidth: null,
      borderTopStyle: void 0,
      borderTopColor: null,
      borderBottomWidth: null,
      borderBottomStyle: void 0,
      borderBottomColor: null,
      zIndex: 100,
    });

    if (placement === "none" || placement === "above" || placement === "below" || placement === "over") {
      // hide arrow
      arrow.style.display.setIntrinsic("none");
    } else if (Math.round(sourceY) <= Math.round(offsetTop - arrowHeight) // arrow tip below source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on top popover edge
      // top arrow
      arrow.style.setIntrinsic({
        display: "block",
        top: Math.round(-arrowHeight),
        left: Math.round(sourceX - offsetLeft - arrowWidth / 2),
        borderLeftWidth: Math.round(arrowWidth / 2),
        borderLeftStyle: "solid",
        borderLeftColor: Color.transparent(),
        borderRightWidth: Math.round(arrowWidth / 2),
        borderRightStyle: "solid",
        borderRightColor: Color.transparent(),
        borderBottomWidth: Math.round(arrowHeight),
        borderBottomStyle: "solid",
        borderBottomColor: backgroundColor,
      });
    } else if (Math.round(offsetBottom + arrowHeight) <= Math.round(sourceY) // arrow tip above source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on bottom popover edge
      // bottom arrow
      arrow.style.setIntrinsic({
        display: "block",
        bottom: Math.round(-arrowHeight),
        left: Math.round(sourceX - offsetLeft - arrowWidth / 2),
        borderLeftWidth: Math.round(arrowWidth / 2),
        borderLeftStyle: "solid",
        borderLeftColor: Color.transparent(),
        borderRightWidth: Math.round(arrowWidth / 2),
        borderRightStyle: "solid",
        borderRightColor: Color.transparent(),
        borderTopWidth: Math.round(arrowHeight),
        borderTopStyle: "solid",
        borderTopColor: backgroundColor,
      });
    } else if (Math.round(sourceX) <= Math.round(offsetLeft - arrowHeight) // arrow tip right of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on left popover edge
      // left arrow
      arrow.style.setIntrinsic({
        display: "block",
        left: Math.round(-arrowHeight),
        top: Math.round(sourceY - offsetTop - arrowWidth / 2),
        borderTopWidth: Math.round(arrowWidth / 2),
        borderTopStyle: "solid",
        borderTopColor: Color.transparent(),
        borderBottomWidth: Math.round(arrowWidth / 2),
        borderBottomStyle: "solid",
        borderBottomColor: Color.transparent(),
        borderRightWidth: Math.round(arrowHeight),
        borderRightStyle: "solid",
        borderRightColor: backgroundColor,
      });
    } else if (Math.round(offsetRight + arrowHeight) <= Math.round(sourceX) // arrow tip left of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on right popover edge
      // right arrow
      arrow.style.setIntrinsic({
        display: "block",
        right: Math.round(-arrowHeight),
        top: Math.round(sourceY - offsetTop - arrowWidth / 2),
        borderTopWidth: Math.round(arrowWidth / 2),
        borderTopStyle: "solid",
        borderTopColor: Color.transparent(),
        borderBottomWidth: Math.round(arrowWidth / 2),
        borderBottomStyle: "solid",
        borderBottomColor: Color.transparent(),
        borderLeftWidth: Math.round(arrowHeight),
        borderLeftStyle: "solid",
        borderLeftColor: backgroundColor,
      });
    } else {
      // no arrow
      arrow.style.display.setIntrinsic("none");
    }
  }

  @EventHandler({
    eventType: "click",
    bindsOwner: true,
    handle(event: MouseEvent): void {
      event.stopPropagation();
    },
  })
  readonly click!: EventHandler<this>;

  /** @internal */
  static readonly HiddenState: number = 0;
  /** @internal */
  static readonly HidingState: number = 1;
  /** @internal */
  static readonly HideState: number = 2;
  /** @internal */
  static readonly ShownState: number = 3;
  /** @internal */
  static readonly ShowingState: number = 4;
  /** @internal */
  static readonly ShowState: number = 5;
}
