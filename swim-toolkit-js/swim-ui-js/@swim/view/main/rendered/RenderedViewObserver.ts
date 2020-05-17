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

import {AnimatedViewObserver} from "../animated/AnimatedViewObserver";
import {RenderedViewContext} from "./RenderedViewContext";
import {RenderedView} from "./RenderedView";

export interface RenderedViewObserver<V extends RenderedView = RenderedView> extends AnimatedViewObserver<V> {
  viewWillProcess?(viewContext: RenderedViewContext, view: V): void;

  viewDidProcess?(viewContext: RenderedViewContext, view: V): void;

  viewWillScroll?(viewContext: RenderedViewContext, view: V): void;

  viewDidScroll?(viewContext: RenderedViewContext, view: V): void;

  viewWillDerive?(viewContext: RenderedViewContext, view: V): void;

  viewDidDerive?(viewContext: RenderedViewContext, view: V): void;

  viewWillAnimate?(viewContext: RenderedViewContext, view: V): void;

  viewDidAnimate?(viewContext: RenderedViewContext, view: V): void;

  viewWillProcessChildViews?(viewContext: RenderedViewContext, view: V): void;

  viewDidProcessChildViews?(viewContext: RenderedViewContext, view: V): void;

  viewWillDisplay?(viewContext: RenderedViewContext, view: V): void;

  viewDidDisplay?(viewContext: RenderedViewContext, view: V): void;

  viewWillLayout?(viewContext: RenderedViewContext, view: V): void;

  viewDidLayout?(viewContext: RenderedViewContext, view: V): void;

  viewWillRender?(viewContext: RenderedViewContext, view: V): void;

  viewDidRender?(viewContext: RenderedViewContext, view: V): void;

  viewWillDisplayChildViews?(viewContext: RenderedViewContext, view: V): void;

  viewDidDisplayChildViews?(viewContext: RenderedViewContext, view: V): void;

  viewWillSetHidden?(hidden: boolean, view: V): void;

  viewDidSetHidden?(hidden: boolean, view: V): void;

  viewWillSetCulled?(culled: boolean, view: V): void;

  viewDidSetCulled?(culled: boolean, view: V): void;
}
