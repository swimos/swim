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

import type {HtmlView} from "@swim/dom";
import type {ToolControllerObserver} from "./ToolControllerObserver";
import type {SearchToolView} from "./SearchToolView";
import type {SearchToolController} from "./SearchToolController";

/** @public */
export interface SearchToolControllerObserver<C extends SearchToolController = SearchToolController> extends ToolControllerObserver<C> {
  controllerWillAttachToolView?(toolView: SearchToolView, controller: C): void;

  controllerDidDetachToolView?(toolView: SearchToolView, controller: C): void;

  controllerWillAttachToolInputView?(toolInputView: HtmlView, controller: C): void;

  controllerDidDetachToolInputView?(toolInputView: HtmlView, controller: C): void;

  controllerDidUpdateSearch?(query: string, inputView: HtmlView, controller: C): void;

  controllerDidSubmitSearch?(query: string, inputView: HtmlView, controller: C): void;

  controllerDidCancelSearch?(inputView: HtmlView, controller: C): void;
}
