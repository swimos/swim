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
import {RenderingContext} from "@swim/render";
import {RenderView, TypesetView} from "@swim/view";
import {TickOrientation, TickView} from "./TickView";

export class LeftTickView<D> extends TickView<D> {
  constructor(value: D) {
    super(value);
  }

  get orientation(): TickOrientation {
    return "left";
  }

  protected layoutTickLabel(tickLabel: RenderView, bounds: BoxR2, anchor: PointR2): void {
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const x1 = x0 - this.tickMarkLength.value!;
    const x2 = x1 - this.tickLabelPadding.value!;

    const tickLabelAnchor = new PointR2(x2, y);
    tickLabel.setAnchor(tickLabelAnchor);
    if (TypesetView.is(tickLabel)) {
      tickLabel.textAlign("right");
      tickLabel.textBaseline("middle");
    }
  }

  protected renderTick(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const x1 = x0 - this.tickMarkLength.value!;

    context.beginPath();
    context.strokeStyle = this.tickMarkColor.value!.toString();
    context.lineWidth = this.tickMarkWidth.value!;
    context.moveTo(x0, y);
    context.lineTo(x1, y);
    context.stroke();

    const gridLineWidth = this.gridLineWidth.value!;
    if (gridLineWidth && bounds.yMin < y && y < bounds.yMax) {
      context.beginPath();
      context.strokeStyle = this.gridLineColor.value!.toString();
      context.lineWidth = gridLineWidth;
      context.moveTo(x0, y);
      context.lineTo(bounds.xMax, y);
      context.stroke();
    }
  }
}
TickView.Left = LeftTickView;
