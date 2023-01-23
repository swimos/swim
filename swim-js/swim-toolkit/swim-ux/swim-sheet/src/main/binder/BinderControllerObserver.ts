// Copyright 2015-2023 Swim.inc
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

import type {Trait} from "@swim/model";
import type {PositionGestureInput} from "@swim/view";
import type {ToolController, BarView, BarController} from "@swim/toolbar";
import type {SheetView} from "../sheet/SheetView";
import type {SheetController} from "../sheet/SheetController";
import type {SheetControllerObserver} from "../sheet/SheetControllerObserver";
import type {BinderTabStyle, BinderView} from "./BinderView";
import type {BinderController} from "./BinderController";

/** @public */
export interface BinderControllerObserver<C extends BinderController = BinderController> extends SheetControllerObserver<C> {
  controllerWillAttachBinderTrait?(binderTrait: Trait, controller: C): void;

  controllerDidDetachBinderTrait?(binderTrait: Trait, controller: C): void;

  controllerWillAttachBinderView?(binderView: BinderView, controller: C): void;

  controllerDidDetachBinderView?(binderView: BinderView, controller: C): void;

  controllerDidSetTabStyle(tabStyle: BinderTabStyle, controller: C): void;

  controllerWillAttachTabBar?(tabBarController: BarController, controller: C): void;

  controllerDidDetachTabBar?(tabBarController: BarController, controller: C): void;

  controllerWillAttachTabBarView?(tabBarView: BarView, controller: C): void;

  controllerDidDetachTabBarView?(tabBarView: BarView, controller: C): void;

  controllerWillAttachTab?(tabController: SheetController, controller: C): void;

  controllerDidDetachTab?(tabController: SheetController, controller: C): void;

  controllerWillAttachTabTrait?(tabTrait: Trait, tabController: SheetController, controller: C): void;

  controllerDidDetachTabTrait?(tabTrait: Trait, tabController: SheetController, controller: C): void;

  controllerWillAttachTabView?(tabView: SheetView, tabController: SheetController, controller: C): void;

  controllerDidDetachTabView?(tabView: SheetView, tabController: SheetController, controller: C): void;

  controllerWillAttachTabHandle?(tabHandleController: ToolController, tabController: SheetController, controller: C): void;

  controllerDidDetachTabHandle?(tabHandleController: ToolController, tabController: SheetController, controller: C): void;

  controllerDidPressTabHandle?(input: PositionGestureInput, event: Event | null, tabController: SheetController, controller: C): void;

  controllerDidLongPressTabHandle?(input: PositionGestureInput, tabController: SheetController, controller: C): void;

  controllerWillAttachActive?(activeController: SheetController, controller: C): void;

  controllerDidDetachActive?(activeController: SheetController, controller: C): void;

  controllerWillAttachActiveTrait?(activeTrait: Trait, controller: C): void;

  controllerDidDetachActiveTrait?(activeTrait: Trait, controller: C): void;

  controllerWillAttachActiveView?(activeView: SheetView, controller: C): void;

  controllerDidDetachActiveView?(activeView: SheetView, controller: C): void;
}
