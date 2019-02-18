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

final class PIParser<I> extends Parser<I> {
  final XmlParser<I, ?> xml;
  final Parser<String> targetParser;
  final Output<I> output;
  final int step;

  PIParser(XmlParser<I, ?> xml, Parser<String> targetParser, Output<I> output, int step) {
    this.xml = xml;
    this.targetParser = targetParser;
    this.output = output;
    this.step = step;
  }

  @Override
  public Parser<I> feed(Input input) {
    return parse(input, this.xml, this.targetParser, this.output, this.step);
  }

  static <I> Parser<I> parse(Input input, XmlParser<I, ?> xml, Parser<String> targetParser,
                             Output<I> output, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        if (input.head() == '<') {
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
        if (input.head() == '?') {
          input = input.step();
          step = 3;
        } else {
          return error(Diagnostic.expected('?', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('?', input));
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
        if (!"xml".equalsIgnoreCase(target)) {
          return xml.parsePITargetRest(input, target);
        } else {
          return error(Diagnostic.message("illegal processing instruction target: " + target, input));
        }
      } else if (targetParser.isError()) {
        return targetParser.asError();
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
          if (output == null) {
            output = xml.piOutput(targetParser.bind());
          }
          step = 5;
        } else {
          return error(Diagnostic.expected("space", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    do {
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isChar(c) && c != '?') {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '?') {
            input = input.step();
            step = 6;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        } else {
          break;
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (c == '>') {
            input = input.step();
            return done(output.bind());
          } else {
            output = output.write('?');
            step = 5;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        } else {
          break;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new PIParser<I>(xml, targetParser, output, step);
  }

  static <I> Parser<I> parse(Input input, XmlParser<I, ?> xml) {
    return parse(input, xml, null, null, 1);
  }

  static <I> Parser<I> parseRest(Input input, XmlParser<I, ?> xml) {
    return parse(input, xml, null, null, 3);
  }

  static <I> Parser<I> parseTargetRest(Input input, XmlParser<I, ?> xml, String target) {
    return parse(input, xml, done(target), null, 4);
  }
}
