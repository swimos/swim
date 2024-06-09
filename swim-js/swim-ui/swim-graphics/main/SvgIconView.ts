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

import type {Timing} from "@swim/util";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import type {MoodVector} from "@swim/theme";
import type {ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import {SvgView} from "@swim/dom";
import {Graphics} from "./Graphics";
import {SvgContext} from "./SvgContext";
import {SvgRenderer} from "./SvgRenderer";
import {IconLayout} from "./IconLayout";
import {Icon} from "./Icon";
import type {IconView} from "./IconView";
import {IconGraphicsAnimator} from "./IconView";

/** @public */
export class SvgIconView extends SvgView implements IconView {
  /** @override */
  @Animator({valueType: IconLayout, value: null, updateFlags: View.NeedsLayout})
  readonly iconLayout!: Animator<this, IconLayout | null>;

  /** @override */
  @ThemeAnimator({
    valueType: Color,
    value: null,
    updateFlags: View.NeedsLayout,
    didSetState(iconColor: Color | null): void {
      const timing = this.timing !== null ? this.timing : false;
      this.owner.graphics.setState(this.owner.graphics.state, timing, Affinity.Reflexive);
    },
  })
  get iconColor(): ThemeAnimator<this, Color | null> {
    return ThemeAnimator.getter();
  }

  /** @override */
  @ThemeAnimator({
    extends: IconGraphicsAnimator,
    valueType: Graphics,
    value: null,
    updateFlags: View.NeedsLayout,
  })
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.derived) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onResize(): void {
    super.onResize();
    this.requireUpdate(View.NeedsLayout);
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.renderIcon();
  }

  protected renderIcon(): void {
    const context = new SvgContext(this);
    context.setPrecision(3);
    context.beginSvg();
    const graphics = this.graphics.value;
    if (graphics !== null) {
      const frame = this.iconBounds;
      if (frame.isDefined() && frame.width > 0 && frame.height > 0) {
        context.beginPath();
        const renderer = new SvgRenderer(context);
        graphics.render(renderer, frame);
      }
    }
    context.finalizeSvg();
  }

  get iconBounds(): R2Box {
    let viewportElement = this.node.viewportElement;
    if (viewportElement === null) {
      viewportElement = this.node;
    }
    if (!(viewportElement instanceof SVGSVGElement)) {
      return R2Box.undefined();
    }
    const viewBox = viewportElement.viewBox.animVal;
    const viewWidth = viewBox.width;
    const viewHeight = viewBox.height;
    const viewSize = Math.min(viewWidth, viewHeight);
    const iconLayout = this.iconLayout.value;
    const iconWidth = iconLayout !== null ? iconLayout.width.pxValue(viewSize) : viewSize;
    const iconHeight = iconLayout !== null ? iconLayout.height.pxValue(viewSize) : viewSize;
    const xAlign = iconLayout !== null ? iconLayout.xAlign : 0.5;
    const yAlign = iconLayout !== null ? iconLayout.yAlign : 0.5;
    const x = viewBox.x + (viewWidth - iconWidth) * xAlign;
    const y = viewBox.y + (viewHeight - iconHeight) * yAlign;
    return new R2Box(x, y, x + iconWidth, y + iconHeight);
  }

  static override readonly MountFlags: ViewFlags = SvgView.MountFlags | View.NeedsAnimate;
}
