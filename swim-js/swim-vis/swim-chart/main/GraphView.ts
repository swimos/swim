// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import type {ScaledViewObserver} from "./ScaledView";
import {ScaledView} from "./ScaledView";

/** @public */
export interface GraphViewObserver<X = unknown, Y = unknown, V extends GraphView<X, Y> = GraphView<X, Y>> extends ScaledViewObserver<X, Y, V> {
}

/** @public */
export class GraphView<X = unknown, Y = unknown> extends ScaledView<X, Y> {
  declare readonly observerType?: Class<GraphViewObserver<X, Y>>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  protected override willRender(): void {
    super.willRender();
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      this.clipGraph(context, this.viewFrame);
    }
  }

  protected override didRender(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.restore();
    }
    super.didRender();
  }

  protected clipGraph(context: CanvasContext, frame: R2Box): void {
    context.beginPath();
    context.rect(frame.x, frame.y, frame.width, frame.height);
    context.clip();
  }

  protected override hitTest(x: number, y: number): GraphicsView | null {
    return this;
  }
}
