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

export class BottomAxisView<X> extends AxisView<X> {
  get orientation(): AxisOrientation {
    return "bottom";
  }

  @ViewAnimator({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: "xScale",
    state: null,
    updateFlags: View.NeedsLayout,
  })
  declare scale: ContinuousScaleAnimator<this, X, number>;

  protected layoutTick(tick: TickView<X>, origin: PointR2, frame: BoxR2,
                       scale: ContinuousScale<X, number>): void {
    if (tick.anchor.isPrecedent(View.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setState(new PointR2(frame.xMin + offset, origin.y), View.Intrinsic);
    }
  }

  protected renderDomain(context: CanvasContext, origin: PointR2, frame: BoxR2): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor !== null && borderWidth !== 0) {
      const x0 = frame.xMin;
      const x1 = frame.xMax;
      const y = origin.y;
      const dy = this.borderSerif.getValue();

      context.beginPath();
      context.strokeStyle = borderColor.toString();
      context.lineWidth = borderWidth;
      if (dy !== 0) {
        context.moveTo(x0, y + dy);
        context.lineTo(x0, y);
        context.lineTo(x1, y);
        context.lineTo(x1, y + dy);
      } else {
        context.moveTo(x0, y);
        context.lineTo(x1, y);
      }
      context.stroke();
    }
  }

  static create<X>(): BottomAxisView<X> {
    return new BottomAxisView<X>();
  }

  static fromInit<X>(init: AxisViewInit<X>): BottomAxisView<X> {
    const view = new BottomAxisView<X>();
    view.initView(init)
    return view;
  }

  static fromAny<X>(value: AnyAxisView<X> | true): BottomAxisView<X> {
    if (value instanceof BottomAxisView) {
      return value;
    } else if (value === true) {
      return new BottomAxisView<X>();
    } else if (typeof value === "object" && value !== null && !(value instanceof AxisView)) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
