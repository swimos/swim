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

import {View} from "@swim/view";
import type {DeckCard} from "./DeckCard";
import type {DeckView} from "./DeckView";
import {DeckViewController} from "./DeckViewController";
import {TitleDeckBar} from "./TitleDeckBar";

export class TitleDeckViewController<V extends DeckView> extends DeckViewController<V> {
  override onSetView(deckView: V | null): void {
    super.onSetView(deckView);
    if (deckView !== null) {
      this.initBar(deckView);
    }
  }

  protected initBar(deckView: V): void {
    let deckBar = deckView.bar.view;
    if (!(deckBar instanceof TitleDeckBar)) {
      deckBar = TitleDeckBar.create();
      deckView.bar.setView(deckBar);
    }
  }

  override deckWillPushCard(newCardView: DeckCard, oldCardView: DeckCard | null, deckView: V): void {
    const deckBar = deckView.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      deckBar.pushTitle(newCardView.cardTitle.getStateOr(""));
      const backMembrane = deckBar.backMembrane.view;
      if (backMembrane !== null) {
        backMembrane.pointerEvents.setState("none", View.Intrinsic);
      }
    }
  }

  override deckDidPushCard(newCardView: DeckCard, oldCardView: DeckCard | null, deckView: V): void {
    const deckBar = deckView.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      const backMembrane = deckBar.backMembrane.view;
      if (backMembrane !== null) {
        backMembrane.pointerEvents.setState("auto", View.Intrinsic);
      }
    }
  }

  override deckWillPopCard(newCardView: DeckCard | null, oldCardView: DeckCard, deckView: V): void {
    const deckBar = deckView.bar.view;
    if (deckBar instanceof TitleDeckBar) {
      deckBar.popTitle();
    }
  }

  override deckDidPressBackButton(event: Event | null, deckView: V): void {
    if (!deckView.deckPhase.isAnimating()) {
      deckView.popCard();
    }
  }
}
