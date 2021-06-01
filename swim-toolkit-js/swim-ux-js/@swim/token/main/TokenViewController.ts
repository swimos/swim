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

import {HtmlViewController} from "@swim/dom";
import type {TokenViewState, TokenView} from "./TokenView";
import type {TokenViewObserver} from "./TokenViewObserver";

export class TokenViewController<V extends TokenView = TokenView> extends HtmlViewController<V> implements TokenViewObserver<V> {
  get tokenState(): TokenViewState | null {
    const view = this.view;
    return view !== null ? view.tokenState : null;
  }

  tokenWillExpand(view: V): void {
    // hook
  }

  tokenDidExpand(view: V): void {
    // hook
  }

  tokenWillCollapse(view: V): void {
    const labelView = view.label.view;
    if (labelView !== null) {
      labelView.node.blur();
    }
  }

  tokenDidCollapse(view: V): void {
    // hook
  }

  tokenDidPressHead(view: V): void {
    view.toggle();
    const labelView = view.label.view;
    if (labelView !== null && view.isExpanded()) {
      labelView.node.focus();
    }
  }

  tokenDidPressBody(view: V): void {
    // hook
  }

  tokenDidPressFoot(view: V): void {
    // hook
  }
}
