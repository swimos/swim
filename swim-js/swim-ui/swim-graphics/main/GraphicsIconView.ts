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
import {View} from "@swim/view";
import {Graphics} from "./Graphics";
import {GraphicsView} from "./GraphicsView";
import {PaintingRenderer} from "./PaintingRenderer";
import {CanvasRenderer} from "./CanvasRenderer";
import {IconLayout} from "./IconLayout";
import {Icon} from "./Icon";
import type {IconView} from "./IconView";
import {IconGraphicsAnimator} from "./IconView";

/** @public */
export class GraphicsIconView extends GraphicsView implements IconView {
  /** @override */
  @Animator({valueType: IconLayout, value: null, updateFlags: View.NeedsRender})
  readonly iconLayout!: Animator<this, IconLayout | null>;

  /** @override */
  @ThemeAnimator({
    valueType: Color,
    value: null,
    updateFlags: View.NeedsRender,
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
    updateFlags: View.NeedsRender,
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

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderIcon(renderer, this.viewBounds);
    }
  }

  protected renderIcon(renderer: PaintingRenderer, frame: R2Box): void {
    const graphics = this.graphics.value;
    if (graphics !== null) {
      const context = renderer.context;
      context.beginPath();
      graphics.render(renderer, frame);
    }
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      return this.hitTestIcon(x, y, renderer, this.viewBounds);
    }
    return null;
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
    //  const p = renderer.transform.transform(x, y);
    //  if (context.isPointInPath(p.x, p.y)) {
    //    return this;
    //  }
    //}
    return null;
  }
}
Object.defineProperty(GraphicsIconView.prototype, "viewBounds", {
  get(this: GraphicsIconView): R2Box {
    const viewFrame = this.viewFrame;
    const viewWidth = viewFrame.width;
    const viewHeight = viewFrame.height;
    const viewSize = Math.min(viewWidth, viewHeight);
    const iconLayout = this.iconLayout.value;
    const iconWidth = iconLayout !== null ? iconLayout.width.pxValue(viewSize) : viewSize;
    const iconHeight = iconLayout !== null ? iconLayout.height.pxValue(viewSize) : viewSize;
    const xAlign = iconLayout !== null ? iconLayout.xAlign : 0.5;
    const yAlign = iconLayout !== null ? iconLayout.yAlign : 0.5;
    const x = viewFrame.x + (viewWidth - iconWidth) * xAlign;
    const y = viewFrame.y + (viewHeight - iconHeight) * yAlign;
    return new R2Box(x, y, x + iconWidth, y + iconHeight);
  },
  configurable: true,
});
