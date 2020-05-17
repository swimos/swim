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

export class TopAxisView<D> extends AxisView<D> {
  constructor(scale: ContinuousScale<D, number>) {
    super(scale);
  }

  get orientation(): AxisOrientation {
    return "top";
  }

  protected renderDomain(context: CanvasContext, frame: BoxR2): void {
    const origin = this.origin.value!;
    const x0 = origin.x;
    const y0 = origin.y;
    const [dx0, dx1] = this.scale.value!.range();
    const dy = this.domainSerif.value!;

    context.beginPath();
    context.strokeStyle = this.domainColor.value!.toString();
    context.lineWidth = this.domainWidth.value!;
    if (dy !== 0) {
      context.moveTo(x0 + dx0, y0 - dy);
      context.lineTo(x0 + dx0, y0);
      context.lineTo(x0 + dx1, y0);
      context.lineTo(x0 + dx1, y0 - dy);
    } else {
      context.moveTo(x0 + dx0, y0);
      context.lineTo(x0 + dx1, y0);
    }
    context.stroke();
  }

  protected layoutTick(tick: TickView<D>, frame: BoxR2): void {
    const origin = this.origin.value!;
    const dx = this.scale.value!.scale(tick.value);
    tick.origin.setAutoState(new PointR2(origin.x + dx, origin.y));
    tick.setCoord(dx);
  }
}
AxisView.Top = TopAxisView;
