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

import {Color} from "@swim/color";
import {Tween, Transition} from "@swim/transition";
import {ViewNodeType} from "@swim/dom";
import {Look, ThemedHtmlView} from "@swim/theme";
import {ModalState} from "../Modal";
import {ModalManager} from "./ModalManager";
import {ModalManagerObserver} from "./ModalManagerObserver";

export class ScrimView extends ThemedHtmlView implements ModalManagerObserver {
  /** @hidden */
  _scrimState: ModalState;

  constructor(node: HTMLElement) {
    super(node);
    this._scrimState = "hidden";
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
  }

  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("scrim");
    this.display.setAutoState("none");
    this.position.setAutoState("absolute");
    this.top.setAutoState(0);
    this.right.setAutoState(0);
    this.bottom.setAutoState(0);
    this.left.setAutoState(0);
    this.pointerEvents.setAutoState("auto");
    this.cursor.setAutoState("pointer");
    this.backgroundColor.setAutoState(Color.black(0));
  }

  get scrimState(): ModalState {
    return this._scrimState;
  }

  isShown(): boolean {
    return this._scrimState === "shown" || this._scrimState === "showing";
  }

  isHidden(): boolean {
    return this._scrimState === "hidden" || this._scrimState === "hiding";
  }

  show(opacity: number, tween?: Tween<any>): void {
    if (this._scrimState === "hidden" || this._scrimState === "hiding") {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willShow();
      this.display.setAutoState("block");
      if (tween !== null) {
        this.backgroundColor.setAutoState(Color.black(0));
        this.backgroundColor.setAutoState(Color.black(opacity), tween.onEnd(this.didShow.bind(this)));
      } else {
        this.backgroundColor.setAutoState(Color.black(opacity));
        this.didShow();
      }
    }
  }

  protected willShow(): void {
    this._scrimState = "showing";
  }

  protected didShow(): void {
    this._scrimState = "shown";
  }

  hide(tween?: Tween<any>): void {
    if (this._scrimState === "shown" || this._scrimState === "showing") {
      if (tween === void 0 || tween === true) {
        tween = this.getLookOr(Look.transition, null);
      } else {
        tween = Transition.forTween(tween);
      }
      this.willHide();
      if (tween !== null) {
        this.backgroundColor.setAutoState(Color.black(0), tween.onEnd(this.didHide.bind(this)));
      } else {
        this.backgroundColor.setAutoState(Color.black(0));
        this.didHide();
      }
    }
  }

  protected willHide(): void {
    this._scrimState = "hiding";
  }

  protected didHide(): void {
    this._scrimState = "hidden";
    this.display.setAutoState("none");
  }

  protected onMount(): void {
    super.onMount();
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0) {
      modalManager.addViewManagerObserver(this);
      this.modalManagerDidUpdateModality(modalManager.modality, 0, modalManager);
    }
  }

  protected onUnmount(): void {
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0) {
      modalManager.removeViewManagerObserver(this);
    }
    this.hide();
    super.onUnmount();
  }

  modalManagerDidUpdateModality(newModality: number, oldModality: number, modalManager: ModalManager): void {
    if (newModality !== 0) {
      const opacity = 0.5 * newModality;
      if (oldModality === 0) {
        this.show(opacity);
      } else {
        this.backgroundColor.setAutoState(Color.black(opacity));
      }
    } else {
      this.hide();
    }
  }

  protected onClick(event: Event): void {
    const modalManager = this.modalService.manager;
    if (modalManager !== void 0) {
      modalManager.displaceModals(event);
    }
  }

  protected onSyntheticClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
