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

final class NameParser extends Parser<String> {
  final XmlParser<?, ?> xml;
  final Output<String> output;
  final int step;

  NameParser(XmlParser<?, ?> xml, Output<String> output, int step) {
    this.xml = xml;
    this.output = output;
    this.step = step;
  }

  @Override
  public Parser<String> feed(Input input) {
    return parse(input, this.xml, this.output, this.step);
  }

  static Parser<String> parse(Input input, XmlParser<?, ?> xml, Output<String> output, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Xml.isNameStartChar(c)) {
          if (output == null) {
            output = xml.nameOutput();
          }
          input = input.step();
          output = output.write(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("name", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("name", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isNameChar(c)) {
          input = input.step();
          output = output.write(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(xml.name(output.bind()));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new NameParser(xml, output, step);
  }

  static Parser<String> parse(Input input, XmlParser<?, ?> xml, Output<String> output) {
    return parse(input, xml, output, 1);
  }

  static Parser<String> parse(Input input, XmlParser<?, ?> xml) {
    return parse(input, xml, null, 1);
  }
}
