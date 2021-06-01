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

import type {AnyTiming} from "@swim/mapping";
import type {PositionGestureInput} from "@swim/view";
import type {HtmlViewObserver} from "@swim/dom";
import type {TreeLeaf} from "./TreeLeaf";

export interface TreeLeafObserver<V extends TreeLeaf = TreeLeaf> extends HtmlViewObserver<V> {
  leafDidPress?(input: PositionGestureInput, event: Event | null, view: V): void;

  leafDidLongPress?(input: PositionGestureInput, view: V): void;

  leafWillHighlight?(timing: AnyTiming | boolean, view: V): void;

  leafDidHighlight?(timing: AnyTiming | boolean, view: V): void;

  leafWillUnhighlight?(timing: AnyTiming | boolean, view: V): void;

  leafDidUnhighlight?(timing: AnyTiming | boolean, view: V): void;
}
