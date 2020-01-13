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

import {LayoutScope} from "./layout/LayoutScope";
import {View} from "./View";

export interface LayoutView extends View, LayoutScope {
}

/** @hidden */
export const LayoutView = {
  is(object: unknown): object is LayoutView {
    if (typeof object === "object" && object) {
      const view = object as LayoutView;
      return view instanceof View
          && typeof view.addConstraint === "function"
          && typeof view.removeConstraint === "function"
          && typeof view.updateVariables === "function";
    }
    return false;
  },
};
View.Layout = LayoutView;
