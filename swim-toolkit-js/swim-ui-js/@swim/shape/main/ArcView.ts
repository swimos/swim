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

import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
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
import {ArcInit, Arc} from "./Arc";

export type AnyArcView = ArcView | Arc | ArcViewInit;

export interface ArcViewInit extends FillViewInit, StrokeViewInit, ArcInit {
}

export class ArcView extends GraphicsLeafView implements FillView, StrokeView {
  get viewController(): GraphicsViewController<ArcView> | null {
    return this._viewController;
  }

  @ViewAnimator(PointR2, {value: PointR2.origin()})
  center: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator(Length, {value: Length.zero()})
  innerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {value: Length.zero()})
  outerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Angle, {value: Angle.zero()})
  startAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator(Angle, {value: Angle.zero()})
  sweepAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator(Angle, {value: Angle.zero()})
  padAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator(Length, {value: null})
  padRadius: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator(Length, {value: Length.zero()})
  cornerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {inherit: true})
  fill: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Color, {inherit: true})
  stroke: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Length, {inherit: true})
  strokeWidth: ViewAnimator<this, Length, AnyLength>;

  get value(): Arc {
    return new Arc(this.center.value!, this.innerRadius.value!, this.outerRadius.value!,
                   this.startAngle.value!, this.sweepAngle.value!, this.padAngle.value!,
                   this.padRadius.value!, this.cornerRadius.value!);
  }

  get state(): Arc {
    return new Arc(this.center.state!, this.innerRadius.state!, this.outerRadius.state!,
                   this.startAngle.state!, this.sweepAngle.state!, this.padAngle.state!,
                   this.padRadius.state!, this.cornerRadius.state!);
  }

  setState(arc: Arc | ArcViewInit, tween?: Tween<any>): void {
    if (arc instanceof Arc) {
      arc = arc.toAny();
    }
    if (arc.center !== void 0) {
      this.center(arc.center, tween);
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
    if (arc.hidden !== void 0) {
      this.setHidden(arc.hidden);
    }
    if (arc.culled !== void 0) {
      this.setCulled(arc.culled);
    }
  }

  protected onRender(viewContext: GraphicsViewContext): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderArc(renderer.context, this.viewFrame);
      context.restore();
    }
  }

  protected renderArc(context: CanvasContext, frame: BoxR2): void {
    const arc = this.value;
    arc.draw(context, frame);
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

  get popoverFrame(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const center = this.center.value!;
    const [px, py] = inversePageTransform.transform(center.x, center.y);
    const r = (this.innerRadius.value!.pxValue(size) + this.outerRadius.value!.pxValue(size)) / 2;
    const a = this.startAngle.value!.radValue() + this.sweepAngle.value!.radValue() / 2;
    const x = px + r * Math.cos(a);
    const y = py + r * Math.sin(a);
    return new BoxR2(x, y, x, y);
  }

  get viewBounds(): BoxR2 {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const center = this.center.value!;
    const radius = this.outerRadius.value!.pxValue(size);
    return new BoxR2(center.x - radius, center.y - radius,
                     center.x + radius, center.y + radius);
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
        hit = this.hitTestArc(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
    context.beginPath();
    const arc = this.value;
    arc.draw(context, frame);
    if (this.fill.value !== void 0 && context.isPointInPath(x, y)) {
      return this;
    } else if (this.stroke.value !== void 0) {
      const strokeWidth = this.strokeWidth.value;
      if (strokeWidth !== void 0) {
        const size = Math.min(frame.width, frame.height);
        context.lineWidth = strokeWidth.pxValue(size);
        if (context.isPointInStroke(x, y)) {
          return this;
        }
      }
    }
    return null;
  }

  static fromAny(arc: AnyArcView): ArcView {
    if (arc instanceof ArcView) {
      return arc;
    } else if (arc instanceof Arc || typeof arc === "object" && arc !== null) {
      const view = new ArcView();
      view.setState(arc);
      return view;
    }
    throw new TypeError("" + arc);
  }
}
