// Copyright 2015-2023 Swim.inc
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
import type {HtmlViewObserver, ModalViewObserver} from "@swim/dom";
import type {PopoverPlacement, PopoverView} from "./PopoverView";

/** @public */
export interface PopoverViewObserver<V extends PopoverView = PopoverView> extends HtmlViewObserver<V>, ModalViewObserver<V> {
  popoverWillAttachSource?(sourceView: View, view: V): void;

  popoverDidDetachSource?(sourceView: View, view: V): void;

  popoverWillPlace?(placement: PopoverPlacement, view: V): void;

  popoverDidPlace?(placement: PopoverPlacement, view: V): void;
}
