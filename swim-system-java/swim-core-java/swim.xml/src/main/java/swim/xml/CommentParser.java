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

final class CommentParser<I> extends Parser<I> {
  final XmlParser<I, ?> xml;
  final Output<I> output;
  final int step;

  CommentParser(XmlParser<I, ?> xml, Output<I> output, int step) {
    this.xml = xml;
    this.output = output;
    this.step = step;
  }

  @Override
  public Parser<I> feed(Input input) {
    return parse(input, this.xml, this.output, this.step);
  }

  static <I> Parser<I> parse(Input input, XmlParser<I, ?> xml, Output<I> output, int step) {
    int c = 0;
    while (step >= 1 && step <= 4) {
      if (input.isCont()) {
        if (input.head() == "<!--".charAt(step - 1)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("<!--".charAt(step - 1), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("<!--".charAt(step - 1), input));
      }
      break;
    }
    do {
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isChar(c) && c != '-') {
            input = input.step();
            if (output == null) {
              output = xml.commentOutput();
            }
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '-') {
            input = input.step();
            step = 6;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (c == '-') {
            input = input.step();
            step = 7;
          } else {
            if (output == null) {
              output = xml.commentOutput();
            }
            output = output.write('-');
            step = 5;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          c = input.head();
          if (output == null) {
            output = xml.commentOutput();
          }
          if (c == '>') {
            input = input.step();
            return done(output.bind());
          } else {
            output = output.write('-');
            output = output.write('-');
            step = 5;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new CommentParser<I>(xml, output, step);
  }

  static <I> Parser<I> parse(Input input, XmlParser<I, ?> xml) {
    return parse(input, xml, null, 1);
  }

  static <I> Parser<I> parseRest(Input input, XmlParser<I, ?> xml) {
    return parse(input, xml, null, 3);
  }
}
