// Copyright 2015-2019 SWIM.AI inc.
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
import {RenderingContext} from "@swim/render";
import {TickView} from "../tick/TickView";
import {AxisOrientation, AxisView} from "./AxisView";

export class LeftAxisView<D> extends AxisView<D> {
  constructor(scale: ContinuousScale<D, number>) {
    super(scale);
  }

  get orientation(): AxisOrientation {
    return "left";
  }

  protected renderDomain(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const ax = anchor.x;
    const ay = anchor.y;
    const [y0, y1] = this.scale.value!.range();
    const dx = this.domainSerif.value!;

    context.beginPath();
    context.strokeStyle = this.domainColor.value!.toString();
    context.lineWidth = this.domainWidth.value!;
    if (dx) {
      context.moveTo(ax - dx, ay + y0);
      context.lineTo(ax,      ay + y0);
      context.lineTo(ax,      ay + y1);
      context.lineTo(ax - dx, ay + y1);
    } else {
      context.moveTo(ax, ay + y0);
      context.lineTo(ax, ay + y1);
    }
    context.stroke();
  }

  protected layoutTick(tick: TickView<D>, bounds: BoxR2, anchor: PointR2): void {
    const dy = this.scale.value!.scale(tick.value);
    const ax = anchor.x;
    const ay = anchor.y + dy;
    const tickAnchor = new PointR2(ax, ay);
    tick.setBounds(bounds);
    tick.setAnchor(tickAnchor);
    tick.setCoord(dy);
  }
}
AxisView.Left = LeftAxisView;
