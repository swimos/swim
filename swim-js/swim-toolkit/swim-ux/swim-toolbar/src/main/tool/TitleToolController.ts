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

import type {Class} from "@swim/util";
import type {MemberFastenerClass} from "@swim/component";
import {ViewRef} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {TraitViewRef} from "@swim/controller";
import {ToolController} from "./ToolController";
import {TitleToolView} from "./TitleToolView";
import {TitleToolContent, TitleToolTrait} from "./TitleToolTrait";
import type {TitleToolControllerObserver} from "./TitleToolControllerObserver";

/** @public */
export class TitleToolController extends ToolController {
  override readonly observerType?: Class<TitleToolControllerObserver>;

  @TraitViewRef<TitleToolController, TitleToolTrait, TitleToolView>({
    extends: true,
    traitType: TitleToolTrait,
    observesTrait: true,
    initTrait(toolTrait: TitleToolTrait): void {
      this.owner.setContentView(toolTrait.content.value, toolTrait);
    },
    deinitTrait(toolTrait: TitleToolTrait): void {
      this.owner.setContentView(null, toolTrait);
    },
    traitDidSetContent(newContent: TitleToolContent | null, oldContent: TitleToolContent | null, toolTrait: TitleToolTrait): void {
      this.owner.setContentView(newContent, toolTrait);
    },
    viewType: TitleToolView,
    observesView: true,
    initView(toolView: TitleToolView): void {
      this.owner.content.setView(toolView.content.view);
      const toolTrait = this.trait;
      if (toolTrait !== null) {
        this.owner.setContentView(toolTrait.content.value, toolTrait);
      }
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
  override readonly tool!: TraitViewRef<this, TitleToolTrait, TitleToolView>;
  static override readonly tool: MemberFastenerClass<TitleToolController, "tool">;

  protected createContentView(content: TitleToolContent, toolTrait: TitleToolTrait): HtmlView | string | null {
    if (typeof content === "function") {
      return content(toolTrait);
    } else {
      return content;
    }
  }

  protected setContentView(content: TitleToolContent | null, toolTrait: TitleToolTrait): void {
    const toolView = this.tool.view;
    if (toolView !== null) {
      const contentView = content !== null ? this.createContentView(content, toolTrait) : null;
      toolView.content.setView(contentView);
    }
  }

  @ViewRef<TitleToolController, HtmlView>({
    type: HtmlView,
    willAttachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerWillAttachToolContentView", contentView, this.owner);
    },
    didDetachView(contentView: HtmlView): void {
      this.owner.callObservers("controllerDidDetachToolContentView", contentView, this.owner);
    },
  })
  readonly content!: ViewRef<this, HtmlView>;
  static readonly content: MemberFastenerClass<TitleToolController, "content">;
}
