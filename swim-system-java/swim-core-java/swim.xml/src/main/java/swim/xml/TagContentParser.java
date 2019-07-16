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
import swim.codec.Output;
import swim.codec.Parser;
import swim.util.Builder;

final class TagContentParser<I, V> extends Parser<V> {
  final XmlParser<I, V> xml;
  final String tag;
  final Builder<I, V> builder;
  final Output<V> text;
  final Parser<?> nodeParser;
  final int step;

  TagContentParser(XmlParser<I, V> xml, String tag, Builder<I, V> builder,
                   Output<V> text, Parser<?> nodeParser, int step) {
    this.xml = xml;
    this.tag = tag;
    this.builder = builder;
    this.text = text;
    this.nodeParser = nodeParser;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.xml, this.tag, this.builder, this.text, this.nodeParser, this.step);
  }

  @SuppressWarnings("unchecked")
  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, String tag, Builder<I, V> builder,
                                Output<V> text, Parser<?> nodeParser, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isChar(c) && c != ']' && c != '<' && c != '&') {
            input = input.step();
            if (text == null) {
              text = xml.textOutput();
            }
            text.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ']') {
            input = input.step();
            step = 2;
          } else if (c == '<') {
            input = input.step();
            step = 4;
          } else if (c == '&') {
            if (text == null) {
              text = xml.textOutput();
            }
            nodeParser = xml.parseReference(input, text);
            step = 8;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == ']') {
            input = input.step();
            step = 3;
          } else {
            if (text == null) {
              text = xml.textOutput();
            }
            text.write(']');
            step = 1;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (c == '>') {
            return error(Diagnostic.message("unexpected ]]>", input));
          } else {
            if (text == null) {
              text = xml.textOutput();
            }
            text.write(']');
            text.write(']');
            step = 1;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (Xml.isNameStartChar(c)) {
            if (text != null) {
              builder.add(xml.item(text.bind()));
              text = null;
            }
            nodeParser = xml.parseTagStartRest(input);
            step = 7;
          } else if (c == '/') {
            input = input.step();
            if (text != null) {
              builder.add(xml.item(text.bind()));
              text = null;
            }
            return xml.parseTagEndRest(input, tag, builder);
          } else if (c == '?') {
            input = input.step();
            if (text != null) {
              builder.add(xml.item(text.bind()));
              text = null;
            }
            nodeParser = xml.parsePIRest(input);
            step = 6;
          } else if (c == '!') {
            input = input.step();
            step = 5;
          } else {
            return error(Diagnostic.expected("end tag, processing instruction, comment, or CDATA section", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("end tag, processing instruction, comment, or CDATA section", input));
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (c == '-') {
            if (text != null) {
              builder.add(xml.item(text.bind()));
              text = null;
            }
            nodeParser = xml.parseCommentRest(input);
            step = 6;
          } else if (c == '[') {
            if (text == null) {
              text = xml.textOutput();
            }
            nodeParser = xml.parseCDataSectionRest(input, text);
            step = 8;
          } else {
            return error(Diagnostic.expected("comment or CDATA section", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("comment or CDATA section", input));
        }
      }
      if (step == 6) {
        while (nodeParser.isCont() && !input.isEmpty()) {
          nodeParser = nodeParser.feed(input);
        }
        if (nodeParser.isDone()) {
          final I node = (I) nodeParser.bind();
          if (node != null) {
            builder.add(node);
          }
          nodeParser = null;
          step = 1;
          continue;
        } else if (nodeParser.isError()) {
          return nodeParser.asError();
        }
      }
      if (step == 7) {
        while (nodeParser.isCont() && !input.isEmpty()) {
          nodeParser = nodeParser.feed(input);
        }
        if (nodeParser.isDone()) {
          final V node = (V) nodeParser.bind();
          if (node != null) {
            builder.add(xml.item(node));
          }
          nodeParser = null;
          step = 1;
          continue;
        } else if (nodeParser.isError()) {
          return nodeParser.asError();
        }
      }
      if (step == 8) {
        while (nodeParser.isCont() && !input.isEmpty()) {
          nodeParser = nodeParser.feed(input);
        }
        if (nodeParser.isDone()) {
          nodeParser = null;
          step = 1;
          continue;
        } else if (nodeParser.isError()) {
          return nodeParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new TagContentParser<I, V>(xml, tag, builder, text, nodeParser, step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, String tag, Builder<I, V> builder) {
    return parse(input, xml, tag, builder, null, null, 1);
  }
}
