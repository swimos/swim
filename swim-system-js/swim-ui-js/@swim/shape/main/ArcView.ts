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

import {AnyAngle, Angle} from "@swim/angle";
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
import {ArcInit, Arc} from "./Arc";

export type AnyArcView = ArcView | Arc | ArcViewInit;

export interface ArcViewInit extends ViewInit, FillViewInit, StrokeViewInit, ArcInit {
}

export class ArcView extends GraphicView implements FillView, StrokeView {
  /** @hidden */
  _viewController: GraphicViewController<ArcView> | null;

  constructor(innerRadius: Length = Length.zero(), outerRadius: Length = Length.zero(),
              startAngle: Angle = Angle.zero(), sweepAngle: Angle = Angle.zero(),
              padAngle: Angle = Angle.zero(), padRadius: Length | null = null,
              cornerRadius: Length = Length.zero()) {
    super();
    this.innerRadius.setState(innerRadius);
    this.outerRadius.setState(outerRadius);
    this.startAngle.setState(startAngle);
    this.sweepAngle.setState(sweepAngle);
    this.padAngle.setState(padAngle);
    this.padRadius.setState(padRadius);
    this.cornerRadius.setState(cornerRadius);
  }

  get viewController(): GraphicViewController<ArcView> | null {
    return this._viewController;
  }

  @MemberAnimator(Length)
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle)
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle)
  sweepAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle)
  padAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length)
  padRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, "inherit")
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, "inherit")
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, "inherit")
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  get value(): Arc {
    return new Arc(this.innerRadius.value!, this.outerRadius.value!, this.startAngle.value!,
                   this.sweepAngle.value!, this.padAngle.value!, this.padRadius.value!,
                   this.cornerRadius.value!);
  }

  get state(): Arc {
    return new Arc(this.innerRadius.state!, this.outerRadius.state!, this.startAngle.state!,
                   this.sweepAngle.state!, this.padAngle.state!, this.padRadius.state!,
                   this.cornerRadius.state!);
  }

  setState(arc: Arc | ArcViewInit, tween?: Tween<any>): void {
    if (arc instanceof Arc) {
      arc = arc.toAny();
    }
    if (arc.key !== void 0) {
      this.key(arc.key);
    }
    if (arc.innerRadius !== void 0) {
      this.innerRadius(arc.innerRadius, tween);
    }
    if (arc.outerRadius !== void 0) {
      this.outerRadius(arc.outerRadius, tween);
    }
    if (arc.startAngle !== void 0) {
      this.startAngle(arc.startAngle, tween);
    }
    if (arc.sweepAngle !== void 0) {
      this.sweepAngle(arc.sweepAngle, tween);
    }
    if (arc.padAngle !== void 0) {
      this.padAngle(arc.padAngle, tween);
    }
    if (arc.padRadius !== void 0) {
      this.padRadius(arc.padRadius, tween);
    }
    if (arc.cornerRadius !== void 0) {
      this.cornerRadius(arc.cornerRadius, tween);
    }
    if (arc.fill !== void 0) {
      this.fill(arc.fill, tween);
    }
    if (arc.stroke !== void 0) {
      this.stroke(arc.stroke, tween);
    }
    if (arc.strokeWidth !== void 0) {
      this.strokeWidth(arc.strokeWidth, tween);
    }
  }

  protected onAnimate(t: number): void {
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
    this.startAngle.onFrame(t);
    this.sweepAngle.onFrame(t);
    this.padAngle.onFrame(t);
    this.padRadius.onFrame(t);
    this.cornerRadius.onFrame(t);
    this.fill.onFrame(t);
    this.stroke.onFrame(t);
    this.strokeWidth.onFrame(t);
  }

  protected onRender(context: RenderingContext): void {
    context.save();
    const bounds = this._bounds;
    const arc = this.value;
    arc.render(context, bounds, this._anchor);
    const fill = this.fill.value;
    if (fill) {
      context.fillStyle = fill.toString();
      context.fill();
    }
    const stroke = this.stroke.value;
    if (stroke) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth) {
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
      const bounds = this._bounds;
      const arc = this.value;
      arc.render(context, bounds, this._anchor);
      if (this.fill.value && context.isPointInPath(x, y)) {
        hit = this;
      } else if (this.stroke.value) {
        const strokeWidth = this.strokeWidth.value;
        if (strokeWidth) {
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

  static from(innerRadius: AnyLength = Length.zero(),
              outerRadius: AnyLength = Length.zero(),
              startAngle: AnyAngle = Angle.zero(),
              sweepAngle: AnyAngle = Angle.zero(),
              padAngle: AnyAngle = Angle.zero(),
              padRadius: AnyLength | null = null,
              cornerRadius: AnyLength = Length.zero(),
              fill?: AnyColor | null,
              stroke?: AnyColor | null,
              strokeWidth?: AnyLength | null): ArcView {
    innerRadius = Length.fromAny(innerRadius);
    outerRadius = Length.fromAny(outerRadius);
    startAngle = Angle.fromAny(startAngle);
    sweepAngle = Angle.fromAny(sweepAngle);
    padAngle = Angle.fromAny(padAngle);
    padRadius = padRadius !== null ? Length.fromAny(padRadius) : null;
    cornerRadius = Length.fromAny(cornerRadius);
    const view = new ArcView(innerRadius, outerRadius, startAngle, sweepAngle,
                             padAngle, padRadius, cornerRadius);
    if (fill !== void 0) {
      view.fill(fill);
    }
    if (stroke !== void 0) {
      view.stroke(stroke);
    }
    if (strokeWidth !== void 0) {
      view.strokeWidth(strokeWidth);
    }
    return view;
  }

  static fromAny(arc: AnyArcView): ArcView {
    if (arc instanceof ArcView) {
      return arc;
    } else if (arc instanceof Arc) {
      return new ArcView(arc.innerRadius(), arc.outerRadius(), arc.startAngle(),
                         arc.sweepAngle(), arc.padAngle(), arc.padRadius(),
                         arc.cornerRadius());
    } else if (typeof arc === "object" && arc) {
      const view = new ArcView();
      view.setState(arc);
      return view;
    }
    throw new TypeError("" + arc);
  }
}
