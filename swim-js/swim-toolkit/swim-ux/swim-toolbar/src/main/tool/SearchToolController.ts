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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import {ToolController} from "./ToolController";
import {SearchToolView} from "./SearchToolView";
import type {SearchToolControllerObserver} from "./SearchToolControllerObserver";

/** @public */
export class SearchToolController extends ToolController {
  override readonly observerType?: Class<SearchToolControllerObserver>;

  @TraitViewRef<SearchToolController["tool"]>({
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
  static override readonly tool: FastenerClass<SearchToolController["tool"]>;

  @ViewRef<SearchToolController["input"]>({
    viewType: HtmlView,
    willAttachView(inputView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachToolInputView", inputView, this.owner);
    },
    didDetachView(inputView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachToolInputView", inputView, this.owner);
    },
  })
  readonly input!: ViewRef<this, HtmlView>;
  static readonly input: FastenerClass<SearchToolController["input"]>;
}
