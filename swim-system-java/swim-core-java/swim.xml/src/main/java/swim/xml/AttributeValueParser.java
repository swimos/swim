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

final class AttributeValueParser<V> extends Parser<V> {
  final XmlParser<?, V> xml;
  final Output<V> output;
  final Parser<?> referenceParser;
  final int quote;
  final int step;

  AttributeValueParser(XmlParser<?, V> xml, Output<V> output, Parser<?> referenceParser,
                       int quote, int step) {
    this.xml = xml;
    this.output = output;
    this.referenceParser = referenceParser;
    this.quote = quote;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.xml, this.output, this.referenceParser, this.quote, this.step);
  }

  static <V> Parser<V> parse(Input input, XmlParser<?, V> xml, Output<V> output,
                             Parser<?> referenceParser, int quote, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if ((c == '"' || c == '\'') && (quote == c || quote == 0)) {
          input = input.step();
          if (output == null) {
            output = xml.textOutput();
          }
          quote = c;
          step = 2;
        } else {
          return error(Diagnostic.expected("attribute value", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("attribute value", input));
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c != quote && c != '<' && c != '&') {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == quote) {
            input = input.step();
            return done(output.bind());
          } else if (c == '&') {
            step = 3;
          } else {
            return error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (referenceParser == null) {
          referenceParser = xml.parseReference(input, output);
        } else {
          referenceParser = referenceParser.feed(input);
        }
        if (referenceParser.isDone()) {
          referenceParser = null;
          step = 2;
          continue;
        } else if (referenceParser.isError()) {
          return referenceParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AttributeValueParser<V>(xml, output, referenceParser, quote, step);
  }

  static <V> Parser<V> parse(Input input, XmlParser<?, V> xml, Output<V> output) {
    return parse(input, xml, output, null, 0, 1);
  }

  static <V> Parser<V> parse(Input input, XmlParser<?, V> xml) {
    return parse(input, xml, null, null, 0, 1);
  }
}
