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

import {AnyColor, Color} from "@swim/color";
import {MemberAnimator} from "../member/MemberAnimator";
import {RenderedViewInit, RenderedView} from "./RenderedView";

export interface FillViewInit extends RenderedViewInit {
  fill?: AnyColor;
}

export interface FillView extends RenderedView {
  readonly fill: MemberAnimator<this, Color, AnyColor>;
}

/** @hidden */
export const FillView = {
  is(object: unknown): object is FillView {
    if (typeof object === "object" && object !== null) {
      const view = object as FillView;
      return RenderedView.is(view)
          && "fill" in view;
    }
    return false;
  },
};
