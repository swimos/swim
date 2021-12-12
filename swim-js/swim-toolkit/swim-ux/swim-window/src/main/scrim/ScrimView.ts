// Copyright 2015-2021 Swim.inc
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

import {Mutable, AnyTiming, Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import type {ModalService, ModalServiceObserver} from "@swim/view";
import {StyleAnimator, HtmlView} from "@swim/dom";

/** @public */
export class ScrimView extends HtmlView implements ModalServiceObserver {
  constructor(node: HTMLElement) {
    super(node);
    this.displayState = ScrimView.HiddenState;
    this.onClick = this.onClick.bind(this);
    if (typeof PointerEvent !== "undefined") {
      this.onSyntheticClick = this.onSyntheticClick.bind(this);
      this.on("pointerup", this.onClick);
      this.on("click", this.onSyntheticClick);
    } else if (typeof TouchEvent !== "undefined") {
      this.onSyntheticClick = this.onSyntheticClick.bind(this);
      this.on("touchend", this.onClick);
      this.on("click", this.onSyntheticClick);
    } else {
      this.on("click", this.onClick);
    }
    this.initScrim();
  }

  protected initScrim(): void {
    this.addClass("scrim");
    this.display.setState("none", Affinity.Intrinsic);
    this.position.setState("absolute", Affinity.Intrinsic);
    this.top.setState(0, Affinity.Intrinsic);
    this.right.setState(0, Affinity.Intrinsic);
    this.bottom.setState(0, Affinity.Intrinsic);
    this.left.setState(0, Affinity.Intrinsic);
    this.pointerEvents.setState("auto", Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);
    this.backgroundColor.setState(Color.black(0), Affinity.Intrinsic);
  }

  /** @internal */
  readonly displayState: number;

  /** @internal */
  setDisplayState(displayState: number): void {
    (this as Mutable<this>).displayState = displayState;
  }

  @StyleAnimator<ScrimView, Color | null, AnyColor | null>({
    propertyNames: "background-color",
    type: Color,
    value: null,
    willTransition(): void {
      const displayState = this.owner.displayState;
      if (displayState === ScrimView.ShowState) {
        this.owner.willShowScrim();
      } else if (displayState === ScrimView.HideState) {
        this.owner.willHideScrim();
      }
    },
    didTransition(): void {
      const displayState = this.owner.displayState;
      if (displayState === ScrimView.ShowingState) {
        this.owner.didShowScrim();
      } else if (displayState === ScrimView.HidingState) {
        this.owner.didHideScrim();
      }
    },
  })
  override readonly backgroundColor!: StyleAnimator<this, Color | null, AnyColor | null>;

  isShown(): boolean {  
    switch (this.displayState) {
      case ScrimView.ShownState:
      case ScrimView.ShowingState:
      case ScrimView.ShowState: return true;
      default: return false;
    }
  }

  isHidden(): boolean {
    switch (this.displayState) {
      case ScrimView.HiddenState:
      case ScrimView.HidingState:
      case ScrimView.HideState: return true;
      default: return false;
    }
  }

  show(opacity: number, timing?: AnyTiming | boolean): void {
    if (this.isHidden()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.setDisplayState(ScrimView.ShowState);
      if (timing !== false) {
        this.backgroundColor.setState(Color.black(0), Affinity.Intrinsic);
        this.backgroundColor.setState(Color.black(opacity), timing, Affinity.Intrinsic);
      } else {
        this.willShowScrim();
        this.backgroundColor.setState(Color.black(opacity), Affinity.Intrinsic);
        this.didShowScrim();
      }
    }
  }

  protected willShowScrim(): void {
    this.setDisplayState(ScrimView.ShowingState);

    this.display.setState("block", Affinity.Intrinsic);
  }

  protected didShowScrim(): void {
    this.setDisplayState(ScrimView.ShownState);
  }

  hide(timing?: AnyTiming | boolean): void {
    if (this.isShown()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromAny(timing);
      }
      this.setDisplayState(ScrimView.HideState);
      if (timing !== false) {
        this.backgroundColor.setState(Color.black(0), timing, Affinity.Intrinsic);
      } else {
        this.willHideScrim();
        this.backgroundColor.setState(Color.black(0), Affinity.Intrinsic);
        this.didHideScrim();
      }
    }
  }

  protected willHideScrim(): void {
    this.setDisplayState(ScrimView.HidingState);
  }

  protected didHideScrim(): void {
    this.setDisplayState(ScrimView.HiddenState);

    this.display.setState("none", Affinity.Intrinsic);
  }

  protected override onMount(): void {
    super.onMount();
    const modalService = this.modalProvider.service;
    if (modalService !== void 0 && modalService !== null) {
      modalService.observe(this);
      this.serviceDidUpdateModality(modalService.modality, 0, modalService);
    }
  }

  protected override onUnmount(): void {
    const modalService = this.modalProvider.service;
    if (modalService !== void 0 && modalService !== null) {
      modalService.unobserve(this);
    }
    this.hide(false);
    super.onUnmount();
  }

  serviceDidUpdateModality(newModality: number, oldModality: number, modalService: ModalService): void {
    if (newModality !== 0) {
      const opacity = 0.5 * newModality;
      if (oldModality === 0) {
        this.show(opacity);
      } else {
        this.backgroundColor.setState(Color.black(opacity), Affinity.Intrinsic);
        if (this.displayState === ScrimView.ShowingState) {
          this.didShowScrim();
        }
      }
    } else {
      this.hide();
    }
  }

  protected onClick(event: Event): void {
    const modalService = this.modalProvider.service;
    if (modalService !== void 0 && modalService !== null) {
      modalService.displaceModals(event);
    }
  }

  protected onSyntheticClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

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
