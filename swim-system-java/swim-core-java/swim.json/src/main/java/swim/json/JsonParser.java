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

package swim.json;

import java.math.BigInteger;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.Builder;

/**
 * Factory for constructing JSON parsers and parse trees.
 */
public abstract class JsonParser<I, V> {
  public abstract I item(V value);

  public abstract V value(I item);

  public abstract I field(V key, V value);

  public abstract Builder<I, V> objectBuilder();

  public abstract Builder<I, V> arrayBuilder();

  public abstract Output<V> textOutput();

  public abstract V ident(V value);

  public abstract V num(int value);

  public abstract V num(long value);

  public abstract V num(float value);

  public abstract V num(double value);

  public abstract V num(BigInteger value);

  public abstract V num(String value);

  public abstract V uint32(int value);

  public abstract V uint64(long value);

  public abstract V bool(boolean value);

  public Parser<V> parseValue(Input input) {
    return ValueParser.parse(input, this);
  }

  public Parser<V> parseObject(Input input) {
    return ObjectParser.parse(input, this);
  }

  public Parser<V> parseArray(Input input) {
    return ArrayParser.parse(input, this);
  }

  public Parser<V> parseIdent(Input input) {
    return IdentParser.parse(input, this);
  }

  public Parser<V> parseString(Input input) {
    return StringParser.parse(input, this);
  }

  public Parser<V> parseNumber(Input input) {
    return NumberParser.parse(input, this);
  }

  public Parser<V> valueParser() {
    return new ValueParser<I, V>(this);
  }

  public Parser<V> objectParser() {
    return new ObjectParser<I, V>(this);
  }

  public Parser<V> arrayParser() {
    return new ArrayParser<I, V>(this);
  }

  public V parseValueString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Json.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseValue(input);
    if (parser.isDone()) {
      while (input.isCont() && Json.isWhitespace(input.head())) {
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

  public V parseObjectString(String string) {
    Input input = Unicode.stringInput(string);
    while (input.isCont() && Json.isWhitespace(input.head())) {
      input = input.step();
    }
    Parser<V> parser = parseObject(input);
    if (parser.isDone()) {
      while (input.isCont() && Json.isWhitespace(input.head())) {
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
