// Copyright 2015-2019 SWIM.AI inc.
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

import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {Tween} from "@swim/transition";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  RenderView,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {Rect} from "./Rect";

export type AnyRectView = RectView | Rect | RectViewInit;

export interface RectViewInit extends ViewInit, FillViewInit, StrokeViewInit {
  x?: AnyLength;
  y?: AnyLength;
  width?: AnyLength;
  height?: AnyLength;
}

export class RectView extends GraphicView implements FillView, StrokeView {
  /** @hidden */
  _viewController: GraphicViewController<RectView> | null;

  constructor(x: Length = Length.zero(), y: Length = Length.zero(),
              width: Length = Length.zero(), height: Length = Length.zero()) {
    super();
    this.x.setState(x);
    this.y.setState(y);
    this.width.setState(width);
    this.height.setState(height);
  }

  get viewController(): GraphicViewController<RectView> | null {
    return this._viewController;
  }

  @MemberAnimator(Length)
  x: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  y: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  width: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  height: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, "inherit")
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, "inherit")
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, "inherit")
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

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
    if (rect.key !== void 0) {
      this.key(rect.key);
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
  }

  protected onAnimate(t: number): void {
    this.x.onFrame(t);
    this.y.onFrame(t);
    this.width.onFrame(t);
    this.height.onFrame(t);
    this.fill.onFrame(t);
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);
  }

  protected onRender(context: RenderingContext): void {
    context.save();
    context.beginPath();
    context.rect(this.x.value!.pxValue(), this.y.value!.pxValue(),
                 this.width.value!.pxValue(), this.height.value!.pxValue());
    const fill = this.fill.value;
    if (fill) {
      context.fillStyle = fill.toString();
      context.fill();
    }
    const stroke = this.stroke.value;
    if (stroke) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth) {
        const bounds = this._bounds;
        const size = Math.min(bounds.width, bounds.height);
        context.lineWidth = strokeWidth.pxValue(size);
      }
      context.strokeStyle = stroke.toString();
      context.stroke();
    }
    context.restore();
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    let hit = super.hitTest(x, y, context);
    if (hit === null) {
      context.save();
      const pixelRatio = this.pixelRatio;
      x *= pixelRatio;
      y *= pixelRatio;
      context.beginPath();
      context.rect(this.x.value!.pxValue(), this.y.value!.pxValue(),
                   this.width.value!.pxValue(), this.height.value!.pxValue());
      if (this.fill.value && context.isPointInPath(x, y)) {
        hit = this;
      } else if (this.stroke.value) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth) {
          const bounds = this._bounds;
          const size = Math.min(bounds.width, bounds.height);
          context.lineWidth = strokeWidth.pxValue(size);
          if (context.isPointInStroke(x, y)) {
            hit = this;
          }
        }
      }
      context.restore();
    }
    return hit;
  }

  static fromAny(rect: AnyRectView): RectView {
    if (rect instanceof RectView) {
      return rect;
    } else if (rect instanceof Rect) {
      return new RectView(rect.x(), rect.y(), rect.width(), rect.height());
    } else if (typeof rect === "object" && rect) {
      const view = new RectView();
      view.setState(rect);
      return view;
    }
    throw new TypeError("" + rect);
  }
}
