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
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class HttpCookieState implements WriteSource, WriteString {

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
    return HttpCookieState.of(this.name, this.value, this.params.updated(key, null));
  }

  public HttpCookieState withParam(String key, @Nullable String value) {
    return HttpCookieState.of(this.name, this.value, this.params.updated(key, value));
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
    } else if (other instanceof HttpCookieState that) {
      return this.name.equals(that.name) && this.value.equals(that.value)
          && this.params.equals(that.params);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpCookieState.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), this.value.hashCode()), this.params.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpCookieState", "of")
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
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  public static HttpCookieState of(String name, String value,
                                   ArrayMap<String, String> params) {
    return new HttpCookieState(name, value, params);
  }

  public static HttpCookieState of(String name, String value) {
    return HttpCookieState.of(name, value, ArrayMap.empty());
  }

  public static Parse<HttpCookieState> parse(Input input) {
    return ParseHttpCookieState.parse(input, null, null, ArrayMap.empty(), null, null, 1);
  }

  public static Parse<HttpCookieState> parse() {
    return new ParseHttpCookieState(null, null, ArrayMap.empty(), null, null, 1);
  }

  public static Parse<HttpCookieState> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpCookieState.parse(input).complete(input);
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
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        nameBuilder = new StringBuilder();
        nameBuilder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("cookie name", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && c == '=') {
        valueBuilder = new StringBuilder();
        input.step();
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
      while (input.isCont() && Http.isCookieChar(c = input.head())) {
        Assume.nonNull(valueBuilder).appendCodePoint(c);
        input.step();
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
      while (input.isCont() && Http.isCookieChar(c = input.head())) {
        Assume.nonNull(valueBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 7;
      }
    }
    do {
      if (step == 7) {
        if (input.isCont() && input.head() == ';') {
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.done(HttpCookieState.of(Assume.nonNull(nameBuilder).toString(),
                                               Assume.nonNull(valueBuilder).toString(),
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
        if (input.isCont() && (c = input.head()) >= 0x20 && c <= 0x7E && c != ';' && c != '=') {
          keyBuilder = new StringBuilder();
          keyBuilder.appendCodePoint(c);
          input.step();
          step = 10;
        } else if (input.isReady()) {
          step = 10;
        }
      }
      if (step == 10) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c <= 0x7E && c != ';' && c != '=') {
          Assume.nonNull(keyBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && c == '=') {
          valBuilder = new StringBuilder();
          input.step();
          step = 11;
        } else if (input.isReady()) {
          params = params.updated(Assume.nonNull(keyBuilder).toString(), null);
          keyBuilder = null;
          step = 7;
          continue;
        }
      }
      if (step == 11) {
        while (input.isCont() && (c = input.head()) >= 0x20 && c <= 0x7E && c != ';') {
          Assume.nonNull(valBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                  Assume.nonNull(valBuilder).toString());
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
        return Write.error(new WriteException("blank cookie name"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid cookie name: " + name));
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
          return Write.error(new WriteException("invalid cookie value: " + value));
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
            return Write.error(new WriteException("invalid param key: " + key));
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
            return Write.error(new WriteException("invalid param value: " + val));
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
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpCookieState(name, value, params, key, val,
                                    index, escape, step);
  }

}
