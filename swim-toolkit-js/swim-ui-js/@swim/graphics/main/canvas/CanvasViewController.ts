// Copyright 2015-2021 Swim inc.
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

import {R2Box} from "@swim/math";
import {HtmlViewController} from "@swim/dom";
import type {CanvasView} from "./CanvasView";
import type {CanvasViewObserver} from "./CanvasViewObserver";

export class CanvasViewController<V extends CanvasView = CanvasView> extends HtmlViewController<V> implements CanvasViewObserver<V> {
  isHidden(): boolean {
    const view = this.view;
    return view !== null && view.isHidden();
  }

  viewWillSetHidden(hidden: boolean, view: V): boolean | void {
    // hook
  }

  viewDidSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  get viewFrame(): R2Box {
    const view = this.view;
    return view !== null ? view.viewFrame : R2Box.undefined();
  }

  get viewBounds(): R2Box {
    const view = this.view;
    return view !== null ? view.viewBounds : R2Box.undefined();
  }

  get hitBounds(): R2Box {
    const view = this.view;
    return view !== null ? view.hitBounds : R2Box.undefined();
  }
}
