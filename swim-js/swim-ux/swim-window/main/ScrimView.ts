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

import type {Mutable} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import type {Observes} from "@swim/util";
import {Animator} from "@swim/component";
import {EventHandler} from "@swim/component";
import {Provider} from "@swim/component";
import type {Service} from "@swim/component";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {HtmlView} from "@swim/dom";
import type {ModalService} from "@swim/dom";

/** @public */
export class ScrimView extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.displayState = ScrimView.HiddenState;
    this.initScrim();
  }

  protected initScrim(): void {
    this.setIntrinsic<ScrimView>({
      classList: ["scrim"],
      style: {
        display: "none",
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: "auto",
        cursor: "pointer",
        backgroundColor: Color.black(0),
      },
    });
  }

  /** @internal */
  readonly displayState: number;

  /** @internal */
  setDisplayState(displayState: number): void {
    (this as Mutable<this>).displayState = displayState;
  }

  @Animator({
    inherits: true,
    get parent(): Animator<any, Color | null, any> {
      return this.owner.style.backgroundColor;
    },
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
  readonly backgroundColor!: Animator<this, Color | null>;

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

  show(opacity: number, timing?: TimingLike | boolean): void {
    if (this.isHidden()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }
      this.setDisplayState(ScrimView.ShowState);
      if (timing !== false) {
        this.style.backgroundColor.setIntrinsic(Color.black(0));
        this.style.backgroundColor.setIntrinsic(Color.black(opacity), timing);
      } else {
        this.willShowScrim();
        this.style.backgroundColor.setIntrinsic(Color.black(opacity));
        this.didShowScrim();
      }
    }
  }

  protected willShowScrim(): void {
    this.setDisplayState(ScrimView.ShowingState);

    this.style.display.setIntrinsic("block");
  }

  protected didShowScrim(): void {
    this.setDisplayState(ScrimView.ShownState);
  }

  hide(timing?: TimingLike | boolean): void {
    if (this.isShown()) {
      if (timing === void 0 || timing === true) {
        timing = this.getLookOr(Look.timing, false);
      } else {
        timing = Timing.fromLike(timing);
      }
      this.setDisplayState(ScrimView.HideState);
      if (timing !== false) {
        this.style.backgroundColor.setIntrinsic(Color.black(0), timing);
      } else {
        this.willHideScrim();
        this.style.backgroundColor.setIntrinsic(Color.black(0));
        this.didHideScrim();
      }
    }
  }

  protected willHideScrim(): void {
    this.setDisplayState(ScrimView.HidingState);
  }

  protected didHideScrim(): void {
    this.setDisplayState(ScrimView.HiddenState);

    this.style.display.setIntrinsic("none");
  }

  @Provider({
    extends: true,
    observes: true,
    didAttachService(service: ModalService, target: Service | null): void {
      this.owner.serviceDidSetModality(service.modality.value, 0, service);
      super.didAttachService(service, target);
    },
    willDetachService(service: ModalService): void {
      super.willDetachService(service);
      this.owner.hide(false);
    },
  })
  override get modal(): Provider<this, ModalService> & HtmlView["modal"] & Observes<ModalService> {
    return Provider.getter();
  }

  serviceDidSetModality(newModality: number, oldModality: number, modalService: ModalService): void {
    if (newModality !== 0) {
      const opacity = 0.5 * newModality;
      if (oldModality === 0) {
        this.show(opacity);
      } else {
        this.style.backgroundColor.setIntrinsic(Color.black(opacity));
        if (this.displayState === ScrimView.ShowingState) {
          this.didShowScrim();
        }
      }
    } else {
      this.hide();
    }
  }

  @EventHandler({
    initEventType(): string {
      if (typeof PointerEvent !== "undefined") {
        return "pointerup";
      } else if (typeof TouchEvent !== "undefined") {
        return "touchend";
      }
      return "click";
    },
    handle(event: Event): void {
      const modalService = this.owner.modal.service;
      if (modalService !== null) {
        modalService.displaceModals();
      }
    },
  })
  readonly click!: EventHandler<this>;

  @EventHandler({
    eventType: "click",
    enabled: typeof PointerEvent !== "undefined"
          || typeof TouchEvent !== "undefined",
    handle(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
    },
  })
  readonly syntheticClick!: EventHandler<this>;

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
