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

import {Tween} from "@swim/transition";
import {View} from "./View";

export type PopoverState = "hidden" | "showing" | "shown" | "hiding";

export type PopoverPlacement = "none" | "above" | "below" | "over" | "top" | "bottom" | "right" | "left";

export interface PopoverOptions {
  modal?: boolean;
  multi?: boolean;
}

export interface Popover {
  readonly popoverState: PopoverState;

  readonly popoverView: View | null;

  showPopover(tween?: Tween<any>): void;

  hidePopover(tween?: Tween<any>): void;
}

/** @hidden */
export const Popover = {
  is(object: unknown): object is Popover {
    if (typeof object === "object" && object) {
      const popover = object as Popover;
      return popover.popoverState !== void 0
          && popover.popoverView !== void 0
          && typeof popover.showPopover === "function"
          && typeof popover.hidePopover === "function";
    }
    return false;
  },
};
