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

import {AnyBoxShadow, BoxShadow} from "@swim/style";
import type {StyleContext} from "./StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class BoxShadowStyleAnimator<V extends StyleContext> extends StyleAnimator<V, BoxShadow | null, AnyBoxShadow | null> {
  override parse(value: string): BoxShadow | null {
    return BoxShadow.parse(value);
  }

  override fromAny(value: AnyBoxShadow): BoxShadow | null {
    return BoxShadow.fromAny(value);
  }
}
