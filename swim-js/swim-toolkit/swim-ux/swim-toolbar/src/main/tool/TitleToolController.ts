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

import type {Class, Observes} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import type {Trait} from "@swim/model";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import {ToolController} from "./ToolController";
import {TitleToolView} from "./TitleToolView";
import type {TitleToolControllerObserver} from "./TitleToolControllerObserver";

/** @public */
export class TitleToolController extends ToolController {
  override readonly observerType?: Class<TitleToolControllerObserver>;

  @TraitViewRef<TitleToolController["tool"]>({
    extends: true,
    viewType: TitleToolView,
    observesView: true,
    initView(toolView: TitleToolView): void {
      this.owner.content.setView(toolView.content.view);
    },
    deinitView(toolView: TitleToolView): void {
      this.owner.content.setView(null);
    },
    viewWillAttachContent(contentView: HtmlView): void {
      this.owner.content.setView(contentView);
    },
    viewDidDetachContent(contentView: HtmlView): void {
      this.owner.content.setView(null);
    },
  })
  override readonly tool!: TraitViewRef<this, Trait, TitleToolView> & ToolController["tool"] & Observes<TitleToolView>;
  static override readonly tool: FastenerClass<TitleToolController["tool"]>;

  @ViewRef<TitleToolController["content"]>({
    viewType: HtmlView,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachToolContentView", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachToolContentView", contentView, this.owner);
    },
  })
  readonly content!: ViewRef<this, HtmlView>;
  static readonly content: FastenerClass<TitleToolController["content"]>;
}
