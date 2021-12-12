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

import type * as Prism from "prismjs";
import {Item, Attr, Value, Record, Text} from "@swim/structure";
import type {ProcessorContext} from "../processor/ProcessorContext";
import {Directive} from "./Directive";

/** @public */
export class HighlightDirective extends Directive {
  constructor(prism: typeof import("prismjs")) {
    super();
    this.prism = prism;
  }

  readonly prism: typeof import("prismjs");

  override evaluate(model: Item, params: Value, context: ProcessorContext): Item {
    const language = params.stringValue();
    if (language !== void 0) {
      const grammar = this.loadLanguage(language);
      if (grammar !== null) {
        return this.highlight(model, grammar, context);
      }
    }
    return Item.absent();
  }

  protected loadLanguage(language: string): Prism.Grammar | null {
    let grammar: Prism.Grammar | null | undefined = this.prism.languages[language];
    if (grammar === void 0 && typeof require === "function") {
      require("prismjs/components/prism-" + language);
      grammar = this.prism.languages[language];
    }
    return grammar !== void 0 ? grammar : null;
  }

  protected highlight(model: Item, grammar: Prism.Grammar, context: ProcessorContext): Item {
    model = context.evaluate(model);
    const code = model.stringValue();
    if (code !== void 0) {
      const tokens = this.prism.tokenize(code, grammar);
      return this.processTokens(tokens);
    }
    return Item.absent();
  }

  protected processTokens(tokens: Prism.TokenStream): Value {
    if (typeof tokens === "string") {
      return Text.from(tokens);
    } else if (tokens instanceof this.prism.Token) {
      const attributes = Record.create(1).slot("class", tokens.type);
      const tag = Attr.of("span", attributes);
      const content = this.processTokens(tokens.content);
      const element = tag.concat(content);
      return element;
    } else if (Array.isArray(tokens)) {
      const n = tokens.length;
      const record = Record.create(n);
      for (let i = 0; i < n; i += 1) {
        const token = tokens[i]!;
        const value = this.processTokens(token);
        if (value.isDefined()) {
          record.item(value);
        }
      }
      return record;
    } else {
      return Value.absent();
    }
  }
}
