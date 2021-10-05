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
import {Affinity} from "@swim/fastener";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, View} from "@swim/view";
import type {Graphics} from "../graphics/Graphics";
import type {GraphicsViewInit, GraphicsView} from "../graphics/GraphicsView";
import {LayerView} from "../layer/LayerView";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import {Icon} from "./Icon";
import {FilledIcon} from "./FilledIcon";
import {IconViewInit, IconView} from "./IconView";
import {IconGraphicsAnimator} from "./IconGraphicsAnimator";

export interface GraphicsIconViewInit extends GraphicsViewInit, IconViewInit {
}

export class GraphicsIconView extends LayerView implements IconView {
  @ThemeAnimator({type: Number, state: 0.5, updateFlags: View.NeedsRender})
  readonly xAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 0.5, updateFlags: View.NeedsRender})
  readonly yAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsRender})
  readonly iconWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsRender})
  readonly iconHeight!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<GraphicsIconView, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    updateFlags: View.NeedsRender,
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

  @ThemeAnimator({extends: IconGraphicsAnimator, type: Object, state: null, updateFlags: View.NeedsRender})
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

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.culled) {
      this.renderIcon(renderer, this.viewBounds);
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

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
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

  override init(init: GraphicsIconViewInit): void {
    super.init(init);
    IconView.init(this, init);
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
  configurable: true,
});
