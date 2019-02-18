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

final class TagEndParser<I, V> extends Parser<V> {
  final XmlParser<I, V> xml;
  final String tag;
  final Builder<I, V> builder;
  final int step;

  TagEndParser(XmlParser<I, V> xml, String tag, Builder<I, V> builder, int step) {
    this.xml = xml;
    this.tag = tag;
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.xml, this.tag, this.builder, this.step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, String tag,
                                Builder<I, V> builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
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
      if (input.isCont()) {
        c = input.head();
        if (c == '/') {
          input = input.step();
          step = 3;
        } else {
          return error(Diagnostic.expected('/', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('/', input));
      }
    }
    while (step >= 3 && step - 3 < tag.length()) {
      if (input.isCont()) {
        if (input.head() == tag.codePointAt(step - 3)) {
          input = input.step();
          step = 3 + tag.offsetByCodePoints(step - 3, 1);
          continue;
        } else {
          return error(Diagnostic.expected("</" + tag + ">", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("</" + tag + ">", input));
      }
      break;
    }
    if (step == 3 + tag.length()) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '>') {
          input = input.step();
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
    return new TagEndParser<I, V>(xml, tag, builder, step);
  }

  static <I, V> Parser<V> parse(Input input, XmlParser<I, V> xml, String tag, Builder<I, V> builder) {
    return parse(input, xml, tag, builder, 1);
  }

  static <I, V> Parser<V> parseRest(Input input, XmlParser<I, V> xml, String tag, Builder<I, V> builder) {
    return parse(input, xml, tag, builder, 3);
  }
}
