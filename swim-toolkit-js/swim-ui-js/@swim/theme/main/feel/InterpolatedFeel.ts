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

import type {Look} from "../look/Look";
import {Feel} from "../feel/Feel";

export class InterpolatedFeel extends Feel {
  override combine<T>(look: Look<T, any>, combination: T | undefined,
                      value: T, weight?: number): T {
    return look.combine(combination, value, weight);
  }
}
