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

import type {Timing} from "@swim/mapping";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import type {Graphics} from "../graphics/Graphics";
import type {GraphicsViewInit, GraphicsView} from "../graphics/GraphicsView";
import {LayerView} from "../layer/LayerView";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";
import {IconViewInit, IconView} from "./IconView";
import {IconViewAnimator} from "./IconViewAnimator";

export interface GraphicsIconViewInit extends GraphicsViewInit, IconViewInit {
}

export class GraphicsIconView extends LayerView implements IconView {
  override initView(init: GraphicsIconViewInit): void {
    super.initView(init);
    IconView.initView(this, init);
  }

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly xAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 0.5, updateFlags: View.NeedsLayout})
  readonly yAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: null, updateFlags: View.NeedsLayout})
  readonly iconHeight!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Color, state: null, updateFlags: View.NeedsLayout})
  readonly iconColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({extends: IconViewAnimator, type: Object, state: null, updateFlags: View.NeedsLayout})
  readonly graphics!: ViewAnimator<this, Graphics | null>;

  protected override onApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean): void {
    super.onApplyTheme(theme, mood, timing);
    if (!this.graphics.isInherited()) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof Icon) {
        const newGraphics = oldGraphics.withTheme(theme, mood);
        this.graphics.setOwnState(newGraphics, oldGraphics.isThemed() ? timing : false);
      }
    }
  }

  protected override onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    const iconColor = this.iconColor.takeUpdatedValue();
    if (iconColor !== void 0 && iconColor !== null) {
      const oldGraphics = this.graphics.value;
      if (oldGraphics instanceof FilledIcon) {
        const newGraphics = oldGraphics.withFillColor(iconColor);
        this.graphics.setOwnState(newGraphics);
      }
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderIcon(renderer, this.viewBounds);
      context.restore();
    }
  }

  protected renderIcon(renderer: CanvasRenderer, frame: R2Box): void {
    const graphics = this.graphics.value;
    if (graphics !== null) {
      const context = renderer.context;
      context.beginPath();
      graphics.render(renderer, frame);
    }
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        hit = this.hitTestIcon(x, y, renderer, this.viewBounds);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestIcon(x: number, y: number, renderer: CanvasRenderer, frame: R2Box): GraphicsView | null {
    // TODO: icon hit test mode
    if (this.hitBounds.contains(x, y)) {
      return this;
    }
    //const graphics = this.graphics.value;
    //if (graphics !== null) {
    //  const context = renderer.context;
    //  graphics.render(renderer, frame);
    //  if (context.isPointInPath(x * renderer.pixelRatio, y * renderer.pixelRatio)) {
    //    return this;
    //  }
    //}
    return null;
  }

  static override create(): GraphicsIconView {
    return new GraphicsIconView();
  }
}
Object.defineProperty(GraphicsIconView.prototype, "viewBounds", {
  get(this: GraphicsIconView): R2Box {
    const viewFrame = this.viewFrame;
    const viewWidth = viewFrame.width;
    const viewHeight = viewFrame.height;
    const viewSize = Math.min(viewWidth, viewHeight);
    let iconWidth: Length | number | null = this.iconWidth.value;
    iconWidth = iconWidth instanceof Length ? iconWidth.pxValue(viewSize) : viewSize;
    let iconHeight: Length | number | null = this.iconHeight.value;
    iconHeight = iconHeight instanceof Length ? iconHeight.pxValue(viewSize) : viewSize;
    const x = viewFrame.x + (viewWidth - iconWidth) * this.xAlign.getValue();
    const y = viewFrame.y + (viewHeight - iconHeight) * this.yAlign.getValue();
    return new R2Box(x, y, x + iconWidth, y + iconHeight);
  },
  enumerable: true,
  configurable: true,
});
