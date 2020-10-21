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
import {AnyColor, Color, ColorInterpolator} from "@swim/color";
import {Transform} from "@swim/transform";
import {Transition} from "@swim/transition";
import {ViewContextType, ViewAnimator, ViewNodeType, SvgView} from "@swim/view";
import {Look, MoodVector, ThemeMatrix, ThemedHtmlView} from "@swim/theme";

export class DisclosureButton extends ThemedHtmlView {
  protected initNode(node: ViewNodeType<this>): void {
    super.initNode(node);
    this.addClass("disclosure-button");
    this.display.setAutoState("flex");
    this.justifyContent.setAutoState("center");
    this.alignItems.setAutoState("center");
    this.flexGrow.setAutoState(1);
    this.flexShrink.setAutoState(0);
    this.cursor.setAutoState("pointer");

    const icon = this.append("svg", "icon");
    icon.width.setAutoState(24);
    icon.height.setAutoState(24);
    icon.viewBox.setAutoState("0 0 24 24");
    const arrow = icon.append("polygon", "arrow");
    arrow.points.setAutoState("0 4 -6 -2 -4.59 -3.41 0 1.17 4.59 -3.41 6 -2");
    arrow.transform.setAutoState(Transform.translate(12, 12).rotate(Angle.deg(0)));
  }

  get icon(): SvgView {
    return this.getChildView("icon") as SvgView;
  }

  get arrow(): SvgView {
    const icon = this.icon;
    return icon.getChildView("arrow") as SvgView;
  }

  @ViewAnimator({type: Number, inherit: true})
  disclosurePhase: ViewAnimator<this, number | undefined>; // 0 = collapsed; 1 = expanded

  @ViewAnimator({type: Color, inherit: true})
  collapsedColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  expandedColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  protected onApplyTheme(theme: ThemeMatrix, mood: MoodVector,
                         transition: Transition<any> | null): void {
    super.onApplyTheme(theme, mood, transition);
    this.collapsedColor.setAutoState(theme.inner(mood, Look.color), transition);
    this.expandedColor.setAutoState(theme.inner(mood, Look.accentColor), transition);
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    if (this.disclosurePhase.isUpdated()) {
      const disclosurePhase = this.disclosurePhase.getValueOr(0);
      const collapsedColor = this.collapsedColor.value;
      const expandedColor = this.expandedColor.value;
      if (collapsedColor !== void 0 && expandedColor !== void 0 && this.arrow.fill.isAuto()) {
        const colorInterpolator = ColorInterpolator.between(collapsedColor, expandedColor);
        this.arrow.fill.setAutoState(colorInterpolator.interpolate(disclosurePhase));
      }
      const transform = Transform.translate(12, 12).rotate(Angle.deg(-180 * disclosurePhase));
      this.arrow.transform.setAutoState(transform);
    }
  }
}
