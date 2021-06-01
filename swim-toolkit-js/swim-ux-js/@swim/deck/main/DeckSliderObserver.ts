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

import type {HtmlView, HtmlViewObserver} from "@swim/dom";
import type {DeckSlider} from "./DeckSlider";

export interface DeckSliderObserver<V extends DeckSlider = DeckSlider> extends HtmlViewObserver<V> {
  deckSliderWillPushItem?(newItemView: HtmlView, oldItemView: HtmlView | null, view: V): void;

  deckSliderDidPushItem?(newItemView: HtmlView, oldItemView: HtmlView | null, view: V): void;

  deckSliderWillPopItem?(newItemView: HtmlView | null, oldItemView: HtmlView, view: V): void;

  deckSliderDidPopItem?(newItemView: HtmlView | null, oldItemView: HtmlView, view: V): void;
}
