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

package swim.ws;

import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
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
import swim.http.Http;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class WsExtension implements ToSource, ToString {

  final String name;
  final ArrayMap<String, String> params;

  WsExtension(String name, ArrayMap<String, String> params) {
    this.name = name;
    this.params = params;
  }

  WsExtension(String name) {
    this(name, ArrayMap.<String, String>empty());
  }

  public String name() {
    return this.name;
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

  public WsExtension withParam(String key, String value) {
    return WsExtension.of(this.name, this.params.updated(key, value));
  }

  public Write<?> write(Output<?> output) {
    return WriteWsExtension.write(output, this.name, this.params.iterator(), null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteWsExtension(this.name, this.params.iterator(), null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WsExtension that) {
      return this.name.equals(that.name) && this.params.equals(that.params);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(WsExtension.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), this.params.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WsExtension", "of")
            .appendArgument(this.name)
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

  public static WsExtension of(String name, ArrayMap<String, String> params) {
    Objects.requireNonNull(name, "name");
    Objects.requireNonNull(params, "params");
    return new WsExtension(name, params);
  }

  public static WsExtension of(String name) {
    return WsExtension.of(name, ArrayMap.empty());
  }

  public static WsExtension permessageDeflate(boolean serverNoContextTakeover,
                                              boolean clientNoContextTakeover,
                                              int serverMaxWindowBits,
                                              int clientMaxWindowBits) {
    ArrayMap<String, String> params = ArrayMap.empty();
    if (serverNoContextTakeover) {
      params = params.updated("server_no_context_takeover", null);
    }
    if (clientNoContextTakeover) {
      params = params.updated("client_no_context_takeover", null);
    }
    if (serverMaxWindowBits != 15) {
      params = params.updated("server_max_window_bits", Integer.toString(serverMaxWindowBits));
    }
    if (clientMaxWindowBits == 0) {
      params = params.updated("client_max_window_bits", null);
    } else if (clientMaxWindowBits != 15) {
      params = params.updated("client_max_window_bits", Integer.toString(clientMaxWindowBits));
    }
    return new WsExtension("permessage-deflate", params);
  }

  public static WsExtension xWebkitDeflateFrame(boolean serverNoContextTakeover,
                                                boolean clientNoContextTakeover,
                                                int serverMaxWindowBits,
                                                int clientMaxWindowBits) {
    ArrayMap<String, String> params = ArrayMap.empty();
    if (serverNoContextTakeover) {
      params = params.updated("server_no_context_takeover", null);
    }
    if (clientNoContextTakeover) {
      params = params.updated("client_no_context_takeover", null);
    }
    if (serverMaxWindowBits != 15) {
      params = params.updated("server_max_window_bits", Integer.toString(serverMaxWindowBits));
    }
    if (clientMaxWindowBits == 0) {
      params = params.updated("client_max_window_bits", null);
    } else if (clientMaxWindowBits != 15) {
      params = params.updated("client_max_window_bits", Integer.toString(clientMaxWindowBits));
    }
    return new WsExtension("x-webkit-deflate-frame", params);
  }

  public static Parse<WsExtension> parse(Input input) {
    return ParseWsExtension.parse(input, null, null, null, ArrayMap.empty(), 1);
  }

  public static Parse<WsExtension> parse() {
    return new ParseWsExtension(null, null, null, ArrayMap.empty(), 1);
  }

  public static Parse<WsExtension> parse(String string) {
    final StringInput input = new StringInput(string);
    return WsExtension.parse(input).complete(input);
  }

}

final class ParseWsExtension extends Parse<WsExtension> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder keyBuilder;
  final @Nullable StringBuilder valueBuilder;
  final ArrayMap<String, String> params;
  final int step;

  ParseWsExtension(@Nullable StringBuilder nameBuilder,
                   @Nullable StringBuilder keyBuilder,
                   @Nullable StringBuilder valueBuilder,
                   ArrayMap<String, String> params, int step) {
    this.nameBuilder = nameBuilder;
    this.keyBuilder = keyBuilder;
    this.valueBuilder = valueBuilder;
    this.params = params;
    this.step = step;
  }

  @Override
  public Parse<WsExtension> consume(Input input) {
    return ParseWsExtension.parse(input, this.nameBuilder, this.keyBuilder,
                                  this.valueBuilder, this.params, this.step);
  }

  static Parse<WsExtension> parse(Input input, @Nullable StringBuilder nameBuilder,
                                  @Nullable StringBuilder keyBuilder,
                                  @Nullable StringBuilder valueBuilder,
                                  ArrayMap<String, String> params, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        nameBuilder = new StringBuilder();
        nameBuilder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("websocket extension", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(nameBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 3;
      }
    }
    do {
      if (step == 3) {
        while (input.isCont() && Http.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ';') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.done(new WsExtension(Assume.nonNull(nameBuilder).toString(), params));
        }
      }
      if (step == 4) {
        while (input.isCont() && Http.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && Http.isTokenChar(c)) {
          keyBuilder = new StringBuilder();
          keyBuilder.appendCodePoint(c);
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("param name", input));
        }
      }
      if (step == 5) {
        while (input.isCont() && Http.isTokenChar(c = input.head())) {
          Assume.nonNull(keyBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && c == '=') {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          params = params.updated(Assume.nonNull(keyBuilder).toString(), null);
          keyBuilder = null;
          step = 3;
          continue;
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          valueBuilder = new StringBuilder();
          if (input.head() == '"') {
            input.step();
            step = 9;
          } else {
            step = 7;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        if (input.isCont() && Http.isTokenChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("param value", input));
        }
      }
      if (step == 8) {
        while (input.isCont() && Http.isTokenChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                  Assume.nonNull(valueBuilder).toString());
          keyBuilder = null;
          valueBuilder = null;
          step = 3;
          continue;
        }
      }
      if (step == 9) {
        while (input.isCont() && Http.isQuotedChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '"') {
            params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                    Assume.nonNull(valueBuilder).toString());
            keyBuilder = null;
            valueBuilder = null;
            input.step();
            step = 3;
            continue;
          } else if (c == '\\') {
            input.step();
            step = 10;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 10) {
        if (input.isCont() && Http.isEscapeChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
          step = 9;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWsExtension(nameBuilder, keyBuilder, valueBuilder, params, step);
  }

}

final class WriteWsExtension extends Write<Object> {

  final String name;
  final Iterator<? extends Map.Entry<String, String>> params;
  final @Nullable String key;
  final @Nullable String value;
  final int index;
  final int escape;
  final int step;

  WriteWsExtension(String name, Iterator<? extends Map.Entry<String, String>> params,
                   @Nullable String key, @Nullable String value,
                   int index, int escape, int step) {
    this.name = name;
    this.params = params;
    this.key = key;
    this.value = value;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteWsExtension.write(output, this.name, this.params, this.key, this.value,
                                  this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String name,
                             Iterator<? extends Map.Entry<String, String>> params,
                             @Nullable String key, @Nullable String value,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("blank websocket extension"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid websocket extension: " + name));
        }
      }
      if (index >= name.length()) {
        index = 0;
        step = 2;
      }
    }
    do {
      if (step == 2) {
        if (params.hasNext()) {
          if (output.isCont()) {
            output.write(';');
            final Map.Entry<String, String> param = params.next();
            key = param.getKey();
            value = param.getValue();
            step = 3;
          }
        } else {
          return Write.done();
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(' ');
        step = 4;
      }
      if (step == 4) {
        key = Assume.nonNull(key);
        if (key.length() == 0) {
          return Write.error(new WriteException("blank param key"));
        }
        while (index < key.length() && output.isCont()) {
          c = key.codePointAt(index);
          if (Http.isTokenChar(c)) {
            output.write(c);
            index = key.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("invalid param key: " + key));
          }
        }
        if (index >= key.length()) {
          index = 0;
          if (value != null) {
            step = 5;
          } else {
            key = null;
            step = 2;
            continue;
          }
        }
      }
      if (step == 5 && output.isCont()) {
        output.write('=');
        if (Http.isToken(Assume.nonNull(value))) {
          step = 6;
        } else {
          step = 7;
        }
      }
      if (step == 6) {
        value = Assume.nonNull(value);
        while (index < value.length() && output.isCont()) {
          output.write(value.codePointAt(index));
          index = value.offsetByCodePoints(index, 1);
        }
        if (index >= value.length()) {
          index = 0;
          key = null;
          value = null;
          step = 2;
          continue;
        }
      }
      if (step == 7 && output.isCont()) {
        output.write('"');
        step = 8;
      }
      do {
        if (step == 8 && output.isCont()) {
          value = Assume.nonNull(value);
          if (index < value.length()) {
            c = value.codePointAt(index);
            if (Http.isQuotedChar(c)) {
              output.write(c);
              index = value.offsetByCodePoints(index, 1);
            } else if (Http.isVisibleChar(c)) {
              output.write('\\');
              index = value.offsetByCodePoints(index, 1);
              escape = c;
              step = 9;
            } else {
              return Write.error(new WriteException("invalid param value: " + value));
            }
            continue;
          } else {
            index = 0;
            step = 10;
            break;
          }
        }
        if (step == 9 && output.isCont()) {
          output.write(escape);
          escape = 0;
          step = 8;
          continue;
        }
        break;
      } while (true);
      if (step == 10 && output.isCont()) {
        output.write('"');
        key = null;
        value = null;
        step = 2;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteWsExtension(name, params, key, value, index, escape, step);
  }

}
