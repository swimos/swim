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

import {View} from "./View";
import {HtmlViewController} from "./HtmlViewController";
import {PopoverPlacement} from "./Popover";
import {PopoverView} from "./PopoverView";
import {PopoverViewObserver} from "./PopoverViewObserver";

export class PopoverViewController<V extends PopoverView = PopoverView> extends HtmlViewController<V> implements PopoverViewObserver<V> {
  get source(): View | null {
    const view = this._view;
    return view ? view.source : null;
  }

  popoverWillSetSource(source: View | null, view: V): void {
    // hook
  }

  popoverDidSetSource(source: View | null, view: V): void {
    // hook
  }

  popoverWillPlace(placement: PopoverPlacement, view: V): void {
    // hook
  }

  popoverDidPlace(placement: PopoverPlacement, view: V): void {
    // hook
  }

  popoverWillShow(view: V): void {
    // hook
  }

  popoverDidShow(view: V): void {
    // hook
  }

  popoverWillHide(view: V): void {
    // hook
  }

  popoverDidHide(view: V): void {
    // hook
  }
}
