// Copyright 2015-2024 Nstream, inc.
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

import type {Item} from "@swim/structure";
import {Slot} from "@swim/structure";
import type {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import {Directive} from "./Directive";

/** @public */
export class ExpandDirective extends Directive {
  constructor(template: Item) {
    super();
    this.template = template;
  }

  readonly template: Item;

  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    return this.expand(this.template, model, params, context);
  }

  protected expand(template: Item, model: Item, params: Value, context: ProcessorContext): Item {
    model = context.evaluate(model);
    const templateContext = context.createContext();
    if (model instanceof Record && model.fieldCount !== 0) {
      const scope = Record.create(model.fieldCount);
      const content = Record.create(model.valueCount);
      for (let i = 0; i < model.length; i += 1) {
        const item = model.getItem(i);
        if (item instanceof Slot) {
          scope.item(item);
        } else {
          content.item(item);
        }
      }
      if (params instanceof Record) {
        for (let i = 0; i < params.length; i += 1) {
          scope.item(params.getItem(i));
        }
      } else if (params.isDistinct()) {
        scope.item(params);
      }
      return templateContext.expand(template, content, scope);
    } else {
      return templateContext.expand(template, model, params);
    }
  }
}
