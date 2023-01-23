// Copyright 2015-2023 Swim.inc
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
import {Affinity} from "@swim/component";
import {AnyColor, Color, AnyExpansion, Expansion, ExpansionAnimator} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {ViewFlags, View} from "@swim/view";
import {HtmlView, SvgView} from "@swim/dom";

/** @public */
export class DisclosureButton extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDisclosureButton();
  }

  protected initDisclosureButton(): void {
    this.addClass("disclosure-button");
    this.display.setState("flex", Affinity.Intrinsic);
    this.justifyContent.setState("center", Affinity.Intrinsic);
    this.alignItems.setState("center", Affinity.Intrinsic);
    this.flexGrow.setState(1, Affinity.Intrinsic);
    this.flexShrink.setState(0, Affinity.Intrinsic);
    this.cursor.setState("pointer", Affinity.Intrinsic);

    const icon = this.appendChild(SvgView, "icon");
    icon.width.setState(24, Affinity.Intrinsic);
    icon.height.setState(24, Affinity.Intrinsic);
    icon.viewBox.setState("0 0 24 24", Affinity.Intrinsic);
    const arrow = icon.appendChild("polygon", "arrow");
    arrow.points.setState("0 4 -6 -2 -4.59 -3.41 0 1.17 4.59 -3.41 6 -2", Affinity.Intrinsic);
    arrow.transform.setState(Transform.translate(12, 12).rotate(Angle.deg(0)), Affinity.Intrinsic);
  }

  get icon(): SvgView {
    return this.getChild("icon") as SvgView;
  }

  get arrow(): SvgView {
    const icon = this.icon;
    return icon.getChild("arrow") as SvgView;
  }

  @ExpansionAnimator({inherits: true, updateFlags: View.NeedsLayout})
  readonly disclosure!: ExpansionAnimator<this, Expansion, AnyExpansion>;

  @ThemeAnimator({valueType: Color, look: Look.textColor, inherits: true, updateFlags: View.NeedsLayout})
  readonly collapsedColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Color, look: Look.accentColor, inherits: true, updateFlags: View.NeedsLayout})
  readonly expandedColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    const phase = this.disclosure.getPhase();
    const collapsedColor = this.collapsedColor.value;
    const expandedColor = this.expandedColor.value;
    if (collapsedColor !== null && expandedColor !== null && this.arrow.fill.hasAffinity(Affinity.Intrinsic)) {
      const colorInterpolator = collapsedColor.interpolateTo(expandedColor);
      this.arrow.fill.setState(colorInterpolator(phase), Affinity.Intrinsic);
    }
    const transform = Transform.translate(12, 12).rotate(Angle.deg(-180 * phase));
    this.arrow.transform.setState(transform, Affinity.Intrinsic);
  }
}
