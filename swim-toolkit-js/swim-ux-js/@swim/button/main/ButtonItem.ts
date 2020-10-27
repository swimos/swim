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

import {Transition} from "@swim/transition";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import {ViewNodeType, HtmlView, SvgView} from "@swim/dom";
import {Look, MoodVector, ThemeMatrix, ThemedHtmlView} from "@swim/theme";
import {FloatingButton} from "./FloatingButton";

export class ButtonItem extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("button-item");
    this.position.setAutoState("relative");
    const button = this.createButton();
    if (button !== null) {
      this.setChildView("button", button);
    }
  }

  protected createButton(): FloatingButton | null {
    const button = FloatingButton.create();
    button.setButtonType("mini");
    return button;
  }

  get button(): FloatingButton | null {
    const childView = this.getChildView("button");
    return childView instanceof FloatingButton ? childView : null;
  }

  get icon(): HtmlView | SvgView | null {
    const button = this.button;
    return button !== null ? button.icon : null;
  }

  get label(): HtmlView | null {
    const childView = this.getChildView("label");
    return childView instanceof HtmlView ? childView : null;
  }

  @ViewAnimator({type: Number, inherit: true})
  stackPhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    const label = this.label;
    if (label !== null && label.color.isAuto()) {
      label.color.setAutoState(theme.inner(mood, Look.mutedColor), transition);
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    const phase = this.stackPhase.getValueOr(1);
    const button = this.button;
    if (button !== null) {
      this.width.setAutoState(button.width.state);
      this.height.setAutoState(button.height.state);
    }
    const label = this.label;
    if (label !== null) {
      label.opacity.setAutoState(phase);
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof FloatingButton) {
      this.onInsertButton(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onInsertLabel(childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    const childKey = childView.key;
    if (childKey === "button" && childView instanceof FloatingButton) {
      this.onRemoveButton(childView);
    } else if (childKey === "label" && childView instanceof HtmlView) {
      this.onRemoveLabel(childView);
    }
    super.onRemoveChildView(childView);
  }

  protected onInsertButton(button: FloatingButton): void {
    // hook
  }

  protected onRemoveButton(button: FloatingButton): void {
    // hook
  }

  protected onInsertLabel(label: HtmlView): void {
    label.display.setAutoState("block");
    label.position.setAutoState("absolute");
    label.top.setAutoState(0);
    label.right.setAutoState(40 + 16);
    label.bottom.setAutoState(0);
    label.fontSize.setAutoState(17);
    label.fontWeight.setAutoState("500");
    label.lineHeight.setAutoState("40px");
    label.whiteSpace.setAutoState("nowrap");
    label.opacity.setAutoState(this.stackPhase.getValueOr(0));
  }

  protected onRemoveLabel(label: HtmlView): void {
    // hook
  }
}
