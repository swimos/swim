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

import {GraphicsViewObserver} from "../graphics/GraphicsViewObserver";
import {RasterViewContext} from "./RasterViewContext";
import {RasterView} from "./RasterView";

export interface RasterViewObserver<V extends RasterView = RasterView> extends GraphicsViewObserver<V> {
  viewWillProcess?(viewContext: RasterViewContext, view: V): void;

  viewDidProcess?(viewContext: RasterViewContext, view: V): void;

  viewWillResize?(viewContext: RasterViewContext, view: V): void;

  viewDidResize?(viewContext: RasterViewContext, view: V): void;

  viewWillScroll?(viewContext: RasterViewContext, view: V): void;

  viewDidScroll?(viewContext: RasterViewContext, view: V): void;

  viewWillCompute?(viewContext: RasterViewContext, view: V): void;

  viewDidCompute?(viewContext: RasterViewContext, view: V): void;

  viewWillAnimate?(viewContext: RasterViewContext, view: V): void;

  viewDidAnimate?(viewContext: RasterViewContext, view: V): void;

  viewWillProcessChildViews?(viewContext: RasterViewContext, view: V): void;

  viewDidProcessChildViews?(viewContext: RasterViewContext, view: V): void;

  viewWillDisplay?(viewContext: RasterViewContext, view: V): void;

  viewDidDisplay?(viewContext: RasterViewContext, view: V): void;

  viewWillLayout?(viewContext: RasterViewContext, view: V): void;

  viewDidLayout?(viewContext: RasterViewContext, view: V): void;

  viewWillRender?(viewContext: RasterViewContext, view: V): void;

  viewDidRender?(viewContext: RasterViewContext, view: V): void;

  viewWillComposite?(viewContext: RasterViewContext, view: V): void;

  viewDidComposite?(viewContext: RasterViewContext, view: V): void;

  viewWillDisplayChildViews?(viewContext: RasterViewContext, view: V): void;

  viewDidDisplayChildViews?(viewContext: RasterViewContext, view: V): void;
}
