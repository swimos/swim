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

import type {Timing} from "@swim/util";
import {Affinity, Animator} from "@swim/fastener";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, View} from "@swim/view";
import {SvgViewInit, SvgView} from "@swim/dom";
import type {Graphics} from "../graphics/Graphics";
import {SvgContext} from "../svg/SvgContext";
import {SvgRenderer} from "../svg/SvgRenderer";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";
import {IconViewInit, IconView} from "./IconView";
import {IconGraphicsAnimator} from "./IconGraphicsAnimator";

export interface SvgIconViewInit extends SvgViewInit, IconViewInit {
}

export class SvgIconView extends SvgView implements IconView {
  constructor(node: SVGElement) {
    super(node);
  }

  @Animator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: Animator<this, number>;

  @Animator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: Animator<this, number>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconHeight!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<SvgIconView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    updateFlags: View.NeedsLayout,
    didSetValue(newIconColor: Color | null, oldIconColor: Color | null): void {
      if (newIconColor !== null) {
        const oldGraphics = this.owner.graphics.value;
        if (oldGraphics instanceof FilledIcon) {
          const newGraphics = oldGraphics.withFillColor(newIconColor);
          this.owner.graphics.setState(newGraphics, Affinity.Reflexive);
        }
      }
    },
  })
  readonly iconColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({extends: IconGraphicsAnimator, type: Object, state: null, updateFlags: View.NeedsLayout})
  readonly graphics!: ThemeAnimator<this, Graphics | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.inherited) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setState(newGraphics, oldGraphics.isThemed() ? timing : false, Affinity.Reflexive);
      }
    }
  }

  protected override onResize(viewContext: ViewContextType<this>): void {
    super.onResize(viewContext);
    this.requireUpdate(View.NeedsLayout);
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
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
    if (viewportElement instanceof SVGSVGElement) {
      const viewBox = viewportElement.viewBox.animVal;
      const viewWidth = viewBox.width;
      const viewHeight = viewBox.height;
      const viewSize = Math.min(viewWidth, viewHeight);
      let iconWidth: Length | number | null = this.iconWidth.value;
      iconWidth = iconWidth instanceof Length ? iconWidth.pxValue(viewSize) : viewSize;
      let iconHeight: Length | number | null = this.iconHeight.value;
      iconHeight = iconHeight instanceof Length ? iconHeight.pxValue(viewSize) : viewSize;
      const x = viewBox.x + (viewWidth - iconWidth) * this.xAlign.getValue();
      const y = viewBox.y + (viewHeight - iconHeight) * this.yAlign.getValue();
      return new R2Box(x, y, x + iconWidth, y + iconHeight);
    } else {
      return R2Box.undefined();
    }
  }

  override init(init: SvgIconViewInit): void {
    super.init(init);
    IconView.init(this, init);
  }

  static override readonly MountFlags: ViewFlags = SvgView.MountFlags | View.NeedsAnimate;
}
