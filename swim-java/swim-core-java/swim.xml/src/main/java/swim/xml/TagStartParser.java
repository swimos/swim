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

final class TagStartParser<I, V> extends Parser<V> {
  final XmlParser<I, V> xml;
  final Builder<I, V> builder;
  final Parser<String> tagParser;
  final Builder<I, V> attributes;
  final Parser<String> nameParser;
  final Parser<V> valueParser;
  final int step;

  TagStartParser(XmlParser<I, V> xml, Builder<I, V> builder,
                 Parser<String> tagParser, Builder<I, V> attributes,
                 Parser<String> nameParser, Parser<V> valueParser, int step) {
    this.xml = xml;
    this.builder = builder;
    this.tagParser = tagParser;
    this.attributes = attributes;
    this.nameParser = nameParser;
    this.valueParser = valueParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.xml, this.builder, this.tagParser, this.attributes,
                 this.nameParser, this.valueParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, Builder<I, V> builder,
                                Parser<String> tagParser, Builder<I, V> attributes,
                                Parser<String> nameParser, Parser<V> valueParser, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '<') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('<', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('<', input));
      }
    }
    if (step == 2) {
      if (tagParser == null) {
        tagParser = xml.parseName(input);
      } else {
        tagParser = tagParser.feed(input);
      }
      if (tagParser.isDone()) {
        step = 3;
      } else if (tagParser.isError()) {
        return tagParser.asError();
      }
    }
    do {
      if (step == 3) {
        if (input.isCont()) {
          if (Xml.isWhitespace(input.head())) {
            input = input.step();
            step = 4;
          } else {
            step = 9;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
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
            step = 5;
          } else {
            step = 9;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 5) {
        if (nameParser == null) {
          nameParser = xml.parseName(input);
        } else {
          nameParser = nameParser.feed(input);
        }
        if (nameParser.isDone()) {
          step = 6;
        } else if (nameParser.isError()) {
          return nameParser.asError();
        }
      }
      if (step == 6) {
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
            step = 7;
          } else {
            return error(Diagnostic.expected('=', input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected('=', input));
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
          if (c == '"' || c == '\'') {
            step = 8;
          } else {
            return error(Diagnostic.expected("attribute value", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("attribute value", input));
        }
      }
      if (step == 8) {
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
          step = 3;
        } else if (valueParser.isError()) {
          return valueParser.asError();
        }
      }
      break;
    } while (true);
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
        if (c == '/') {
          input = input.step();
          step = 10;
        } else if (c == '>') {
          input = input.step();
          if (builder == null) {
            if (attributes == null) {
              builder = xml.tagBuilder(tagParser.bind());
            } else {
              builder = xml.tagBuilder(tagParser.bind(), attributes.bind());
            }
          } else if (attributes == null) {
            builder.add(xml.tag(tagParser.bind()));
          } else {
            builder.add(xml.tag(tagParser.bind(), attributes.bind()));
          }
          return xml.parseTagContent(input, tagParser.bind(), builder);
        } else {
          return error(Diagnostic.expected("'/' or '>'", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("'/' or '>'", input));
      }
    }
    if (step == 10) {
      if (input.isCont()) {
        c = input.head();
        if (c == '>') {
          input = input.step();
          if (builder == null) {
            if (attributes == null) {
              builder = xml.tagBuilder(tagParser.bind());
            } else {
              builder = xml.tagBuilder(tagParser.bind(), attributes.bind());
            }
          } else if (attributes == null) {
            builder.add(xml.tag(tagParser.bind()));
          } else {
            builder.add(xml.tag(tagParser.bind(), attributes.bind()));
          }
          return done(builder.bind());
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
    return new TagStartParser<I, V>(xml, builder, tagParser, attributes,
                                    nameParser, valueParser, step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, null, null, 1);
  }

  static <I, V> Parser<V> parseRest(Input input, XmlParser<I, V> xml, Builder<I, V> builder) {
    return parse(input, xml, builder, null, null, null, null, 2);
  }

  static <I, V> Parser<V> parseRest(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, null, null, 2);
  }
}
