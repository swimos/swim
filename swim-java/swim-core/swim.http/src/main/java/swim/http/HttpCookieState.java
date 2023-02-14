// Copyright 2015-2022 Swim.inc
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

package swim.http;

import java.util.Iterator;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.ArrayMap;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class HttpCookieState implements ToSource, ToString {

  final String name;
  final String value;
  final ArrayMap<String, String> params;

  HttpCookieState(String name, String value, ArrayMap<String, String> params) {
    this.name = name;
    this.value = value;
    this.params = params;
  }

  public String name() {
    return this.name;
  }

  public String value() {
    return this.value;
  }

  public ArrayMap<String, String> params() {
    return this.params;
  }

  public boolean hasParam(String key) {
    return this.params.containsKey(key);
  }

  public @Nullable String getParam(String key) {
    return this.params.get(key);
  }

  public HttpCookieState withParam(String key) {
    return HttpCookieState.create(this.name, this.value, this.params.updated(key, null));
  }

  public HttpCookieState withParam(String key, @Nullable String value) {
    return HttpCookieState.create(this.name, this.value, this.params.updated(key, value));
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpCookieState.write(output, this.name, this.value, this.params.iterator(),
                                      null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpCookieState(this.name, this.value, this.params.iterator(),
                                    null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpCookieState) {
      final HttpCookieState that = (HttpCookieState) other;
      return this.name.equals(that.name) && this.value.equals(that.value)
          && this.params.equals(that.params);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(HttpCookieState.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HttpCookieState.hashSeed,
        this.name.hashCode()), this.value.hashCode()), this.params.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpCookieState", "create")
            .appendArgument(this.name)
            .appendArgument(this.value)
            .endInvoke();
    for (Map.Entry<String, String> param : this.params) {
      notation.beginInvoke("withParam")
              .appendArgument(param.getKey())
              .appendArgument(param.getValue())
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).checkDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).checkDone();
    return output.get();
  }

  public static HttpCookieState create(String name, String value,
                                       ArrayMap<String, String> params) {
    return new HttpCookieState(name, value, params);
  }

  public static HttpCookieState create(String name, String value) {
    return HttpCookieState.create(name, value, ArrayMap.empty());
  }

  public static Parse<HttpCookieState> parse(Input input) {
    return ParseHttpCookieState.parse(input, null, null, ArrayMap.empty(), null, null, 1);
  }

  public static Parse<HttpCookieState> parse() {
    return new ParseHttpCookieState(null, null, ArrayMap.empty(), null, null, 1);
  }

  public static HttpCookieState parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpCookieState> parse = HttpCookieState.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

}

