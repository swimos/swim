// Copyright 2015-2023 Nstream, inc.
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
import swim.codec.Base16;
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
public final class HttpChunkHeader implements WriteSource, WriteString {

  final long size;
  final ArrayMap<String, String> exts;

  HttpChunkHeader(long size, ArrayMap<String, String> exts) {
    this.size = size;
    this.exts = exts;
  }

  public boolean isLast() {
    return this.size == 0L;
  }

  public long size() {
    return this.size;
  }

  public ArrayMap<String, String> exts() {
    return this.exts;
  }

  public boolean hasExt(String key) {
    return this.exts.containsKey(key);
  }

  public @Nullable String getExt(String key) {
    return this.exts.get(key);
  }

  public HttpChunkHeader withExt(String key) {
    return this.withExt(key, null);
  }

  public HttpChunkHeader withExt(String key, @Nullable String value) {
    return HttpChunkHeader.of(this.size, this.exts.updated(key, value));
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpChunkHeader.write(output, this.size, this.exts.iterator(),
                                      null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpChunkHeader(this.size, this.exts.iterator(),
                                    null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunkHeader that) {
      return this.size == that.size && this.exts.equals(that.exts);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpChunkHeader.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Murmur3.hash(this.size)), this.exts.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.size == 0L) {
      notation.beginInvoke("HttpChunkHeader", "last").endInvoke();
    } else {
      notation.beginInvoke("HttpChunkHeader", "of")
              .appendArgument(this.size)
              .endInvoke();
    }
    for (Map.Entry<String, String> ext : this.exts) {
      notation.beginInvoke("withExt")
              .appendArgument(ext.getKey())
              .appendArgument(ext.getValue())
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

  static final HttpChunkHeader LAST = new HttpChunkHeader(0L, ArrayMap.empty());

  public static HttpChunkHeader last() {
    return LAST;
  }

  public static HttpChunkHeader of(long size, ArrayMap<String, String> exts) {
    if (size == 0L && exts.isEmpty()) {
      return HttpChunkHeader.last();
    } else {
      return new HttpChunkHeader(size, exts);
    }
  }

  public static HttpChunkHeader of(long size) {
    return HttpChunkHeader.of(size, ArrayMap.empty());
  }

  public static Parse<HttpChunkHeader> parse(Input input) {
    return ParseHttpChunkHeader.parse(input, 0L, null, null, null, 1);
  }

  public static Parse<HttpChunkHeader> parse() {
    return new ParseHttpChunkHeader(0L, null, null, null, 1);
  }

  public static Parse<HttpChunkHeader> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpChunkHeader.parse(input).complete(input);
  }

}

final class ParseHttpChunkHeader extends Parse<HttpChunkHeader> {

