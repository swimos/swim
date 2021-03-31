// Copyright 2015-2020 Swim inc.
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

import type {HtmlViewObserver} from "@swim/dom";
import type {DeckCard} from "./DeckCard";
import type {DeckView} from "./DeckView";

export interface DeckViewObserver<V extends DeckView = DeckView> extends HtmlViewObserver<V> {
  deckWillPushCard?(newCardView: DeckCard, oldCardView: DeckCard | null, view: V): void;

  deckDidPushCard?(newCardView: DeckCard, oldCardView: DeckCard | null, view: V): void;

  deckWillPopCard?(newCardView: DeckCard | null, oldCardView: DeckCard, view: V): void;

  deckDidPopCard?(newCardView: DeckCard | null, oldCardView: DeckCard, view: V): void;

  deckDidPressBackButton?(event: Event | null, view: V): void;

  deckDidPressCloseButton?(event: Event | null, view: V): void;
}
