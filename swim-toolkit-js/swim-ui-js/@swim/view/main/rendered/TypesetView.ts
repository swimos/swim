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

import {AnyPointR2, PointR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {MemberAnimator} from "../member/MemberAnimator";
import {RenderedViewInit, RenderedView} from "./RenderedView";

export interface TypesetViewInit extends RenderedViewInit {
  font?: AnyFont;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  textOrigin?: AnyPointR2;
  textColor?: AnyColor;
}

export interface TypesetView extends RenderedView {
  readonly font: MemberAnimator<this, Font, AnyFont>;

  readonly textAlign: MemberAnimator<this, CanvasTextAlign>;

  readonly textBaseline: MemberAnimator<this, CanvasTextBaseline>;

  readonly textOrigin: MemberAnimator<this, PointR2, AnyPointR2>;

  readonly textColor: MemberAnimator<this, Color, AnyColor>;
}

/** @hidden */
export const TypesetView = {
  is(object: unknown): object is TypesetView {
    if (typeof object === "object" && object !== null) {
      const view = object as TypesetView;
      return RenderedView.is(view)
          && "font" in view
          && "textAlign" in view
          && "textBaseline" in view
          && "textOrigin" in view
          && "textColor" in view;
    }
    return false;
  },
};
