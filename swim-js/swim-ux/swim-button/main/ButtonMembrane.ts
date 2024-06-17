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

import {Property} from "@swim/component";
import {HtmlView} from "@swim/dom";
import type {PositionGestureInput} from "@swim/view";
import {PositionGesture} from "@swim/view";
import {ButtonGlow} from "./ButtonGlow";

/** @public */
export class ButtonMembrane extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initMembrane(node);
  }

  protected initMembrane(node: HTMLElement): void {
    this.classList.add("membrane");
  }

  @Property({valueType: Boolean, value: true, inherits: true})
  readonly glows!: Property<this, boolean>;

  protected glow(input: PositionGestureInput): void {
    if (input.detail instanceof ButtonGlow) {
      input.detail.fade(input.x, input.y);
      input.detail = void 0;
    }
    if (input.detail === void 0) {
      const delay = input.inputType === "mouse" ? 0 : 100;
      input.detail = this.prependChild(ButtonGlow);
      (input.detail as ButtonGlow).glow(input.x, input.y, void 0, delay);
    }
  }

  @PositionGesture({
    bindsOwner: true,
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.glows.value) {
        this.owner.glow(input);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      } else if (!this.owner.clientBounds.contains(input.x, input.y)) {
        input.clearHoldTimer();
        this.beginHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      }
    },
    didEndPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
        if (input.detail instanceof ButtonGlow) {
          input.detail.fade(input.x, input.y);
          input.detail = void 0;
        }
      } else if (input.detail instanceof ButtonGlow) {
        input.detail.pulse(input.x, input.y);
      }
    },
    didCancelPress(input: PositionGestureInput, event: Event | null): void {
      if (!this.owner.clientBounds.contains(input.x, input.y)) {
        this.endHover(input, event);
      }
      if (input.detail instanceof ButtonGlow) {
        input.detail.fade(input.x, input.y);
        input.detail = void 0;
      }
    },
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
}
