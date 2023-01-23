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

import type {AnyTiming} from "@swim/util";
import {Animator} from "@swim/component";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {GraphicsView} from "../graphics/GraphicsView";
import type {PaintingContext} from "../painting/PaintingContext";
import {PaintingRenderer} from "../painting/PaintingRenderer";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import type {FillViewInit, FillView} from "./FillView";
import type {StrokeViewInit, StrokeView} from "./StrokeView";
import {Rect} from "./Rect";

/** @public */
export type AnyRectView = RectView | Rect | RectViewInit;

/** @public */
export interface RectViewInit extends FillViewInit, StrokeViewInit {
  x?: AnyLength;
  y?: AnyLength;
  width?: AnyLength;
  height?: AnyLength;
}

/** @public */
export class RectView extends GraphicsView implements FillView, StrokeView {
  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly x!: Animator<this, Length, AnyLength>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly y!: Animator<this, Length, AnyLength>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly width!: Animator<this, Length, AnyLength>;

  @Animator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly height!: Animator<this, Length, AnyLength>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  get value(): Rect {
    return new Rect(this.x.getValue(), this.y.getValue(), this.width.getValue(), this.height.getValue());
  }

  get state(): Rect {
    return new Rect(this.x.getState(), this.y.getState(), this.width.getState(), this.height.getState());
  }

  setState(rect: Rect | RectViewInit, timing?: AnyTiming | boolean): void {
    if (rect instanceof Rect) {
      rect = rect.toAny();
    }
    if (rect.x !== void 0) {
      this.x(rect.x, timing);
    }
    if (rect.y !== void 0) {
      this.y(rect.y, timing);
    }
    if (rect.width !== void 0) {
      this.width(rect.width, timing);
    }
    if (rect.height !== void 0) {
      this.height(rect.height, timing);
    }
    if (rect.fill !== void 0) {
      this.fill(rect.fill, timing);
    }
    if (rect.stroke !== void 0) {
      this.stroke(rect.stroke, timing);
    }
    if (rect.strokeWidth !== void 0) {
      this.strokeWidth(rect.strokeWidth, timing);
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
    } else if (this.stroke.value !== null) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== null) {
        // save
        const contextLineWidth = context.lineWidth;

        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        const pointInStroke = context.isPointInStroke(hx, hy);

        // restore
        context.lineWidth = contextLineWidth;

        if (pointInStroke) {
          return this;
        }
      }
    }
    return null;
  }

  override init(init: Rect | RectViewInit): void {
    if (!(init instanceof Rect)) {
      super.init(init);
    }
    this.setState(init);
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
