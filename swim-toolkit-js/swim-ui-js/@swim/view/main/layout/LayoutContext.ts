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

import {ConstraintScope} from "@swim/constraint";
import {LayoutAnchorDescriptor, LayoutAnchorConstructor, LayoutAnchor} from "./LayoutAnchor";

export interface LayoutContext extends ConstraintScope {
  hasLayoutAnchor(anchorName: string): boolean;

  getLayoutAnchor(anchorName: string): LayoutAnchor<this> | null;

  setLayoutAnchor(anchorName: string, layoutAnchor: LayoutAnchor<this> | null): void;
}

/** @hidden */
export const LayoutContext = {
  /** @hidden */
  is(object: unknown): object is LayoutContext {
    if (typeof object === "object" && object !== null) {
      const view = object as LayoutContext;
      return view.hasLayoutAnchor !== void 0
          && view.getLayoutAnchor !== void 0
          && view.setLayoutAnchor !== void 0;
    }
    return false;
  },

  /** @hidden */
  decorateLayoutAnchor<L extends LayoutContext>(LayoutAnchor: LayoutAnchorConstructor,
                                                descriptor: LayoutAnchorDescriptor<L> | undefined,
                                                layoutClass: unknown, anchorName: string): void {
    Object.defineProperty(layoutClass, anchorName, {
      get: function (this: L): LayoutAnchor<L> {
        let layoutAnchor = this.getLayoutAnchor(anchorName) as LayoutAnchor<L> | null;
        if (layoutAnchor === null) {
          layoutAnchor = new LayoutAnchor<L>(this, anchorName, descriptor);
          this.setLayoutAnchor(anchorName, layoutAnchor);
        }
        return layoutAnchor;
      },
      configurable: true,
      enumerable: true,
    });
  },
};
