// Copyright 2015-2020 Swim inc.
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

import {BoxR2} from "@swim/math";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewAnimator,
  GraphicsViewContext,
  GraphicsView,
  GraphicsViewController,
  GraphicsLeafView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {Rect} from "./Rect";

export type AnyRectView = RectView | Rect | RectViewInit;

export interface RectViewInit extends FillViewInit, StrokeViewInit {
  x?: AnyLength;
  y?: AnyLength;
  width?: AnyLength;
  height?: AnyLength;
}

export class RectView extends GraphicsLeafView implements FillView, StrokeView {
  get viewController(): GraphicsViewController<RectView> | null {
    return this._viewController;
  }

  @ViewAnimator(Length, {value: Length.zero()})
  x: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.zero()})
  y: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.zero()})
  width: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.zero()})
  height: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {inherit: true})
  fill: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Color, {inherit: true})
  stroke: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Length, {inherit: true})
  strokeWidth: ViewAnimator<this, Length, AnyLength>;

  get value(): Rect {
    return new Rect(this.x.value!, this.y.value!, this.width.value!, this.height.value!);
  }

  get state(): Rect {
    return new Rect(this.x.state!, this.y.state!, this.width.state!, this.height.state!);
  }

  setState(rect: Rect | RectViewInit, tween?: Tween<any>): void {
    if (rect instanceof Rect) {
      rect = rect.toAny();
    }
    if (rect.x !== void 0) {
      this.x(rect.x, tween);
    }
    if (rect.y !== void 0) {
      this.y(rect.y, tween);
    }
    if (rect.width !== void 0) {
      this.width(rect.width, tween);
    }
    if (rect.height !== void 0) {
      this.height(rect.height, tween);
    }
    if (rect.fill !== void 0) {
      this.fill(rect.fill, tween);
    }
    if (rect.stroke !== void 0) {
      this.stroke(rect.stroke, tween);
    }
    if (rect.strokeWidth !== void 0) {
      this.strokeWidth(rect.strokeWidth, tween);
    }
    if (rect.hidden !== void 0) {
      this.setHidden(rect.hidden);
    }
    if (rect.culled !== void 0) {
      this.setCulled(rect.culled);
    }
  }

  protected onRender(viewContext: GraphicsViewContext): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderRect(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderRect(context: CanvasContext, frame: BoxR2): void {
    const x = this.x.value!.pxValue(frame.width);
    const y = this.y.value!.pxValue(frame.height);
    const width = this.width.value!.pxValue(frame.width);
    const height = this.height.value!.pxValue(frame.height);
    context.beginPath();
    context.rect(x, y, width, height);
    const fill = this.fill.value;
    if (fill !== void 0) {
      context.fillStyle = fill.toString();
      context.fill();
    }
    const stroke = this.stroke.value;
    if (stroke !== void 0) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
  }

  get viewBounds(): BoxR2 {
    const frame = this.viewFrame;
    const x = this.x.value!.pxValue(frame.width);
    const y = this.y.value!.pxValue(frame.height);
    const width = this.width.value!.pxValue(frame.width);
    const height = this.height.value!.pxValue(frame.height);
    return new BoxR2(x, y, x + width, y + height);
  }

  hitTest(x: number, y: number, viewContext: GraphicsViewContext): GraphicsView | null {
    let hit = super.hitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestRect(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestRect(hx: number, hy: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    const x = this.x.value!.pxValue(frame.width);
    const y = this.y.value!.pxValue(frame.height);
    const width = this.width.value!.pxValue(frame.width);
    const height = this.height.value!.pxValue(frame.height);
    context.beginPath();
    context.rect(x, y, width, height);
    if (this.fill.value !== void 0 && context.isPointInPath(hx, hy)) {
      return this;
    } else if (this.stroke.value !== void 0) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        if (context.isPointInStroke(hx, hy)) {
          return this;
        }
      }
    }
    return null;
  }

  static fromAny(rect: AnyRectView): RectView {
    if (rect instanceof RectView) {
      return rect;
    } else if (rect instanceof Rect || typeof rect === "object" && rect !== null) {
      const view = new RectView();
      view.setState(rect);
      return view;
    }
    throw new TypeError("" + rect);
  }
}
