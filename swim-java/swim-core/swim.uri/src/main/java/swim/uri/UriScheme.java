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

package swim.uri;

import java.io.IOException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.decl.Marshal;
import swim.decl.Unmarshal;
import swim.util.Assume;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class UriScheme extends UriPart implements Comparable<UriScheme>, WriteSource, WriteString {

  final @Nullable String name;

  UriScheme(@Nullable String name) {
    this.name = name;
  }

  public boolean isDefined() {
    return this.name != null;
  }

  public @Nullable String name() {
    return this.name;
  }

  @Override
  public int compareTo(UriScheme that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriScheme that) {
      return Objects.equals(this.name, that.name);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UriScheme.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.name)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isDefined()) {
      notation.beginInvoke("UriScheme", "name")
              .appendArgument(this.name)
              .endInvoke();
    } else {
      notation.beginInvoke("UriScheme", "undefined").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    final String name = this.name;
    if (name == null) {
      return;
    }
    final int n = name.length();
    if (n == 0) {
      throw new IOException("blank scheme");
    }
    char c = name.charAt(0);
    if (!Uri.isAlpha(c)) {
      throw new IOException(Notation.of("invalid scheme: ")
                                    .appendSource(name)
                                    .toString());
    }
    output.append(c);
    for (int i = 1; i < n; i += 1) {
      c = name.charAt(i);
      if (!Uri.isSchemeChar(c)) {
        throw new IOException(Notation.of("invalid scheme: ")
                                      .appendSource(name)
                                      .toString());
      }
      output.append(c);
    }
  }

  @Marshal
  @Override
  public String toString() {
    return this.name != null ? this.name : "";
  }

  static final UriScheme UNDEFINED = new UriScheme(null);

  public static UriScheme undefined() {
    return UNDEFINED;
  }

  public static UriScheme name(@Nullable String name) {
    if (name == null) {
      return UriScheme.undefined();
    }
    return new UriScheme(name);
  }

  @Unmarshal
  public static @Nullable UriScheme from(String value) {
    return UriScheme.parse(value).getOr(null);
  }

  public static Parse<UriScheme> parse(Input input) {
    return ParseUriScheme.parse(input, null, 1);
  }

  public static Parse<UriScheme> parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, Parse<UriScheme>> cache = UriScheme.cache();
    Parse<UriScheme> parseScheme = cache.get(part);
    if (parseScheme == null) {
      final StringInput input = new StringInput(part);
      parseScheme = UriScheme.parse(input).complete(input);
      if (parseScheme.isDone()) {
        parseScheme = cache.put(part, parseScheme);
      }
    }
    return parseScheme;
  }

  static @Nullable CacheMap<String, Parse<UriScheme>> cache;

  static CacheMap<String, Parse<UriScheme>> cache() {
    // Global cache is used in lieu of thread-local cache due to small number
    // of frequently used URI schemes.
    if (UriScheme.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.scheme.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 16;
      }
      UriScheme.cache = new LruCacheMap<String, Parse<UriScheme>>(cacheSize);
    }
    return UriScheme.cache;
  }

}

final class ParseUriScheme extends Parse<UriScheme> {

  final @Nullable StringBuilder builder;
  final int step;

  ParseUriScheme(@Nullable StringBuilder builder, int step) {
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<UriScheme> consume(Input input) {
    return ParseUriScheme.parse(input, this.builder, this.step);
  }

  static Parse<UriScheme> parse(Input input, @Nullable StringBuilder builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Uri.isAlpha(c = input.head())) {
        if (builder == null) {
          builder = new StringBuilder();
        }
        builder.append(Character.toLowerCase((char) c));
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("scheme", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Uri.isSchemeChar(c = input.head())) {
        Assume.nonNull(builder).append(Character.toLowerCase((char) c));
        input.step();
      }
      if (input.isReady()) {
        return Parse.done(UriScheme.name(Assume.nonNull(builder).toString()));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriScheme(builder, step);
  }

}
