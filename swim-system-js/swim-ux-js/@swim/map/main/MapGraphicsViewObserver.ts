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

import {GraphicsViewObserver} from "@swim/view";
import {MapViewObserver} from "./MapViewObserver";
import {MapViewContext} from "./MapViewContext";
import {MapGraphicsView} from "./MapGraphicsView";

export interface MapGraphicsViewObserver<V extends MapGraphicsView = MapGraphicsView> extends GraphicsViewObserver<V>, MapViewObserver<V> {
  viewWillUpdate?(viewContext: MapViewContext, view: V): void;

  viewDidUpdate?(viewContext: MapViewContext, view: V): void;

  viewWillCompute?(viewContext: MapViewContext, view: V): void;

  viewDidCompute?(viewContext: MapViewContext, view: V): void;

  viewWillAnimate?(viewContext: MapViewContext, view: V): void;

  viewDidAnimate?(viewContext: MapViewContext, view: V): void;

  viewWillProject?(viewContext: MapViewContext, view: V): void;

  viewDidProject?(viewContext: MapViewContext, view: V): void;

  viewWillLayout?(viewContext: MapViewContext, view: V): void;

  viewDidLayout?(viewContext: MapViewContext, view: V): void;

  viewWillScroll?(viewContext: MapViewContext, view: V): void;

  viewDidScroll?(viewContext: MapViewContext, view: V): void;

  viewWillRender?(viewContext: MapViewContext, view: V): void;

  viewDidRender?(viewContext: MapViewContext, view: V): void;

  viewWillUpdateChildViews?(viewContext: MapViewContext, view: V): void;

  viewDidUpdateChildViews?(viewContext: MapViewContext, view: V): void;
}
