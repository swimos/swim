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
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class MediaType implements WriteSource, WriteString {

  final String type;
  final String subtype;
  final ArrayMap<String, String> params;

  MediaType(String type, String subtype, ArrayMap<String, String> params) {
    this.type = type;
    this.subtype = subtype;
    this.params = params;
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

  public MediaType withParam(String key, String value) {
    return MediaType.of(this.type, this.subtype, this.params.updated(key, value));
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
    return WriteMediaType.write(output, this.type, this.subtype,
                                this.params.iterator(), null, null, 0, 0, 1);
  }

  public Write<?> write() {
    return new WriteMediaType(this.type, this.subtype,
                              this.params.iterator(), null, null, 0, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MediaType that) {
      return this.type.equals(that.type) && this.subtype.equals(that.subtype)
          && this.params.equals(that.params);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(MediaType.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.type.hashCode()), this.subtype.hashCode()), this.params.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("MediaType", "of")
            .appendArgument(this.type)
            .appendArgument(this.subtype)
            .endInvoke();
    for (Map.Entry<String, String> param : this.params) {
      notation.beginInvoke("withParam")
              .appendArgument(param.getKey())
              .appendArgument(param.getValue())
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

  public static MediaType of(String type, String subtype,
                                 ArrayMap<String, String> params) {
    return new MediaType(type, subtype, params);
  }

  public static MediaType of(String type, String subtype) {
    return MediaType.of(type, subtype, ArrayMap.empty());
  }

  public static Parse<MediaType> parse(Input input) {
    return ParseMediaType.parse(input, null, null, ArrayMap.empty(), null, null, 1);
  }

  public static Parse<MediaType> parse() {
    return new ParseMediaType(null, null, ArrayMap.empty(), null, null, 1);
  }

  public static Parse<MediaType> parse(String string) {
    Objects.requireNonNull(string);
    final CacheMap<String, Parse<MediaType>> cache = MediaType.cache();
    Parse<MediaType> parseMediaType = cache.get(string);
    if (parseMediaType == null) {
      final StringInput input = new StringInput(string);
      parseMediaType = MediaType.parse(input).complete(input);
      if (parseMediaType.isDone()) {
        parseMediaType = cache.put(string, parseMediaType);
      }
    }
    return parseMediaType;
  }

  static @Nullable CacheMap<String, Parse<MediaType>> cache;

  static CacheMap<String, Parse<MediaType>> cache() {
    if (MediaType.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.codec.media.type.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 64;
      }
      MediaType.cache = new LruCacheMap<String, Parse<MediaType>>(cacheSize);
    }
    return MediaType.cache;
  }

  static boolean isSpace(int c) {
    return c == 0x20 || c == 0x09;
  }

  static boolean isVisibleChar(int c) {
    return c >= 0x21 && c <= 0x7E;
  }

  static boolean isTokenChar(int c) {
    return c == '!' || c == '#'
        || c == '$' || c == '%'
        || c == '&' || c == '\''
        || c == '*' || c == '+'
        || c == '-' || c == '.'
        || (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || c == '^' || c == '_'
        || c == '`'
        || (c >= 'a' && c <= 'z')
        || c == '|' || c == '~';
  }

  static boolean isQuotedChar(int c) {
    return c == 0x09 || c == 0x20 || c == 0x21
        || (c >= 0x23 && c <= 0x5B)
        || (c >= 0x5D && c <= 0x7E)
        || (c >= 0x80 && c <= 0xFF);
  }

  static boolean isEscapeChar(int c) {
    return c == 0x09 || c == 0x20
        || (c >= 0x21 && c <= 0x7E)
        || (c >= 0x80 && c <= 0xFF);
  }

  static boolean isToken(String token) {
    final int n = token.length();
    if (n == 0) {
      return false;
    }
    for (int i = 0; i < n; i += 1) {
      if (!MediaType.isTokenChar(token.charAt(i))) {
        return false;
      }
    }
    return true;
  }

}

final class ParseMediaType extends Parse<MediaType> {

  final @Nullable StringBuilder typeBuilder;
  final @Nullable StringBuilder subtypeBuilder;
  final ArrayMap<String, String> params;
  final @Nullable StringBuilder keyBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseMediaType(@Nullable StringBuilder typeBuilder,
                 @Nullable StringBuilder subtypeBuilder,
                 ArrayMap<String, String> params,
                 @Nullable StringBuilder keyBuilder,
                 @Nullable StringBuilder valueBuilder,
                 int step) {
    this.typeBuilder = typeBuilder;
    this.subtypeBuilder = subtypeBuilder;
    this.params = params;
    this.keyBuilder = keyBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<MediaType> consume(Input input) {
    return ParseMediaType.parse(input, this.typeBuilder, this.subtypeBuilder,
                                this.params, this.keyBuilder, this.valueBuilder,
                                this.step);
  }

  static Parse<MediaType> parse(Input input, @Nullable StringBuilder typeBuilder,
                                @Nullable StringBuilder subtypeBuilder,
                                ArrayMap<String, String> params,
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
          return Parse.done(MediaType.of(Assume.nonNull(typeBuilder).toString(),
                                         Assume.nonNull(subtypeBuilder).toString(),
                                         params));
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
          step = 8;
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
          params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                  Assume.nonNull(valueBuilder).toString());
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
            params = params.updated(Assume.nonNull(keyBuilder).toString(),
                                    Assume.nonNull(valueBuilder).toString());
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
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseMediaType(typeBuilder, subtypeBuilder, params,
                              keyBuilder, valueBuilder, step);
  }

}

final class WriteMediaType extends Write<Object> {

  final String type;
  final String subtype;
  final Iterator<Map.Entry<String, String>> params;
  final @Nullable String key;
  final @Nullable String value;
  final int index;
  final int escape;
  final int step;

  WriteMediaType(String type, String subtype,
                  Iterator<Map.Entry<String, String>> params,
                  @Nullable String key, @Nullable String value,
                  int index, int escape, int step) {
    this.type = type;
    this.subtype = subtype;
    this.params = params;
    this.key = key;
    this.value = value;
    this.index = index;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteMediaType.write(output, this.type, this.subtype,
                                 this.params, this.key, this.value,
                                 this.index, this.escape, this.step);
  }

  static Write<Object> write(Output<?> output, String type, String subtype,
                             Iterator<Map.Entry<String, String>> params,
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
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteMediaType(type, subtype, params, key, value,
                              index, escape, step);
  }

}
