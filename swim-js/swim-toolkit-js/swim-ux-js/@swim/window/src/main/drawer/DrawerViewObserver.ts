// Copyright 2015-2021 Swim Inc.
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

import type {HtmlViewObserver} from "@swim/dom";
import type {DrawerPlacement, DrawerView} from "./DrawerView";

/** @public */
export interface DrawerViewObserver<V extends DrawerView = DrawerView> extends HtmlViewObserver<V> {
  viewWillSetPlacement?(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void;

  viewDidSetPlacement?(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void;

  viewWillPresent?(view: V): void;

  viewDidPresent?(view: V): void;

  viewWillDismiss?(view: V): void;

  viewDidDismiss?(view: V): void;

  viewWillExpand?(view: V): void;

  viewDidExpand?(view: V): void;

  viewWillCollapse?(view: V): void;

  viewDidCollapse?(view: V): void;
}
