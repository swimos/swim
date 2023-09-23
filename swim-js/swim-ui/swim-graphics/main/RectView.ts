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

import type {TimingLike} from "@swim/util";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {GraphicsView} from "./GraphicsView";
import type {PaintingContext} from "./PaintingContext";
import {PaintingRenderer} from "./PaintingRenderer";
import type {CanvasContext} from "./CanvasContext";
import {CanvasRenderer} from "./CanvasRenderer";
import type {FillView} from "./FillView";
import type {StrokeView} from "./StrokeView";
import type {RectInit} from "./Rect";
import {Rect} from "./Rect";

/** @public */
export class RectView extends GraphicsView implements FillView, StrokeView {
  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly x!: Animator<this, Length>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly y!: Animator<this, Length>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly width!: Animator<this, Length>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly height!: Animator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  get value(): Rect {
    return new Rect(this.x.getValue(), this.y.getValue(), this.width.getValue(), this.height.getValue());
  }

  get state(): Rect {
    return new Rect(this.x.getState(), this.y.getState(), this.width.getState(), this.height.getState());
  }

  setState(rect: Rect | RectInit, timing?: TimingLike | boolean): void {
    if (rect instanceof Rect) {
      rect = rect.toLike();
    }
    if (rect.x !== void 0) {
      this.x.setState(rect.x, timing);
    }
    if (rect.y !== void 0) {
      this.y.setState(rect.y, timing);
    }
    if (rect.width !== void 0) {
      this.width.setState(rect.width, timing);
    }
    if (rect.height !== void 0) {
      this.height.setState(rect.height, timing);
    }
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderRect(renderer.context, this.viewFrame);
    }
  }

  protected renderRect(context: PaintingContext, frame: R2Box): void {
    const x = this.x.getValue().pxValue(frame.width);
    const y = this.y.getValue().pxValue(frame.height);
    const width = this.width.getValue().pxValue(frame.width);
    const height = this.height.getValue().pxValue(frame.height);

    // save
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.rect(x, y, width, height);

    const fill = this.fill.value;
    if (fill !== null) {
      context.fillStyle = fill.toString();
      context.fill();
    }

    const stroke = this.stroke.value;
    if (stroke !== null) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }

    // restore
    context.fillStyle = contextFillStyle;
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestRect(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestRect(hx: number, hy: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const x = this.x.getValue().pxValue(frame.width);
    const y = this.y.getValue().pxValue(frame.height);
    const width = this.width.getValue().pxValue(frame.width);
    const height = this.height.getValue().pxValue(frame.height);
    context.beginPath();
    context.rect(x, y, width, height);

    if (this.fill.value !== null && context.isPointInPath(hx, hy)) {
      return this;
    }
    let strokeWidth: Length | null;
    if (this.stroke.value === null || (strokeWidth = this.strokeWidth.value) === null) {
      return null;
    }

    // save
    const contextLineWidth = context.lineWidth;

    const size = Math.min(frame.width, frame.height);
    context.lineWidth = strokeWidth.pxValue(size);
    const pointInStroke = context.isPointInStroke(hx, hy);

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }
}
Object.defineProperty(RectView.prototype, "viewBounds", {
  get(this: RectView): R2Box {
    const frame = this.viewFrame;
    const x = this.x.getValue().pxValue(frame.width);
    const y = this.y.getValue().pxValue(frame.height);
    const width = this.width.getValue().pxValue(frame.width);
    const height = this.height.getValue().pxValue(frame.height);
    return new R2Box(x, y, x + width, y + height);
  },
  configurable: true,
});
