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

import {ContinuousScale} from "@swim/util";
import {Affinity, Animator} from "@swim/fastener";
import {R2Point, R2Box} from "@swim/math";
import {View} from "@swim/view";
import type {CanvasContext} from "@swim/graphics";
import {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {TickView} from "../tick/TickView";
import {AxisOrientation, AxisView} from "./AxisView";

export class LeftAxisView<Y = unknown> extends AxisView<Y> {
  override get orientation(): AxisOrientation {
    return "left";
  }

  @Animator({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherits: "yScale",
    state: null,
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, Y, number>;

  protected override layoutTick(tick: TickView<Y>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<Y, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setState(new R2Point(origin.x, frame.yMin + offset), Affinity.Intrinsic);
    }
  }

  protected override renderDomain(context: CanvasContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor !== null && borderWidth !== 0) {
      const x = origin.x;
      const dx = this.borderSerif.getValue();
      const y0 = frame.yMin;
      const y1 = frame.yMax;

      // save
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      context.beginPath();
      context.lineWidth = borderWidth;
      context.strokeStyle = borderColor.toString();
      if (dx !== 0) {
        context.moveTo(x - dx, y0);
        context.lineTo(x,      y0);
        context.lineTo(x,      y1);
        context.lineTo(x - dx, y1);
      } else {
        context.moveTo(x, y0);
        context.lineTo(x, y1);
      }
      context.stroke();

      // restore
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }
}
