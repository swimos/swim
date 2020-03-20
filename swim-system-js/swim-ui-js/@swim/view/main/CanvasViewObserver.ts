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

import {RenderedViewContext} from "./RenderedViewContext";
import {RenderedViewObserver} from "./RenderedViewObserver";
import {HtmlViewObserver} from "./HtmlViewObserver";
import {CanvasView} from "./CanvasView";

export interface CanvasViewObserver<V extends CanvasView = CanvasView> extends HtmlViewObserver<V>, RenderedViewObserver<V> {
  viewWillUpdate?(viewContext: RenderedViewContext, view: V): void;

  viewDidUpdate?(viewContext: RenderedViewContext, view: V): void;

  viewWillCompute?(viewContext: RenderedViewContext, view: V): void;

  viewDidCompute?(viewContext: RenderedViewContext, view: V): void;

  viewWillAnimate?(viewContext: RenderedViewContext, view: V): void;

  viewDidAnimate?(viewContext: RenderedViewContext, view: V): void;

  viewWillLayout?(viewContext: RenderedViewContext, view: V): void;

  viewDidLayout?(viewContext: RenderedViewContext, view: V): void;

  viewWillScroll?(viewContext: RenderedViewContext, view: V): void;

  viewDidScroll?(viewContext: RenderedViewContext, view: V): void;

  viewWillRender?(viewContext: RenderedViewContext, view: V): void;

  viewDidRender?(viewContext: RenderedViewContext, view: V): void;

  viewWillUpdateChildViews?(viewContext: RenderedViewContext, view: V): void;

  viewDidUpdateChildViews?(viewContext: RenderedViewContext, view: V): void;
}
