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

import {Objects} from "@swim/util";
import {BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {Color} from "@swim/color";
import {Ease, Tween, AnyTransition, Transition} from "@swim/transition";
import {
  ViewContext,
  ViewFlags,
  View,
  ModalState,
  Modal,
  ViewAnimator,
  HtmlView,
  HtmlViewObserver,
} from "@swim/view";
import {PopoverViewObserver} from "./PopoverViewObserver";
import {PopoverViewController} from "./PopoverViewController";

export type PopoverPlacement = "none" | "above" | "below" | "over" | "top" | "bottom" | "right" | "left";

export class PopoverView extends HtmlView implements Modal, HtmlViewObserver {
  /** @hidden */
  _source: View | null;
  /** @hidden */
  _sourceFrame: BoxR2 | null;
  /** @hidden */
  _modalState: ModalState;
  /** @hidden */
  readonly _placement: PopoverPlacement[];
  /** @hidden */
  _placementFrame: BoxR2 | null;
  /** @hidden */
  _popoverTransition: Transition<any> | null;

  constructor(node: HTMLElement = document.createElement("div")) {
    super(node);
    this.arrowWidth.setState(Length.fromAny(10));
    this.arrowHeight.setState(Length.fromAny(8));
    this._source = null;
    this._sourceFrame = null;
    this._modalState = "shown";
    this._placement = ["top", "bottom", "right", "left"];
    this._placementFrame = null;
    this._popoverTransition = Transition.duration(250, Ease.cubicOut);
    this.backgroundColor.didUpdate = this.didUpdateBackgroundColor.bind(this);

    const arrow = this.createArrow();
    if (arrow !== null) {
      const arrowView = View.fromNode(arrow);
      this.prependChildView(arrowView, "arrow");
    }
  }

  protected createArrow(): HTMLElement | null {
    const arrow = document.createElement("div");
    arrow.setAttribute("class", "popover-arrow");
    arrow.style.setProperty("display", "none");
    arrow.style.setProperty("position", "absolute");
    arrow.style.setProperty("width", "0");
    arrow.style.setProperty("height", "0");
    return arrow;
  }

  get viewController(): PopoverViewController | null {
    return this._viewController;
  }

  @ViewAnimator(Length)
  arrowWidth: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length)
  arrowHeight: ViewAnimator<this, Length, AnyLength>;

  get source(): View | null {
    return this._source;
  }

  setSource(source: View | null): void {
    if (this._source !== source) {
      this.willSetSource(source);
      if (this._source !== null && this.isMounted()) {
        this._source.removeViewObserver(this);
      }
      this._source = source;
      this.onSetSource(source);
      if (this._source !== null && this.isMounted()) {
        this._source.addViewObserver(this);
      }
      this.didSetSource(source);
    }
  }

  protected willSetSource(source: View | null): void {
    this.willObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverWillSetSource !== void 0) {
        viewObserver.popoverWillSetSource(source, this);
      }
    });
  }

  protected onSetSource(source: View | null): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetSource(source: View | null): void {
    this.didObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverDidSetSource !== void 0) {
        viewObserver.popoverDidSetSource(source, this);
      }
    });
  }

  get modalState(): ModalState {
    return this._modalState;
  }

  get modalView(): View | null {
    return this;
  }

  toggleModal(tween?: Tween<any>): void {
    if (this._modalState === "hidden" || this._modalState === "hiding") {
      this.showModal(tween);
    } else if (this._modalState === "shown" || this._modalState === "showing") {
      this.hideModal(tween);
    }
  }

  showModal(tween?: Tween<any>): void {
    if (this._modalState === "hidden" || this._modalState === "hiding") {
      if (tween === void 0 || tween === true) {
        tween = this._popoverTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willShow();
      const placement = this.place();
      if (tween !== null) {
        tween = tween.onEnd(this.didShow.bind(this));
        if (placement === "above") {
          this.opacity.setState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop(-this._node.clientHeight);
          }
          this.marginTop(0, tween);
        } else if (placement === "below") {
          this.opacity.setState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop(this._node.clientHeight);
          }
          this.marginTop(0, tween);
        } else {
          this.marginTop.setState(void 0);
          if (this.opacity.value === void 0) {
            this.opacity(0);
          }
          this.opacity(1, tween);
        }
      } else {
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.willObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverWillShow !== void 0) {
        viewObserver.popoverWillShow(this);
      }
    });
    this.visibility("visible");
    this._modalState = "showing";
  }

  protected didShow(): void {
    this._modalState = "shown";
    this.pointerEvents("auto");
    this.marginTop.setState(void 0);
    this.opacity.setState(void 0);
    this.didObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverDidShow !== void 0) {
        viewObserver.popoverDidShow(this);
      }
    });
  }

  hideModal(tween?: Tween<any>): void {
    if (this._modalState === "shown" || this._modalState === "showing") {
      if (tween === void 0 || tween === true) {
        tween = this._popoverTransition;
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      const placement = this.place();
      if (tween !== null) {
        tween = tween.onEnd(this.didHide.bind(this));
        if (placement === "above") {
          this.opacity.setState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop(0);
          }
          this.marginTop(-this._node.clientHeight, tween);
        } else if (placement === "below") {
          this.opacity.setState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop(0);
          }
          this.marginTop(this._node.clientHeight, tween);
        } else {
          this.marginTop.setState(void 0);
          if (this.opacity.value === void 0) {
            this.opacity(1);
          }
          this.opacity(0, tween);
        }
      } else {
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.willObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverWillHide !== void 0) {
        viewObserver.popoverWillHide(this);
      }
    });
    this.pointerEvents("none");
    this._modalState = "hiding";
  }

  protected didHide(): void {
    this._modalState = "hidden";
    this.visibility("hidden");
    this.marginTop.setState(void 0);
    this.opacity.setState(void 0);
    this.didObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverDidHide !== void 0) {
        viewObserver.popoverDidHide(this);
      }
    });
  }

  placement(): ReadonlyArray<PopoverPlacement>;
  placement(placement: ReadonlyArray<PopoverPlacement>): this;
  placement(placement?: ReadonlyArray<PopoverPlacement>): ReadonlyArray<PopoverPlacement> | this {
    if (placement === void 0) {
      return this._placement;
    } else {
      if (!Objects.equalArray(this._placement, placement)) {
        this._placement.length = 0;
        for (let i = 0, n = placement.length; i < n; i += 1) {
          this._placement.push(placement[i]);
        }
        this.place();
      }
      return this;
    }
  }

  placementFrame(): BoxR2 | null;
  placementFrame(placementFrame: BoxR2 | null): this;
  placementFrame(placementFrame?: BoxR2 | null): BoxR2 | null | this {
    if (placementFrame === void 0) {
      return this._placementFrame;
    } else {
      if (!Objects.equal(this._placementFrame, placementFrame)) {
        this._placementFrame = placementFrame;
        this.place();
      }
      return this;
    }
  }

  popoverTransition(): Transition<any> | null;
  popoverTransition(popoverTransition: AnyTransition<any> | null): this;
  popoverTransition(popoverTransition?: AnyTransition<any> | null): Transition<any> | null | this {
    if (popoverTransition === void 0) {
      return this._popoverTransition;
    } else {
      if (popoverTransition !== null) {
        popoverTransition = Transition.fromAny(popoverTransition);
      }
      return this;
    }
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & (View.NeedsScroll | View.NeedsAnimate)) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected didMount(): void {
    if (this._source !== null) {
      this._source.addViewObserver(this);
    }
    super.didMount();
  }

  protected willUnmount(): void {
    super.willUnmount();
    if (this._source !== null) {
      this._source.removeViewObserver(this);
    }
  }

  protected onLayout(viewContext: ViewContext): void {
    super.onLayout(viewContext);
    this.place();
  }

  place(force: boolean = true): PopoverPlacement {
    const source = this._source;
    const oldSourceFrame = this._sourceFrame;
    const newSourceFrame = source !== null ? source.popoverFrame : null;
    if (newSourceFrame !== null && this._placement.length !== 0 &&
        (force || !newSourceFrame.equals(oldSourceFrame))) {
      const placement = this.placePopover(source!, newSourceFrame);
      const arrow = this.getChildView("arrow");
      if (arrow instanceof HtmlView) {
        this.placeArrow(source!, newSourceFrame, arrow, placement);
      }
      return placement;
    } else {
      return "none";
    }
  }

  /** @hidden */
  protected placePopover(source: View, sourceFrame: BoxR2): PopoverPlacement {
    const node = this._node;
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
    const sourceX = sourceLeft + sourceWidth/2;
    const sourceY = sourceTop + sourceHeight/2;

    // placement frame in offsetParent coordinates (transformed from client coordinates)
    const placementFrame = this._placementFrame;
    const placementLeft = (placementFrame !== null ? placementFrame.left : 0);
    const placementRight = (placementFrame !== null ? placementFrame.right : window.innerWidth) - parentLeft;
    const placementTop = (placementFrame !== null ? placementFrame.top : 0);
    const placementBottom = (placementFrame !== null ? placementFrame.bottom : window.innerHeight) - parentTop;

    // source bound margins relative to placement bounds
    const marginLeft = sourceLeft - placementLeft - window.pageXOffset;
    const marginRight = placementRight - sourceLeft - sourceWidth;
    const marginTop = sourceTop - placementTop - window.pageYOffset;
    const marginBottom = placementBottom - sourceTop - sourceHeight;

    const arrowHeight = this.arrowHeight.value!.pxValue();

    let placement: PopoverPlacement | undefined;
    for (let i = 0; i < this._placement.length; i += 1) { // first fit
      const p = this._placement[i];
      if (p === "above" || p === "below" || p === "over") {
        placement = p;
        break;
      } else if (p === "top" && popoverHeight + arrowHeight <= marginTop) {
        placement = p;
        break;
      } else if (p === "bottom" && popoverHeight + arrowHeight <= marginBottom) {
        placement = p;
        break;
      } else if (p === "left" && popoverWidth + arrowHeight <= marginLeft) {
        placement = p;
        break;
      } else if (p === "right" && popoverWidth + arrowHeight <= marginRight) {
        placement = p;
        break;
      }
    }
    if (placement === void 0) {
      placement = "none";
      for (let i = 0, n = this._placement.length; i < n; i += 1) { // best fit
        const p = this._placement[i];
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

    const maxWidthStyle = node.style.getPropertyValue("max-width");
    const maxHeightStyle = node.style.getPropertyValue("max-height");
    const oldMaxWidth = maxWidthStyle ? Length.fromAny(maxWidthStyle).pxValue() : 0;
    const oldMaxHeight = maxHeightStyle ? Length.fromAny(maxHeightStyle).pxValue() : 0;
    let maxWidth = oldMaxWidth;
    let maxHeight = oldMaxHeight;
    let left = node.offsetLeft;
    let top = node.offsetTop;
    let right: number | undefined;
    let bottom: number | undefined;
    if (placement === "above") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round((placementFrame !== null ? placementFrame.width : window.innerWidth) - placementRight);
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "below") {
      left = Math.round(placementLeft);
      top = Math.round(placementBottom - popoverHeight);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "over") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      bottom = Math.round(placementBottom - (placementFrame !== null ? placementFrame.height : window.innerHeight));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "top") {
      if (sourceX - popoverWidth / 2 <= placementLeft) {
        left = Math.round(placementLeft);
      } else if (sourceX + popoverWidth / 2 >= placementRight) {
        left = Math.round(placementRight - popoverWidth);
      } else {
        left = Math.round(sourceX - popoverWidth / 2);
      }
      top = Math.round(Math.max(placementTop, sourceTop - (popoverHeight + arrowHeight)));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, sourceBottom - placementTop));
    } else if (placement === "bottom") {
      if (sourceX - popoverWidth / 2 <= placementLeft) {
        left = Math.round(placementLeft);
      } else if (sourceX + popoverWidth / 2 >= placementRight) {
        left = Math.round(placementRight - popoverWidth);
      } else {
        left = Math.round(sourceX - popoverWidth / 2);
      }
      top = Math.round(Math.max(placementTop, sourceBottom + arrowHeight));
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - sourceTop));
    } else if (placement === "left") {
      left = Math.round(Math.max(placementLeft, sourceLeft - (popoverWidth + arrowHeight)));
      if (sourceY - popoverHeight / 2 <= placementTop) {
        top = Math.round(placementTop);
      } else if (sourceY + popoverHeight / 2 >= placementBottom) {
        top = Math.round(placementBottom - popoverHeight);
      } else {
        top = Math.round(sourceY - popoverHeight / 2);
      }
      maxWidth = Math.round(Math.max(0, sourceRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "right") {
      left = Math.round(Math.max(placementLeft, sourceRight + arrowHeight));
      if (sourceY - popoverHeight / 2 <= placementTop) {
        top = Math.round(placementTop);
      } else if (sourceY + popoverHeight / 2 >= placementBottom) {
        top = Math.round(placementBottom - popoverHeight);
      } else {
        top = Math.round(sourceY - popoverHeight / 2);
      }
      maxWidth = Math.round(Math.max(0, placementRight - sourceLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    }

    if (placement !== "none" && (left !== node.offsetLeft || top !== node.offsetTop
                             ||  maxWidth !== oldMaxWidth || maxHeight !== oldMaxHeight)) {
      this.willPlacePopover(placement!);
      node.style.setProperty("position", "absolute");
      node.style.setProperty("left", left + "px");
      if (right !== void 0) {
        node.style.setProperty("right", right + "px");
      } else {
        node.style.removeProperty("right");
      }
      node.style.setProperty("top", top + "px");
      if (bottom !== void 0) {
        node.style.setProperty("bottom", bottom + "px");
      } else {
        node.style.removeProperty("bottom");
      }
      node.style.setProperty("max-width", maxWidth + "px");
      node.style.setProperty("max-height", maxHeight + "px");
      this.onPlacePopover(placement!);
      this.didPlacePopover(placement!);
    }

    return placement;
  }

  protected willPlacePopover(placement: PopoverPlacement): void {
    this.willObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverWillPlace !== void 0) {
        viewObserver.popoverWillPlace(placement, this);
      }
    });
  }

  protected onPlacePopover(placement: PopoverPlacement): void {
    // hook
  }

  protected didPlacePopover(placement: PopoverPlacement): void {
    this.didObserve(function (viewObserver: PopoverViewObserver): void {
      if (viewObserver.popoverDidPlace !== void 0) {
        viewObserver.popoverDidPlace(placement, this);
      }
    });
  }

  /** @hidden */
  protected placeArrow(source: View, sourceFrame: BoxR2, arrow: HtmlView,
                       placement: PopoverPlacement): void {
    const node = this._node;
    const parent = node.offsetParent;
    if (parent === null) {
      return;
    }
    const arrowNode = arrow._node;

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

    let backgroundColor = this.backgroundColor.value;
    if (backgroundColor === void 0) {
      backgroundColor = Color.transparent();
    }
    const borderRadius = this.borderRadius();
    const radius = borderRadius instanceof Length ? borderRadius.pxValue() : 0;

    const arrowWidth = this.arrowWidth.value!.pxValue();
    const arrowHeight = this.arrowHeight.value!.pxValue();

    const arrowXMin = offsetLeft + radius + arrowWidth / 2;
    const arrowXMax = offsetRight - radius - arrowWidth / 2;
    const arrowYMin = offsetTop + radius + arrowWidth / 2;
    const arrowYMax = offsetBottom - radius - arrowWidth / 2;

    arrowNode.style.removeProperty("top");
    arrowNode.style.removeProperty("right");
    arrowNode.style.removeProperty("bottom");
    arrowNode.style.removeProperty("left");
    arrowNode.style.removeProperty("border-left-width");
    arrowNode.style.removeProperty("border-left-style");
    arrowNode.style.removeProperty("border-left-color");
    arrowNode.style.removeProperty("border-right-width");
    arrowNode.style.removeProperty("border-right-style");
    arrowNode.style.removeProperty("border-right-color");
    arrowNode.style.removeProperty("border-top-width");
    arrowNode.style.removeProperty("border-top-style");
    arrowNode.style.removeProperty("border-top-color");
    arrowNode.style.removeProperty("border-bottom-width");
    arrowNode.style.removeProperty("border-bottom-style");
    arrowNode.style.removeProperty("border-bottom-color");
    arrowNode.style.setProperty("z-index", "100");

    if (placement === "none" || placement === "above" || placement === "below" || placement === "over") {
      // hide arrow
      arrowNode.style.setProperty("display", "none");
    } else if (Math.round(sourceY) <= Math.round(offsetTop - arrowHeight) // arrow tip below source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on top popover edge
      // top arrow
      arrowNode.style.setProperty("display", "block");
      arrowNode.style.setProperty("top", Math.round(-arrowHeight) + "px");
      arrowNode.style.setProperty("left", Math.round(sourceX - offsetLeft - arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-left-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-left-style", "solid");
      arrowNode.style.setProperty("border-left-color", "transparent");
      arrowNode.style.setProperty("border-right-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-right-style", "solid");
      arrowNode.style.setProperty("border-right-color", "transparent");
      arrowNode.style.setProperty("border-bottom-width", Math.round(arrowHeight) + "px");
      arrowNode.style.setProperty("border-bottom-style", "solid");
      arrowNode.style.setProperty("border-bottom-color", backgroundColor.toString());
    } else if (Math.round(offsetBottom + arrowHeight) <= Math.round(sourceY) // arrow tip above source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on bottom popover edge
      // bottom arrow
      arrowNode.style.setProperty("display", "block");
      arrowNode.style.setProperty("bottom", Math.round(-arrowHeight) + "px");
      arrowNode.style.setProperty("left", Math.round(sourceX - offsetLeft - arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-left-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-left-style", "solid");
      arrowNode.style.setProperty("border-left-color", "transparent");
      arrowNode.style.setProperty("border-right-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-right-style", "solid");
      arrowNode.style.setProperty("border-right-color", "transparent");
      arrowNode.style.setProperty("border-top-width", Math.round(arrowHeight) + "px");
      arrowNode.style.setProperty("border-top-style", "solid");
      arrowNode.style.setProperty("border-top-color", backgroundColor.toString());
    } else if (Math.round(sourceX) <= Math.round(offsetLeft - arrowHeight) // arrow tip right of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on left popover edge
      // left arrow
      arrowNode.style.setProperty("display", "block");
      arrowNode.style.setProperty("left", Math.round(-arrowHeight) + "px");
      arrowNode.style.setProperty("top", Math.round(sourceY - offsetTop - arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-top-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-top-style", "solid");
      arrowNode.style.setProperty("border-top-color", "transparent");
      arrowNode.style.setProperty("border-bottom-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-bottom-style", "solid");
      arrowNode.style.setProperty("border-bottom-color", "transparent");
      arrowNode.style.setProperty("border-right-width", Math.round(arrowHeight) + "px");
      arrowNode.style.setProperty("border-right-style", "solid");
      arrowNode.style.setProperty("border-right-color", backgroundColor.toString());
    } else if (Math.round(offsetRight + arrowHeight) <= Math.round(sourceX) // arrow tip left of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on right popover edge
      // right arrow
      arrowNode.style.setProperty("display", "block");
      arrowNode.style.setProperty("right", Math.round(-arrowHeight) + "px");
      arrowNode.style.setProperty("top", Math.round(sourceY - offsetTop - arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-top-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-top-style", "solid");
      arrowNode.style.setProperty("border-top-color", "transparent");
      arrowNode.style.setProperty("border-bottom-width", Math.round(arrowWidth / 2) + "px");
      arrowNode.style.setProperty("border-bottom-style", "solid");
      arrowNode.style.setProperty("border-bottom-color", "transparent");
      arrowNode.style.setProperty("border-left-width", Math.round(arrowHeight) + "px");
      arrowNode.style.setProperty("border-left-style", "solid");
      arrowNode.style.setProperty("border-left-color", backgroundColor.toString());
    } else {
      // no arrow
      arrowNode.style.setProperty("display", "none");
    }
  }

  protected didUpdateBackgroundColor(backgroundColor: Color | undefined): void {
    this.place(true);
  }

  viewDidMount(view: View): void {
    this.place();
  }

  viewDidPower(view: View): void {
    this.place();
  }

  viewDidResize(viewContext: ViewContext, view: View): void {
    this.place();
  }

  viewDidScroll(viewContext: ViewContext, view: View): void {
    this.place();
  }

  viewDidAnimate(viewContext: ViewContext, view: View): void {
    this.place();
  }

  viewDidLayout(viewContext: ViewContext, view: View): void {
    this.place();
  }

  viewDidProject(viewContext: ViewContext, view: View): void {
    this.place();
  }

  viewDidSetAttribute(name: string, value: unknown, view: HtmlView): void {
    this.place();
  }

  viewDidSetStyle(name: string, value: unknown, priority: string | undefined, view: HtmlView): void {
    this.place();
  }
}
