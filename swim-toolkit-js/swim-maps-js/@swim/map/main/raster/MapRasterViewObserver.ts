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

import {MapGraphicsViewObserver} from "../graphics/MapGraphicsViewObserver";
import {MapRasterViewContext} from "./MapRasterViewContext";
import {MapRasterView} from "./MapRasterView";

export interface MapRasterViewObserver<V extends MapRasterView = MapRasterView> extends MapGraphicsViewObserver<V> {
  viewWillProcess?(viewContext: MapRasterViewContext, view: V): void;

  viewDidProcess?(viewContext: MapRasterViewContext, view: V): void;

  viewWillResize?(viewContext: MapRasterViewContext, view: V): void;

  viewDidResize?(viewContext: MapRasterViewContext, view: V): void;

  viewWillScroll?(viewContext: MapRasterViewContext, view: V): void;

  viewDidScroll?(viewContext: MapRasterViewContext, view: V): void;

  viewWillCompute?(viewContext: MapRasterViewContext, view: V): void;

  viewDidCompute?(viewContext: MapRasterViewContext, view: V): void;

  viewWillAnimate?(viewContext: MapRasterViewContext, view: V): void;

  viewDidAnimate?(viewContext: MapRasterViewContext, view: V): void;

  viewWillProject?(viewContext: MapRasterViewContext, view: V): void;

  viewDidProject?(viewContext: MapRasterViewContext, view: V): void;

  viewWillProcessChildViews?(viewContext: MapRasterViewContext, view: V): void;

  viewDidProcessChildViews?(viewContext: MapRasterViewContext, view: V): void;

  viewWillDisplay?(viewContext: MapRasterViewContext, view: V): void;

  viewDidDisplay?(viewContext: MapRasterViewContext, view: V): void;

  viewWillLayout?(viewContext: MapRasterViewContext, view: V): void;

  viewDidLayout?(viewContext: MapRasterViewContext, view: V): void;

  viewWillRender?(viewContext: MapRasterViewContext, view: V): void;

  viewDidRender?(viewContext: MapRasterViewContext, view: V): void;

  viewWillComposite?(viewContext: MapRasterViewContext, view: V): void;

  viewDidComposite?(viewContext: MapRasterViewContext, view: V): void;

  viewWillDisplayChildViews?(viewContext: MapRasterViewContext, view: V): void;

  viewDidDisplayChildViews?(viewContext: MapRasterViewContext, view: V): void;
}
