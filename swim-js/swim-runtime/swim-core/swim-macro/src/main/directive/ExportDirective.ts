// Copyright 2015-2023 Swim.inc
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
import {Directive} from "./Directive";

/** @public */
export class ExportDirective extends Directive {
  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    params = context.evaluate(params);
    const exportPath = params.stringValue();
    if (exportPath !== void 0) {
      this.export(exportPath, model, context);
    }
    return Item.absent();
  }

  protected export(exportPath: string, model: Item, context: ProcessorContext): void {
    model = context.evaluate(model);
    let output: string | undefined;
    if (model instanceof Text) {
      output = model.value;
    } else {
      const dotIndex = exportPath.lastIndexOf(".");
      if (dotIndex >= 0) {
        const extension = exportPath.substr(dotIndex + 1);
        const converter = context.getConverter(extension);
        if (converter !== null) {
          output = converter.convert(Unicode.stringOutput(), model);
        } else {
          output = model.stringValue();
        }
      } else {
        output = model.stringValue();
      }
    }
    if (output !== void 0) {
      context.exportFile(exportPath, output);
    }
  }
}
