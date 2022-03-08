// Copyright 2015-2022 Swim.inc
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

/** @public */
export class TemplateDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    params = context.evaluate(params);

    let path: Value | string | undefined = params.get("path");
    if (!path.isDefined()) {
      path = params;
    }
    path = path.stringValue();

    let type: Value | string | undefined = params.get("type");
    type = type.stringValue();

    if (path !== void 0) {
      const template = context.includeFile(path, type);
      return this.expand(template, model, context);
    }
    return Item.absent();
  }

  protected expand(template: Item, model: Item, context: ProcessorContext): Item {
    model = context.evaluate(model);
    const templateContext = context.createContext();
    if (model instanceof Record && model.fieldCount !== 0) {
      const params = Record.create(model.fieldCount);
      const content = Record.create(model.valueCount);
      for (let i = 0, n = model.length; i < n; i += 1) {
        const item = model.getItem(i);
        if (item instanceof Slot) {
          params.item(item);
        } else {
          content.item(item);
        }
      }
      return templateContext.expand(template, content, params);
    } else {
      return templateContext.expand(template, model, Value.absent());
    }
  }
}
