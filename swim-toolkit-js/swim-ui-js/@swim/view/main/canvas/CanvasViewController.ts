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

import {BoxR2} from "@swim/math";
import {RenderedViewContext} from "../rendered/RenderedViewContext";
import {RenderedViewController} from "../rendered/RenderedViewController";
import {HtmlViewController} from "../html/HtmlViewController";
import {CanvasView} from "./CanvasView";
import {CanvasViewObserver} from "./CanvasViewObserver";

export class CanvasViewController<V extends CanvasView = CanvasView> extends HtmlViewController<V> implements RenderedViewController<V>, CanvasViewObserver<V> {
  viewWillProcess(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidProcess(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillScroll(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidScroll(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillDerive(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidDerive(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillAnimate(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidAnimate(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillProcessChildViews(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidProcessChildViews(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillDisplay(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidDisplay(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillLayout(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidLayout(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillRender(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidRender(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewWillDisplayChildViews(viewContext: RenderedViewContext, view: V): void {
    // hook
  }

  viewDidDisplayChildViews(viewContext: RenderedViewContext, view: V): void {
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

  isCulled(): boolean {
    const view = this._view;
    return view !== null && view.isCulled();
  }

  viewWillSetCulled(culled: boolean, view: V): boolean | void {
    // hook
  }

  viewDidSetCulled(culled: boolean, view: V): void {
    // hook
  }

  get viewFrame(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewFrame : BoxR2.empty();
  }

  get viewBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.viewBounds : BoxR2.empty();
  }

  get hitBounds(): BoxR2 {
    const view = this._view;
    return view !== null ? view.hitBounds : BoxR2.empty();
  }
}
