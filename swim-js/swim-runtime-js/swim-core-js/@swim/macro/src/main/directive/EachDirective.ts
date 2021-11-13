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

import {Item, Slot, Value, Record} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import {Directive} from "./Directive";

export class EachDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    if (params instanceof Record) {
      return this.evaluateEach(model, params, context);
    }
    return Item.absent();
  }

  protected evaluateEach(model: Item, params: Record, context: ProcessorContext): Item {
    const interpreter = context.interpreter;
    const param = params.head();
    const tail = params.tail();
    if (param instanceof Slot) {
      const key = param.key;
      const values = param.value.evaluate(interpreter);
      if (values instanceof Record) {
        const n = values.length;
        let record = Record.create(n);
        for (let i = 0; i < n; i += 1) {
          const value = values.getItem(i);
          interpreter.pushScope(Record.create(1).slot(key, value));
          const item = this.evaluateEach(model, tail, context);
          if (item.isDefined()) {
            if (tail.isEmpty()) {
              record.item(item);
            } else {
              record = record.concat(item);
            }
          }
          interpreter.popScope();
        }
        return record;
      } else {
        interpreter.pushScope(Record.create(1).slot(key, values));
        const item = this.evaluateEach(model, tail, context);
        interpreter.popScope();
        return item;
      }
    } else {
      return context.evaluate(model);
    }
  }
}
