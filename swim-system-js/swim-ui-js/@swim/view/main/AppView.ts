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

import {Viewport} from "./Viewport";
import {ViewContext} from "./ViewContext";
import {View} from "./View";
import {AppViewController} from "./AppViewController";
import {PopoverOptions, Popover} from "./Popover";

export interface AppView extends View {
  readonly viewController: AppViewController | null;

  readonly appView: this;

  readonly viewport: Viewport;

  readonly popovers: ReadonlyArray<Popover>;

  togglePopover(popover: Popover, options?: PopoverOptions): void;

  showPopover(popover: Popover, options?: PopoverOptions): void;

  hidePopover(popover: Popover): void;

  hidePopovers(): void;

  appViewContext(): ViewContext;
}

/** @hidden */
export const AppView = {
  is(object: unknown): object is AppView {
    if (typeof object === "object" && object) {
      const view = object as AppView;
      return view instanceof View
          && typeof view.togglePopover === "function"
          && typeof view.showPopover === "function"
          && typeof view.hidePopover === "function"
          && typeof view.hidePopovers === "function";
    }
    return false;
  },
};
View.App = AppView;
