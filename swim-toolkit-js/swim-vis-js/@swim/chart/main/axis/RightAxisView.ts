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

import {ContinuousScale} from "@swim/mapping";
import {PointR2, BoxR2} from "@swim/math";
import {View, ViewAnimator} from "@swim/view";
import type {CanvasContext} from "@swim/graphics";
import {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {TickView} from "../tick/TickView";
import {AxisOrientation, AnyAxisView, AxisViewInit, AxisView} from "./AxisView";

export class RightAxisView<Y> extends AxisView<Y> {
  get orientation(): AxisOrientation {
    return "right";
  }

  @ViewAnimator({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: "yScale",
    state: null,
    updateFlags: View.NeedsLayout,
  })
  declare scale: ContinuousScaleAnimator<this, Y, number>;

  protected layoutTick(tick: TickView<Y>, origin: PointR2, frame: BoxR2,
                       scale: ContinuousScale<Y, number>): void {
    if (tick.anchor.takesPrecedence(View.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setState(new PointR2(origin.x, frame.yMin + offset), View.Intrinsic);
    }
  }

  protected renderDomain(context: CanvasContext, origin: PointR2, frame: BoxR2): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor !== null && borderWidth !== 0) {
      const x = origin.x;
      const dx = this.borderSerif.getValue();
      const y0 = frame.yMin;
      const y1 = frame.yMax;

      context.beginPath();
      context.strokeStyle = borderColor.toString();
      context.lineWidth = borderWidth;
      if (dx !== 0) {
        context.moveTo(x + dx, y0);
        context.lineTo(x,      y0);
        context.lineTo(x,      y1);
        context.lineTo(x + dx, y1);
      } else {
        context.moveTo(x, y0);
        context.lineTo(x, y1);
      }
      context.stroke();
    }
  }

  static create<Y>(): RightAxisView<Y> {
    return new RightAxisView<Y>();
  }

  static fromInit<Y>(init: AxisViewInit<Y>): RightAxisView<Y> {
    const view = new RightAxisView<Y>();
    view.initView(init)
    return view;
  }

  static fromAny<Y>(value: AnyAxisView<Y> | true): RightAxisView<Y> {
    if (value instanceof RightAxisView) {
      return value;
    } else if (value === true) {
      return new RightAxisView<Y>();
    } else if (typeof value === "object" && value !== null && !(value instanceof AxisView)) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
