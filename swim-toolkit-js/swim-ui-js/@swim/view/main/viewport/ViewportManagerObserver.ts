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

import {View} from "../View";
import {ViewManagerObserver} from "../manager/ViewManagerObserver";
import {ViewIdiom} from "./ViewIdiom";
import {Viewport} from "./Viewport";
import {ViewportManager} from "./ViewportManager";

export interface ViewportManagerObserver<V extends View = View, VM extends ViewportManager<V> = ViewportManager<V>> extends ViewManagerObserver<V, VM> {
  detectViewIdiom?(viewport: Viewport, viewportManager: VM): void | ViewIdiom;

  viewportManagerWillSetViewIdiom?(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom, viewportManager: VM): void;

  viewportManagerDidSetViewIdiom?(newViewIdiom: ViewIdiom, oldViewIdiom: ViewIdiom, viewportManager: VM): void;

  viewportManagerWillReorient?(orientation: OrientationType, viewportManager: VM): void;

  viewportManagerDidReorient?(orientation: OrientationType, viewportManager: VM): void;
}
