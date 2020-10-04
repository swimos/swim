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

import {PointR2, BoxR2} from "@swim/math";
import {ContinuousScale} from "@swim/scale";
import {CanvasContext} from "@swim/render";
import {ViewAnimator, ContinuousScaleViewAnimator} from "@swim/view";
import {TickView} from "../tick/TickView";
import {AxisOrientation, AxisView} from "./AxisView";

export class RightAxisView<Y = unknown> extends AxisView<Y> {
  get orientation(): AxisOrientation {
    return "right";
  }

  @ViewAnimator({type: ContinuousScale, inherit: "yScale"})
  scale: ContinuousScaleViewAnimator<this, Y, number>;

  protected layoutTick(tick: TickView<Y>, origin: PointR2, frame: BoxR2,
                       scale: ContinuousScale<Y, number>): void {
    if (tick.anchor.isAuto()) {
      tick._offset = scale.scale(tick._value);
      tick.anchor.setAutoState(new PointR2(origin.x, frame.yMin + tick._offset));
    }
  }

  protected renderDomain(context: CanvasContext, origin: PointR2, frame: BoxR2): void {
    const borderWidth = this.borderWidth.value;
    if (borderWidth !== void 0 && borderWidth !== 0) {
      const x = origin.x;
      const dx = this.borderSerif.getValue();
      const y0 = frame.yMin;
      const y1 = frame.yMax;

      context.beginPath();
      context.strokeStyle = this.borderColor.getValue().toString();
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
}
AxisView.Right = RightAxisView;
