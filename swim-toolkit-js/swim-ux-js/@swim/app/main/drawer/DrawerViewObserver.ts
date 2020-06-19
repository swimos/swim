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

import {HtmlViewObserver} from "@swim/view";
import {DrawerPlacement, DrawerView} from "./DrawerView";

export interface DrawerViewObserver<V extends DrawerView = DrawerView> extends HtmlViewObserver<V> {
  drawerWillSetPlacement?(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void;

  drawerDidSetPlacement?(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void;

  drawerWillShow?(view: V): void;

  drawerDidShow?(view: V): void;

  drawerWillHide?(view: V): void;

  drawerDidHide?(view: V): void;

  drawerWillExpand?(view: V): void;

  drawerDidExpand?(view: V): void;

  drawerWillCollapse?(view: V): void;

  drawerDidCollapse?(view: V): void;
}
