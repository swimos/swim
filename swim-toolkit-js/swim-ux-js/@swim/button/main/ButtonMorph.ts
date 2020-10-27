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

import {Angle} from "@swim/angle";
import {Transform} from "@swim/transform";
import {Tween, Transition} from "@swim/transition";
import {ViewNodeType, HtmlView, SvgView} from "@swim/dom";
import {Look, ThemedHtmlView} from "@swim/theme";

export class ButtonMorph extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("button-morph");
    this.display.setAutoState("flex");
    this.justifyContent.setAutoState("center");
    this.alignItems.setAutoState("center");
    this.flexGrow.setAutoState(1);
    this.pointerEvents.setAutoState("none");
  }

  get form(): HtmlView | null {
    const childView = this.getChildView("form");
    return childView instanceof HtmlView ? childView : null;
  }

  get icon(): HtmlView | SvgView | null {
    const form = this.form;
    const childView = form !== null ? form.getChildView("icon") : null;
    return childView instanceof SvgView || childView instanceof HtmlView ? childView : null;
  }

  setIcon(icon: HtmlView | SvgView | null, tween?: Tween<any>, ccw: boolean = false): void {
    if (tween === void 0 || tween === true) {
      tween = this.getLookOr(Look.transition, null);
    } else {
      tween = Transition.forTween(tween);
    }
    const oldForm = this.getChildView("form");
    if (oldForm instanceof HtmlView) {
      if (tween !== null) {
        this.removeChildViewMap(oldForm);
        oldForm.setKey(void 0);
        oldForm.opacity.setAutoState(0, tween.onEnd(oldForm.remove.bind(oldForm)));
        oldForm.transform.setAutoState(Transform.rotate(Angle.deg(ccw ? -90 : 90)), tween);
      } else {
        oldForm.remove();
      }
    }
    const newForm = this.createForm(icon);
    newForm.opacity.setAutoState(0);
    newForm.opacity.setAutoState(1, tween);
    newForm.transform.setAutoState(Transform.rotate(Angle.deg(ccw ? 90 : -90)));
    newForm.transform.setAutoState(Transform.rotate(Angle.deg(0)), tween);
    this.appendChildView(newForm, "form");
  }

  protected createForm(icon: HtmlView | SvgView | null): HtmlView {
    const form = HtmlView.create("div");
    form.addClass("morph-form");
    form.position.setAutoState("absolute");
    form.display.setAutoState("flex");
    form.justifyContent.setAutoState("center");
    form.alignItems.setAutoState("center");
    form.top.setAutoState(0);
    form.right.setAutoState(0);
    form.bottom.setAutoState(0);
    form.left.setAutoState(0);
    form.pointerEvents.setAutoState("none");
    if (icon !== null) {
      form.appendChildView(icon, "icon");
    }
    return form;
  }
}
