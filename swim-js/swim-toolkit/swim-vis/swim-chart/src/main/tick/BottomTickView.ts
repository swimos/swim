// Copyright 2015-2021 Swim.inc
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

import {Affinity} from "@swim/component";
import {R2Point, R2Box} from "@swim/math";
import {GraphicsView, PaintingContext, TypesetView} from "@swim/graphics";
import {TickOrientation, TickView} from "./TickView";

/** @public */
export class BottomTickView<X = unknown> extends TickView<X> {
  constructor(value: X) {
    super(value);
  }

  override get orientation(): TickOrientation {
    return "bottom";
  }

  protected override layoutLabel(labelView: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const y1 = y0 + this.tickMarkLength.getValue();
    const y2 = y1 + this.tickLabelPadding.getValue();

    if (TypesetView.is(labelView)) {
      labelView.textAlign.setState("center", Affinity.Intrinsic);
      labelView.textBaseline.setState("top", Affinity.Intrinsic);
      labelView.textOrigin.setState(new R2Point(x, y2), Affinity.Intrinsic);
    }
  }

  protected override renderTick(context: PaintingContext, frame: R2Box): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const y1 = y0 + tickMarkLength;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const tickMarkColor = this.tickMarkColor.value;
    const tickMarkWidth = this.tickMarkWidth.getValue();
    if (tickMarkColor !== null && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.lineWidth = tickMarkWidth;
      context.strokeStyle = tickMarkColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, y1);
      context.stroke();
    }

    const gridLineColor = this.gridLineColor.value;
    const gridLineWidth = this.gridLineWidth.getValue();
    if (gridLineColor !== null && gridLineWidth !== 0 && frame.xMin < x && x < frame.xMax) {
      context.beginPath();
      context.lineWidth = gridLineWidth;
      context.strokeStyle = gridLineColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, frame.yMin);
      context.stroke();
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}
