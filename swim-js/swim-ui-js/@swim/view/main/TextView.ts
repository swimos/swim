// Copyright 2015-2019 SWIM.AI inc.
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

import {View} from "./View";
import {NodeView} from "./NodeView";
import {TextViewController} from "./TextViewController";

export interface ViewText extends Text {
  view?: TextView;
}

export class TextView extends NodeView {
  /** @hidden */
  readonly _node: ViewText;
  /** @hidden */
  _viewController: TextViewController | null;

  constructor(node: Text, key: string | null = null) {
    super(node, key);
  }

  get node(): ViewText {
    return this._node;
  }

  protected initNode(node: ViewText): void {
    // hook
  }

  get viewController(): TextViewController | null {
    return this._viewController;
  }
}
View.Text = TextView;
