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

import type {InletOptions} from "./Inlet";
import {StreamletPrototype, AbstractStreamlet} from "./AbstractStreamlet";

export function In(name: string): PropertyDecorator;
export function In(options: InletOptions): PropertyDecorator;
export function In(target: unknown, key: string): void;
export function In(target: unknown, key?: string): PropertyDecorator | void {
  if (arguments.length === 1) {
    if (typeof target === "string") {
      target = {name: target} as InletOptions;
    }
    return AbstractStreamlet.decorateInlet.bind(void 0, target as InletOptions);
  } else {
    AbstractStreamlet.decorateInlet({}, target as StreamletPrototype, key!);
  }
}
