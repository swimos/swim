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
import type {ToolViewObserver} from "./ToolViewObserver";
import type {SearchToolView} from "./SearchToolView";

/** @public */
export interface SearchToolViewObserver<V extends SearchToolView = SearchToolView> extends ToolViewObserver<V> {
  viewWillAttachInput?(inputView: HtmlView, view: V): void;

  viewDidDetachInput?(inputView: HtmlView, view: V): void;

  viewDidUpdateSearch?(query: string, inputView: HtmlView, view: V): void;

  viewDidSubmitSearch?(query: string, inputView: HtmlView, view: V): void;

  viewDidCancelSearch?(inputView: HtmlView, view: V): void;
}
