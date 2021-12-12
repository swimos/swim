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

import * as FS from "fs";
import * as Path from "path";
import * as Prism from "prismjs";
import {Diagnostic, Input, Parser, Unicode} from "@swim/codec";
import {Item, Value, Text, Interpreter} from "@swim/structure";
import {Recon} from "@swim/recon";
import {ProcessorContext} from "./ProcessorContext";
import type {Directive} from "../directive/Directive";
import {DefineDirective} from "../"; // forward import
import {IncludeDirective} from "../"; // forward import
import {TemplateDirective} from "../"; // forward import
import {ConvertDirective} from "../"; // forward import
import {ExportDirective} from "../"; // forward import
import {IfDirective} from "../"; // forward import
import {EachDirective} from "../"; // forward import
import {HighlightDirective} from "../"; // forward import
import type {Converter} from "../converter/Converter";
import {ReconConverter} from "../"; // forward import
import {HtmlConverter} from "../"; // forward import
import {CssConverter} from "../"; // forward import

/** @public */
export class Processor {
  constructor() {
    this.directives = {};
    this.converters = {};
    this.initDirectives();
    this.initConverters();
  }

  readonly directives: {readonly [name: string]: Directive | undefined};

  protected initDirectives(): void {
    this.addDirective("define", new DefineDirective());
    this.addDirective("include", new IncludeDirective());
    this.addDirective("template", new TemplateDirective());
    this.addDirective("convert", new ConvertDirective());
    this.addDirective("export", new ExportDirective());
    this.addDirective("if", new IfDirective());
    this.addDirective("each", new EachDirective());

    if (Prism !== void 0) {
      this.addDirective("highlight", new HighlightDirective(Prism));
    }
  }

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

  readonly converters: {readonly [name: string]: Converter | undefined};

  protected initConverters(): void {
    this.addConverter("recon", new ReconConverter());
    this.addConverter("html", new HtmlConverter());
    this.addConverter("css", new CssConverter());
  }

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
    return new Interpreter();
  }

  createContext(): ProcessorContext {
    return new ProcessorContext(this, this.createInterpreter(),
                                Object.create(this.directives),
                                Object.create(this.converters));
  }

  evaluate(model: Item, params?: Item, context?: ProcessorContext): Item {
    if (context === void 0) {
      context = this.createContext();
    }
    if (params !== void 0) {
      context.interpreter.pushScope(params);
    }
    const result = context.evaluate(model);
    if (params !== void 0) {
      context.interpreter.popScope();
    }
    return result;
  }

  includeFile(path: string, type?: string): Item {
    if (FS !== void 0 && FS.existsSync(path)) {
      const content = FS.readFileSync(path).toString();
      if (type === void 0) {
        const dotIndex = path.lastIndexOf(".");
        if (dotIndex >= 0) {
          type = path.substr(dotIndex + 1);
        }
      }
      if (type === "recon") {
        const input = Unicode.stringInput(content).withId(path);
        return this.parseRecon(input);
      } else {
        return Text.from(content);
      }
    }
    return Value.absent();
  }

  protected parseRecon(input: Input): Item {
    while (input.isCont() && Recon.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Recon.structureParser().parseBlock(input);
    if (parser.isDone()) {
      while (input.isCont() && Recon.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  exportFile(path: string, output: string): void {
    if (FS !== void 0 && Path !== void 0) {
      const directory = Path.dirname(path);
      FS.mkdirSync(directory, {recursive: true});
      FS.writeFileSync(path, output);
    }
  }
}
