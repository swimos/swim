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
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {R2Point} from "@swim/math";
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
import type {ArcInit} from "./Arc";
import {Arc} from "./Arc";

/** @public */
export class ArcView extends GraphicsView implements FillView, StrokeView {
  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsRender})
  readonly xAlign!: Animator<this, number>;

  @Animator({valueType: Number, value: 0.5, updateFlags: View.NeedsRender})
  readonly yAlign!: Animator<this, number>;

  @Animator({valueType: R2Point, value: R2Point.origin(), updateFlags: View.NeedsRender})
  readonly center!: Animator<this, R2Point>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly startAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly sweepAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Angle, value: Angle.zero(), updateFlags: View.NeedsRender})
  readonly padAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsRender})
  readonly padRadius!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero(), updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  get value(): Arc {
    return new Arc(this.center.value, this.innerRadius.value, this.outerRadius.value,
                   this.startAngle.value, this.sweepAngle.value, this.padAngle.value,
                   this.padRadius.value, this.cornerRadius.value);
  }

  get state(): Arc {
    return new Arc(this.center.state, this.innerRadius.state, this.outerRadius.state,
                   this.startAngle.state, this.sweepAngle.state, this.padAngle.state,
                   this.padRadius.state, this.cornerRadius.state);
  }

  setState(arc: Arc | ArcInit, timing?: TimingLike | boolean): void {
    if (arc instanceof Arc) {
      arc = arc.toLike();
    }
    if (arc.center !== void 0) {
      this.center.setState(arc.center, timing);
    }
    if (arc.innerRadius !== void 0) {
      this.innerRadius.setState(arc.innerRadius, timing);
    }
    if (arc.outerRadius !== void 0) {
      this.outerRadius.setState(arc.outerRadius, timing);
    }
    if (arc.startAngle !== void 0) {
      this.startAngle.setState(arc.startAngle, timing);
    }
    if (arc.sweepAngle !== void 0) {
      this.sweepAngle.setState(arc.sweepAngle, timing);
    }
    if (arc.padAngle !== void 0) {
      this.padAngle.setState(arc.padAngle, timing);
    }
    if (arc.padRadius !== void 0) {
      this.padRadius.setState(arc.padRadius, timing);
    }
    if (arc.cornerRadius !== void 0) {
      this.cornerRadius.setState(arc.cornerRadius, timing);
    }
  }

  protected layoutArc(): void {
    if (this.center.hasAffinity(Affinity.Intrinsic)) {
      const viewFrame = this.viewFrame;
      const cx = viewFrame.xMin + viewFrame.width * this.xAlign.getValue();
      const cy = viewFrame.yMin + viewFrame.height * this.yAlign.getValue();
      this.center.setIntrinsic(new R2Point(cx, cy));
    }
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.layoutArc();
      this.renderArc(renderer.context, this.viewFrame);
    }
  }

  protected renderArc(context: PaintingContext, frame: R2Box): void {
    // save
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const arc = this.value;
    context.beginPath();
    arc.draw(context, frame);

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

  override get popoverFrame(): R2Box {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const inversePageTransform = this.pageTransform.inverse();
    const center = this.center.getValue();
    const px = inversePageTransform.transformX(center.x, center.y);
    const py = inversePageTransform.transformY(center.x, center.y);
    const r = (this.innerRadius.getValue().pxValue(size) + this.outerRadius.getValue().pxValue(size)) / 2;
    const a = this.startAngle.getValue().radValue() + this.sweepAngle.getValue().radValue() / 2;
    const x = px + r * Math.cos(a);
    const y = py + r * Math.sin(a);
    return new R2Box(x, y, x, y);
  }

  declare readonly viewBounds: R2Box; // getter defined below to work around useDefineForClassFields lunacy

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      this.layoutArc();
      return this.hitTestArc(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestArc(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const arc = this.value;
    context.beginPath();
    arc.draw(context, frame);

    let strokeWidth: Length | null;
    if (this.fill.value !== null && context.isPointInPath(x, y)) {
      return this;
    } else if (this.stroke.value === null || (strokeWidth = this.strokeWidth.value) === null) {
      return null;
    }

    // save
    const contextLineWidth = context.lineWidth;

    const size = Math.min(frame.width, frame.height);
    context.lineWidth = strokeWidth.pxValue(size);
    const pointInStroke = context.isPointInStroke(x, y);

    // restore
    context.lineWidth = contextLineWidth;

    return pointInStroke ? this : null;
  }
}
Object.defineProperty(ArcView.prototype, "viewBounds", {
  get(this: ArcView): R2Box {
    const frame = this.viewFrame;
    const size = Math.min(frame.width, frame.height);
    const center = this.center.getValue();
    const radius = this.outerRadius.getValue().pxValue(size);
    return new R2Box(center.x - radius, center.y - radius,
                     center.x + radius, center.y + radius);
  },
  configurable: true,
});
