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

import {HtmlViewController} from "@swim/dom";
import type {DrawerPlacement, DrawerView} from "./DrawerView";
import type {DrawerViewObserver} from "./DrawerViewObserver";

export class DrawerViewController<V extends DrawerView = DrawerView> extends HtmlViewController<V> implements DrawerViewObserver<V> {
  drawerWillSetPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void {
    // hook
  }

  drawerDidSetPlacement(newPlacement: DrawerPlacement, oldPlacement: DrawerPlacement, view: V): void {
    // hook
  }

  drawerWillShow(view: V): void {
    // hook
  }

  drawerDidShow(view: V): void {
    // hook
  }

  drawerWillHide(view: V): void {
    // hook
  }

  drawerDidHide(view: V): void {
    // hook
  }

  drawerWillExpand(view: V): void {
    // hook
  }

  drawerDidExpand(view: V): void {
    // hook
  }

  drawerWillCollapse(view: V): void {
    // hook
  }

  drawerDidCollapse(view: V): void {
    // hook
  }
}
