// Copyright 2015-2021 Swim.inc
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

import type {View} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {BarView} from "@swim/toolbar";
import type {CardView} from "../card/CardView";
import type {DeckView} from "./DeckView";

/** @public */
export interface DeckViewObserver<V extends DeckView = DeckView> extends HtmlViewObserver<V> {
  viewWillAttachBar?(barView: BarView, targetView: View | null, view: V): void;

  viewDidDetachBar?(barView: BarView, view: V): void;

  viewWillAttachCard?(cardView: CardView, targetView: View | null, view: V): void;

  viewDidDetachCard?(cardView: CardView, view: V): void;

  viewWillPresentCard?(cardView: CardView, view: V): void;

  viewDidPresentCard?(cardView: CardView, view: V): void;

  viewWillDismissCard?(cardView: CardView, view: V): void;

  viewDidDismissCard?(cardView: CardView, view: V): void;
}
