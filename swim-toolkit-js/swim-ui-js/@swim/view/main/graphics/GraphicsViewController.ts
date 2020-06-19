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
import {ViewController} from "../ViewController";
import {GraphicsViewContext} from "./GraphicsViewContext";
import {GraphicsView} from "./GraphicsView";
import {GraphicsViewObserver} from "./GraphicsViewObserver";
import {CanvasView} from "../canvas/CanvasView";

export class GraphicsViewController<V extends GraphicsView = GraphicsView> extends ViewController<V> implements GraphicsViewObserver<V> {
  get canvasView(): CanvasView | null {
    const view = this._view;
    return view !== null ? view.canvasView : null;
  }

  viewWillRender(viewContext: GraphicsViewContext, view: V): void {
    // hook
  }

  viewDidRender(viewContext: GraphicsViewContext, view: V): void {
    // hook
  }

  isHidden(): boolean {
    const view = this._view;
    return view !== null && view.isHidden();
  }

  viewWillSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  viewDidSetHidden(hidden: boolean, view: V): void {
    // hook
  }

  isCulled(): boolean {
    const view = this._view;
    return view !== null && view.isCulled();
  }

  viewWillSetCulled(culled: boolean, view: V): void {
    // hook
  }

  viewDidSetCulled(culled: boolean, view: V): void {
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
