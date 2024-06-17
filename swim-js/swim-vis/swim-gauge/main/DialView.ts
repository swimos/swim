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

import type {Class} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Property} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {FillView} from "@swim/graphics";
import {Arc} from "@swim/graphics";
import {TypesetView} from "@swim/graphics";
import {TextRunView} from "@swim/graphics";

/** @public */
export type DialViewArrangement = "auto" | "manual";

/** @public */
export interface DialViewObserver<V extends DialView = DialView> extends GraphicsViewObserver<V> {
  viewDidSetValue?(value: number, view: V): void;

  viewDidSetLimit?(limit: number, view: V): void;

  viewWillAttachLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachLabel?(labelView: GraphicsView, view: V): void;

  viewWillAttachLegend?(legendView: GraphicsView, view: V): void;

  viewDidDetachLegend?(legendView: GraphicsView, view: V): void;
}

/** @public */
export class DialView extends GraphicsView {
  declare readonly observerType?: Class<DialViewObserver>;

  @Animator({
    valueType: Number,
    value: 0,
    updateFlags: View.NeedsRender,
    didSetValue(value: number): void {
      this.owner.callObservers("viewDidSetValue", value, this.owner);
    },
  })
  readonly value!: Animator<this, number>;

  @Animator({
    valueType: Number,
    value: 1,
    updateFlags: View.NeedsRender,
    didSetValue(limit: number): void {
      this.owner.callObservers("viewDidSetLimit", limit, this.owner);
    },
  })
  readonly limit!: Animator<this, number>;

  @Animator({valueType: R2Point, value: R2Point.origin(), inherits: true, updateFlags: View.NeedsRender})
  readonly center!: Animator<this, R2Point>;

