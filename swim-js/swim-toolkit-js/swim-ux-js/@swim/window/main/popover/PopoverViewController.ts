// Copyright 2015-2021 Swim Inc.
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

import type {View} from "@swim/view";
import {HtmlViewController} from "@swim/dom";
import type {PopoverPlacement, PopoverView} from "./PopoverView";
import type {PopoverViewObserver} from "./PopoverViewObserver";

export class PopoverViewController<V extends PopoverView = PopoverView> extends HtmlViewController<V> implements PopoverViewObserver<V> {
  get sourceView(): View | null {
    const view = this.view;
    return view !== null ? view.source.view : null;
  }

  popoverWillSetSource(newSourceView: View | null, oldSourceView: View | null, view: V): void {
    // hook
  }

  popoverDidSetSource(newSourceView: View | null, oldSourceView: View | null, view: V): void {
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
