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

import type {HtmlView} from "@swim/dom";
import {TokenViewController} from "./TokenViewController";
import type {InputTokenView} from "./InputTokenView";
import type {InputTokenViewObserver} from "./InputTokenViewObserver";

export class InputTokenViewController<V extends InputTokenView = InputTokenView> extends TokenViewController<V> implements InputTokenViewObserver<V> {
  tokenDidUpdateInput(inputView: HtmlView, view: V): void {
    // hook
  }

  tokenDidChangeInput(inputView: HtmlView, view: V): void {
    // hook
  }

  tokenDidAcceptInput(inputView: HtmlView, view: V): void {
    // hook
  }
}
