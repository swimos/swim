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
import {Tween, Transition} from "@swim/transition";
import {ViewContextType, ViewContext, ViewFlags, View, ViewAnimator} from "@swim/view";
import {HtmlView, HtmlViewObserver} from "@swim/dom";
import {Look, ThemedHtmlViewInit, ThemedHtmlView} from "@swim/theme";
import {ModalOptions, ModalState, Modal} from "../Modal";
import {DropdownViewObserver} from "./DropdownViewObserver";
import {DropdownViewController} from "./DropdownViewController";

export type DropdownPlacement = "none" | "above" | "below" | "over" | "top" | "bottom" | "right" | "left";

export interface DropdownViewInit extends ThemedHtmlViewInit {
  viewController?: DropdownViewController;
  source?: View;
  placement?: DropdownPlacement[];
  placementFrame?: BoxR2;
  placementGap?: AnyLength;
}

export class DropdownView extends ThemedHtmlView implements Modal, HtmlViewObserver {
  /** @hidden */
  _source: View | null;
  /** @hidden */
  _sourceFrame: BoxR2 | null;
  /** @hidden */
  _modalState: ModalState;
  /** @hidden */
  _modality: boolean | number;
  /** @hidden */
  readonly _placement: DropdownPlacement[];
  /** @hidden */
  _placementFrame: BoxR2 | null;

  constructor(node: HTMLElement) {
    super(node);
    this.onClick = this.onClick.bind(this);
    this._source = null;
    this._sourceFrame = null;
    this._modalState = "shown";
    this._modality = false;
    this._placement = ["bottom"];
    this._placementFrame = null;
  }

  // @ts-ignore
  declare readonly viewController: DropdownViewController | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<DropdownViewObserver>;

  initView(init: DropdownViewInit): void {
    super.initView(init);
    if (init.source !== void 0) {
      this.setSource(init.source);
    }
    if (init.placement !== void 0) {
      this.placement(init.placement);
    }
    if (init.placementFrame !== void 0) {
      this.placementFrame(init.placementFrame);
    }
    if (init.placementGap !== void 0) {
      this.placementGap(init.placementGap);
    }
  }

