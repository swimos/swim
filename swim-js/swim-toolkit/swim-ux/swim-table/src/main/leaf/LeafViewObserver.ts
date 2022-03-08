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

import type {View, PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {CellView} from "../cell/CellView";
import type {LeafView} from "./LeafView";

/** @public */
export interface LeafViewObserver<V extends LeafView = LeafView> extends HtmlViewObserver<V> {
  viewWillAttachCell?(cellView: CellView, targetView: View | null, view: V): void;

  viewDidDetachCell?(cellView: CellView, view: V): void;

  viewWillHighlight?(view: V): void;

  viewDidHighlight?(view: V): void;

  viewWillUnhighlight?(view: V): void;

  viewDidUnhighlight?(view: V): void;

  viewDidEnter?(view: V): void;

  viewDidLeave?(view: V): void;

  viewDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  viewDidLongPress?(input: PositionGestureInput, view: V): void;
}
