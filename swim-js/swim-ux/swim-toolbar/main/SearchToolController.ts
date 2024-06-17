// Copyright 2015-2024 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Observes} from "@swim/util";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import type {ToolControllerObserver} from "./ToolController";
import {ToolController} from "./ToolController";
import {SearchToolView} from "./SearchToolView";

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

/** @public */
export class SearchToolController extends ToolController {
  declare readonly observerType?: Class<SearchToolControllerObserver>;

  @TraitViewRef({
    extends: true,
    viewType: SearchToolView,
    observesView: true,
    initView(toolView: SearchToolView): void {
      this.owner.input.setView(toolView.input.view);
    },
    deinitView(toolView: SearchToolView): void {
      this.owner.input.setView(null);
    },
    viewWillAttachInput(inputView: HtmlView): void {
      this.owner.input.setView(inputView);
    },
    viewDidDetachInput(inputView: HtmlView): void {
      this.owner.input.setView(null);
    },
    viewDidUpdateSearch(query: string, inputView: HtmlView): void {
      this.owner.callObservers("controllerDidUpdateSearch", query, inputView, this.owner);
    },
    viewDidSubmitSearch(query: string, inputView: HtmlView): void {
      this.owner.callObservers("controllerDidSubmitSearch", query, inputView, this.owner);
    },
    viewDidCancelSearch(inputView: HtmlView): void {
      this.owner.callObservers("controllerDidCancelSearch", inputView, this.owner);
    },
  })
  override readonly tool!: TraitViewRef<this, Trait, SearchToolView> & ToolController["tool"] & Observes<SearchToolView>;

  @ViewRef({
    viewType: HtmlView,
    willAttachView(inputView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachToolInputView", inputView, this.owner);
    },
    didDetachView(inputView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachToolInputView", inputView, this.owner);
    },
  })
  readonly input!: ViewRef<this, HtmlView>;
}
