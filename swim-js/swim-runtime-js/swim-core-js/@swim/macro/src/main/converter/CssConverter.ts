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

import type {Output} from "@swim/codec";
import {Item, Attr, Slot, Value, Record, Text, Num} from "@swim/structure";
import {Converter} from "./Converter";

/** @public */
export class CssConverter extends Converter {
  override convert<O>(output: Output<O>, model: Item): O {
    if (model instanceof Record) {
      output = this.writeStylesheet(output, model);
    } else if (model instanceof Text) {
      output = output.write(model.value);
    }
    return output.bind();
  }

  writeStylesheet<O>(output: Output<O>, stylesheet: Record): Output<O> {
    if (stylesheet.tag !== void 0) {
      output = this.writeBlock(output, stylesheet);
    } else {
      for (let i = 0, n = stylesheet.length; i < n; i += 1) {
        const item = stylesheet.getItem(i);
        if (item instanceof Record) {
          output = this.writeBlock(output, item);
        }
      }
    }
    return output;
  }

  writeBlock<O>(output: Output<O>, block: Record): Output<O> {
    const head = block.head();
    if (head instanceof Attr) {
      const tag = head.key.value;
      if (tag === "rule") {
        output = this.writeRuleset(output, Value.absent(), head.value, block.tail().branch());
      } else if (tag === "media") {
        output = this.writeRuleset(output, head.value, Value.absent(), block.tail().branch());
      }
    } else {
      output = this.writeStylesheet(output, block);
    }
    return output;
  }

