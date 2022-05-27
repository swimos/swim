// Copyright 2015-2022 Swim.inc
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

import type {ServiceObserver} from "@swim/component";
import type {ViewIdiom} from "../view/ViewIdiom";
import type {ViewInsets} from "../view/ViewInsets";
import type {LayoutViewport} from "./LayoutViewport";
import type {VisualViewport} from "./VisualViewport";
import type {ViewportOrientation} from "./ViewportOrientation";
import type {ViewportColorScheme} from "./ViewportColorScheme";
import type {ViewportService} from "./ViewportService";

/** @public */
export interface ViewportServiceObserver<S extends ViewportService = ViewportService> extends ServiceObserver<S> {
  serviceDidScrollLayoutViewport?(layoutViewport: LayoutViewport, service: S): void;

  serviceDidResizeLayoutViewport?(layoutViewport: LayoutViewport, service: S): void;

  serviceDidResizeVisualViewport?(visualViewport: VisualViewport, service: S): void;

  serviceDidResizeViewportSafeArea?(safeArea: ViewInsets, service: S): void;

  serviceDidSetViewportOrientation?(orientation: ViewportOrientation, service: S): void;

  serviceDidSetViewportColorScheme?(colorScheme: ViewportColorScheme, service: S): void;

  serviceDidSetViewIdiom?(viewIdiom: ViewIdiom, service: S): void;
}