final class ParseHttpCookieState extends Parse<HttpCookieState> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder valueBuilder;
  final ArrayMap<String, String> params;
  final @Nullable StringBuilder keyBuilder;
  final @Nullable StringBuilder valBuilder;
  final int step;

  ParseHttpCookieState(@Nullable StringBuilder nameBuilder,
                       @Nullable StringBuilder valueBuilder,
                       ArrayMap<String, String> params,
                       @Nullable StringBuilder keyBuilder,
                       @Nullable StringBuilder valBuilder, int step) {
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.params = params;
    this.keyBuilder = keyBuilder;
    this.valBuilder = valBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpCookieState> consume(Input input) {
    return ParseHttpCookieState.parse(input, this.nameBuilder, this.valueBuilder,
                                      this.params, this.keyBuilder, this.valBuilder,
                                      this.step);
  }

  static Parse<HttpCookieState> parse(Input input, @Nullable StringBuilder nameBuilder,
                                      @Nullable StringBuilder valueBuilder,
                                      ArrayMap<String, String> params,
                                      @Nullable StringBuilder keyBuilder,
                                      @Nullable StringBuilder valBuilder,
                                      int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parse.error(Diagnostic.expected("cookie name", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("cookie name", input));
      }
    }
    if (step == 2) {
      nameBuilder = Assume.nonNull(nameBuilder);
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '=') {
        input.step();
        valueBuilder = new StringBuilder();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('=', input));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        if (input.head() == '"') {
          input.step();
          step = 4;
        } else {
          step = 6;
        }
      } else if (input.isDone()) {
        step = 7;
      }
    }
    if (step == 4) {
      valueBuilder = Assume.nonNull(valueBuilder);
      while (input.isCont()) {
        c = input.head();
        if (Http.isCookieChar(c)) {
          input.step();
          valueBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        step = 5;
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '"') {
        input.step();
        step = 7;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('"', input));
      }
    }
    if (step == 6) {
      valueBuilder = Assume.nonNull(valueBuilder);
      while (input.isCont()) {
        c = input.head();
        if (Http.isCookieChar(c)) {
          input.step();
          valueBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isReady()) {
        step = 7;
      }
    }
    do {
      if (step == 7) {
        nameBuilder = Assume.nonNull(nameBuilder);
        valueBuilder = Assume.nonNull(valueBuilder);
        if (input.isCont() && input.head() == ';') {
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.done(HttpCookieState.create(nameBuilder.toString(),
                                                   valueBuilder.toString(),
                                                   params));
        }
      }
      if (step == 8) {
        if (input.isCont() && input.head() == ' ') {
          input.step();
          step = 9;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("space", input));
        }
      }
      if (step == 9) {
        if (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c <= 0x7E && c != ';' && c != '=') {
            input.step();
            keyBuilder = new StringBuilder();
            keyBuilder.appendCodePoint(c);
            step = 10;
          } else {
            step = 10;
          }
        } else if (input.isDone()) {
          step = 10;
        }
      }
      if (step == 10) {
        keyBuilder = Assume.nonNull(keyBuilder);
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c <= 0x7E && c != ';' && c != '=') {
            input.step();
            keyBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '=') {
          input.step();
          valBuilder = new StringBuilder();
          step = 11;
        } else if (input.isReady()) {
          params = params.updated(keyBuilder.toString(), null);
          keyBuilder = null;
          step = 7;
          continue;
        }
      }
      if (step == 11) {
        keyBuilder = Assume.nonNull(keyBuilder);
        valBuilder = Assume.nonNull(valBuilder);
        while (input.isCont()) {
          c = input.head();
          if (c >= 0x20 && c <= 0x7E && c != ';') {
            input.step();
            valBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          params = params.updated(keyBuilder.toString(), valBuilder.toString());
          keyBuilder = null;
          valBuilder = null;
          step = 7;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpCookieState(nameBuilder, valueBuilder, params,
                                    keyBuilder, valBuilder, step);
  }

}

final class WriteHttpCookieState extends Write<Object> {

  final String name;
  final String value;
  final Iterator<Map.Entry<String, String>> params;
  final @Nullable String key;
  final @Nullable String val;
  final int index;
  final int escape;
  final int step;

  WriteHttpCookieState(String name, String value,
                       Iterator<Map.Entry<String, String>> params,
                       @Nullable String key, @Nullable String val,
                       int index, int escape, int step) {
    this.name = name;
    this.value = value;
    this.params = params;
    this.key = key;
    this.val = val;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpCookieState.write(output, this.name, this.value,
                                      this.params, this.key, this.val,
                                      this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String name, String value,
                             Iterator<Map.Entry<String, String>> params,
                             @Nullable String key, @Nullable String val,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("Blank cookie name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid cookie name: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        step = 2;
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('=');
      step = 3;
    }
    if (step == 3) {
      while (index < value.length() && output.isCont()) {
        c = value.codePointAt(index);
        if (Http.isCookieChar(c)) {
          output.write(c);
          index = value.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid cookie value: " + value));
        }
      }
      if (index >= value.length()) {
        index = 0;
        step = 4;
      }
    }
    do {
      if (step == 4) {
        if (params.hasNext()) {
          if (output.isCont()) {
            output.write(';');
            final Map.Entry<String, String> param = params.next();
            key = param.getKey();
            val = param.getValue();
            step = 5;
          }
        } else {
          return Write.done();
        }
      }
      if (step == 5 && output.isCont()) {
        output.write(' ');
        step = 6;
      }
      if (step == 6) {
        key = Assume.nonNull(key);
        while (index < key.length() && output.isCont()) {
          c = key.codePointAt(index);
          if (c >= 0x20 && c <= 0x7E && c != ';' && c != '=') {
            output.write(c);
            index = key.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("Invalid param key: " + key));
          }
        }
        if (index >= key.length()) {
          index = 0;
          if (val != null) {
            step = 7;
          } else {
            key = null;
            step = 4;
            continue;
          }
        }
      }
      if (step == 7 && output.isCont()) {
        output.write('=');
        step = 8;
      }
      if (step == 8) {
        val = Assume.nonNull(val);
        while (index < val.length() && output.isCont()) {
          c = val.codePointAt(index);
          if (c >= 0x20 && c <= 0x7E && c != ';') {
            output.write(c);
            index = val.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("Invalid param value: " + val));
          }
        }
        if (index >= val.length()) {
          index = 0;
          key = null;
          val = null;
          step = 4;
          continue;
        }
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpCookieState(name, value, params, key, val,
                                    index, escape, step);
  }

}
