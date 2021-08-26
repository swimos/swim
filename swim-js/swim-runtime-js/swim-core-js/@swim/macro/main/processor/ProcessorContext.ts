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

import {Item, Attr, Slot, Value, Record, Text, Interpreter} from "@swim/structure";
import type {Processor} from "./Processor";
import type {Directive} from "../directive/Directive";
import type {Converter} from "../converter/Converter";

export class ProcessorContext {
  constructor(processor: Processor, interpreter: Interpreter,
              directives: {readonly [name: string]: Directive | undefined} = {},
              converters: {readonly [name: string]: Converter | undefined} = {}) {
    Object.defineProperty(this, "processor", {
      value: processor,
      enumerable: true,
    });
    Object.defineProperty(this, "interpreter", {
      value: interpreter,
      enumerable: true,
    });
    Object.defineProperty(this, "directives", {
      value: directives,
      enumerable: true,
    });
    Object.defineProperty(this, "converters", {
      value: converters,
      enumerable: true,
    });
  }

  readonly processor!: Processor;

  readonly interpreter!: Interpreter;

  readonly directives!: {readonly [name: string]: Directive | undefined};

  getDirective(name: string): Directive | null {
    const directive = this.directives[name];
    return directive !== void 0 ? directive : null;
  }

  addDirective(name: string, directive: Directive): void {
    const directives = this.directives as {[name: string]: Directive | undefined};
    directives[name] = directive;
  }

  removeDirective(name: string): void {
    const directives = this.directives as {[name: string]: Directive | undefined};
    delete directives[name];
  }

  readonly converters!: {readonly [name: string]: Converter | undefined};

  getConverter(name: string): Converter | null {
    const converter = this.converters[name];
    return converter !== void 0 ? converter : null;
  }

  addConverter(name: string, converter: Converter): void {
    const converters = this.converters as {[name: string]: Converter | undefined};
    converters[name] = converter;
  }

  removeConverter(name: string): void {
    const converters = this.converters as {[name: string]: Converter | undefined};
    delete converters[name];
  }

  createInterpreter(): Interpreter {
    const interpreter = this.interpreter;
    return new Interpreter(interpreter.settings,
                           interpreter.scopeStack !== null ? interpreter.scopeStack.slice(0) : null,
                           interpreter.scopeDepth);
  }

  createContext(): ProcessorContext {
    return new ProcessorContext(this.processor, this.createInterpreter(),
                                Object.create(this.directives),
                                Object.create(this.converters));
  }

  expand(template: Item, model: Item, params: Value): Item {
    this.interpreter.pushScope(params);
    this.interpreter.pushScope(Record.of(new Slot(Text.from("model"), model.toValue())));
    const result = this.evaluate(template);
    this.interpreter.popScope();
    this.interpreter.popScope();
    return result;
  }

  evaluate(model: Item): Item {
    model = this.applyDirective(model);
    if (model instanceof Record) {
      const scope = Record.create();
      this.interpreter.pushScope(scope);
      const n = model.length;
      const record = Record.create(n);
      for (let i = 0, n = model.length; i < n; i += 1) {
        let item = model.getItem(i);
        item = this.evaluate(item);
        if (item.isDefined()) {
          if (item instanceof Slot) {
            scope.item(item);
          }
          record.item(item);
        }
      }
      this.interpreter.popScope();
      return record;
    } else {
      return model.evaluate(this.interpreter);
    }
  }

  applyDirective(model: Item): Item {
    if (model instanceof Attr) {
      const value = this.applyDirective(model.value);
      if (value !== model.value) {
        if (value.isDefined()) {
          model = Attr.of(model.key, value);
        } else {
          model = Item.absent();
        }
      }
    } else if (model instanceof Slot) {
      const value = this.applyDirective(model.value);
      if (value !== model.value) {
        if (value.isDefined()) {
          model = Slot.of(model.key, value);
        } else {
          model = Item.absent();
        }
      }
    } else if (model instanceof Record && model.fieldCount !== 0) {
      const n = model.length;
      const header = Record.create(n);
      for (let i = 0; i < n; i += 1) {
        const item = model.getItem(i);
        if (item instanceof Attr) {
          const directive = this.getDirective(item.key.stringValue());
          if (directive !== null) {
            let record = directive.evaluate(model.subRecord(i + 1).flattened(), item.value, this);
            if (!header.isEmpty()) {
              record = header.concat(record);
            }
            return record;
          } else {
            header.item(item);
          }
        } else {
          header.item(item);
        }
      }
    }
    return model;
  }

  includeFile(path: string, type?: string): Item {
    return this.processor.includeFile(path, type);
  }

  exportFile(path: string, output: string): void {
    this.processor.exportFile(path, output);
  }
}
