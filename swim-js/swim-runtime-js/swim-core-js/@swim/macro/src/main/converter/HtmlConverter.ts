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

import {Output, OutputException} from "@swim/codec";
import {Item, Attr, Slot, Value, Record} from "@swim/structure";
import {Converter} from "./Converter";

export class HtmlConverter extends Converter {
  override convert<O>(output: Output<O>, model: Item): O {
    if (model instanceof Record) {
      output = this.writeDocument(output, model);
    }
    return output.bind();
  }

  writeDocument<O>(output: Output<O>, document: Record): Output<O> {
    if (document.tag !== void 0) {
      output = this.writeElement(output, document);
    } else {
      for (let i = 0, n = document.length; i < n; i += 1) {
        const node = document.getItem(i);
        if (node instanceof Record) {
          const tag = node.tag;
          if (tag === "cdata") {
            output = this.writeCdata(output, node);
          } else if (tag === "doctype") {
            output = this.writeDoctype(output, node);
          } else {
            output = this.writeElement(output, node);
          }
        } else if (node instanceof Value) {
          const text = node.stringValue();
          if (text !== void 0) {
            output = this.writeText(output, text);
          }
        }
      }
    }
    return output;
  }

  writeDoctype<O>(output: Output<O>, doctype: Record): Output<O> {
    const head = doctype.head();
    if (head instanceof Attr && head.key.value === "doctype") {
      const name = head.value.stringValue();
      if (name !== void 0) {
        output = output.write(60/*'<'*/);
        output = output.write(33/*'!'*/);
        output = output.write("DOCTYPE");
        output = output.write(32/*' '*/);
        output = output.write(name);
        output = output.write(62/*'>'*/);
      }
    }
    return output;
  }

  writeFragment<O>(output: Output<O>, fragment: Record): Output<O> {
    for (let i = 0, n = fragment.length; i < n; i += 1) {
      const node = fragment.getItem(i);
      if (node instanceof Record) {
        const tag = node.tag;
        if (tag !== void 0) {
          if (tag === "cdata") {
            output = this.writeCdata(output, node);
          } else {
            output = this.writeElement(output, node);
          }
        } else {
          output = this.writeFragment(output, node);
        }
      } else if (node instanceof Value) {
        const text = node.stringValue();
        if (text !== void 0) {
          output = this.writeText(output, text);
        }
      }
    }
    return output;
  }

  protected writeElement<O>(output: Output<O>, element: Record): Output<O> {
    const tag = element.head();
    if (tag instanceof Attr) {
      const tagName = tag.key.value;
      const attributes = tag.value;
      const fragment = element.tail();
      if (fragment.isEmpty()) {
        //output = this.writeEmptyTag(tagName, attributes);
        output = this.writeStartTag(output, tagName, attributes);
        output = this.writeEndTag(output, tagName);
      } else {
        output = this.writeStartTag(output, tagName, attributes);
        output = this.writeFragment(output, fragment.branch());
        output = this.writeEndTag(output, tagName);
      }
    }
    return output;
  }

  protected writeAttributes<O>(output: Output<O>, attributes: Record): Output<O> {
    for (let i = 0, n = attributes.length; i < n; i += 1) {
      const attribute = attributes.getItem(i);
      if (attribute instanceof Slot) {
        output = this.writeAttribute(output, attribute);
      }
    }
    return output;
  }

  protected writeAttribute<O>(output: Output<O>, attribute: Slot): Output<O> {
    const attributeName = attribute.key.stringValue();
    const attributeValue = attribute.value.stringValue();
    if (attributeName !== void 0 && attributeValue !== void 0) {
      output = output.write(32/*' '*/);
      output = this.writeName(output, attributeName);
      output = output.write(61/*'='*/);
      output = this.writeAttributeValue(output, attributeValue);
    }
    return output;
  }

  protected writeAttributeValue<O>(output: Output<O>, attributeValue: string): Output<O> {
    output = output.write(34/*'"'*/);
    for (let i = 0, n = attributeValue.length; i < n; i += 1) {
      const c = attributeValue.charCodeAt(i);
      if (c === 34/*'"'*/) {
        output = output.write("&quot;");
      } else {
        output = output.write(c);
      }
    }
    output = output.write(34/*'"'*/);
    return output;
  }

  //protected writeEmptyTag<O>(output: Output<O>, tagName: string, attributes: Value): Output<O> {
  //  output = output.write(60/*'<'*/);
  //  output = this.writeName(output, tagName);
  //  if (attributes instanceof Record) {
  //    output = this.writeAttributes(output, attributes);
  //  }
  //  output = output.write(47/*'/'*/);
  //  output = output.write(62/*'>'*/);
  //  return output;
  //}

  protected writeStartTag<O>(output: Output<O>, tagName: string, attributes: Value): Output<O> {
    output = output.write(60/*'<'*/);
    output = this.writeName(output, tagName);
    if (attributes instanceof Record) {
      output = this.writeAttributes(output, attributes);
    }
    output = output.write(62/*'>'*/);
    return output;
  }

  protected writeEndTag<O>(output: Output<O>, tagName: string): Output<O> {
    output = output.write(60/*'<'*/);
    output = output.write(47/*'/'*/);
    output = this.writeName(output, tagName);
    output = output.write(62/*'>'*/);
    return output;
  }

  writeText<O>(output: Output<O>, text: string): Output<O> {
    for (let i = 0, n = text.length; i < n; i += 1) {
      const c = text.charCodeAt(i);
      if (c === 60/*'<'*/) {
        output = output.write("&lt;");
      } else if (c === 62/*'>'*/) {
        output = output.write("&gt;");
      } else {
        output = output.write(c);
      }
    }
    return output;
  }

  writeCdata<O>(output: Output<O>, node: Record): Output<O> {
    const text = node.tail().stringValue();
    if (text !== void 0) {
      output = output.write("<![CDATA[");
      output = output.write(text);
      output = output.write("]]>");
    }
    return output;
  }

  protected writeName<O>(output: Output<O>, name: string): Output<O> {
    const n = name.length;
    if (n !== 0) {
      for (let i = 0; i < n; i += 1) {
        const c = name.charCodeAt(i);
        if (c === 34/*'"'*/) {
          output = output.write("&quot;");
        } else if (this.isNameChar(c)) {
          output = output.write(c);
        } else {
          return Output.error(new OutputException("invalid name: " + name));
        }
      }
    } else {
      return Output.error(new OutputException("empty name"));
    }
    return output;
  }

  protected isNameChar(c: number): boolean {
    return c === 45/*'-'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c === 58/*':'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c === 95/*'_'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/;
  }
}