  @ViewAnimator({type: Length, state: Length.zero()})
  placementGap: ViewAnimator<this, Length, AnyLength>;

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
    this.willObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownWillSetSource !== void 0) {
        viewObserver.dropdownWillSetSource(source, this);
      }
    });
  }

  protected onSetSource(source: View | null): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetSource(source: View | null): void {
    this.didObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownDidSetSource !== void 0) {
        viewObserver.dropdownDidSetSource(source, this);
      }
    });
  }

  get modalView(): View | null {
    return this;
  }

  get modalState(): ModalState {
    return this._modalState;
  }

  get modality(): boolean | number {
    return this._modality;
  }

  showModal(options: ModalOptions, tween?: Tween<any>): void {
    if (this._modalState === "hidden" || this._modalState === "hiding") {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      if (options.modal !== void 0) {
        this._modality = options.modal;
      }
      this.willShow();
      const placement = this.place();
      if (tween !== null) {
        tween = tween.onEnd(this.didShow.bind(this));
        if (placement === "above") {
          this.opacity.setAutoState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop.setAutoState(-this._node.clientHeight);
          }
          this.marginTop.setAutoState(0, tween);
        } else if (placement === "below") {
          this.opacity.setAutoState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop.setAutoState(this._node.clientHeight);
          }
          this.marginTop.setAutoState(0, tween);
        } else {
          this.marginTop.setAutoState(void 0);
          if (this.opacity.value === void 0) {
            this.opacity.setAutoState(0);
          }
          this.opacity.setAutoState(1, tween);
        }
      } else {
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.willObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownWillShow !== void 0) {
        viewObserver.dropdownWillShow(this);
      }
    });
    this.visibility.setAutoState("visible");
    this._modalState = "showing";
  }

  protected didShow(): void {
    this._modalState = "shown";
    this.pointerEvents.setAutoState("auto");
    this.marginTop.setAutoState(void 0);
    this.opacity.setAutoState(void 0);
    this.didObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownDidShow !== void 0) {
        viewObserver.dropdownDidShow(this);
      }
    });
  }

  hideModal(tween?: Tween<any>): void {
    if (this._modalState === "shown" || this._modalState === "showing") {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      const placement = this.place();
      if (tween !== null) {
        tween = tween.onEnd(this.didHide.bind(this));
        if (placement === "above") {
          this.opacity.setAutoState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop.setAutoState(0);
          }
          this.marginTop.setAutoState(-this._node.clientHeight, tween);
        } else if (placement === "below") {
          this.opacity.setAutoState(void 0);
          if (this.marginTop.value === void 0) {
            this.marginTop.setAutoState(0);
          }
          this.marginTop.setAutoState(this._node.clientHeight, tween);
        } else {
          this.marginTop.setAutoState(void 0);
          if (this.opacity.value === void 0) {
            this.opacity.setAutoState(1);
          }
          this.opacity.setAutoState(0, tween);
        }
      } else {
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.willObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownWillHide !== void 0) {
        viewObserver.dropdownWillHide(this);
      }
    });
    this.pointerEvents.setAutoState("none");
    this._modalState = "hiding";
  }

  protected didHide(): void {
    this._modalState = "hidden";
    this.visibility.setAutoState("hidden");
    this.marginTop.setAutoState(void 0);
    this.opacity.setAutoState(void 0);
    this.didObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownDidHide !== void 0) {
        viewObserver.dropdownDidHide(this);
      }
    });
  }

  placement(): ReadonlyArray<DropdownPlacement>;
  placement(placement: ReadonlyArray<DropdownPlacement>): this;
  placement(placement?: ReadonlyArray<DropdownPlacement>): ReadonlyArray<DropdownPlacement> | this {
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

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & (View.NeedsScroll | View.NeedsAnimate)) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onMount(): void {
    super.onMount();
    this.attachEvents();
    if (this._source !== null) {
      this._source.addViewObserver(this);
    }
  }

  protected onUnmount(): void {
    super.onUnmount();
    this.detachEvents();
    if (this._source !== null) {
      this._source.removeViewObserver(this);
    }
  }

  protected attachEvents(): void {
    this.on("click", this.onClick);
  }

  protected detachEvents(): void {
    this.off("click", this.onClick);
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.place();
  }

  place(force: boolean = true): DropdownPlacement {
    const source = this._source;
    const oldSourceFrame = this._sourceFrame;
    const newSourceFrame = source !== null ? source.popoverFrame : null;
    if (newSourceFrame !== null && this._placement.length !== 0 &&
        (force || !newSourceFrame.equals(oldSourceFrame))) {
      return this.placeDropdown(source!, newSourceFrame);
    } else {
      return "none";
    }
  }

  /** @hidden */
  protected placeDropdown(source: View, sourceFrame: BoxR2): DropdownPlacement {
    const node = this._node;
    const parent = node.offsetParent;
    if (parent === null) {
      return "none";
    }
    const dropdownWidth = node.clientWidth;
    const dropdownHeight = node.clientHeight;

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

    const placementGap = this.placementGap.getValue().pxValue();

    let placement: DropdownPlacement | undefined;
    for (let i = 0; i < this._placement.length; i += 1) { // first fit
      const p = this._placement[i];
      if (p === "above" || p === "below" || p === "over") {
        placement = p;
        break;
      } else if (p === "top" && dropdownHeight + placementGap <= marginTop) {
        placement = p;
        break;
      } else if (p === "bottom" && dropdownHeight + placementGap <= marginBottom) {
        placement = p;
        break;
      } else if (p === "left" && dropdownWidth + placementGap <= marginLeft) {
        placement = p;
        break;
      } else if (p === "right" && dropdownWidth + placementGap <= marginRight) {
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

    let left = node.offsetLeft;
    let top = node.offsetTop;
    let right: number | undefined;
    let bottom: number | undefined;

    let oldWidth: Length | string | number | undefined = this.width.state;
    oldWidth = oldWidth instanceof Length ? oldWidth.pxValue() : void 0;
    let oldHeight: Length | string | number | undefined = this.height.state;
    oldHeight = oldHeight instanceof Length ? oldHeight.pxValue() : void 0;
    let width = oldWidth;
    let height = oldHeight;

    let oldMaxWidth: Length | string | number | undefined = this.maxWidth.state;
    oldMaxWidth = oldMaxWidth instanceof Length ? oldMaxWidth.pxValue() : void 0;
    let oldMaxHeight: Length | string | number | undefined = this.maxHeight.state;
    oldMaxHeight = oldMaxHeight instanceof Length ? oldMaxHeight.pxValue() : void 0;
    let maxWidth = oldMaxWidth;
    let maxHeight = oldMaxHeight;

    if (placement === "above") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round((placementFrame !== null ? placementFrame.width : window.innerWidth) - placementRight);
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = void 0;
      maxWidth = void 0;
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "below") {
      left = Math.round(placementLeft);
      top = Math.round(placementBottom - dropdownHeight);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = void 0;
      maxWidth = void 0;
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "over") {
      left = Math.round(placementLeft);
      top = Math.round(placementTop);
      right = Math.round(placementRight - (placementFrame !== null ? placementFrame.width : window.innerWidth));
      bottom = Math.round(placementBottom - (placementFrame !== null ? placementFrame.height : window.innerHeight));
      width = Math.round(Math.max(0, placementRight - placementLeft));
      height = Math.round(Math.max(0, placementBottom - placementTop));
      maxWidth = void 0;
      maxHeight = void 0;
    } else if (placement === "top") {
      left = Math.max(placementLeft, sourceLeft);
      top = Math.round(Math.max(placementTop, sourceTop - (dropdownHeight + placementGap)));
      width = Math.round(Math.max(0, Math.min(sourceWidth, placementRight - sourceLeft)));
      height = void 0;
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, sourceBottom - placementTop));
    } else if (placement === "bottom") {
      left = Math.max(placementLeft, sourceLeft);
      top = Math.round(Math.max(placementTop, sourceBottom + placementGap));
      width = Math.round(Math.max(0, Math.min(sourceWidth, placementRight - sourceLeft)));
      height = void 0;
      maxWidth = Math.round(Math.max(0, placementRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - sourceTop));
    } else if (placement === "left") {
      left = Math.round(Math.max(placementLeft, sourceLeft - (dropdownWidth + placementGap)));
      top = Math.max(placementTop, sourceTop);
      width = void 0;
      height = Math.round(Math.max(0, Math.min(sourceHeight, placementBottom - sourceTop)));
      maxWidth = Math.round(Math.max(0, sourceRight - placementLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    } else if (placement === "right") {
      left = Math.round(Math.max(placementLeft, sourceRight + placementGap));
      top = Math.max(placementTop, sourceTop);
      width = void 0;
      height = Math.round(Math.max(0, Math.min(sourceHeight, placementBottom - sourceTop)));
      maxWidth = Math.round(Math.max(0, placementRight - sourceLeft));
      maxHeight = Math.round(Math.max(0, placementBottom - placementTop));
    }

    if (placement !== "none" && (left !== node.offsetLeft && this.left.isAuto() ||
                                 top !== node.offsetTop && this.top.isAuto() ||
                                 width !== oldWidth && this.width.isAuto() ||
                                 height !== oldHeight && this.height.isAuto() ||
                                 maxWidth !== oldMaxWidth && this.maxWidth.isAuto() ||
                                 maxHeight !== oldMaxHeight && this.maxHeight.isAuto())) {
      this.willPlaceDropdown(placement!);
      this.position.setAutoState("absolute");
      this.left.setAutoState(left);
      this.right.setAutoState(right);
      this.top.setAutoState(top);
      this.bottom.setAutoState(bottom);
      this.width.setAutoState(width);
      this.height.setAutoState(height);
      this.maxWidth.setAutoState(maxWidth);
      this.maxHeight.setAutoState(maxHeight);
      this.onPlaceDropdown(placement!);
      this.didPlaceDropdown(placement!);
    }

    return placement;
  }

  protected willPlaceDropdown(placement: DropdownPlacement): void {
    this.willObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownWillPlace !== void 0) {
        viewObserver.dropdownWillPlace(placement, this);
      }
    });
  }

  protected onPlaceDropdown(placement: DropdownPlacement): void {
    // hook
  }

  protected didPlaceDropdown(placement: DropdownPlacement): void {
    this.didObserve(function (viewObserver: DropdownViewObserver): void {
      if (viewObserver.dropdownDidPlace !== void 0) {
        viewObserver.dropdownDidPlace(placement, this);
      }
    });
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

  protected onClick(event: Event): void {
    event.stopPropagation();
  }
}