  final long size;
  final @Nullable ArrayMap<String, String> exts;
  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseHttpChunkHeader(long size, @Nullable ArrayMap<String, String> exts,
                       @Nullable StringBuilder nameBuilder,
                       @Nullable StringBuilder valueBuilder, int step) {
    this.size = size;
    this.exts = exts;
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpChunkHeader> consume(Input input) {
    return ParseHttpChunkHeader.parse(input, this.size, this.exts, this.nameBuilder,
                                      this.valueBuilder, this.step);
  }

  static Parse<HttpChunkHeader> parse(Input input, long size,
                                      @Nullable ArrayMap<String, String> exts,
                                      @Nullable StringBuilder nameBuilder,
                                      @Nullable StringBuilder valueBuilder,
                                      int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Base16.isDigit(c = input.head())) {
        size = (long) Base16.decodeDigit(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("chunk size", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Base16.isDigit(c = input.head())) {
        size = (size << 4) | (long) Base16.decodeDigit(c);
        if (size < 0L) {
          return Parse.error(Diagnostic.message("chunk size overflow", input));
        }
        input.step();
      }
      if (input.isReady()) {
        step = 3;
      }
    }
    do {
      if (step == 3) {
        if (input.isCont() && input.head() == ';') {
          if (exts == null) {
            exts = ArrayMap.empty();
          }
          input.step();
          step = 4;
        } else if (input.isReady()) {
          if (exts == null) {
            exts = ArrayMap.empty();
          }
          return Parse.done(HttpChunkHeader.of(size, exts));
        }
      }
      if (step == 4) {
        if (input.isCont() && Http.isTokenChar(c = input.head())) {
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("chunk ext name", input));
        }
      }
      if (step == 5) {
        while (input.isCont() && Http.isTokenChar(c = input.head())) {
          Assume.nonNull(nameBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && c == '=') {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          exts = Assume.nonNull(exts).updated(Assume.nonNull(nameBuilder).toString(), null);
          nameBuilder = null;
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
          return Parse.error(Diagnostic.expected("chunk ext value", input));
        }
      }
      if (step == 8) {
        while (input.isCont() && Http.isTokenChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          exts = Assume.nonNull(exts).updated(Assume.nonNull(nameBuilder).toString(),
                                              Assume.nonNull(valueBuilder).toString());
          nameBuilder = null;
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
            exts = Assume.nonNull(exts).updated(Assume.nonNull(nameBuilder).toString(),
                                                Assume.nonNull(valueBuilder).toString());
            nameBuilder = null;
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
    return new ParseHttpChunkHeader(size, exts, nameBuilder, valueBuilder, step);
  }

}

final class WriteHttpChunkHeader extends Write<Object> {

  final long size;
  final Iterator<Map.Entry<String, String>> exts;
  final @Nullable String key;
  final @Nullable String value;
  final int index;
  final int escape;
  final int step;

  WriteHttpChunkHeader(long size, Iterator<Map.Entry<String, String>> exts,
                       @Nullable String key, @Nullable String value,
                       int index, int escape, int step) {
    this.size = size;
    this.exts = exts;
    this.key = key;
    this.value = value;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpChunkHeader.write(output, this.size, this.exts,
                                      this.key, this.value, this.index,
                                      this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, long size,
                             Iterator<Map.Entry<String, String>> exts,
                             @Nullable String key, @Nullable String value,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1 && output.isCont()) {
      if (size >= 0L && size < 16L) {
        output.write(Base16.uppercase().encodeDigit((int) size));
        step = 2;
      } else {
        int i = 15;
        final int[] digits = new int[16];
        long x = size;
        while (x != 0L) {
          digits[i] = (int) x & 0xF;
          x >>>= 4;
          i -= 1;
        }
        i += 1 + index;
        while (i < 16 && output.isCont()) {
          output.write(Base16.uppercase().encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 16) {
          index = 0;
          step = 2;
        }
      }
    }
    do {
      if (step == 2) {
        if (exts.hasNext()) {
          if (output.isCont()) {
            output.write(';');
            final Map.Entry<String, String> ext = exts.next();
            key = ext.getKey();
            value = ext.getValue();
            step = 3;
          }
        } else {
          return Write.done();
        }
      }
      if (step == 3) {
        key = Assume.nonNull(key);
        if (key.length() == 0) {
          return Write.error(new WriteException("blank chunk ext name"));
        }
        while (index < key.length() && output.isCont()) {
          c = key.codePointAt(index);
          if (Http.isTokenChar(c)) {
            output.write(c);
            index = key.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("invalid chunk ext name: " + key));
          }
        }
        if (index >= key.length()) {
          index = 0;
          if (value == null) {
            key = null;
            step = 2;
            continue;
          } else {
            step = 4;
          }
        }
      }
      if (step == 4 && output.isCont()) {
        output.write('=');
        if (Http.isToken(Assume.nonNull(value))) {
          step = 5;
        } else {
          step = 6;
        }
      }
      if (step == 5) {
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
      if (step == 6 && output.isCont()) {
        output.write('"');
        step = 7;
      }
      do {
        if (step == 7 && output.isCont()) {
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
              step = 8;
            } else {
              return Write.error(new WriteException("invalid chunk ext value: " + value));
            }
            continue;
          } else {
            index = 0;
            step = 9;
            break;
          }
        }
        if (step == 8 && output.isCont()) {
          output.write(escape);
          escape = 0;
          step = 7;
          continue;
        }
        break;
      } while (true);
      if (step == 9 && output.isCont()) {
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
    return new WriteHttpChunkHeader(size, exts, key, value, index, escape, step);
  }

}
