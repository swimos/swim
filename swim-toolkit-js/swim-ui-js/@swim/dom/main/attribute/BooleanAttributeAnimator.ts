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

import {AttributeAnimator} from "./AttributeAnimator";
import type {ElementView} from "../element/ElementView";

/** @hidden */
export abstract class BooleanAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, boolean | undefined, string> {
  override parse(value: string): boolean | undefined {
    return !!value;
  }

  override fromAny(value: boolean | string): boolean | undefined {
    return !!value;
  }
}
