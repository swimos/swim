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
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.WriteException;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class UriScheme extends UriPart implements Comparable<UriScheme>, ToSource, ToString {

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
    } else if (other instanceof UriScheme) {
      final UriScheme that = (UriScheme) other;
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
      throw new WriteException(new Notation().append("Invalid scheme: ")
                                             .appendSource(name).toString());
    }
    char c = name.charAt(0);
    if (Uri.isAlpha(c)) {
      output.append(c);
    } else {
      throw new WriteException(new Notation().append("Invalid scheme: ")
                                             .appendSource(name).toString());
    }
    for (int i = 1; i < n; i += 1) {
      c = name.charAt(i);
      if (Uri.isSchemeChar(c)) {
        output.append(c);
      } else {
        throw new WriteException(new Notation().append("Invalid scheme: ")
                                               .appendSource(name).toString());
      }
    }
  }

  @Override
  public String toString() {
    return this.name != null ? this.name : "";
  }

  private static final UriScheme UNDEFINED = new UriScheme(null);

  public static UriScheme undefined() {
    return UNDEFINED;
  }

  public static UriScheme name(@Nullable String name) {
    if (name != null) {
      return new UriScheme(name);
    } else {
      return UriScheme.undefined();
    }
  }

  public static UriScheme parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriScheme> cache = UriScheme.cache();
    UriScheme scheme = cache.get(part);
    if (scheme == null) {
      final Input input = new StringInput(part);
      scheme = UriScheme.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      scheme = cache.put(part, scheme);
    }
    return scheme;
  }

  public static UriScheme parse(Input input) {
    final StringBuilder builder = new StringBuilder();
    int c = 0;
    if (input.isCont()) {
      c = input.head();
      if (Uri.isAlpha(c)) {
        input.step();
        builder.append(Character.toLowerCase((char) c));
      } else {
        throw new ParseException(Diagnostic.expected("scheme", input));
      }
    } else if (input.isDone()) {
      throw new ParseException(Diagnostic.expected("scheme", input));
    }
    while (input.isCont()) {
      c = input.head();
      if (Uri.isSchemeChar(c)) {
        input.step();
        builder.append(Character.toLowerCase((char) c));
      } else {
        break;
      }
    }
    if (input.isReady()) {
      return UriScheme.name(builder.toString());
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriScheme fromJsonString(String value) {
    return UriScheme.parse(value);
  }

  public static String toJsonString(UriScheme scheme) {
    return scheme.toString();
  }

  public static UriScheme fromWamlString(String value) {
    return UriScheme.parse(value);
  }

  public static String toWamlString(UriScheme scheme) {
    return scheme.toString();
  }

  private static @Nullable CacheMap<String, UriScheme> cache;

  static CacheMap<String, UriScheme> cache() {
    // Global cache is used in lieu of thread-local cache due to small number
    // of frequently used URI schemes.
    if (UriScheme.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.scheme.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      UriScheme.cache = new LruCacheMap<String, UriScheme>(cacheSize);
    }
    return UriScheme.cache;
  }

}
