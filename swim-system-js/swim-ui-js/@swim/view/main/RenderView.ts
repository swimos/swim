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
import {ViewEvent} from "./ViewEvent";
import {View} from "./View";
import {AnimatedView} from "./AnimatedView";
import {RenderViewContext} from "./RenderViewContext";
import {RenderViewController} from "./RenderViewController";
import {CanvasView} from "./CanvasView";

export interface RenderView extends AnimatedView {
  readonly viewController: RenderViewController | null;

  readonly canvasView: CanvasView | null;

  readonly renderingContext: RenderingContext | null;

  readonly pixelRatio: number;

  needsUpdate(updateFlags: number, viewContext: RenderViewContext): number;

  readonly hidden: boolean;

  setHidden(hidden: boolean): void;

  readonly culled: boolean;

  setCulled(culled: boolean): void;

  readonly bounds: BoxR2;

  setBounds(bounds: BoxR2): void;

  readonly anchor: PointR2;

  setAnchor(anchor: PointR2): void;

  readonly hitBounds: BoxR2 | null;

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null;

  /** @hidden */
  handleEvent(event: ViewEvent): void;

  /**
   * Invokes event handlers registered with this `View` before propagating the
   * `event` up the view hierarchy.  Returns a `View`, without invoking any
   * registered event handlers, on which `dispatchEvent` should be called to
   * continue event propagation.
   * @hidden
   */
  bubbleEvent(event: ViewEvent): View | null;
}

/** @hidden */
export const RenderView = {
  is(object: unknown): object is RenderView {
    if (typeof object === "object" && object) {
      const view = object as RenderView;
      return AnimatedView.is(view)
          && typeof view.hitTest === "function";
    }
    return false;
  },
};
View.Render = RenderView;
