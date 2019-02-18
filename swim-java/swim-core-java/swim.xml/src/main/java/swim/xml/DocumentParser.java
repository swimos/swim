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

final class DocumentParser<I, V> extends Parser<V> {
  final XmlParser<I, V> xml;
  final Builder<I, V> builder;
  final Parser<String> targetParser;
  final Parser<I> miscParser;
  final Parser<V> tagParser;
  final int step;

  DocumentParser(XmlParser<I, V> xml, Builder<I, V> builder, Parser<String> targetParser,
                 Parser<I> miscParser, Parser<V> tagParser, int step) {
    this.xml = xml;
    this.builder = builder;
    this.targetParser = targetParser;
    this.miscParser = miscParser;
    this.tagParser = tagParser;
    this.step = step;
  }

  DocumentParser(XmlParser<I, V> xml) {
    this(xml, null, null, null, null, 1);
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.xml, this.builder, this.targetParser, this.miscParser,
                 this.tagParser, this.step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, Builder<I, V> builder,
                                Parser<String> targetParser, Parser<I> miscParser,
                                Parser<V> tagParser, int step) {
    int c = 0;
    do {
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
        } else if (input.isError()) {
          return error(input.trap());
        } else if (input.isDone()) {
          if (builder == null) {
            builder = xml.documentBuilder();
          }
          return done(builder.bind());
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (c == '?') {
            input = input.step();
            step = 3;
          } else if (c == '!') {
            input = input.step();
            step = 4;
          } else if (Xml.isNameStartChar(c)) {
            if (builder == null) {
              builder = xml.documentBuilder();
            }
            tagParser = xml.parseTagStartRest(input, builder);
            step = 6;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (targetParser == null) {
          targetParser = xml.parsePITarget(input);
        } else {
          targetParser = targetParser.feed(input);
        }
        if (targetParser.isDone()) {
          final String target = targetParser.bind();
          targetParser = null;
          if ("xml".equalsIgnoreCase(target)) {
            miscParser = xml.parseXmlDeclRest(input);
            step = 5;
          } else {
            miscParser = xml.parsePITargetRest(input, target);
            step = 5;
          }
        } else if (targetParser.isError()) {
          return targetParser.asError();
        }
      }
      if (step == 4) {
        if (input.isCont()) {
          c = input.head();
          if (c == '-') {
            miscParser = xml.parseCommentRest(input);
            step = 5;
          } else {
            miscParser = xml.parseDoctypeDeclRest(input);
            step = 5;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 5) {
        while (miscParser.isCont() && !input.isEmpty()) {
          miscParser = miscParser.feed(input);
        }
        if (miscParser.isDone()) {
          final I misc = miscParser.bind();
          if (misc != null) {
            if (builder == null) {
              builder = xml.documentBuilder();
            }
            builder.add(misc);
          }
          miscParser = null;
          step = 1;
          continue;
        } else if (miscParser.isError()) {
          return miscParser.asError();
        }
      }
      if (step == 6) {
        while (tagParser.isCont() && !input.isEmpty()) {
          tagParser = tagParser.feed(input);
        }
        if (tagParser.isDone()) {
          tagParser = null;
          step = 1;
          continue;
        } else if (tagParser.isError()) {
          return tagParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new DocumentParser<I, V>(xml, builder, targetParser, miscParser, tagParser, step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, Builder<I, V> builder) {
    return parse(input, xml, builder, null, null, null, 1);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, null, 1);
  }
}
