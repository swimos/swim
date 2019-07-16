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

import {ElementViewController} from "./ElementViewController";
import {ViewSvg, SvgView} from "./SvgView";
import {SvgViewObserver} from "./SvgViewObserver";

export class SvgViewController<V extends SvgView = SvgView> extends ElementViewController<V> implements SvgViewObserver<V> {
  get node(): ViewSvg | null {
    const view = this._view;
    return view ? view.node : null;
  }
}
