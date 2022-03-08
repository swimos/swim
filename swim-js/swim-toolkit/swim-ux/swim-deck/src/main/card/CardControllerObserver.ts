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

import type {ControllerObserver} from "@swim/controller";
import type {ToolView} from "@swim/toolbar";
import type {CardView} from "./CardView";
import type {CardTrait} from "./CardTrait";
import type {CardController} from "./CardController";

/** @public */
export interface CardControllerObserver<C extends CardController = CardController> extends ControllerObserver<C> {
  controllerWillAttachCardTrait?(cardTrait: CardTrait, controller: C): void;

  controllerDidDetachCardTrait?(cardTrait: CardTrait, controller: C): void;

  controllerWillAttachCardView?(cardView: CardView, controller: C): void;

  controllerDidDetachCardView?(cardView: CardView, controller: C): void;

  controllerWillAttachCardTitleView?(titleView: ToolView, controller: C): void;

  controllerDidDetachCardTitleView?(titleView: ToolView, controller: C): void;

  controllerWillPresentCardView?(cardView: CardView, controller: C): void;

  controllerDidPresentCardView?(cardView: CardView, controller: C): void;

  controllerWillDismissCardView?(cardView: CardView, controller: C): void;

  controllerDidDismissCardView?(cardView: CardView, controller: C): void;
}
