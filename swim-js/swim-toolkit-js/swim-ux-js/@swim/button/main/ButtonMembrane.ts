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

import {HtmlViewInit, HtmlView} from "@swim/dom";
import {PositionGestureInput, PositionGesture} from "@swim/view";
import {ButtonGlow} from "./ButtonGlow";

export interface ButtonMembraneInit extends HtmlViewInit {
}

export class ButtonMembrane extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initMembrane(node);
  }

  protected initMembrane(node: HTMLElement): void {
    this.addClass("membrane");
  }

  override initView(init: ButtonMembraneInit): void {
    super.initView(init);
  }

  get glows(): boolean {
    return true;
  }

  setGlows(glows: boolean): void {
    if (this.glows !== glows) {
      Object.defineProperty(this, "glows", {
        value: glows,
        configurable: true,
        enumerable: true,
      });
    }
  }

  protected glow(input: PositionGestureInput): void {
    if (input.detail instanceof ButtonGlow) {
      input.detail.fade(input.x, input.y);
      input.detail = void 0;
    }
    if (input.detail === void 0) {
      const delay = input.inputType === "mouse" ? 0 : 100;
      input.detail = this.prepend(ButtonGlow);
      (input.detail as ButtonGlow).glow(input.x, input.y, void 0, delay);
    }
  }

  /** @hidden */
  static Gesture = PositionGesture.define<ButtonMembrane, HtmlView>({
    didBeginPress(input: PositionGestureInput, event: Event | null): void {
      if (this.owner.glows) {
        this.owner.glow(input);
      }
    },
    didMovePress(input: PositionGestureInput, event: Event | null): void {
      if (input.isRunaway()) {
        this.cancelPress(input, event);
      } else if (!this.owner.clientBounds.contains(input.x, input.y)) {
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
  });

  @PositionGesture<ButtonMembrane, HtmlView>({
    extends: ButtonMembrane.Gesture,
    self: true,
  })
  readonly gesture!: PositionGesture<this, HtmlView>;
}
