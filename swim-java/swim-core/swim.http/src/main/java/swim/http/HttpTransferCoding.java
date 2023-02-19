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
public final class HttpTransferCoding implements ToSource, ToString {

  final String name;
  final ArrayMap<String, String> params;

  HttpTransferCoding(String name, ArrayMap<String, String> params) {
    this.name = name;
    this.params = params;
  }

  HttpTransferCoding(String name) {
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

  public HttpTransferCoding withParam(String key, String value) {
    return HttpTransferCoding.of(this.name, this.params.updated(key, value));
  }

  public boolean isChunked() {
    return "chunked".equalsIgnoreCase(this.name);
  }

  public boolean isCompress() {
    return "compress".equalsIgnoreCase(this.name);
  }

  public boolean isDeflate() {
    return "deflate".equalsIgnoreCase(this.name);
  }

  public boolean isGzip() {
    return "gzip".equalsIgnoreCase(this.name);
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpTransferCoding.write(output, this.name, this.params.iterator(),
                                         null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpTransferCoding(this.name, this.params.iterator(),
                                       null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpTransferCoding) {
      final HttpTransferCoding that = (HttpTransferCoding) other;
      return this.name.equals(that.name) && this.params.equals(that.params);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpTransferCoding.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.name.hashCode()), this.params.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpTransferCoding", "of")
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
    this.write(StringOutput.from(output)).checkDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).checkDone();
    return output.get();
  }

  private static final HttpTransferCoding CHUNKED = new HttpTransferCoding("chunked");

  public static HttpTransferCoding chunked() {
    return CHUNKED;
  }

  private static final HttpTransferCoding COMPRESS = new HttpTransferCoding("compress");

  public static HttpTransferCoding compress() {
    return COMPRESS;
  }

  private static final HttpTransferCoding DEFLATE = new HttpTransferCoding("deflate");

  public static HttpTransferCoding deflate() {
    return DEFLATE;
  }

  private static final HttpTransferCoding GZIP = new HttpTransferCoding("gzip");

  public static HttpTransferCoding gzip() {
    return GZIP;
  }

  public static HttpTransferCoding of(String name, ArrayMap<String, String> params) {
    if (params.isEmpty()) {
      if ("chunked".equals(name)) {
        return HttpTransferCoding.chunked();
      } else if ("compress".equals(name)) {
        return HttpTransferCoding.compress();
      } else if ("deflate".equals(name)) {
        return HttpTransferCoding.deflate();
      } else if ("gzip".equals(name)) {
        return HttpTransferCoding.gzip();
      }
    }
    return new HttpTransferCoding(name, params);
  }

  public static HttpTransferCoding of(String name) {
    return HttpTransferCoding.of(name, ArrayMap.<String, String>empty());
  }

  public static Parse<HttpTransferCoding> parse(Input input) {
    return ParseHttpTransferCoding.parse(input, null, null, null, ArrayMap.empty(), 1);
  }

  public static Parse<HttpTransferCoding> parse() {
    return new ParseHttpTransferCoding(null, null, null, ArrayMap.empty(), 1);
  }

  public static HttpTransferCoding parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpTransferCoding> parse = HttpTransferCoding.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

}

final class ParseHttpTransferCoding extends Parse<HttpTransferCoding> {

  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder keyBuilder;
  final @Nullable StringBuilder valueBuilder;
  final ArrayMap<String, String> params;
  final int step;

  ParseHttpTransferCoding(@Nullable StringBuilder nameBuilder,
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
  public Parse<HttpTransferCoding> consume(Input input) {
    return ParseHttpTransferCoding.parse(input, this.nameBuilder,
                                         this.keyBuilder, this.valueBuilder,
                                         this.params, this.step);
  }

  static Parse<HttpTransferCoding> parse(Input input,
                                         @Nullable StringBuilder nameBuilder,
                                         @Nullable StringBuilder keyBuilder,
                                         @Nullable StringBuilder valueBuilder,
                                         ArrayMap<String, String> params,
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
          return Parse.error(Diagnostic.expected("transfer coding", input));
        }
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.expected("transfer coding", input));
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
      if (input.isReady()) {
        step = 3;
      }
    }
    do {
      if (step == 3) {
        nameBuilder = Assume.nonNull(nameBuilder);
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ';') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.done(HttpTransferCoding.of(nameBuilder.toString(), params));
        }
      }
      if (step == 4) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (Http.isTokenChar(c)) {
            keyBuilder = new StringBuilder();
            input.step();
            keyBuilder.appendCodePoint(c);
            step = 5;
          } else {
            return Parse.error(Diagnostic.expected("param name", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("param name", input));
        }
      }
      if (step == 5) {
        keyBuilder = Assume.nonNull(keyBuilder);
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            keyBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '=') {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('=', input));
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
        valueBuilder = Assume.nonNull(valueBuilder);
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            valueBuilder.appendCodePoint(c);
            step = 8;
          } else {
            return Parse.error(Diagnostic.expected("param value", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("param value", input));
        }
      }
      if (step == 8) {
        keyBuilder = Assume.nonNull(keyBuilder);
        valueBuilder = Assume.nonNull(valueBuilder);
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            valueBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isReady()) {
          params = params.updated(keyBuilder.toString(), valueBuilder.toString());
          keyBuilder = null;
          valueBuilder = null;
          step = 3;
          continue;
        }
      }
      if (step == 9) {
        keyBuilder = Assume.nonNull(keyBuilder);
        valueBuilder = Assume.nonNull(valueBuilder);
        while (input.isCont()) {
          c = input.head();
          if (Http.isQuotedChar(c)) {
            input.step();
            valueBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '"') {
            input.step();
            params = params.updated(keyBuilder.toString(), valueBuilder.toString());
            keyBuilder = null;
            valueBuilder = null;
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
        valueBuilder = Assume.nonNull(valueBuilder);
        if (input.isCont()) {
          c = input.head();
          if (Http.isEscapeChar(c)) {
            input.step();
            valueBuilder.appendCodePoint(c);
            step = 9;
            continue;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpTransferCoding(nameBuilder, keyBuilder,
                                       valueBuilder, params, step);
  }

}

final class WriteHttpTransferCoding extends Write<Object> {

  final String name;
  final Iterator<? extends Map.Entry<String, String>> params;
  final @Nullable String key;
  final @Nullable String value;
  final int index;
  final int escape;
  final int step;

  WriteHttpTransferCoding(String name, Iterator<? extends Map.Entry<String, String>> params,
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
    return WriteHttpTransferCoding.write(output, this.name, this.params,
                                         this.key, this.value, this.index,
                                         this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String name,
                             Iterator<? extends Map.Entry<String, String>> params,
                             @Nullable String key, @Nullable String value,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (name.length() == 0) {
        return Write.error(new WriteException("Blank transfer coding"));
      }
      while (index < name.length() && output.isCont()) {
        c = name.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = name.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("Invalid transfer coding: " + name));
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
          return Write.error(new WriteException("Blank param key"));
        }
        while (index < key.length() && output.isCont()) {
          c = key.codePointAt(index);
          if (Http.isTokenChar(c)) {
            output.write(c);
            index = key.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("Invalid param key: " + key));
          }
        }
        if (index >= key.length()) {
          index = 0;
          step = 5;
        }
      }
      if (step == 5 && output.isCont()) {
        value = Assume.nonNull(value);
        output.write('=');
        if (Http.isToken(value)) {
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
              return Write.error(new WriteException("Invalid param value: " + value));
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
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpTransferCoding(name, params, key, value, index, escape, step);
  }

}
