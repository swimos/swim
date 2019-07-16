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

import {HtmlViewController} from "./HtmlViewController";
import {HtmlAppView} from "./HtmlAppView";
import {HtmlAppViewObserver} from "./HtmlAppViewObserver";
import {PopoverOptions, Popover} from "./Popover";

export class HtmlAppViewController<V extends HtmlAppView = HtmlAppView> extends HtmlViewController<V> implements HtmlAppViewObserver<V> {
  get popovers(): ReadonlyArray<Popover> {
    const view = this._view;
    return view ? view.popovers : [];
  }

  viewWillShowPopover(popover: Popover, options: PopoverOptions, view: V): void {
    // hook
  }

  viewDidShowPopover(popover: Popover, options: PopoverOptions, view: V): void {
    // hook
  }

  viewWillHidePopover(popover: Popover, view: V): void {
    // hook
  }

  viewDidHidePopover(popover: Popover, view: V): void {
    // hook
  }
}
