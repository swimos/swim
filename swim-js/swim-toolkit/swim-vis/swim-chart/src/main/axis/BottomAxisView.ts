// Copyright 2015-2023 Swim.inc
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

import type {ContinuousScale} from "@swim/util";
import {Affinity} from "@swim/component";
import {R2Point, R2Box} from "@swim/math";
import {View} from "@swim/view";
import type {PaintingContext} from "@swim/graphics";
import {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {TickView} from "../tick/TickView";
import {AxisOrientation, AxisView} from "./AxisView";

/** @public */
export class BottomAxisView<X = unknown> extends AxisView<X> {
  override get orientation(): AxisOrientation {
    return "bottom";
  }

  @ContinuousScaleAnimator<BottomAxisView<X>["scale"]>({
    value: null,
    inherits: "xScale",
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, X, number>;

  protected override layoutTick(tick: TickView<X>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<X, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setState(new R2Point(frame.xMin + offset, origin.y), Affinity.Intrinsic);
    }
  }

  protected override renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor !== null && borderWidth !== 0) {
      const x0 = frame.xMin;
      const x1 = frame.xMax;
      const y = origin.y;
      const dy = this.borderSerif.getValue();

      // save
      const contextLineWidth = context.lineWidth;
      const contextStrokeStyle = context.strokeStyle;

      context.beginPath();
      context.lineWidth = borderWidth;
      context.strokeStyle = borderColor.toString();
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

      // restore
      context.lineWidth = contextLineWidth;
      context.strokeStyle = contextStrokeStyle;
    }
  }
}
