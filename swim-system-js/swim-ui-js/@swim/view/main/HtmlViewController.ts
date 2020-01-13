// Copyright 2015-2020 SWIM.AI inc.
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

import {ElementViewController} from "./ElementViewController";
import {ViewHtml, HtmlView} from "./HtmlView";
import {HtmlViewObserver} from "./HtmlViewObserver";

export class HtmlViewController<V extends HtmlView = HtmlView> extends ElementViewController<V> implements HtmlViewObserver<V> {
  get node(): ViewHtml | null {
    const view = this._view;
    return view ? view.node : null;
  }
}
