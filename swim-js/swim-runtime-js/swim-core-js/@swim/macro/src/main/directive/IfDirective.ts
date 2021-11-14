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

import {Item, Attr, Value, Record} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import {Directive} from "./Directive";

/** @public */
export class IfDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    if (model instanceof Record) {
      const n = model.length;
      let i = 0;
      let thenModel = Value.absent();
      while (i < n) {
        const item = model.getItem(i);
        i += 1;
        if (item instanceof Attr && item.key.value === "else") {
          break;
        } else if (i === 1) {
          thenModel = item;
        } else if (i === 2) {
          thenModel = Record.of(thenModel, item);
        } else {
          (thenModel as Record).item(item);
        }
      }
      let elseModel: Value;
      if (i === n - 1) {
        elseModel = model.getItem(i);
      } else if (i < n) {
        elseModel = model.subRecord(i).branch();
      } else {
        elseModel = Value.absent();
      }
      return this.evaluateCondition(params, thenModel, elseModel, context);
    } else {
      return this.evaluateCondition(params, model, Value.absent(), context);
    }
    return Item.absent();
  }

  protected evaluateCondition(predicate: Value, thenModel: Item, elseModel: Item,
                              context: ProcessorContext): Item {
    predicate = context.evaluate(predicate);
    if (predicate.isDefinite()) {
      thenModel = context.evaluate(thenModel);
      return thenModel;
    } else {
      elseModel = context.evaluate(elseModel);
      return elseModel;
    }
  }
}
