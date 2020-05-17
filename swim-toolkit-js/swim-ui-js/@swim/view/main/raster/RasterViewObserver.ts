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

import {GraphicsViewObserver} from "../graphics/GraphicsViewObserver";
import {CompositedViewContext} from "../composited/CompositedViewContext";
import {CompositedViewObserver} from "../composited/CompositedViewObserver";
import {RasterView} from "./RasterView";

export interface RasterViewObserver<V extends RasterView = RasterView> extends GraphicsViewObserver<V>, CompositedViewObserver<V> {
  viewWillProcess?(viewContext: CompositedViewContext, view: V): void;

  viewDidProcess?(viewContext: CompositedViewContext, view: V): void;

  viewWillScroll?(viewContext: CompositedViewContext, view: V): void;

  viewDidScroll?(viewContext: CompositedViewContext, view: V): void;

  viewWillDerive?(viewContext: CompositedViewContext, view: V): void;

  viewDidDerive?(viewContext: CompositedViewContext, view: V): void;

  viewWillAnimate?(viewContext: CompositedViewContext, view: V): void;

  viewDidAnimate?(viewContext: CompositedViewContext, view: V): void;

  viewWillProcessChildViews?(viewContext: CompositedViewContext, view: V): void;

  viewDidProcessChildViews?(viewContext: CompositedViewContext, view: V): void;

  viewWillDisplay?(viewContext: CompositedViewContext, view: V): void;

  viewDidDisplay?(viewContext: CompositedViewContext, view: V): void;

  viewWillLayout?(viewContext: CompositedViewContext, view: V): void;

  viewDidLayout?(viewContext: CompositedViewContext, view: V): void;

  viewWillRender?(viewContext: CompositedViewContext, view: V): void;

  viewDidRender?(viewContext: CompositedViewContext, view: V): void;

  viewWillComposite?(viewContext: CompositedViewContext, view: V): void;

  viewDidComposite?(viewContext: CompositedViewContext, view: V): void;

  viewWillDisplayChildViews?(viewContext: CompositedViewContext, view: V): void;

  viewDidDisplayChildViews?(viewContext: CompositedViewContext, view: V): void;
}
