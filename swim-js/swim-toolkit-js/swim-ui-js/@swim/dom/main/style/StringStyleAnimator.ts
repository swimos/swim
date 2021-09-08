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

import type {StyleContext} from "./StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class StringStyleAnimator<V extends StyleContext> extends StyleAnimator<V, string | undefined> {
  override parse(value: string): string | undefined {
    return value;
  }

  override fromCssValue(value: CSSStyleValue): string | undefined {
    return value.toString();
  }

  override fromAny(value: string): string | undefined {
    return value;
  }

  override equalState(newState: string | undefined, oldState: string | undefined): boolean {
    return newState === oldState;
  }
}
