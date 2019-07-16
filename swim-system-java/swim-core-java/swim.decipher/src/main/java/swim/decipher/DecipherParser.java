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

package swim.decipher;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Unicode;

/**
 * Factory for constructing Format-detecting parsers.
 */
public abstract class DecipherParser<I, V> {
  public abstract Parser<V> parseXml(Input input);

  public abstract Parser<V> parseJson(Input input);

  public abstract Parser<V> parseRecon(Input input);

  public Parser<V> parseAny(Input input) {
    return AnyParser.parse(input, this);
  }

  public Parser<V> anyParser() {
    return new AnyParser<I, V>(this);
  }

  public V parseAnyString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Decipher.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseAny(input);
    if (parser.isDone()) {
      while (input.isCont() && Decipher.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}
