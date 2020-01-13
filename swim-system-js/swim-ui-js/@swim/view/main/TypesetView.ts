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
import {AnyFont, Font} from "@swim/font";
import {Tween} from "@swim/transition";
import {View} from "./View";
import {RenderView} from "./RenderView";

export interface TypesetViewInit {
  font?: AnyFont | null;
  textAlign?: CanvasTextAlign | null;
  textBaseline?: CanvasTextBaseline | null;
  textColor?: AnyColor | null;
}

export interface TypesetView extends RenderView {
  font(): Font | null | undefined;
  font(font: AnyFont | null, tween?: Tween<Font>): this;

  textAlign(): CanvasTextAlign | null | undefined;
  textAlign(textAlign: CanvasTextAlign | null, tween?: Tween<CanvasTextAlign>): this;

  textBaseline(): CanvasTextBaseline | null | undefined;
  textBaseline(textBaseline: CanvasTextBaseline | null, tween?: Tween<CanvasTextBaseline>): this;

  textColor(): Color | null | undefined;
  textColor(value: AnyColor | null, tween?: Tween<Color>): this;
}

/** @hidden */
export const TypesetView = {
  is(object: unknown): object is TypesetView {
    if (typeof object === "object" && object) {
      const view = object as TypesetView;
      return view instanceof View
          && typeof view.font === "function"
          && typeof view.textColor === "function"
          && typeof view.textAlign === "function"
          && typeof view.textBaseline === "function";
    }
    return false;
  },
};
