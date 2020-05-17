// Copyright 2015-2020 SWIM.AI inc.
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
import {TickView} from "../tick/TickView";
import {AxisOrientation, AxisView} from "./AxisView";

export class RightAxisView<D> extends AxisView<D> {
  constructor(scale: ContinuousScale<D, number>) {
    super(scale);
  }

  get orientation(): AxisOrientation {
    return "right";
  }

  protected renderDomain(context: CanvasContext, frame: BoxR2): void {
    const origin = this.origin.value!;
    const x0 = origin.x;
    const y0 = origin.y;
    const [dy0, dy1] = this.scale.value!.range();
    const dx = this.domainSerif.value!;

    context.beginPath();
    context.strokeStyle = this.domainColor.value!.toString();
    context.lineWidth = this.domainWidth.value!;
    if (dx !== 0) {
      context.moveTo(x0 + dx, y0 + dy0);
      context.lineTo(x0,      y0 + dy0);
      context.lineTo(x0,      y0 + dy1);
      context.lineTo(x0 + dx, y0 + dy1);
    } else {
      context.moveTo(x0, y0 + dy0);
      context.lineTo(x0, y0 + dy1);
    }
    context.stroke();
  }

  protected layoutTick(tick: TickView<D>, frame: BoxR2): void {
    const origin = this.origin.value!;
    const dy = this.scale.value!.scale(tick.value);
    tick.origin.setAutoState(new PointR2(origin.x, origin.y + dy));
    tick.setCoord(dy);
  }
}
AxisView.Right = RightAxisView;
