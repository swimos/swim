// Copyright 2015-2019 SWIM.AI inc.
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

package swim.xml;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.util.Builder;

final class XmlDeclParser<I, V> extends Parser<I> {
  final XmlParser<I, V> xml;
  final Builder<I, V> attributes;
  final Parser<String> nameParser;
  final Parser<V> valueParser;
  final int step;

  XmlDeclParser(XmlParser<I, V> xml, Builder<I, V> attributes,
                Parser<String> nameParser, Parser<V> valueParser, int step) {
    this.xml = xml;
    this.attributes = attributes;
    this.nameParser = nameParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<I> feed(Input input) {
    return parse(input, this.xml, this.attributes, this.nameParser, this.valueParser, this.step);
  }

  static <I, V> Parser<I> parse(Input input, XmlParser<I, V> xml, Builder<I, V> attributes,
                                Parser<String> nameParser, Parser<V> valueParser, int step) {
    int c = 0;
    while (step >= 1 && step <= 5) {
      if (input.isCont()) {
        if (input.head() == "<?xml".charAt(step - 1)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("<?xml".charAt(step - 1), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("<?xml".charAt(step - 1), input));
      }
      break;
    }
    do {
      if (step == 6) {
        if (input.isCont()) {
          if (Xml.isWhitespace(input.head())) {
            input = input.step();
            step = 7;
          } else {
            step = 12;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (Xml.isNameStartChar(c)) {
            step = 8;
          } else {
            step = 12;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (nameParser == null) {
          nameParser = xml.parseName(input);
        } else {
          nameParser = nameParser.feed(input);
        }
        if (nameParser.isDone()) {
          step = 9;
        } else if (nameParser.isError()) {
          return nameParser.asError();
        } else {
          break;
        }
      }
      if (step == 9) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '=') {
            input = input.step();
            step = 10;
          } else {
            return error(Diagnostic.expected('=', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected('=', input));
        }
      }
      if (step == 10) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isWhitespace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"' || c == '\'') {
            step = 11;
          } else {
            return error(Diagnostic.expected("attribute value", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("attribute value", input));
        }
      }
      if (step == 11) {
        if (valueParser == null) {
          valueParser = xml.parseAttributeValue(input);
        } else {
          valueParser = valueParser.feed(input);
        }
        if (valueParser.isDone()) {
          if (attributes == null) {
            attributes = xml.attributesBuilder();
          }
          attributes.add(xml.attribute(nameParser.bind(), valueParser.bind()));
          nameParser = null;
          valueParser = null;
          step = 6;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      break;
    } while (true);
    if (step == 12) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '?') {
          input = input.step();
          step = 13;
        } else {
          return error(Diagnostic.expected('?', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('?', input));
      }
    }
    if (step == 13) {
      if (input.isCont()) {
        c = input.head();
        if (c == '>') {
          input = input.step();
          if (attributes == null) {
            return done(xml.xml(xml.attributes()));
          } else {
            return done(xml.xml(attributes.bind()));
          }
        } else {
          return error(Diagnostic.expected('>', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('>', input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new XmlDeclParser<I, V>(xml, attributes, nameParser, valueParser, step);
  }

  static <I, V> Parser<I> parse(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, 1);
  }

  static <I, V> Parser<I> parseRest(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, 6);
  }
}
