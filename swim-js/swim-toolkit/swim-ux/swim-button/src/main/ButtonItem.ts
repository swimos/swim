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

import type {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {AnyExpansion, Expansion} from "@swim/style";
import {Look, MoodVector, ThemeMatrix, ThemeAnimator, ExpansionThemeAnimator} from "@swim/theme";
import type {ViewContextType, View} from "@swim/view";
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
    this.addClass("button-item");
    this.position.setState("relative", Affinity.Intrinsic);
    const button = this.createButton();
    if (button !== null) {
      this.setChild("button", button);
    }
  }

  protected createButton(): FloatingButton | null {
    const button = FloatingButton.create();
    button.setButtonType("mini");
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

  @ThemeAnimator({type: Expansion, inherits: true})
  readonly disclosure!: ExpansionThemeAnimator<this, Expansion | undefined, AnyExpansion | undefined>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    const label = this.label;
    if (label !== null && label.color.hasAffinity(Affinity.Intrinsic)) {
      label.color.setState(theme.getOr(Look.mutedColor, mood, null), timing, Affinity.Intrinsic);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    const phase = this.disclosure.getPhaseOr(1);
    const button = this.button;
    if (button !== null) {
      this.width.setState(button.width.state, Affinity.Intrinsic);
      this.height.setState(button.height.state, Affinity.Intrinsic);
    }
    const label = this.label;
    if (label !== null) {
      label.opacity.setState(phase, Affinity.Intrinsic);
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
    label.display.setState("block", Affinity.Intrinsic);
    label.position.setState("absolute", Affinity.Intrinsic);
    label.top.setState(0, Affinity.Intrinsic);
    label.right.setState(40 + 16, Affinity.Intrinsic);
    label.bottom.setState(0, Affinity.Intrinsic);
    label.fontSize.setState(17, Affinity.Intrinsic);
    label.fontWeight.setState("500", Affinity.Intrinsic);
    label.lineHeight.setState(40, Affinity.Intrinsic);
    label.whiteSpace.setState("nowrap", Affinity.Intrinsic);
    label.opacity.setState(this.disclosure.getPhaseOr(0), Affinity.Intrinsic);
  }

  protected onRemoveLabel(label: HtmlView): void {
    // hook
  }
}
