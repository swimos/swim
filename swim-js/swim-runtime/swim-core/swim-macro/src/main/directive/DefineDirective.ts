// Copyright 2015-2021 Swim.inc
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

import {Item, Value} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import {Directive} from "./Directive";
import {ExpandDirective} from "./ExpandDirective";

/** @public */
export class DefineDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    const name = params.stringValue();
    if (name !== void 0) {
      const directive = new ExpandDirective(model);
      context.addDirective(name, directive);
    }
    return Item.absent();
  }
}
