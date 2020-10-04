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

import {View} from "@swim/view";
import {ThemedHtmlViewController} from "@swim/theme";
import {DropdownPlacement, DropdownView} from "./DropdownView";
import {DropdownViewObserver} from "./DropdownViewObserver";

export class DropdownViewController<V extends DropdownView = DropdownView> extends ThemedHtmlViewController<V> implements DropdownViewObserver<V> {
  get source(): View | null {
    const view = this._view;
    return view !== null ? view.source : null;
  }

  dropdownWillSetSource(source: View | null, view: V): void {
    // hook
  }

  dropdownDidSetSource(source: View | null, view: V): void {
    // hook
  }

  dropdownWillPlace(placement: DropdownPlacement, view: V): void {
    // hook
  }

  dropdownDidPlace(placement: DropdownPlacement, view: V): void {
    // hook
  }

  dropdownWillShow(view: V): void {
    // hook
  }

  dropdownDidShow(view: V): void {
    // hook
  }

  dropdownWillHide(view: V): void {
    // hook
  }

  dropdownDidHide(view: V): void {
    // hook
  }
}
