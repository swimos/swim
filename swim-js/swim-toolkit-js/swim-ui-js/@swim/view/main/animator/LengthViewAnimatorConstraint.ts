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

import {AnyLength, Length} from "@swim/math";
import type {View} from "../View";
import {ViewAnimatorConstraint} from "./ViewAnimatorConstraint";

/** @hidden */
export abstract class LengthViewAnimatorConstraint<V extends View> extends ViewAnimatorConstraint<V, Length | null | undefined, AnyLength | null | undefined> {
  override toNumber(value: Length | null | undefined): number {
    try {
      return value !== void 0 && value !== null ? value.pxValue() : 0;
    } catch (swallow) {
      return 0;
    }
  }

  override fromAny(value: AnyLength | null | undefined): Length | null | undefined {
    return value !== void 0 && value !== null ? Length.fromAny(value) : null;
  }

  override equalState(newState: Length | null | undefined, oldState: Length | null | undefined): boolean {
    if (newState !== void 0 && newState !== null) {
      return newState.equals(oldState);
    } else {
      return newState === oldState;
    }
  }
}
