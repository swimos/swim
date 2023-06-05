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

package swim.codec;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.ArrayMap;
import swim.util.Assume;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class MediaRange implements ToSource, ToString {

  final String type;
  final String subtype;
  final ArrayMap<String, String> params;
  final int weight;
  final ArrayMap<String, String> extParams;

  MediaRange(String type, String subtype, ArrayMap<String, String> params,
             int weight, ArrayMap<String, String> extParams) {
    this.type = type;
    this.subtype = subtype;
    this.params = params;
    this.weight = weight;
    this.extParams = extParams;
  }

  public String type() {
    return this.type;
  }

  public String subtype() {
    return this.subtype;
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

  public MediaRange withParam(String key, String value) {
    return MediaRange.of(this.type, this.subtype, this.params.updated(key, value),
                         this.weight, this.extParams);
  }

  public int weight() {
    return this.weight;
  }

  public MediaRange withWeight(int weight) {
    return new MediaRange(this.type, this.subtype, this.params,
                          weight, this.extParams);
  }

  public ArrayMap<String, String> extParams() {
    return this.extParams;
  }

  public boolean hasExtParam(String key) {
    return this.extParams.containsKey(key);
  }

  public @Nullable String getExtParam(String key) {
    return this.extParams.get(key);
  }

  public MediaRange withExtParam(String key, String value) {
    return new MediaRange(this.type, this.subtype, this.params,
                          this.weight, this.extParams.updated(key, value));
  }

  public boolean isApplication() {
    return "application".equalsIgnoreCase(this.type);
  }

  public boolean isAudio() {
    return "audio".equalsIgnoreCase(this.type);
  }

  public boolean isImage() {
    return "image".equalsIgnoreCase(this.type);
  }

  public boolean isMultipart() {
    return "multipart".equalsIgnoreCase(this.type);
  }

  public boolean isText() {
    return "text".equalsIgnoreCase(this.type);
  }

  public boolean isVideo() {
    return "video".equalsIgnoreCase(this.type);
  }

  public Write<?> write(Output<?> output) {
    return WriteMediaRange.write(output, this.type, this.subtype, this.params.iterator(),
                                 this.weight, this.extParams.iterator(), null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteMediaRange(this.type, this.subtype, this.params.iterator(),
                               this.weight, this.extParams.iterator(), null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MediaRange that) {
      return this.type.equals(that.type) && this.subtype.equals(that.subtype)
          && this.params.equals(that.params) && this.weight == that.weight
          && this.extParams.equals(that.extParams);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(MediaRange.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(HASH_SEED, this.type.hashCode()), this.subtype.hashCode()),
        this.params.hashCode()), Murmur3.hash(this.weight)),
        this.extParams.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("MediaRange", "of")
            .appendArgument(this.type)
            .appendArgument(this.subtype)
            .endInvoke();
    for (Map.Entry<String, String> param : this.params) {
      notation.beginInvoke("withParam")
              .appendArgument(param.getKey())
              .appendArgument(param.getValue())
              .endInvoke();
    }
    if (this.weight != 1000) {
      notation.beginInvoke("withWeight")
              .appendArgument(this.weight)
              .endInvoke();
    }
    for (Map.Entry<String, String> extParam : this.extParams) {
      notation.beginInvoke("withExtParam")
              .appendArgument(extParam.getKey())
              .appendArgument(extParam.getValue())
              .endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    try {
      this.write(StringOutput.from(output)).checkDone();
    } catch (WriteException cause) {
      throw new IOException("write failed", cause);
    }
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output); // swallow write errors to ensure toString never fails
    return output.get();
  }

  public static MediaRange of(String type, String subtype, ArrayMap<String, String> params,
                              int weight, ArrayMap<String, String> extParams) {
    return new MediaRange(type, subtype, params, weight, extParams);
  }

  public static MediaRange of(String type, String subtype, ArrayMap<String, String> params) {
    return MediaRange.of(type, subtype, params, 1000, ArrayMap.empty());
  }

  public static MediaRange of(String type, String subtype) {
    return MediaRange.of(type, subtype, ArrayMap.empty(), 1000, ArrayMap.empty());
  }

  public static Parse<MediaRange> parse(Input input) {
    return ParseMediaRange.parse(input, null, null, ArrayMap.empty(), -1,
                                 ArrayMap.empty(), null, null, 1);
  }

  public static Parse<MediaRange> parse() {
    return new ParseMediaRange(null, null, ArrayMap.empty(), -1,
                               ArrayMap.empty(), null, null, 1);
  }

  public static Parse<MediaRange> parse(String string) {
    Objects.requireNonNull(string);
    final CacheMap<String, Parse<MediaRange>> cache = MediaRange.cache();
    Parse<MediaRange> parseMediaRange = cache.get(string);
    if (parseMediaRange == null) {
      final StringInput input = new StringInput(string);
      parseMediaRange = MediaRange.parse(input).complete(input);
      if (parseMediaRange.isDone()) {
        parseMediaRange = cache.put(string, parseMediaRange);
      }
    }
    return parseMediaRange;
  }

  static @Nullable CacheMap<String, Parse<MediaRange>> cache;

  static CacheMap<String, Parse<MediaRange>> cache() {
    if (MediaRange.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.codec.media.range.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 128;
      }
      MediaRange.cache = new LruCacheMap<String, Parse<MediaRange>>(cacheSize);
    }
    return MediaRange.cache;
  }

}

