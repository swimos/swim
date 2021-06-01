// Copyright 2015-2021 Swim inc.
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

import type {Output} from "@swim/codec";
import {Item, Attr, Slot, Value, Record, Text, Num} from "@swim/structure";
import {Converter} from "./Converter";

export class CssConverter extends Converter {
  override convert<O>(model: Item, output: Output<O>): O {
    if (model instanceof Record) {
      output = this.writeStylesheet(model, output);
    } else if (model instanceof Text) {
      output = output.write(model.value);
    }
    return output.bind();
  }

  writeStylesheet<O>(stylesheet: Record, output: Output<O>): Output<O> {
    if (stylesheet.tag !== void 0) {
      output = this.writeBlock(stylesheet, output);
    } else {
      for (let i = 0, n = stylesheet.length; i < n; i += 1) {
        const item = stylesheet.getItem(i);
        if (item instanceof Record) {
          output = this.writeBlock(item, output);
        }
      }
    }
    return output;
  }

  writeBlock<O>(block: Record, output: Output<O>): Output<O> {
    const head = block.head();
    if (head instanceof Attr) {
      const tag = head.key.value;
      if (tag === "rule") {
        output = this.writeRuleset(Value.absent(), head.value, block.tail().branch(), output);
      } else if (tag === "media") {
        output = this.writeRuleset(head.value, Value.absent(), block.tail().branch(), output);
      }
    } else {
      output = this.writeStylesheet(block, output);
    }
    return output;
  }

