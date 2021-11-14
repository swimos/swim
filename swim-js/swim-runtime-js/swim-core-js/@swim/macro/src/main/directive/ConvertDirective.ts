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

import {Unicode} from "@swim/codec";
import {Item, Value, Text} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import type {Converter} from "../converter/Converter";
import {Directive} from "./Directive";

/** @public */
export class ConvertDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    const converterName = params.stringValue();
    if (converterName !== void 0) {
      const converter = context.getConverter(converterName);
      if (converter !== null) {
        return this.convert(converter, model, context);
      }
    }
    return Item.absent();
  }

  protected convert(converter: Converter, model: Item, context: ProcessorContext): Item {
    model = context.evaluate(model);
    const output = converter.convert(Unicode.stringOutput(), model);
    return Text.from(output);
  }
}
