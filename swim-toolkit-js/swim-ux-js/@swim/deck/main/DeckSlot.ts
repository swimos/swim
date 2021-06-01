// Copyright 2015-2021 Swim inc.
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

import type {Color} from "@swim/style";
import type {Look} from "@swim/theme";
import {ViewProperty, ViewAnimator} from "@swim/view";
import {HtmlView} from "@swim/dom";
import {AnyDeckPost, DeckPost} from "./DeckPost";

export abstract class DeckSlot extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initSlot();
  }

  protected initSlot(): void {
    this.addClass("deck-slot");
  }

  @ViewProperty({type: DeckPost, state: null, inherit: true})
  readonly post!: ViewProperty<this, DeckPost | null, AnyDeckPost | null>;

  @ViewProperty({type: DeckPost, state: null})
  readonly nextPost!: ViewProperty<this, DeckPost | null, AnyDeckPost | null>;

  @ViewProperty({type: DeckPost, state: null})
  readonly prevPost!: ViewProperty<this, DeckPost | null, AnyDeckPost | null>;

  abstract readonly deckPhase: ViewAnimator<this, number | undefined>;

  abstract readonly slotAlign: ViewAnimator<this, number>;

  abstract readonly colorLook: Look<Color>;
}
