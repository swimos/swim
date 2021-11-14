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

import {Affinity} from "@swim/fastener";
import type {DeckCard} from "./DeckCard";
import {DeckView} from "./DeckView";
import {TitleDeckBar} from "./TitleDeckBar";

/** @public */
export class TitleDeckView extends DeckView {
  constructor(node: HTMLElement) {
    super(node);
    this.initBar();
  }

  protected initBar(): void {
    let deckBar = this.bar.view;
    if (!(deckBar instanceof TitleDeckBar)) {
      deckBar = TitleDeckBar.create();
      this.bar.setView(deckBar);
    }
  }

  protected override willPushCard(newCardView: DeckCard, oldCardView: DeckCard | null): void {
    super.willPushCard(newCardView, oldCardView);
    const deckBar = this.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      deckBar.pushTitle(newCardView.cardTitle.getStateOr(""));
      const backMembrane = deckBar.backMembrane.view;
      if (backMembrane !== null) {
        backMembrane.pointerEvents.setState("none", Affinity.Intrinsic);
      }
    }
  }

  protected override didPushCard(newCardView: DeckCard, oldCardView: DeckCard | null): void {
    const deckBar = this.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      const backMembrane = deckBar.backMembrane.view;
      if (backMembrane !== null) {
        backMembrane.pointerEvents.setState("auto", Affinity.Intrinsic);
      }
    }
    super.didPushCard(newCardView, oldCardView);
  }

  protected override willPopCard(newCardView: DeckCard | null, oldCardView: DeckCard): void {
    super.willPopCard(newCardView, oldCardView);
    const deckBar = this.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      deckBar.popTitle();
    }
  }

  override didPressBackButton(event: Event | null): void {
    if (!this.deckPhase.tweening) {
      this.popCard();
    }
    super.didPressBackButton(event);
  }
}
