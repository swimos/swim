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

import {BoxR2} from "@swim/math";
import {ViewContextType} from "@swim/view";
import {HtmlViewController} from "@swim/dom";
import {CanvasView} from "./CanvasView";
import {CanvasViewObserver} from "./CanvasViewObserver";

export class CanvasViewController<V extends CanvasView = CanvasView> extends HtmlViewController<V> implements CanvasViewObserver<V> {
  viewWillRender(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  viewDidRender(viewContext: ViewContextType<V>, view: V): void {
    // hook
  }

  isHidden(): boolean {
    const view = this._view;
    return view !== null && view.isHidden();
  }

  viewWillSetHidden(hidden: boolean, view: V): boolean | void {
    // hook
  }

  viewDidSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  get viewFrame(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewFrame : BoxR2.undefined();
  }

  get viewBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewBounds : BoxR2.undefined();
  }

  get hitBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.hitBounds : BoxR2.undefined();
  }
}
