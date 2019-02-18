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
import swim.codec.Unicode;

final class DoctypeDeclParser<I, V> extends Parser<I> {
  final XmlParser<I, V> xml;
  final Parser<String> nameParser;
  final Output<String> publicId;
  final Output<String> systemId;
  final Parser<V> markupDeclParser;
  final int quote;
  final int step;

  DoctypeDeclParser(XmlParser<I, V> xml, Parser<String> nameParser, Output<String> publicId,
                    Output<String> systemId, Parser<V> markupDeclParser, int quote, int step) {
    this.xml = xml;
    this.nameParser = nameParser;
    this.publicId = publicId;
    this.systemId = systemId;
    this.markupDeclParser = markupDeclParser;
    this.quote = quote;
    this.step = step;
  }

  @Override
  public Parser<I> feed(Input input) {
    return parse(input, this.xml, this.nameParser, this.publicId, this.systemId,
                 this.markupDeclParser, this.quote, this.step);
  }

  static <I, V> Parser<I> parse(Input input, XmlParser<I, V> xml, Parser<String> nameParser,
                                Output<String> publicId, Output<String> systemId,
                                Parser<V> markupDeclParser, int quote, int step) {
    int c = 0;
    while (step >= 1 && step <= 9) {
      if (input.isCont()) {
        if (input.head() == "<!DOCTYPE".charAt(step - 1)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("<!DOCTYPE".charAt(step - 1), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("<!DOCTYPE".charAt(step - 1), input));
      }
      break;
    }
    if (step == 10) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
          step = 11;
        } else {
          return error(Diagnostic.expected("space", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 11) {
      if (nameParser == null) {
        nameParser = xml.parseName(input);
      } else {
        nameParser = nameParser.feed(input);
      }
      if (nameParser.isDone()) {
        step = 12;
      } else if (nameParser.isError()) {
        return nameParser.asError();
      }
    }
    if (step == 12) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
          step = 13;
        } else {
          step = 32;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 13) {
      if (input.isCont()) {
        c = input.head();
        if (c == 'P') {
          step = 14;
        } else if (c == 'S') {
          step = 23;
        } else if (c == '[') {
          input = input.step();
          step = 34;
        } else {
          step = 37;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    while (step >= 14 && step <= 19) {
      if (input.isCont()) {
        if (input.head() == "PUBLIC".charAt(step - 14)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("PUBLIC".charAt(step - 14), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("PUBLIC".charAt(step - 14), input));
      }
      break;
    }
    if (step == 20) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
          step = 21;
        } else {
          return error(Diagnostic.expected("space", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 21) {
      if (input.isCont()) {
        c = input.head();
        if (c == '"' || c == '\'') {
          input = input.step();
          publicId = Unicode.stringOutput();
          quote = c;
          step = 22;
        } else {
          return error(Diagnostic.expected("quote", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("quote", input));
      }
    }
    if (step == 22) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isPubidChar(c) && c != quote) {
          input = input.step();
          publicId.write(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == quote) {
          input = input.step();
          quote = 0;
          step = 29;
        } else {
          return error(Diagnostic.expected(c, input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(c, input));
      }
    }
    while (step >= 23 && step <= 28) {
      if (input.isCont()) {
        if (input.head() == "SYSTEM".charAt(step - 23)) {
          input = input.step();
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("SYSTEM".charAt(step - 23), input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("SYSTEM".charAt(step - 23), input));
      }
      break;
    }
    if (step == 29) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
          step = 30;
        } else {
          return error(Diagnostic.expected("space", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 30) {
      if (input.isCont()) {
        c = input.head();
        if (c == '"' || c == '\'') {
          input = input.step();
          systemId = Unicode.stringOutput();
          quote = c;
          step = 31;
        } else {
          return error(Diagnostic.expected("quote", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("quote", input));
      }
    }
    if (step == 31) {
      while (input.isCont()) {
        c = input.head();
        if (Xml.isChar(c) && c != quote) {
          input = input.step();
          systemId.write(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == quote) {
          input = input.step();
          quote = 0;
          step = 32;
        } else {
          return error(Diagnostic.expected(c, input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(c, input));
      }
    }
    if (step == 32) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
        }
        step = 33;
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 33) {
      if (input.isCont()) {
        c = input.head();
        if (c == '[') {
          input = input.step();
          step = 34;
        } else {
          step = 37;
        }
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 34) {
      if (markupDeclParser == null) {
        markupDeclParser = xml.parseMarkupDecl(input);
      } else {
        markupDeclParser = markupDeclParser.feed(input);
      }
      if (markupDeclParser.isDone()) {
        step = 35;
      } else if (markupDeclParser.isError()) {
        return markupDeclParser.asError();
      }
    }
    if (step == 35) {
      if (input.isCont()) {
        c = input.head();
        if (c == ']') {
          input = input.step();
          step = 36;
        } else {
          return error(Diagnostic.expected(']', input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected(']', input));
      }
    }
    if (step == 36) {
      if (input.isCont()) {
        if (Xml.isWhitespace(input.head())) {
          input = input.step();
        }
        step = 37;
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 37) {
      if (input.isCont()) {
        c = input.head();
        if (c == '>') {
          input = input.step();
          if (publicId == null && systemId == null) {
            return done(xml.doctype(nameParser.bind()));
          } else if (publicId == null) {
            return done(xml.doctype(nameParser.bind(), systemId.bind()));
          } else {
            return done(xml.doctype(nameParser.bind(), publicId.bind(), systemId.bind()));
          }
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
    return new DoctypeDeclParser<I, V>(xml, nameParser, publicId, systemId,
                                       markupDeclParser, quote, step);
  }

  static <I, V> Parser<I> parse(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, null, 0, 1);
  }

  static <I, V> Parser<I> parseRest(Input input, XmlParser<I, V> xml) {
    return parse(input, xml, null, null, null, null, 0, 3);
  }
}
