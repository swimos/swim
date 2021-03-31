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

import type {Timing} from "@swim/mapping";
import type {GeoPoint} from "@swim/geo";
import type {MoodVector, ThemeMatrix} from "@swim/theme";
import type {ViewContextType, View} from "@swim/view";
import type {MapGraphicsViewController} from "../graphics/MapGraphicsViewController";
import type {MapView} from "./MapView";
import type {MapViewObserver} from "./MapViewObserver";

export interface MapViewController<V extends MapView = MapView> extends MapGraphicsViewController<V>, MapViewObserver<V> {
  viewWillSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewDidSetParentView(newParentView: View | null, oldParentView: View | null, view: V): void;

  viewWillInsertChildView(childView: View, targetView: View | null, view: V): void;

  viewDidInsertChildView(childView: View, targetView: View | null, view: V): void;

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

  viewWillCull(view: V): void;

  viewDidCull(view: V): void;

  viewWillUncull(view: V): void;

  viewDidUncull(view: V): void;

  viewWillResize(viewContext: ViewContextType<V>, view: V): void;

  viewDidResize(viewContext: ViewContextType<V>, view: V): void;

  viewWillScroll(viewContext: ViewContextType<V>, view: V): void;

  viewDidScroll(viewContext: ViewContextType<V>, view: V): void;

  viewWillChange(viewContext: ViewContextType<V>, view: V): void;

  viewDidChange(viewContext: ViewContextType<V>, view: V): void;

  viewWillAnimate(viewContext: ViewContextType<V>, view: V): void;

  viewDidAnimate(viewContext: ViewContextType<V>, view: V): void;

  viewWillProject(viewContext: ViewContextType<V>, view: V): void;

  viewDidProject(viewContext: ViewContextType<V>, view: V): void;

  viewWillLayout(viewContext: ViewContextType<V>, view: V): void;

  viewDidLayout(viewContext: ViewContextType<V>, view: V): void;

  viewWillRender(viewContext: ViewContextType<V>, view: V): void;

  viewDidRender(viewContext: ViewContextType<V>, view: V): void;

  viewWillComposite(viewContext: ViewContextType<V>, view: V): void;

  viewDidComposite(viewContext: ViewContextType<V>, view: V): void;

  viewWillApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, view: V): void;

  viewDidApplyTheme(theme: ThemeMatrix, mood: MoodVector, timing: Timing | boolean, view: V): void;

  viewWillSetHidden(hidden: boolean, view: V): void;

  viewDidSetHidden(hidden: boolean, view: V): void;

  mapViewWillMove(mapCenter: GeoPoint, mapZoom: number, view: V): void;

  mapViewDidMove(mapCenter: GeoPoint, mapZoom: number, view: V): void;
}
