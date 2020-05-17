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

import {Renderer, CanvasCompositeOperation} from "@swim/render";
import {ViewFlags, View} from "../View";
import {MemberAnimator} from "../member/MemberAnimator";
import {RenderedViewInit, RenderedView} from "../rendered/RenderedView";
import {CompositedViewContext} from "./CompositedViewContext";
import {CompositedViewController} from "./CompositedViewController";

export interface CompositedViewInit extends RenderedViewInit {
  opacity?: number;
}

export interface CompositedView extends RenderedView {
  readonly viewController: CompositedViewController | null;

  readonly compositor: Renderer | null;

  readonly opacity: MemberAnimator<this, number>;

  readonly compositeOperation: MemberAnimator<this, CanvasCompositeOperation>;

  needsProcess(processFlags: ViewFlags, viewContext: CompositedViewContext): ViewFlags;

  needsDisplay(displayFlags: ViewFlags, viewContext: CompositedViewContext): ViewFlags;
}

/** @hidden */
export const CompositedView = {
  is(object: unknown): object is CompositedView {
    if (typeof object === "object" && object !== null) {
      const view = object as CompositedView;
      return view instanceof View.Raster
          || RenderedView.is(view) && "compositor" in view;
    }
    return false;
  },
};
View.Composited = CompositedView;
