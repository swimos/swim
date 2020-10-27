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
import {CanvasContext} from "@swim/render";
import {GraphicsView, TypesetView} from "@swim/graphics";
import {TickOrientation, TickView} from "./TickView";

export class TopTickView<X> extends TickView<X> {
  constructor(value: X) {
    super(value);
  }

  get orientation(): TickOrientation {
    return "top";
  }

  protected layoutTickLabel(tickLabel: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const y1 = y0 - this.tickMarkLength.getValue();
    const y2 = y1 - this.tickLabelPadding.getValue();

    if (TypesetView.is(tickLabel)) {
      tickLabel.textAlign.setAutoState("center");
      tickLabel.textBaseline.setAutoState("bottom");
      tickLabel.textOrigin.setAutoState(new PointR2(x, y2));
    }
  }

  protected renderTick(context: CanvasContext, frame: BoxR2): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const y1 = y0 - tickMarkLength;

    const tickMarkWidth = this.tickMarkWidth.value;
    if (tickMarkWidth !== void 0 && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.strokeStyle = this.tickMarkColor.getValue().toString();
      context.lineWidth = tickMarkWidth;
      context.moveTo(x, y0);
      context.lineTo(x, y1);
      context.stroke();
    }

    const gridLineWidth = this.gridLineWidth.value;
    if (gridLineWidth !== void 0 && gridLineWidth !== 0 && frame.xMin < x && x < frame.xMax) {
      context.beginPath();
      context.strokeStyle = this.gridLineColor.getValue().toString();
      context.lineWidth = gridLineWidth;
      context.moveTo(x, y0);
      context.lineTo(x, frame.yMax);
      context.stroke();
    }
  }
}
TickView.Top = TopTickView;