  @ThemeAnimator({valueType: Length, value: Length.pct(30), inherits: true, updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.pct(40), inherits: true, updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Angle, value: Angle.rad(-Math.PI / 2), inherits: true, updateFlags: View.NeedsRender})
  readonly startAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Angle, value: Angle.rad(2 * Math.PI), inherits: true, updateFlags: View.NeedsRender})
  readonly sweepAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Length, value: Length.pct(50), inherits: true, updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.etchColor, inherits: true, updateFlags: View.NeedsRender})
  readonly dialColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.accentColor, inherits: true, updateFlags: View.NeedsRender})
  readonly meterColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: Length.pct(50), inherits: true, updateFlags: View.NeedsRender})
  readonly labelPadding!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Number, value: 1, inherits: true, updateFlags: View.NeedsRender})
  readonly tickAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Length, value: Length.pct(45), inherits: true, updateFlags: View.NeedsRender})
  readonly tickRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.pct(50), inherits: true, updateFlags: View.NeedsRender})
  readonly tickLength!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(1), inherits: true, updateFlags: View.NeedsRender})
  readonly tickWidth!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(2), inherits: true, updateFlags: View.NeedsRender})
  readonly tickPadding!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.legendColor, inherits: true, updateFlags: View.NeedsRender})
  readonly tickColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.legendColor, inherits: true, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachLabel", labelView, this.owner);
    },
    fromLike(value: GraphicsView | LikeType<GraphicsView> | string | undefined): GraphicsView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        if (view instanceof TextRunView) {
          view.text.setState(value !== void 0 ? value : "");
        }
        return view;
      }
      return super.fromLike(value);
    },
  })
  readonly label!: ViewRef<this, Like<GraphicsView, string | undefined>>;

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachLegend", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachLegend", legendView, this.owner);
    },
    fromLike(value: GraphicsView | LikeType<GraphicsView> | string | undefined): GraphicsView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        if (view instanceof TextRunView) {
          view.text.setState(value !== void 0 ? value : "");
        }
        return view;
      }
      return super.fromLike(value);
    },
  })
  readonly legend!: ViewRef<this, Like<GraphicsView, string | undefined>>;

  @Property({valueType: String, value: "auto"})
  readonly arrangement!: Property<this, DialViewArrangement>;

  protected override onLayout(): void {
    super.onLayout();
    this.center.recohere(this.updateTime);
  }

  protected override onRender(): void {
    super.onRender();
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer && !this.hidden && !this.culled) {
      const context = renderer.context;
      context.save();
      this.renderDial(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderDial(context: CanvasContext, frame: R2Box): void {
    const width = frame.width;
    const height = frame.height;
    const size = Math.min(width, height);
    const value = this.value.getValue();
    const limit = this.limit.getValue();
    const delta = limit !== 0 ? value / limit : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue().rad();
    const sweepAngle = this.sweepAngle.getValue().rad();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);
    const meter = dial.withSweepAngle(sweepAngle.times(delta));

    context.save();

    context.beginPath();
    const dialColor = this.dialColor.value;
    if (dialColor !== null) {
      context.fillStyle = dialColor.toString();
    }
    dial.draw(context, frame);
    if (dialColor !== null) {
      context.fill();
    }
    context.clip();

    const meterColor = this.meterColor.value;
    if (meterColor !== null) {
      context.beginPath();
      context.fillStyle = meterColor.toString();
      meter.draw(context, frame);
      context.fill();
    }

    context.restore();

    const labelView = this.label.view;
    if (labelView !== null && !labelView.hidden) {
      const r = (innerRadius.value + outerRadius.value) / 2;
      const rx = r * Math.cos(startAngle.value + Equivalent.Epsilon);
      const ry = r * Math.sin(startAngle.value + Equivalent.Epsilon);

      let textAlign: CanvasTextAlign;
      if (rx >= 0) {
        if (ry >= 0) { // top-right
          textAlign = "start";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        if (ry < 0) { // bottom-left
          textAlign = "end";
        } else { // top-left
          textAlign = "start";
        }
      }
      const padAngle = startAngle.value - Math.PI / 2;
      const labelPadding = this.labelPadding.getValue().pxValue(deltaRadius);
      const dx = labelPadding * Math.cos(padAngle);
      const dy = labelPadding * Math.sin(padAngle);

      if (TypesetView[Symbol.hasInstance](labelView)) {
        labelView.setIntrinsic({
          textAlign,
          textBaseline: "middle",
          textOrigin: new R2Point(center.x + rx + dx, center.y + ry + dy),
        });
      }
    }

    const legendView = this.legend.view;
    if (legendView !== null && !legendView.hidden) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * delta * tickAlign;
      const tickRadius = this.tickRadius.getValue().pxValue(size);
      const tickLength = this.tickLength.getValue().pxValue(width);
      const tickWidth = this.tickWidth.getValue().pxValue(size);
      const tickColor = this.tickColor.value;

      const cx = center.x;
      const cy = center.y;
      const r1x = outerRadius.value * Math.cos(tickAngle + Equivalent.Epsilon);
      const r1y = outerRadius.value * Math.sin(tickAngle + Equivalent.Epsilon);
      const r2x = tickRadius * Math.cos(tickAngle + Equivalent.Epsilon);
      const r2y = tickRadius * Math.sin(tickAngle + Equivalent.Epsilon);
      let dx = 0;

      if (tickColor !== null) {
        context.beginPath();
        context.lineWidth = tickWidth;
        context.strokeStyle = tickColor.toString();
        context.moveTo(cx + r1x, cy + r1y);
        context.lineTo(cx + r2x, cy + r2y);
        if (tickLength !== 0) {
          if (r2x >= 0) {
            context.lineTo(cx + tickLength, cy + r2y);
            dx = tickLength - r2x;
          } else if (r2x < 0) {
            context.lineTo(cx - tickLength, cy + r2y);
            dx = tickLength + r2x;
          }
        }
        context.stroke();
      }

      let textAlign: CanvasTextAlign;
      if (r2x >= 0) {
        if (r2y >= 0) { // top-right
          textAlign = "end";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        dx = -dx;
        if (r2y < 0) { // bottom-left
          textAlign = "start";
        } else { // top-left
          textAlign = "start";
        }
      }

      if (TypesetView[Symbol.hasInstance](legendView)) {
        const tickPadding = this.tickPadding.getValue().pxValue(size);
        if (FillView[Symbol.hasInstance](legendView)) {
          legendView.fill.setIntrinsic(tickColor);
        }
        legendView.setIntrinsic({
          textAlign,
          textBaseline: "alphabetic",
          textOrigin: new R2Point(cx + r2x + dx, cy + r2y - tickPadding),
        });
      }
    }
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestDial(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestDial(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue();
    const sweepAngle = this.sweepAngle.getValue();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);

    context.beginPath();
    dial.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }
}
