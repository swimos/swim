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

import {GraphicsViewController} from "@swim/view";
import {MapProjection} from "./MapProjection";
import {MapViewContext} from "./MapViewContext";
import {MapGraphicsView} from "./MapGraphicsView";
import {MapGraphicsViewObserver} from "./MapGraphicsViewObserver";

export class MapGraphicsViewController<V extends MapGraphicsView = MapGraphicsView> extends GraphicsViewController<V> implements MapGraphicsViewObserver<V> {
  get projection(): MapProjection | null {
    const view = this._view;
    return view ? view.projection : null;
  }

  get zoom(): number {
    const view = this._view;
    return view ? view.zoom : 0;
  }

  get heading(): number {
    const view = this._view;
    return view ? view.heading : 0;
  }

  get tilt(): number {
    const view = this._view;
    return view ? view.tilt : 0;
  }

  viewWillUpdate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidUpdate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillCompute(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidCompute(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillAnimate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidAnimate(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillProject(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidProject(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillLayout(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidLayout(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillScroll(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidScroll(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillRender(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidRender(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewWillUpdateChildViews(viewContext: MapViewContext, view: V): void {
    // hook
  }

  viewDidUpdateChildViews(viewContext: MapViewContext, view: V): void {
    // hook
  }
}
