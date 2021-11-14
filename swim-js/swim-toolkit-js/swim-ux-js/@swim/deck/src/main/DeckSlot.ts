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

import type {Color} from "@swim/style";
import {Property} from "@swim/fastener";
import type {Look, ThemeAnimator} from "@swim/theme";
import {HtmlView} from "@swim/dom";
import {AnyDeckPost, DeckPost} from "./DeckPost";

/** @public */
export abstract class DeckSlot extends HtmlView {
  constructor(node: HTMLElement) {
    super(node);
    this.initSlot();
  }

  protected initSlot(): void {
    this.addClass("deck-slot");
  }

  @Property({type: DeckPost, state: null, inherits: true})
  readonly post!: Property<this, DeckPost | null, AnyDeckPost | null>;

  @Property({type: DeckPost, state: null})
  readonly nextPost!: Property<this, DeckPost | null, AnyDeckPost | null>;

  @Property({type: DeckPost, state: null})
  readonly prevPost!: Property<this, DeckPost | null, AnyDeckPost | null>;

  abstract readonly deckPhase: ThemeAnimator<this, number | undefined>;

  abstract readonly slotAlign: ThemeAnimator<this, number>;

  abstract readonly colorLook: Look<Color>;
}
