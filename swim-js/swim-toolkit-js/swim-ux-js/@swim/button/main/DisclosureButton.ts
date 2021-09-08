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

import {Angle, Transform} from "@swim/math";
import {AnyColor, Color, AnyExpansion, Expansion} from "@swim/style";
import {Look} from "@swim/theme";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  ExpansionViewAnimator,
} from "@swim/view";
import {HtmlView, SvgView} from "@swim/dom";

export class DisclosureButton extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDisclosureButton();
  }

  protected initDisclosureButton(): void {
    this.addClass("disclosure-button");
    this.display.setState("flex", View.Intrinsic);
    this.justifyContent.setState("center", View.Intrinsic);
    this.alignItems.setState("center", View.Intrinsic);
    this.flexGrow.setState(1, View.Intrinsic);
    this.flexShrink.setState(0, View.Intrinsic);
    this.cursor.setState("pointer", View.Intrinsic);

    const icon = this.append(SvgView, "icon");
    icon.width.setState(24, View.Intrinsic);
    icon.height.setState(24, View.Intrinsic);
    icon.viewBox.setState("0 0 24 24", View.Intrinsic);
    const arrow = icon.append("polygon", "arrow");
    arrow.points.setState("0 4 -6 -2 -4.59 -3.41 0 1.17 4.59 -3.41 6 -2", View.Intrinsic);
    arrow.transform.setState(Transform.translate(12, 12).rotate(Angle.deg(0)), View.Intrinsic);
  }

  get icon(): SvgView {
    return this.getChildView("icon") as SvgView;
  }

  get arrow(): SvgView {
    const icon = this.icon;
    return icon.getChildView("arrow") as SvgView;
  }

  @ViewAnimator({type: Expansion, inherit: true, updateFlags: View.NeedsAnimate})
  readonly disclosure!: ExpansionViewAnimator<this, Expansion, AnyExpansion>;

  @ViewAnimator({type: Color, inherit: true, look: Look.color, updateFlags: View.NeedsAnimate})
  readonly collapsedColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, inherit: true, look: Look.accentColor, updateFlags: View.NeedsAnimate})
  readonly expandedColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    if (this.disclosure.isUpdated() || this.collapsedColor.isUpdated() || this.expandedColor.isUpdated()) {
      const disclosure = this.disclosure.takeValue()!;
      const phase = disclosure.phase;
      const collapsedColor = this.collapsedColor.takeValue();
      const expandedColor = this.expandedColor.takeValue();
      if (collapsedColor !== null && expandedColor !== null && this.arrow.fill.takesPrecedence(View.Intrinsic)) {
        const colorInterpolator = collapsedColor.interpolateTo(expandedColor);
        this.arrow.fill.setState(colorInterpolator(phase), View.Intrinsic);
      }
      const transform = Transform.translate(12, 12).rotate(Angle.deg(-180 * phase));
      this.arrow.transform.setState(transform, View.Intrinsic);
    }
  }

  static override readonly mountFlags: ViewFlags = HtmlView.mountFlags | View.NeedsAnimate;
}
