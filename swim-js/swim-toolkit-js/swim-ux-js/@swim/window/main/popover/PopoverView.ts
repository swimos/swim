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

import {Mutable, Arrays} from "@swim/util";
import {AnyTiming, Timing} from "@swim/mapping";
import {AnyLength, Length, AnyR2Box, R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {
  ViewContextType,
  ViewContext,
  ViewFlags,
  View,
  ViewProperty,
  ViewAnimator,
  ModalOptions,
  ModalState,
  Modal,
  ViewFastener,
} from "@swim/view";
import {HtmlViewInit, HtmlView, HtmlViewObserver} from "@swim/dom";
import type {PopoverViewObserver} from "./PopoverViewObserver";

export type PopoverPlacement = "none" | "above" | "below" | "over" | "top" | "bottom" | "right" | "left";

export interface PopoverViewInit extends HtmlViewInit {
  source?: View;
  placement?: PopoverPlacement[];
  placementFrame?: R2Box;
  arrowWidth?: AnyLength;
  arrowHeight?: AnyLength;
}

export class PopoverView extends HtmlView implements Modal {
  constructor(node: HTMLElement) {
    super(node);
    this.sourceFrame = null;
    this.displayState = PopoverView.HiddenState;
    this.modality = false;
    this.allowedPlacement = ["top", "bottom", "right", "left"];
    this.currentPlacement = "none";
    this.onClick = this.onClick.bind(this);
    this.initArrow();
  }

  protected initArrow(): void {
    const arrow = this.createArrow();
    if (arrow !== null) {
      this.prependChildView(arrow, "arrow");
    }
  }

  protected createArrow(): HtmlView | null {
    const arrow = HtmlView.create("div");
    arrow.addClass("popover-arrow");
    arrow.display.setState("none", View.Intrinsic);
    arrow.position.setState("absolute", View.Intrinsic);
    arrow.width.setState(0, View.Intrinsic);
    arrow.height.setState(0, View.Intrinsic);
    return arrow;
  }

  override readonly viewObservers!: ReadonlyArray<PopoverViewObserver>;

  override initView(init: PopoverViewInit): void {
    super.initView(init);
    if (init.source !== void 0) {
      this.source.setView(init.source);
    }
    if (init.placement !== void 0) {
      this.placement(init.placement);
    }
    if (init.placementFrame !== void 0) {
      this.placementFrame(init.placementFrame);
    }
    if (init.arrowWidth !== void 0) {
      this.arrowWidth(init.arrowWidth);
    }
    if (init.arrowHeight !== void 0) {
      this.arrowHeight(init.arrowHeight);
    }
  }

  /** @hidden */
  readonly displayState: number;

  /** @hidden */
  setDisplayState(displayState: number): void {
    (this as Mutable<this>).displayState = displayState;
  }

  /** @hidden */
  @ViewAnimator({type: Number, state: 0})
  readonly displayPhase!: ViewAnimator<this, number>; // 0 = hidden; 1 = shown

  @ViewAnimator({type: Length, state: Length.zero()})
  readonly placementGap!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(10)})
  readonly arrowWidth!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(8)})
  readonly arrowHeight!: ViewAnimator<this, Length, AnyLength>;

  protected initSourceView(sourceView: View): void {
    // hook
  }

  protected attachSourceView(sourceView: View): void {
    // hook
  }

  protected detachSourceView(sourceView: View): void {
    // hook
  }

  protected willSetSourceView(newSourceView: View | null, oldSourceView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverWillSetSource !== void 0) {
        viewObserver.popoverWillSetSource(newSourceView, oldSourceView, this);
      }
    }
  }

  protected onSetSourceView(newSourceView: View | null, oldSourceView: View | null): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetSourceView(newSourceView: View | null, oldSourceView: View | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverDidSetSource !== void 0) {
        viewObserver.popoverDidSetSource(newSourceView, oldSourceView, this);
      }
    }
  }

  /** @hidden */
  static SourceFastener = ViewFastener.define<PopoverView, View, never, HtmlViewObserver>({
    child: false,
    observe: true,
    willSetView(newSourceView: View | null, oldSourceView: View | null, popoverView: PopoverView): void {
      this.owner.willSetSourceView(newSourceView, oldSourceView);
    },
    onSetView(newSourceView: View | null, oldSourceView: View | null, popoverView: PopoverView): void {
      if (oldSourceView !== null) {
        this.owner.detachSourceView(oldSourceView);
      }
      this.owner.onSetSourceView(newSourceView, oldSourceView);
      if (newSourceView !== null) {
        this.owner.attachSourceView(newSourceView);
        this.owner.initSourceView(newSourceView);
      }
    },
    didSetView(newSourceView: View | null, oldSourceView: View | null, popoverView: PopoverView): void {
      this.owner.didSetSourceView(newSourceView, oldSourceView);
    },
    viewDidMount(view: View): void {
      this.owner.place();
    },
    viewDidPower(view: View): void {
      this.owner.place();
    },
    viewDidResize(viewContext: ViewContext, view: View): void {
      this.owner.place();
    },
    viewDidScroll(viewContext: ViewContext, view: View): void {
      this.owner.place();
    },
    viewDidAnimate(viewContext: ViewContext, view: View): void {
      this.owner.place();
    },
    viewDidLayout(viewContext: ViewContext, view: View): void {
      this.owner.place();
    },
    viewDidProject(viewContext: ViewContext, view: View): void {
      this.owner.place();
    },
    viewDidSetAttribute(name: string, value: unknown, view: HtmlView): void {
      this.owner.place();
    },
    viewDidSetStyle(name: string, value: unknown, priority: string | undefined, view: HtmlView): void {
      this.owner.place();
    },
  });

  @ViewFastener<PopoverView, View>({
    extends: PopoverView.SourceFastener,
  })
  readonly source!: ViewFastener<this, View>;

  setSource(sourceView: View | null): void {
    this.source.setView(sourceView);
  }

  get modalView(): View | null {
    return this;
  }

  get modalState(): ModalState {
    switch (this.displayState) {
      case PopoverView.HiddenState: return "hidden";
      case PopoverView.HidingState:
      case PopoverView.HideState: return "hiding";
      case PopoverView.ShownState: return "shown";
      case PopoverView.ShowingState:
      case PopoverView.ShowState: return "showing";
      default: throw new Error("" + this.displayState);
    }
  }

  isShown(): boolean {
    switch (this.displayState) {
      case PopoverView.ShownState:
      case PopoverView.ShowingState:
      case PopoverView.ShowState: return true;
      default: return false;
    }
  }

  isHidden(): boolean {
    switch (this.displayState) {
      case PopoverView.HiddenState:
      case PopoverView.HidingState:
      case PopoverView.HideState: return true;
      default: return false;
    }
  }

  readonly modality: boolean | number;

  showModal(options: ModalOptions, timing?: AnyTiming | boolean): void {
    if (this.isHidden()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      if (options.modal !== void 0) {
        (this as Mutable<this>).modality = options.modal;
      }
      this.setDisplayState(PopoverView.ShowState);
      if (timing !== false) {
        this.displayPhase.setState(1, timing);
      } else {
        this.willShow();
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this.setDisplayState(PopoverView.ShowingState);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverWillShow !== void 0) {
        viewObserver.popoverWillShow(this);
      }
    }

    this.place();
    this.visibility.setState("visible", View.Intrinsic);
  }

  protected didShow(): void {
    this.setDisplayState(PopoverView.ShownState);

    this.pointerEvents.setState("auto", View.Intrinsic);
    this.marginTop.setState(null, View.Intrinsic);
    this.opacity.setState(void 0, View.Intrinsic);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverDidShow !== void 0) {
        viewObserver.popoverDidShow(this);
      }
    }
  }

  hideModal(timing?: AnyTiming | boolean): void {
    if (this.isShown()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.setDisplayState(PopoverView.HideState);
      if (timing !== false) {
        this.displayPhase.setState(0, timing);
      } else {
        this.willHide();
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this.setDisplayState(PopoverView.HidingState);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverWillHide !== void 0) {
        viewObserver.popoverWillHide(this);
      }
    }

    this.pointerEvents.setState("none", View.Intrinsic);
  }

  protected didHide(): void {
    this.setDisplayState(PopoverView.HiddenState);

    this.visibility.setState("hidden", View.Intrinsic);
    this.marginTop.setState(null, View.Intrinsic);
    this.opacity.setState(void 0, View.Intrinsic);

    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverDidHide !== void 0) {
        viewObserver.popoverDidHide(this);
      }
    }
  }

  /** @hidden */
  readonly allowedPlacement: PopoverPlacement[];

  placement(): ReadonlyArray<PopoverPlacement>;
  placement(placement: ReadonlyArray<PopoverPlacement>): this;
  placement(placement?: ReadonlyArray<PopoverPlacement>): ReadonlyArray<PopoverPlacement> | this {
    if (placement === void 0) {
      return this.allowedPlacement;
    } else {
      if (!Arrays.equal(this.allowedPlacement, placement)) {
        this.allowedPlacement.length = 0;
        this.allowedPlacement.push(...placement);
        this.place();
      }
      return this;
    }
  }

  /** @hidden */
  readonly currentPlacement: PopoverPlacement;

  @ViewProperty<PopoverView, R2Box | null, AnyR2Box | null>({
    type: R2Box,
    state: null,
    didSetState(placementFrame: R2Box | null): void {
      this.owner.place();
    },
    fromAny(value: AnyR2Box | null): R2Box | null {
      return value !== null ? R2Box.fromAny(value) : null;
    },
  })
  readonly placementFrame!: ViewProperty<this, R2Box | null, AnyR2Box | null>;

  @ViewProperty<PopoverView, boolean>({
    type: Boolean,
    state: false,
    didSetState(dropdown: boolean): void {
      this.owner.place();
    }
  })
  readonly dropdown!: ViewProperty<this, boolean>;

  protected override onMount(): void {
    super.onMount();
    this.attachEvents();
  }

  protected override onUnmount(): void {
    super.onUnmount();
    this.detachEvents();
  }

  protected attachEvents(): void {
    this.on("click", this.onClick);
  }

  protected detachEvents(): void {
    this.off("click", this.onClick);
  }

  protected override needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((processFlags & (View.NeedsScroll | View.NeedsAnimate)) !== 0) {
      this.requireUpdate(View.NeedsLayout);
    }
    return processFlags;
  }

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    if (this.backgroundColor.takeUpdatedValue() !== void 0) {
      this.place(true);
    }
    const displayState = this.displayState;
    if (displayState === PopoverView.ShowState) {
      this.willShow();
    } else if (displayState === PopoverView.HideState) {
      this.willHide();
    } else if (displayState === PopoverView.ShowingState && !this.displayPhase.isAnimating()) {
      this.didShow();
    } else if (displayState === PopoverView.HidingState && !this.displayPhase.isAnimating()) {
      this.didHide();
    }
    if (this.displayPhase.isAnimating() || this.displayPhase.isUpdated()) {
      this.applyDisplayPhase(this.displayPhase.takeValue());
    }
  }

  protected applyDisplayPhase(displayPhase: number): void {
    const placement = this.currentPlacement;
    if (placement === "above") {
      this.opacity.setState(void 0, View.Intrinsic);
      this.marginTop.setState((1 - displayPhase) * -this.node.clientHeight, View.Intrinsic);
    } else if (placement === "below") {
      this.opacity.setState(void 0, View.Intrinsic);
      this.marginTop.setState((1 - displayPhase) * this.node.clientHeight, View.Intrinsic);
    } else {
      this.marginTop.setState(null, View.Intrinsic);
      this.opacity.setState(displayPhase, View.Intrinsic);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.place();
  }

  /** @hidden */
  readonly sourceFrame: R2Box | null;

  place(force: boolean = false): PopoverPlacement {
    const sourceView = this.source.view;
    const oldSourceFrame = this.sourceFrame;
    const newSourceFrame = sourceView !== null ? sourceView.popoverFrame : null;
    if (newSourceFrame !== null && this.allowedPlacement.length !== 0 &&
        (force || !newSourceFrame.equals(oldSourceFrame))) {
      (this as Mutable<this>).sourceFrame = null;
      const placement = this.placePopover(sourceView!, newSourceFrame);
      const arrow = this.getChildView("arrow");
      if (arrow instanceof HtmlView) {
        this.placeArrow(sourceView!, newSourceFrame, arrow, placement);
      }
      return placement;
    } else {
      return "none";
    }
  }

  /** @hidden */
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
    const placementFrame = this.placementFrame.state;
    const placementLeft = (placementFrame !== null ? placementFrame.left : 0);
    const placementRight = (placementFrame !== null ? placementFrame.right : window.innerWidth) - parentLeft;
    const placementTop = (placementFrame !== null ? placementFrame.top : 0);
    const placementBottom = (placementFrame !== null ? placementFrame.bottom : window.innerHeight) - parentTop;

    // source bound margins relative to placement bounds
    const marginLeft = sourceLeft - placementLeft - window.pageXOffset;
    const marginRight = placementRight - sourceLeft - sourceWidth;
    const marginTop = sourceTop - placementTop - window.pageYOffset;
    const marginBottom = placementBottom - sourceTop - sourceHeight;

    const dropdown = this.dropdown.state;
    const arrowHeight = this.arrowHeight.getValue().pxValue();
    const placementGap = this.placementGap.getValue().pxValue();

    let placement: PopoverPlacement | undefined;
    const allowedPlacement = this.allowedPlacement;
    for (let i = 0, n = allowedPlacement.length; i < n; i += 1) { // first fit
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
      for (let i = 0, n = allowedPlacement.length; i < n; i += 1) { // best fit
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

    let oldWidth: Length | number | null = this.width.state;
    oldWidth = oldWidth instanceof Length ? oldWidth.pxValue() : null;
    let oldHeight: Length | number | null = this.height.state;
    oldHeight = oldHeight instanceof Length ? oldHeight.pxValue() : null;
    let width = oldWidth;
    let height = oldHeight;

    let oldMaxWidth: Length | number | null = this.maxWidth.state;
    oldMaxWidth = oldMaxWidth instanceof Length ? oldMaxWidth.pxValue() : null;
    let oldMaxHeight: Length | number | null = this.maxHeight.state;
    oldMaxHeight = oldMaxHeight instanceof Length ? oldMaxHeight.pxValue() : null;
    let maxWidth = oldMaxWidth;
    let maxHeight = oldMaxHeight;

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

    if (placement !== "none" && (left !== node.offsetLeft && this.left.takesPrecedence(View.Intrinsic)
                              || top !== node.offsetTop && this.top.takesPrecedence(View.Intrinsic)
                              || width !== oldWidth && this.width.takesPrecedence(View.Intrinsic)
                              || height !== oldHeight && this.height.takesPrecedence(View.Intrinsic)
                              || maxWidth !== oldMaxWidth && this.maxWidth.takesPrecedence(View.Intrinsic)
                              || maxHeight !== oldMaxHeight && this.maxHeight.takesPrecedence(View.Intrinsic))) {
      this.willPlacePopover(placement!);
      this.position.setState("absolute", View.Intrinsic);
      this.left.setState(left, View.Intrinsic);
      this.right.setState(right, View.Intrinsic);
      this.top.setState(top, View.Intrinsic);
      this.bottom.setState(bottom, View.Intrinsic);
      this.width.setState(width, View.Intrinsic);
      this.height.setState(height, View.Intrinsic);
      this.maxWidth.setState(maxWidth, View.Intrinsic);
      this.maxHeight.setState(maxHeight, View.Intrinsic);
      this.onPlacePopover(placement!);
      this.didPlacePopover(placement!);
    }

    (this as Mutable<this>).currentPlacement = placement;
    return placement;
  }

  protected willPlacePopover(placement: PopoverPlacement): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverWillPlace !== void 0) {
        viewObserver.popoverWillPlace(placement, this);
      }
    }
  }

  protected onPlacePopover(placement: PopoverPlacement): void {
    // hook
  }

  protected didPlacePopover(placement: PopoverPlacement): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.popoverDidPlace !== void 0) {
        viewObserver.popoverDidPlace(placement, this);
      }
    }
  }

  /** @hidden */
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

    let backgroundColor = this.backgroundColor.value;
    if (backgroundColor === null) {
      backgroundColor = Color.transparent();
    }
    const borderRadius = this.borderRadius();
    const radius = borderRadius instanceof Length ? borderRadius.pxValue() : 0;

    const arrowWidth = this.arrowWidth.getValue().pxValue();
    const arrowHeight = this.arrowHeight.getValue().pxValue();

    const arrowXMin = offsetLeft + radius + arrowWidth / 2;
    const arrowXMax = offsetRight - radius - arrowWidth / 2;
    const arrowYMin = offsetTop + radius + arrowWidth / 2;
    const arrowYMax = offsetBottom - radius - arrowWidth / 2;

    arrow.top.setState(null, View.Intrinsic);
    arrow.right.setState(null, View.Intrinsic);
    arrow.bottom.setState(null, View.Intrinsic);
    arrow.left.setState(null, View.Intrinsic);
    arrow.borderLeftWidth.setState(null, View.Intrinsic);
    arrow.borderLeftStyle.setState(void 0, View.Intrinsic);
    arrow.borderLeftColor.setState(null, View.Intrinsic);
    arrow.borderRightWidth.setState(null, View.Intrinsic);
    arrow.borderRightStyle.setState(void 0, View.Intrinsic);
    arrow.borderRightColor.setState(null, View.Intrinsic);
    arrow.borderTopWidth.setState(null, View.Intrinsic);
    arrow.borderTopStyle.setState(void 0, View.Intrinsic);
    arrow.borderTopColor.setState(null, View.Intrinsic);
    arrow.borderBottomWidth.setState(null, View.Intrinsic);
    arrow.borderBottomStyle.setState(void 0, View.Intrinsic);
    arrow.borderBottomColor.setState(null, View.Intrinsic);
    arrow.zIndex.setState(100, View.Intrinsic);

    if (placement === "none" || placement === "above" || placement === "below" || placement === "over") {
      // hide arrow
      arrow.display.setState("none", View.Intrinsic);
    } else if (Math.round(sourceY) <= Math.round(offsetTop - arrowHeight) // arrow tip below source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on top popover edge
      // top arrow
      arrow.display.setState("block", View.Intrinsic);
      arrow.top.setState(Math.round(-arrowHeight), View.Intrinsic);
      arrow.left.setState(Math.round(sourceX - offsetLeft - arrowWidth / 2), View.Intrinsic);
      arrow.borderLeftWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderLeftStyle.setState("solid", View.Intrinsic);
      arrow.borderLeftColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderRightWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderRightStyle.setState("solid", View.Intrinsic);
      arrow.borderRightColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderBottomWidth.setState(Math.round(arrowHeight), View.Intrinsic);
      arrow.borderBottomStyle.setState("solid", View.Intrinsic);
      arrow.borderBottomColor.setState(backgroundColor, View.Intrinsic);
    } else if (Math.round(offsetBottom + arrowHeight) <= Math.round(sourceY) // arrow tip above source center
        && arrowXMin <= sourceX && sourceX <= arrowXMax) { // arrow base on bottom popover edge
      // bottom arrow
      arrow.display.setState("block", View.Intrinsic);
      arrow.bottom.setState(Math.round(-arrowHeight), View.Intrinsic);
      arrow.left.setState(Math.round(sourceX - offsetLeft - arrowWidth / 2), View.Intrinsic);
      arrow.borderLeftWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderLeftStyle.setState("solid", View.Intrinsic);
      arrow.borderLeftColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderRightWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderRightStyle.setState("solid", View.Intrinsic);
      arrow.borderRightColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderTopWidth.setState(Math.round(arrowHeight), View.Intrinsic);
      arrow.borderTopStyle.setState("solid", View.Intrinsic);
      arrow.borderTopColor.setState(backgroundColor, View.Intrinsic);
    } else if (Math.round(sourceX) <= Math.round(offsetLeft - arrowHeight) // arrow tip right of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on left popover edge
      // left arrow
      arrow.display.setState("block");
      arrow.left.setState(Math.round(-arrowHeight), View.Intrinsic);
      arrow.top.setState(Math.round(sourceY - offsetTop - arrowWidth / 2), View.Intrinsic);
      arrow.borderTopWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderTopStyle.setState("solid", View.Intrinsic);
      arrow.borderTopColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderBottomWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderBottomStyle.setState("solid", View.Intrinsic);
      arrow.borderBottomColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderRightWidth.setState(Math.round(arrowHeight), View.Intrinsic);
      arrow.borderRightStyle.setState("solid", View.Intrinsic);
      arrow.borderRightColor.setState(backgroundColor, View.Intrinsic);
    } else if (Math.round(offsetRight + arrowHeight) <= Math.round(sourceX) // arrow tip left of source center
        && arrowYMin <= sourceY && sourceY <= arrowYMax) { // arrow base on right popover edge
      // right arrow
      arrow.display.setState("block", View.Intrinsic);
      arrow.right.setState(Math.round(-arrowHeight), View.Intrinsic);
      arrow.top.setState(Math.round(sourceY - offsetTop - arrowWidth / 2), View.Intrinsic);
      arrow.borderTopWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderTopStyle.setState("solid", View.Intrinsic);
      arrow.borderTopColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderBottomWidth.setState(Math.round(arrowWidth / 2), View.Intrinsic);
      arrow.borderBottomStyle.setState("solid", View.Intrinsic);
      arrow.borderBottomColor.setState(Color.transparent(), View.Intrinsic);
      arrow.borderLeftWidth.setState(Math.round(arrowHeight), View.Intrinsic);
      arrow.borderLeftStyle.setState("solid", View.Intrinsic);
      arrow.borderLeftColor.setState(backgroundColor, View.Intrinsic);
    } else {
      // no arrow
      arrow.display.setState("none", View.Intrinsic);
    }
  }

  protected onClick(event: Event): void {
    event.stopPropagation();
  }

  /** @hidden */
  static readonly HiddenState: number = 0;
  /** @hidden */
  static readonly HidingState: number = 1;
  /** @hidden */
  static readonly HideState: number = 2;
  /** @hidden */
  static readonly ShownState: number = 3;
  /** @hidden */
  static readonly ShowingState: number = 4;
  /** @hidden */
  static readonly ShowState: number = 5;
}
