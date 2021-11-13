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

import type {HtmlViewObserver} from "@swim/dom";
import type {TokenView} from "./TokenView";

export interface TokenViewObserver<V extends TokenView = TokenView> extends HtmlViewObserver<V> {
  tokenWillExpand?(view: V): void;

  tokenDidExpand?(view: V): void;

  tokenWillCollapse?(view: V): void;

  tokenDidCollapse?(view: V): void;

  tokenDidPressHead?(view: V): void;

  tokenDidPressBody?(view: V): void;

  tokenDidPressFoot?(view: V): void;
}