  writeRuleset<O>(mediaQueries: Value, selectors: Value, declarations: Value, output: Output<O>): Output<O> {
    let inMedia = false;
    let inRule = false;
    let isEmpty = true;
    if (declarations instanceof Record) {
      for (let i = 0, n = declarations.length; i < n; i += 1) {
        const declaration = declarations.getItem(i);
        const head = declaration.head();
        if (head instanceof Attr) {
          const tag = head.key.value;
          if (tag === "rule") {
            if (inRule) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inRule = false;
            }
            if (inMedia) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inMedia = false;
            }
            output = this.writeRuleset(mediaQueries, this.nestedSelector(selectors, head.value),
                                       declaration.tail().branch(), output);
            isEmpty = false;
          } else if (tag === "media") {
            if (inRule) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inRule = false;
            }
            if (inMedia) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inMedia = false;
            }
            output = this.writeRuleset(this.nestedMediaQuery(mediaQueries, head.value), selectors,
                                       declaration.tail().branch(), output);
            isEmpty = false;
          }
        } else if (declaration instanceof Slot) {
          if (!inMedia && mediaQueries.isDistinct()) {
            output = output.write(64/*'@'*/);
            output = output.write("media");
            output = output.write(32/*' '*/);
            output = this.writeMediaQueries(mediaQueries, output);
            output = output.write(32/*' '*/);
            output = output.write(123/*'{'*/);
            output = output.write(10/*'\n'*/);
            inMedia = true;
            isEmpty = false;
          }
          if (!inRule) {
            output = this.writeSelectors(selectors, output);
            output = output.write(32/*' '*/);
            output = output.write(123/*'{'*/);
            output = output.write(10/*'\n'*/);
            inRule = true;
            isEmpty = false;
          }
          output = this.writeDeclaration(declaration.key, declaration.value, output);
        } else if (declaration instanceof Record && !declaration.isEmpty()) {
          if (declaration.fieldCount === 0) {
            if (inRule) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inRule = false;
            }
            if (inMedia) {
              output = output.write(125/*'}'*/);
              output = output.write(10/*'\n'*/);
              inMedia = false;
            }
            output = this.writeRuleset(mediaQueries, selectors, declaration, output);
            isEmpty = false;
          } else {
            if (!inMedia && mediaQueries.isDistinct()) {
              output = output.write(64/*'@'*/);
              output = output.write("media");
              output = output.write(32/*' '*/);
              output = this.writeMediaQueries(mediaQueries, output);
              output = output.write(32/*' '*/);
              output = output.write(123/*'{'*/);
              output = output.write(10/*'\n'*/);
              inMedia = true;
              isEmpty = false;
            }
            if (!inRule) {
              output = this.writeSelectors(selectors, output);
              output = output.write(32/*' '*/);
              output = output.write(123/*'{'*/);
              output = output.write(10/*'\n'*/);
              inRule = true;
              isEmpty = false;
            }
            output = this.writeDeclarations(declaration, output);
          }
        }
      }
    }
    if (isEmpty && mediaQueries.isDistinct()) {
      output = output.write(64/*'@'*/);
      output = output.write("media");
      output = output.write(32/*' '*/);
      output = this.writeMediaQueries(mediaQueries, output);
      output = output.write(32/*' '*/);
      output = output.write(123/*'{'*/);
      output = output.write(10/*'\n'*/);
      inMedia = true;
      isEmpty = false;
    }
    if (inRule) {
      output = output.write(125/*'}'*/);
      output = output.write(10/*'\n'*/);
      inRule = false;
    }
    if (inMedia) {
      output = output.write(125/*'}'*/);
      output = output.write(10/*'\n'*/);
      inMedia = false;
    }
    return output;
  }

  nestedMediaQuery(mediaQueries: Value, subMediaQueries: Value): Value {
    if (mediaQueries.isDistinct()) {
      return Record.create(3).attr("and").item(mediaQueries).item(subMediaQueries);
    } else {
      return subMediaQueries;
    }
  }

  writeMediaQueries<O>(mediaQueries: Value, output: Output<O>): Output<O> {
    if (mediaQueries instanceof Record) {
      output = this.writeMediaExpression(mediaQueries, output);
    } else {
      output = this.writeMediaQuery(mediaQueries, output);
    }
    return output;
  }

  writeMediaExpression<O>(mediaExpression: Record, output: Output<O>): Output<O> {
    const tag = mediaExpression.tag;
    if (tag === "and") {
      output = this.writeMediaAnd(mediaExpression.tail().branch(), output);
    } else if (tag === "not") {
      output = this.writeMediaNot(mediaExpression.tail().branch(), output);
    } else {
      for (let i = 0, n = mediaExpression.length; i < n; i += 1) {
        const mediaQuery = mediaExpression.getItem(i);
        if (i !== 0) {
          output = output.write(44/*','*/);
          output = output.write(32/*' '*/);
        }
        output = this.writeMediaQuery(mediaQuery, output);
      }
    }
    return output;
  }

  writeMediaQuery<O>(mediaQuery: Item, output: Output<O>): Output<O> {
    if (mediaQuery instanceof Slot) {
      output = output.write(40/*'('*/);
      output = this.writeMediaFeature(mediaQuery.key, mediaQuery.value, output);
      output = output.write(41/*')'*/);
    } else if (mediaQuery instanceof Record) {
      output = this.writeMediaExpression(mediaQuery, output);
    } else {
      output = output.write(mediaQuery.stringValue(""));
    }
    return output;
  }

  writeMediaAnd<O>(mediaQuery: Record, output: Output<O>): Output<O> {
    for (let i = 0, n = mediaQuery.length; i < n; i += 1) {
      const medium = mediaQuery.getItem(i);
      if (i !== 0) {
        output = output.write(32/*' '*/);
        output = output.write("and");
        output = output.write(32/*' '*/);
      }
      output = this.writeMediaQuery(medium, output);
    }
    return output;
  }

  writeMediaNot<O>(mediaQuery: Record, output: Output<O>): Output<O> {
    output = output.write("not");
    output = output.write(32/*' '*/);
    const n = mediaQuery.length;
    if (n === 1) {
      output = output.write(40/*'('*/);
    }
    for (let i = 0; i < n; i += 1) {
      const medium = mediaQuery.getItem(i);
      output = this.writeMediaQuery(medium, output);
    }
    if (n === 1) {
      output = output.write(41/*')'*/);
    }
    return output;
  }

  writeMediaFeature<O>(name: Value, value: Value, output: Output<O>): Output<O> {
    output = output.write(name.stringValue(""));
    output = output.write(58/*':'*/);
    output = output.write(32/*' '*/);
    if (value instanceof Num) {
      output = output.write(value.value + "px");
    } else {
      output = output.write(value.stringValue(""));
    }
    return output;
  }

  nestedSelector(selectors: Value, subSelectors: Value): Value {
    if (selectors.isDistinct()) {
      const nested = Record.create();
      selectors.forEach(function (selector: Item): void {
        subSelectors.forEach(function (subselector: Item): void {
          nested.push(selector.stringValue() + " " + subselector.stringValue());
        }, this);
      }, this);
      return nested;
    } else {
      return subSelectors;
    }
  }

  writeSelectors<O>(selectors: Value, output: Output<O>): Output<O> {
    if (selectors instanceof Record) {
      for (let i = 0, n = selectors.length; i < n; i += 1) {
        const selector = selectors.getItem(i);
        if (i !== 0) {
          output = output.write(44/*','*/);
          output = output.write(10/*'\n'*/);
        }
        output = this.writeSelector(selector, output);
      }
    } else {
      output = this.writeSelector(selectors, output);
    }
    return output;
  }

  writeSelector<O>(selector: Value, output: Output<O>): Output<O> {
    output = output.write(selector.stringValue(""));
    return output;
  }

  writeDeclarations<O>(declarations: Record, output: Output<O>): Output<O> {
    for (let i = 0, n = declarations.length; i < n; i += 1) {
      const declaration = declarations.getItem(i);
      if (declaration instanceof Slot) {
        output = this.writeDeclaration(declaration.key, declaration.value, output);
      } else if (declaration instanceof Record) {
        output = this.writeDeclarations(declaration, output);
      }
    }
    return output;
  }

  writeDeclaration<O>(property: Value, expression: Value, output: Output<O>): Output<O> {
    output = this.writeProperty(property, output);
    output = output.write(58/*':'*/);
    output = output.write(32/*' '*/);
    output = this.writeExpression(expression, output);
    output = output.write(59/*';'*/);
    output = output.write(10/*'\n'*/);
    return output;
  }

  writeProperty<O>(property: Value, output: Output<O>): Output<O> {
    output = output.write(property.stringValue(""));
    return output;
  }

  writeExpression<O>(expression: Value, output: Output<O>): Output<O> {
    output = output.write(expression.stringValue(""));
    return output;
  }
}
