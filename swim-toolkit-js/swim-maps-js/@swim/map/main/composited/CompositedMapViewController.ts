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

import {View, CompositedViewController} from "@swim/view";
import {MapViewController} from "../MapViewController";
import {CompositedMapViewContext} from "./CompositedMapViewContext";
import {CompositedMapView} from "./CompositedMapView";
import {CompositedMapViewObserver} from "./CompositedMapViewObserver";

export interface CompositedMapViewController<V extends CompositedMapView = CompositedMapView> extends CompositedViewController<V>, MapViewController<V>, CompositedMapViewObserver<V> {
  readonly view: V | null;

  setView(view: V | null): void;

  viewWillSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewDidSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewWillInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewDidInsertChildView(childView: View, targetView: View | null | undefined, view: V): void;

  viewWillRemoveChildView(childView: View, view: V): void;

  viewDidRemoveChildView(childView: View, view: V): void;

  viewWillMount(view: V): void;

  viewDidMount(view: V): void;

  viewWillUnmount(view: V): void;

  viewDidUnmount(view: V): void;

  viewWillPower(view: V): void;

  viewDidPower(view: V): void;

  viewWillUnpower(view: V): void;

  viewDidUnpower(view: V): void;

  viewWillProcess(viewContext: CompositedMapViewContext, view: V): void;

  viewDidProcess(viewContext: CompositedMapViewContext, view: V): void;

  viewWillScroll(viewContext: CompositedMapViewContext, view: V): void;

  viewDidScroll(viewContext: CompositedMapViewContext, view: V): void;

  viewWillDerive(viewContext: CompositedMapViewContext, view: V): void;

  viewDidDerive(viewContext: CompositedMapViewContext, view: V): void;

  viewWillAnimate(viewContext: CompositedMapViewContext, view: V): void;

  viewDidAnimate(viewContext: CompositedMapViewContext, view: V): void;

  viewWillProject(viewContext: CompositedMapViewContext, view: V): void;

  viewDidProject(viewContext: CompositedMapViewContext, view: V): void;

  viewWillProcessChildViews(viewContext: CompositedMapViewContext, view: V): void;

  viewDidProcessChildViews(viewContext: CompositedMapViewContext, view: V): void;

  viewWillDisplay(viewContext: CompositedMapViewContext, view: V): void;

  viewDidDisplay(viewContext: CompositedMapViewContext, view: V): void;

  viewWillLayout(viewContext: CompositedMapViewContext, view: V): void;

  viewDidLayout(viewContext: CompositedMapViewContext, view: V): void;

  viewWillRender(viewContext: CompositedMapViewContext, view: V): void;

  viewDidRender(viewContext: CompositedMapViewContext, view: V): void;

  viewWillComposite(viewContext: CompositedMapViewContext, view: V): void;

  viewDidComposite(viewContext: CompositedMapViewContext, view: V): void;

  viewWillDisplayChildViews(viewContext: CompositedMapViewContext, view: V): void;

  viewDidDisplayChildViews(viewContext: CompositedMapViewContext, view: V): void;

  viewWillSetHidden(hidden: boolean, view: V): void;

  viewDidSetHidden(hidden: boolean, view: V): void;

  viewWillSetCulled(culled: boolean, view: V): void;

  viewDidSetCulled(culled: boolean, view: V): void;
}
