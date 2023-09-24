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

import {Angle} from "@swim/math";
import {Transform} from "@swim/math";
import {Affinity} from "@swim/component";
import {Color} from "@swim/style";
import type {Expansion} from "@swim/style";
import {ExpansionAnimator} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {SvgView} from "@swim/dom";

/** @public */
export class DisclosureButton extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initDisclosureButton();
  }

  protected initDisclosureButton(): void {
    this.setIntrinsic<DisclosureButton>({
      classList: ["disclosure-button"],
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        flexShrink: 0,
        cursor: "pointer",
      },
    });

    const icon = this.appendChild(SvgView, "icon").attributes.setIntrinsic({
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
    });
    icon.appendChild("polygon", "arrow").attributes.setIntrinsic({
      points: "0 4 -6 -2 -4.59 -3.41 0 1.17 4.59 -3.41 6 -2",
      transform: Transform.translate(12, 12).rotate(Angle.deg(0)),
    });
  }

  get icon(): SvgView {
    return this.getChild("icon") as SvgView;
  }

  get arrow(): SvgView {
    const icon = this.icon;
    return icon.getChild("arrow") as SvgView;
  }

  @ExpansionAnimator({inherits: true, updateFlags: View.NeedsLayout})
  readonly disclosure!: ExpansionAnimator<this, Expansion | null>;

  @ThemeAnimator({valueType: Color, look: Look.textColor, inherits: true, updateFlags: View.NeedsLayout})
  readonly collapsedColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, look: Look.accentColor, inherits: true, updateFlags: View.NeedsLayout})
  readonly expandedColor!: ThemeAnimator<this, Color | null>;

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    const phase = this.disclosure.getPhaseOr(1);
    const collapsedColor = this.collapsedColor.value;
    const expandedColor = this.expandedColor.value;
    if (collapsedColor !== null && expandedColor !== null && this.arrow.attributes.fill.hasAffinity(Affinity.Intrinsic)) {
      const colorInterpolator = collapsedColor.interpolateTo(expandedColor);
      this.arrow.attributes.fill.setIntrinsic(colorInterpolator(phase));
    }
    const transform = Transform.translate(12, 12).rotate(Angle.deg(-180 * phase));
    this.arrow.attributes.transform.setIntrinsic(transform);
  }
}