  writeRuleset<O>(output: Output<O>, mediaQueries: Value, selectors: Value, declarations: Value): Output<O> {
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
            output = this.writeRuleset(output, mediaQueries, this.nestedSelector(selectors, head.value),
                                       declaration.tail().branch());
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
            output = this.writeRuleset(output, this.nestedMediaQuery(mediaQueries, head.value), selectors,
                                       declaration.tail().branch());
            isEmpty = false;
          }
        } else if (declaration instanceof Slot) {
          if (!inMedia && mediaQueries.isDistinct()) {
            output = output.write(64/*'@'*/);
            output = output.write("media");
            output = output.write(32/*' '*/);
            output = this.writeMediaQueries(output, mediaQueries);
            output = output.write(32/*' '*/);
            output = output.write(123/*'{'*/);
            output = output.write(10/*'\n'*/);
            inMedia = true;
            isEmpty = false;
          }
          if (!inRule) {
            output = this.writeSelectors(output, selectors);
            output = output.write(32/*' '*/);
            output = output.write(123/*'{'*/);
            output = output.write(10/*'\n'*/);
            inRule = true;
            isEmpty = false;
          }
          output = this.writeDeclaration(output, declaration.key, declaration.value);
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
            output = this.writeRuleset(output, mediaQueries, selectors, declaration);
            isEmpty = false;
          } else {
            if (!inMedia && mediaQueries.isDistinct()) {
              output = output.write(64/*'@'*/);
              output = output.write("media");
              output = output.write(32/*' '*/);
              output = this.writeMediaQueries(output, mediaQueries);
              output = output.write(32/*' '*/);
              output = output.write(123/*'{'*/);
              output = output.write(10/*'\n'*/);
              inMedia = true;
              isEmpty = false;
            }
            if (!inRule) {
              output = this.writeSelectors(output, selectors);
              output = output.write(32/*' '*/);
              output = output.write(123/*'{'*/);
              output = output.write(10/*'\n'*/);
              inRule = true;
              isEmpty = false;
            }
            output = this.writeDeclarations(output, declaration);
          }
        }
      }
    }
    if (isEmpty && mediaQueries.isDistinct()) {
      output = output.write(64/*'@'*/);
      output = output.write("media");
      output = output.write(32/*' '*/);
      output = this.writeMediaQueries(output, mediaQueries);
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

  writeMediaQueries<O>(output: Output<O>, mediaQueries: Value): Output<O> {
    if (mediaQueries instanceof Record) {
      output = this.writeMediaExpression(output, mediaQueries);
    } else {
      output = this.writeMediaQuery(output, mediaQueries);
    }
    return output;
  }

  writeMediaExpression<O>(output: Output<O>, mediaExpression: Record): Output<O> {
    const tag = mediaExpression.tag;
    if (tag === "and") {
      output = this.writeMediaAnd(output, mediaExpression.tail().branch());
    } else if (tag === "not") {
      output = this.writeMediaNot(output, mediaExpression.tail().branch());
    } else {
      for (let i = 0, n = mediaExpression.length; i < n; i += 1) {
        const mediaQuery = mediaExpression.getItem(i);
        if (i !== 0) {
          output = output.write(44/*','*/);
          output = output.write(32/*' '*/);
        }
        output = this.writeMediaQuery(output, mediaQuery);
      }
    }
    return output;
  }

  writeMediaQuery<O>(output: Output<O>, mediaQuery: Item): Output<O> {
    if (mediaQuery instanceof Slot) {
      output = output.write(40/*'('*/);
      output = this.writeMediaFeature(output, mediaQuery.key, mediaQuery.value);
      output = output.write(41/*')'*/);
    } else if (mediaQuery instanceof Record) {
      output = this.writeMediaExpression(output, mediaQuery);
    } else {
      output = output.write(mediaQuery.stringValue(""));
    }
    return output;
  }

  writeMediaAnd<O>(output: Output<O>, mediaQuery: Record): Output<O> {
    for (let i = 0, n = mediaQuery.length; i < n; i += 1) {
      const medium = mediaQuery.getItem(i);
      if (i !== 0) {
        output = output.write(32/*' '*/);
        output = output.write("and");
        output = output.write(32/*' '*/);
      }
      output = this.writeMediaQuery(output, medium);
    }
    return output;
  }

  writeMediaNot<O>(output: Output<O>, mediaQuery: Record): Output<O> {
    output = output.write("not");
    output = output.write(32/*' '*/);
    const n = mediaQuery.length;
    if (n === 1) {
      output = output.write(40/*'('*/);
    }
    for (let i = 0; i < n; i += 1) {
      const medium = mediaQuery.getItem(i);
      output = this.writeMediaQuery(output, medium);
    }
    if (n === 1) {
      output = output.write(41/*')'*/);
    }
    return output;
  }

  writeMediaFeature<O>(output: Output<O>, name: Value, value: Value): Output<O> {
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

  writeSelectors<O>(output: Output<O>, selectors: Value): Output<O> {
    if (selectors instanceof Record) {
      for (let i = 0, n = selectors.length; i < n; i += 1) {
        const selector = selectors.getItem(i);
        if (i !== 0) {
          output = output.write(44/*','*/);
          output = output.write(10/*'\n'*/);
        }
        output = this.writeSelector(output, selector);
      }
    } else {
      output = this.writeSelector(output, selectors);
    }
    return output;
  }

  writeSelector<O>(output: Output<O>, selector: Value): Output<O> {
    output = output.write(selector.stringValue(""));
    return output;
  }

  writeDeclarations<O>(output: Output<O>, declarations: Record): Output<O> {
    for (let i = 0, n = declarations.length; i < n; i += 1) {
      const declaration = declarations.getItem(i);
      if (declaration instanceof Slot) {
        output = this.writeDeclaration(output, declaration.key, declaration.value);
      } else if (declaration instanceof Record) {
        output = this.writeDeclarations(output, declaration);
      }
    }
    return output;
  }

  writeDeclaration<O>(output: Output<O>, property: Value, expression: Value): Output<O> {
    output = this.writeProperty(output, property);
    output = output.write(58/*':'*/);
    output = output.write(32/*' '*/);
    output = this.writeExpression(output, expression);
    output = output.write(59/*';'*/);
    output = output.write(10/*'\n'*/);
    return output;
  }

  writeProperty<O>(output: Output<O>, property: Value): Output<O> {
    output = output.write(property.stringValue(""));
    return output;
  }

  writeExpression<O>(output: Output<O>, expression: Value): Output<O> {
    output = output.write(expression.stringValue(""));
    return output;
  }
}
