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

import type {AnyTiming} from "@swim/mapping";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import type {GraphicsView} from "../graphics/GraphicsView";
import {LayerView} from "../layer/LayerView";
import type {CanvasContext} from "../canvas/CanvasContext";
import {CanvasRenderer} from "../canvas/CanvasRenderer";
import type {FillViewInit, FillView} from "./FillView";
import type {StrokeViewInit, StrokeView} from "./StrokeView";
import {Rect} from "./Rect";

export type AnyRectView = RectView | Rect | RectViewInit;

export interface RectViewInit extends FillViewInit, StrokeViewInit {
  x?: AnyLength;
  y?: AnyLength;
  width?: AnyLength;
  height?: AnyLength;
}

export class RectView extends LayerView implements FillView, StrokeView {
  override initView(init: RectViewInit): void {
    super.initView(init);
    this.setState(init);
  }

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly x!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly y!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly width!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly height!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, inherit: true, updateFlags: View.NeedsRender})
  readonly fill!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null, inherit: true, updateFlags: View.NeedsRender})
  readonly stroke!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null, inherit: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ViewAnimator<this, Length | null, AnyLength | null>;

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

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderRect(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderRect(context: CanvasContext, frame: R2Box): void {
    const x = this.x.getValue().pxValue(frame.width);
    const y = this.y.getValue().pxValue(frame.height);
    const width = this.width.getValue().pxValue(frame.width);
    const height = this.height.getValue().pxValue(frame.height);
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
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      const p = renderer.transform.transform(x, y);
      const hit = this.hitTestRect(p.x, p.y, context, this.viewFrame);
      context.restore();
      return hit;
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
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        if (context.isPointInStroke(hx, hy)) {
          return this;
        }
      }
    }
    return null;
  }

  static override create(): RectView {
    return new RectView();
  }

  static fromRect(rect: Rect): RectView {
    const view = new RectView();
    view.setState(rect);
    return view;
  }

  static fromInit(init: RectViewInit): RectView {
    const view = new RectView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyRectView): RectView {
    if (value instanceof RectView) {
      return value;
    } else if (value instanceof Rect) {
      return this.fromRect(value);
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    } else {
      throw new TypeError("" + value);
    }
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
  enumerable: true,
  configurable: true,
});
