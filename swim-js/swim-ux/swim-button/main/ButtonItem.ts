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

import type {Presence} from "@swim/style";
import {PresenceAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import type {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import type {HtmlIconView} from "@swim/graphics";
import {FloatingButton} from "./FloatingButton";

/** @public */
export class ButtonItem extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initButtonItem();
  }

  protected initButtonItem(): void {
    this.classList.add("button-item");
    this.style.position.setIntrinsic("relative");
    const button = this.createButton();
    if (button !== null) {
      this.setChild("button", button);
    }
  }

  protected createButton(): FloatingButton | null {
    const button = FloatingButton.create();
    button.buttonType.setIntrinsic("mini");
    return button;
  }

  get button(): FloatingButton | null {
    const childView = this.getChild("button");
    return childView instanceof FloatingButton ? childView : null;
  }

  get icon(): HtmlIconView | null {
    const button = this.button;
    const buttonIcon = button !== null ? button.icon : null;
    return buttonIcon !== null ? buttonIcon.view : null;
  }

  get label(): HtmlView | null {
    const childView = this.getChild("label");
    return childView instanceof HtmlView ? childView : null;
  }

  @PresenceAnimator({inherits: true})
  readonly presence!: PresenceAnimator<this, Presence | undefined>;

  protected override onLayout(): void {
    super.onLayout();
    const phase = this.presence.getPhaseOr(1);
    const button = this.button;
    if (button !== null) {
      this.style.width.setIntrinsic(button.style.width.state);
      this.style.height.setIntrinsic(button.style.height.state);
    }
    const label = this.label;
    if (label !== null) {
      label.style.opacity.setIntrinsic(phase);
    }
  }

  protected override onInsertChild(childView: View, targetView: View | null): void {
    super.onInsertChild(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof FloatingButton) {
      this.onInsertButton(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onInsertLabel(childView);
    }
  }

  protected override onRemoveChild(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof FloatingButton) {
      this.onRemoveButton(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onRemoveLabel(childView);
    }
    super.onRemoveChild(childView);
  }

  protected onInsertButton(button: FloatingButton): void {
    // hook
  }

  protected onRemoveButton(button: FloatingButton): void {
    // hook
  }

  protected onInsertLabel(label: HtmlView): void {
    label.style.setIntrinsic({
      display: "block",
      position: "absolute",
      top: 0,
      right: 40 + 16,
      bottom: 0,
      fontSize: 17,
      fontWeight: "500",
      lineHeight: 40,
      whiteSpace: "nowrap",
      color: Look.labelColor,
      opacity: this.presence.getPhaseOr(0),
    });
  }

  protected onRemoveLabel(label: HtmlView): void {
    // hook
  }
}
