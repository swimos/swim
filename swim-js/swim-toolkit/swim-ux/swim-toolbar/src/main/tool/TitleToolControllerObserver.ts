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

import type {HtmlView} from "@swim/dom";
import type {ToolControllerObserver} from "./ToolControllerObserver";
import type {TitleToolView} from "./TitleToolView";
import type {TitleToolController} from "./TitleToolController";

/** @public */
export interface TitleToolControllerObserver<C extends TitleToolController = TitleToolController> extends ToolControllerObserver<C> {
  controllerWillAttachToolView?(toolView: TitleToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: TitleToolView, controller: C): void;

  controllerWillAttachToolContentView?(toolContentView: HtmlView, controller: C): void;

  controllerDidDetachToolContentView?(toolContentView: HtmlView, controller: C): void;
}
