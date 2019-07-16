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

import swim.codec.Base10;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;

final class ReferenceParser extends Parser<Object> {
  final XmlParser<?, ?> xml;
  final Output<?> output;
  final Parser<String> nameParser;
  final int code;
  final int step;

  ReferenceParser(XmlParser<?, ?> xml, Output<?> output, Parser<String> nameParser,
                  int code, int step) {
    this.xml = xml;
    this.output = output;
    this.nameParser = nameParser;
    this.code = code;
    this.step = step;
  }

  @Override
  public Parser<Object> feed(Input input) {
    return parse(input, this.xml, this.output, this.nameParser, this.code, this.step);
  }

  static Parser<Object> parse(Input input, XmlParser<?, ?> xml, Output<?> output,
                              Parser<String> nameParser, int code, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '&') {
          input = input.step();
          step = 2;
        } else {
          return error(Diagnostic.expected('&', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected('&', input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '#') {
          input = input.step();
          step = 5;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 3) {
      if (nameParser == null) {
        nameParser = xml.parseEntityName(input);
      } else {
        nameParser = nameParser.feed(input);
      }
      if (nameParser.isDone()) {
        step = 4;
      } else if (nameParser.isError()) {
        return nameParser.asError();
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (c == ';') {
          input = input.step();
          final boolean expanded = xml.expandEntityRef(nameParser.bind(), output);
          if (expanded) {
            return done();
          } else {
            return error(Diagnostic.message("unrecognized entity: " + nameParser.bind(), input));
          }
        } else {
          return error(Diagnostic.expected(';', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(';', input));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == 'x') {
          input = input.step();
          step = 6;
        } else {
          step = 8;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 6) {
      if (input.isCont()) {
        c = input.head();
        if (Base16.isDigit(c)) {
          input = input.step();
          code = Base16.decodeDigit(c);
          step = 7;
        } else {
          return error(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("hex digit", input));
      }
    }
    if (step == 7) {
      do {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            code = 16 * code + Base16.decodeDigit(c);
          } else {
            step = 10;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        } else {
          break;
        }
      } while (true);
    }
    if (step == 8) {
      if (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          code = Base10.decodeDigit(c);
          step = 9;
        } else {
          return error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 9) {
      do {
        if (input.isCont()) {
          c = input.head();
          if (Base10.isDigit(c)) {
            input = input.step();
            code = 10 * code + Base10.decodeDigit(c);
          } else {
            step = 10;
            break;
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        } else {
          break;
        }
      } while (true);
    }
    if (step == 10) {
      if (input.isCont()) {
        c = input.head();
        if (c == ';') {
          input = input.step();
          if (Xml.isChar(code)) {
            output = output.write(code);
          } else {
            return error(Diagnostic.message("illegal character reference: " + code, input));
          }
          return done();
        } else {
          return error(Diagnostic.expected(';', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(';', input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new ReferenceParser(xml, output, nameParser, code, step);
  }

  static Parser<Object> parse(Input input, XmlParser<?, ?> xml, Output<?> output) {
    return parse(input, xml, output, null, 0, 1);
  }
}
