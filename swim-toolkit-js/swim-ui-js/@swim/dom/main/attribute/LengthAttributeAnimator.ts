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

import {AnyLength, Length} from "@swim/length";
import {AttributeAnimator} from "./AttributeAnimator";
import {ElementView} from "../element/ElementView";

/** @hidden */
export abstract class LengthAttributeAnimator<V extends ElementView> extends AttributeAnimator<V, Length, AnyLength> {
  parse(value: string): Length {
    return Length.parse(value, this.node);
  }

  fromAny(value: AnyLength): Length {
    return Length.fromAny(value, this.node);
  }
}
AttributeAnimator.Length = LengthAttributeAnimator;
