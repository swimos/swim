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

import {GraphicsViewObserver} from "@swim/view";
import {MapGraphicsViewContext} from "./MapGraphicsViewContext";
import {MapGraphicsView} from "./MapGraphicsView";

export interface MapGraphicsViewObserver<V extends MapGraphicsView = MapGraphicsView> extends GraphicsViewObserver<V> {
  viewWillProcess?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidProcess?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillResize?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidResize?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillScroll?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidScroll?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillCompute?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidCompute?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillAnimate?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidAnimate?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillProject?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidProject?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillProcessChildViews?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidProcessChildViews?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillDisplay?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidDisplay?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillLayout?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidLayout?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillRender?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidRender?(viewContext: MapGraphicsViewContext, view: V): void;

  viewWillDisplayChildViews?(viewContext: MapGraphicsViewContext, view: V): void;

  viewDidDisplayChildViews?(viewContext: MapGraphicsViewContext, view: V): void;
}
