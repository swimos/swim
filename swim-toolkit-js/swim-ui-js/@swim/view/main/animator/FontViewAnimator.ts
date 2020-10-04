// Copyright 2015-2020 Swim inc.
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

import {AnyFont, Font} from "@swim/font";
import {View} from "../View";
import {ViewAnimator} from "./ViewAnimator";

/** @hidden */
export abstract class FontViewAnimator<V extends View> extends ViewAnimator<V, Font | null | undefined, AnyFont | null | undefined> {
  fromAny(value: AnyFont | null | undefined): Font | null | undefined {
    return value !== void 0 && value !== null ? Font.fromAny(value) : value;
  }
}
ViewAnimator.Font = FontViewAnimator;
