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

import {AnimatorContext} from "@swim/animate";
import {View} from "./View";
import {AnimatedViewContext} from "./AnimatedViewContext";
import {AnimatedViewController} from "./AnimatedViewController";

export interface AnimatedView extends AnimatorContext, View {
  readonly viewController: AnimatedViewController | null;

  needsUpdate(updateFlags: number, viewContext: AnimatedViewContext): number;
}

/** @hidden */
export const AnimatedView = {
  is(object: unknown): object is AnimatedView {
    if (typeof object === "object" && object) {
      const view = object as AnimatedView;
      return view instanceof View.Graphic || view instanceof View
          && typeof view.animate === "function";
    }
    return false;
  },
};
View.Animated = AnimatedView;
