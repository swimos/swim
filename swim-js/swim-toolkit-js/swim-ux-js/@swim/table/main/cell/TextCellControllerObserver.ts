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

import type {HtmlView} from "@swim/dom";
import type {CellControllerObserver} from "./CellControllerObserver";
import type {TextCellView} from "./TextCellView";
import type {TextCellTrait} from "./TextCellTrait";
import type {TextCellController} from "./TextCellController";

export interface TextCellControllerObserver<C extends TextCellController = TextCellController> extends CellControllerObserver<C> {
  controllerWillSetCellTrait?(newCellTrait: TextCellTrait | null, oldCellTrait: TextCellTrait | null, controller: C): void;

  controllerDidSetCellTrait?(newCellTrait: TextCellTrait | null, oldCellTrait: TextCellTrait | null, controller: C): void;

  controllerWillSetCellView?(newCellView: TextCellView | null, oldCellView: TextCellView | null, controller: C): void;

  controllerDidSetCellView?(newCellView: TextCellView | null, oldCellView: TextCellView | null, controller: C): void;

  controllerWillSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, controller: C): void;

  controllerDidSetCellContentView?(newCellContentView: HtmlView | null, oldCellContentView: HtmlView | null, controller: C): void;
}