final class ParseMediaRange extends Parse<MediaRange> {

  final @Nullable StringBuilder typeBuilder;
  final @Nullable StringBuilder subtypeBuilder;
  final ArrayMap<String, String> params;
  final int weight;
  final ArrayMap<String, String> extParams;
  final @Nullable StringBuilder keyBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseMediaRange(@Nullable StringBuilder typeBuilder,
                  @Nullable StringBuilder subtypeBuilder,
                  ArrayMap<String, String> params,
                  int weight,
                  ArrayMap<String, String> extParams,
                  @Nullable StringBuilder keyBuilder,
                  @Nullable StringBuilder valueBuilder,
                  int step) {
    this.typeBuilder = typeBuilder;
    this.subtypeBuilder = subtypeBuilder;
    this.params = params;
    this.weight = weight;
    this.extParams = extParams;
    this.keyBuilder = keyBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<MediaRange> consume(Input input) {
    return ParseMediaRange.parse(input, this.typeBuilder, this.subtypeBuilder,
                                 this.params, this.weight, this.extParams,
                                 this.keyBuilder, this.valueBuilder, this.step);
  }

  static Parse<MediaRange> parse(Input input, @Nullable StringBuilder typeBuilder,
                                 @Nullable StringBuilder subtypeBuilder,
                                 ArrayMap<String, String> params, int weight,
                                 ArrayMap<String, String> extParams,
                                 @Nullable StringBuilder keyBuilder,
                                 @Nullable StringBuilder valueBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && MediaType.isTokenChar(c = input.head())) {
        typeBuilder = new StringBuilder();
        typeBuilder.appendCodePoint(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("media type", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && MediaType.isTokenChar(c = input.head())) {
        Assume.nonNull(typeBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && c == '/') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('/', input));
      }
    }
    if (step == 3) {
      if (input.isCont() && MediaType.isTokenChar(c = input.head())) {
        subtypeBuilder = new StringBuilder();
        subtypeBuilder.appendCodePoint(c);
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("media subtype", input));
      }
    }
    if (step == 4) {
      while (input.isCont() && MediaType.isTokenChar(c = input.head())) {
        Assume.nonNull(subtypeBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        step = 5;
      }
    }
    do {
      if (step == 5) {
        while (input.isCont() && MediaType.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ';') {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          if (weight < 0) {
            weight = 1000;
          }
          return Parse.done(MediaRange.of(Assume.nonNull(typeBuilder).toString(),
                                          Assume.nonNull(subtypeBuilder).toString(),
                                          params, weight, extParams));
        }
      }
      if (step == 6) {
        while (input.isCont() && MediaType.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && MediaType.isTokenChar(c)) {
          keyBuilder = new StringBuilder();
          keyBuilder.appendCodePoint(c);
          input.step();
          step = 7;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("param name", input));
        }
      }
      if (step == 7) {
        while (input.isCont() && MediaType.isTokenChar(c = input.head())) {
          Assume.nonNull(keyBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && c == '=') {
          input.step();
          if (weight < 0 && "q".equals(Assume.nonNull(keyBuilder).toString())) {
            step = 13;
          } else {
            step = 8;
          }
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('=', input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          valueBuilder = new StringBuilder();
          if (input.head() == '"') {
            input.step();
            step = 11;
          } else {
            step = 9;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        if (input.isCont() && MediaType.isTokenChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
          step = 10;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("param value", input));
        }
      }
      if (step == 10) {
        while (input.isCont() && MediaType.isTokenChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isReady()) {
          if (weight < 0) {
            params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                    Assume.nonNull(valueBuilder).toString());
          } else {
            extParams = extParams.updated(Assume.nonNull(keyBuilder).toString(),
                                          Assume.nonNull(valueBuilder).toString());
          }
          keyBuilder = null;
          valueBuilder = null;
          step = 5;
          continue;
        }
      }
      if (step == 11) {
        while (input.isCont() && MediaType.isQuotedChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
        }
        if (input.isCont() && (c == '"' || c == '\\')) {
          if (c == '"') {
            if (weight < 0) {
              params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                      Assume.nonNull(valueBuilder).toString());
            } else {
              extParams = extParams.updated(Assume.nonNull(keyBuilder).toString(),
                                            Assume.nonNull(valueBuilder).toString());
            }
            keyBuilder = null;
            valueBuilder = null;
            input.step();
            step = 5;
            continue;
          } else { // c == '\\'
            input.step();
            step = 12;
          }
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 12) {
        if (input.isCont() && MediaType.isEscapeChar(c = input.head())) {
          Assume.nonNull(valueBuilder).appendCodePoint(c);
          input.step();
          step = 11;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 13) {
        if (input.isCont() && ((c = input.head()) == '0' || c == '1')) {
          if (c == '0') {
            weight = 0;
          } else { // c == '1'
            weight = 1000;
          }
          input.step();
          step = 14;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("qvalue", input));
        }
      }
      if (step == 14) {
        if (input.isCont() && input.head() == '.') {
          input.step();
          step = 15;
        } else if (input.isReady()) {
          step = 18;
        }
      }
      if (step == 15) {
        if (input.isCont() && Base10.isDigit(c = input.head())) {
          weight += 100 * Base10.decodeDigit(c);
          input.step();
          step = 16;
        } else if (input.isReady()) {
          step = 18;
        }
      }
      if (step == 16) {
        if (input.isCont() && Base10.isDigit(c = input.head())) {
          weight += 10 * Base10.decodeDigit(c);
          input.step();
          step = 17;
        } else if (input.isReady()) {
          step = 18;
        }
      }
      if (step == 17) {
        if (input.isCont() && Base10.isDigit(c = input.head())) {
          weight += Base10.decodeDigit(c);
          input.step();
          step = 18;
        } else if (input.isReady()) {
          step = 18;
        }
      }
      if (step == 18) {
        if (weight <= 1000) {
          step = 5;
          continue;
        } else {
          return Parse.error(Diagnostic.message("invalid qvalue: " + weight, input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseMediaRange(typeBuilder, subtypeBuilder, params, weight,
                               extParams, keyBuilder, valueBuilder, step);
  }

}

final class WriteMediaRange extends Write<Object> {

  final String type;
  final String subtype;
  final Iterator<Map.Entry<String, String>> params;
  final int weight;
  final Iterator<Map.Entry<String, String>> extParams;
  final @Nullable String key;
  final @Nullable String value;
  final int index;
  final int escape;
  final int step;

  WriteMediaRange(String type, String subtype,
                  Iterator<Map.Entry<String, String>> params, int weight,
                  Iterator<Map.Entry<String, String>> extParams,
                  @Nullable String key, @Nullable String value,
                  int index, int escape, int step) {
    this.type = type;
    this.subtype = subtype;
    this.params = params;
    this.weight = weight;
    this.extParams = extParams;
    this.key = key;
    this.value = value;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteMediaRange.write(output, this.type, this.subtype, this.params,
                                 this.weight, this.extParams, this.key,
                                 this.value, this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String type, String subtype,
                             Iterator<Map.Entry<String, String>> params, int weight,
                             Iterator<Map.Entry<String, String>> extParams,
                             @Nullable String key, @Nullable String value,
                             int index, int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (type.length() == 0) {
        return Write.error(new WriteException("blank media type"));
      }
      while (index < type.length() && output.isCont()) {
        c = type.codePointAt(index);
        if (MediaType.isTokenChar(c)) {
          output.write(c);
          index = type.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid media type: " + type));
        }
      }
      if (index >= type.length()) {
        index = 0;
        step = 2;
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('/');
      step = 3;
    }
    if (step == 3) {
      if (subtype.length() == 0) {
        return Write.error(new WriteException("blank media subtype"));
      }
      while (index < subtype.length() && output.isCont()) {
        c = subtype.codePointAt(index);
        if (MediaType.isTokenChar(c)) {
          output.write(c);
          index = subtype.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid media subtype: " + subtype));
        }
      }
      if (index >= subtype.length()) {
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
            value = param.getValue();
            step = 5;
          }
        } else if (weight >= 0 && (weight != 1000 || extParams.hasNext())) {
          if (output.isCont()) {
            output.write(';');
            step = 13;
          }
        } else if (weight < 0 && extParams.hasNext()) {
          if (output.isCont()) {
            output.write(';');
            final Map.Entry<String, String> extParam = extParams.next();
            key = extParam.getKey();
            value = extParam.getValue();
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
        if (key.length() == 0) {
          return Write.error(new WriteException("blank param key"));
        }
        while (index < key.length() && output.isCont()) {
          c = key.codePointAt(index);
          if (MediaType.isTokenChar(c)) {
            output.write(c);
            index = key.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("invalid param key: " + key));
          }
        }
        if (index >= key.length()) {
          index = 0;
          step = 7;
        }
      }
      if (step == 7 && output.isCont()) {
        output.write('=');
        if (MediaType.isToken(Assume.nonNull(value))) {
          step = 8;
        } else {
          step = 9;
        }
      }
      if (step == 8) {
        value = Assume.nonNull(value);
        while (index < value.length() && output.isCont()) {
          output.write(value.codePointAt(index));
          index = value.offsetByCodePoints(index, 1);
        }
        if (index >= value.length()) {
          index = 0;
          key = null;
          value = null;
          step = 4;
          continue;
        }
      }
      if (step == 9 && output.isCont()) {
        output.write('"');
        step = 10;
      }
      do {
        if (step == 10 && output.isCont()) {
          value = Assume.nonNull(value);
          if (index < value.length()) {
            c = value.codePointAt(index);
            if (MediaType.isQuotedChar(c)) {
              output.write(c);
              index = value.offsetByCodePoints(index, 1);
            } else if (MediaType.isVisibleChar(c)) {
              output.write('\\');
              index = value.offsetByCodePoints(index, 1);
              escape = c;
              step = 11;
            } else {
              return Write.error(new WriteException("invalid param value: " + value));
            }
            continue;
          } else {
            index = 0;
            step = 12;
            break;
          }
        }
        if (step == 11 && output.isCont()) {
          output.write(escape);
          escape = 0;
          step = 10;
          continue;
        }
        break;
      } while (true);
      if (step == 12 && output.isCont()) {
        output.write('"');
        key = null;
        value = null;
        step = 4;
        continue;
      }
      if (step == 13 && output.isCont()) {
        output.write(' ');
        step = 14;
      }
      if (step == 14 && output.isCont()) {
        output.write('q');
        step = 15;
      }
      if (step == 15 && output.isCont()) {
        output.write('=');
        step = 16;
      }
      if (step == 16 && output.isCont()) {
        output.write('0' + (weight / 1000));
        weight %= 1000;
        if (weight == 0) {
          weight = -1;
          step = 4;
          continue;
        } else {
          step = 17;
        }
      }
      if (step == 17 && output.isCont()) {
        output.write('.');
        step = 18;
      }
      if (step == 18 && output.isCont()) {
        output.write('0' + (weight / 100));
        weight %= 100;
        if (weight == 0) {
          weight = -1;
          step = 4;
          continue;
        } else {
          step = 19;
        }
      }
      if (step == 19 && output.isCont()) {
        output.write('0' + (weight / 10));
        weight %= 10;
        if (weight == 0) {
          weight = -1;
          step = 4;
          continue;
        } else {
          step = 20;
        }
      }
      if (step == 20 && output.isCont()) {
        output.write('0' + weight);
        weight = -1;
        step = 4;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteMediaRange(type, subtype, params, weight, extParams,
                               key, value, index, escape, step);
  }

}
