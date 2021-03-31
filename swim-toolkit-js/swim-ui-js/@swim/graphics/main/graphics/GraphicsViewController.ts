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
import {ViewController} from "@swim/view";
import type {GraphicsView} from "./GraphicsView";
import type {GraphicsViewObserver} from "./GraphicsViewObserver";

export class GraphicsViewController<V extends GraphicsView = GraphicsView> extends ViewController<V> implements GraphicsViewObserver<V> {
  isHidden(): boolean {
    const view = this.view;
    return view !== null && view.isHidden();
  }

  viewWillSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  viewDidSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  get viewFrame(): BoxR2 {
    const view = this.view;
    return view !== null ? view.viewFrame : BoxR2.undefined();
  }

  get viewBounds(): BoxR2 {
    const view = this.view;
    return view !== null ? view.viewBounds : BoxR2.undefined();
  }

  get hitBounds(): BoxR2 {
    const view = this.view;
    return view !== null ? view.hitBounds : BoxR2.undefined();
  }
}
