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

final class CDataSectionParser extends Parser<Object> {
  final XmlParser<?, ?> xml;
  final Output<?> output;
  final int step;

  CDataSectionParser(XmlParser<?, ?> xml, Output<?> output, int step) {
    this.xml = xml;
    this.output = output;
    this.step = step;
  }

  @Override
  public Parser<Object> feed(Input input) {
    return parse(input, this.xml, this.output, this.step);
  }

  static Parser<Object> parse(Input input, XmlParser<?, ?> xml, Output<?> output, int step) {
    int c = 0;
    while (step >= 1 && step <= 9) {
      if (input.isCont()) {
        if (input.head() == "<![CDATA[".charAt(step - 1)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("<![CDATA[".charAt(step - 1), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("<![CDATA[".charAt(step - 1), input));
      }
      break;
    }
    do {
      if (step == 10) {
        while (input.isCont()) {
          c = input.head();
          if (Xml.isChar(c) && c != ']') {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == ']') {
            input = input.step();
            step = 11;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 11) {
        if (input.isCont()) {
          c = input.head();
          if (c == ']') {
            input = input.step();
            step = 12;
          } else {
            output = output.write(']');
            step = 10;
            continue;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 12) {
        if (input.isCont()) {
          c = input.head();
          if (c == '>') {
            input = input.step();
            return done();
          } else {
            output = output.write(']');
            output = output.write(']');
            step = 10;
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
    return new CDataSectionParser(xml, output, step);
  }

  static Parser<Object> parse(Input input, XmlParser<?, ?> xml, Output<?> output) {
    return parse(input, xml, output, 1);
  }

  static Parser<Object> parseRest(Input input, XmlParser<?, ?> xml, Output<?> output) {
    return parse(input, xml, output, 3);
  }
}
