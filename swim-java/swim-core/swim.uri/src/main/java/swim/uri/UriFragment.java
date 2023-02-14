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
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8DecodedOutput;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class UriFragment extends UriPart implements Comparable<UriFragment>, ToSource, ToString {

  final @Nullable String identifier;

  UriFragment(@Nullable String identifier) {
    this.identifier = identifier;
  }

  public boolean isDefined() {
    return this.identifier != null;
  }

  public @Nullable String identifier() {
    return this.identifier;
  }

  @Override
  public int compareTo(UriFragment that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriFragment) {
      final UriFragment that = (UriFragment) other;
      return Objects.equals(this.identifier, that.identifier);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(UriFragment.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(UriFragment.hashSeed,
        Objects.hashCode(this.identifier)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isDefined()) {
      notation.beginInvoke("UriFragment", "identifier")
              .appendArgument(this.identifier)
              .endInvoke();
    } else {
      notation.beginInvoke("UriFragment", "undefined").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    final String identifier = this.identifier;
    if (identifier == null) {
      return;
    }
    for (int i = 0, n = identifier.length(); i < n; i = identifier.offsetByCodePoints(i, 1)) {
      final int c = identifier.codePointAt(i);
      if (Uri.isFragmentChar(c)) {
        output.append((char) c);
      } else {
        Uri.writeEncoded(output, c);
      }
    }
  }

  @Override
  public String toString() {
    return this.toString(null);
  }

  private static final UriFragment UNDEFINED = new UriFragment(null);

  public static UriFragment undefined() {
    return UNDEFINED;
  }

  public static UriFragment identifier(@Nullable String identifier) {
    if (identifier != null) {
      return new UriFragment(identifier);
    } else {
      return UriFragment.undefined();
    }
  }

  public static UriFragment parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriFragment> cache = UriFragment.cache();
    UriFragment fragment = cache.get(part);
    if (fragment == null) {
      final Input input = new StringInput(part);
      fragment = UriFragment.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      fragment = cache.put(part, fragment);
    }
    return fragment;
  }

  public static UriFragment parse(Input input) {
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isFragmentChar(c)) {
          input.step();
          output.write(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return UriFragment.identifier(output.get());
      } else {
        break;
      }
      int c1 = 0;
      if (input.isCont()) {
        c1 = input.head();
        if (Base16.isDigit(c1)) {
          input.step();
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
      int c2 = 0;
      if (input.isCont()) {
        c2 = input.head();
        if (Base16.isDigit(c2)) {
          input.step();
          output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c2));
          continue;
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriFragment fromJsonString(String value) {
    return UriFragment.parse(value);
  }

  public static String toJsonString(UriFragment fragment) {
    return fragment.toString();
  }

  public static UriFragment fromWamlString(String value) {
    return UriFragment.parse(value);
  }

  public static String toWamlString(UriFragment fragment) {
    return fragment.toString();
  }

  private static final ThreadLocal<CacheMap<String, UriFragment>> CACHE = new ThreadLocal<CacheMap<String, UriFragment>>();

  private static CacheMap<String, UriFragment> cache() {
    CacheMap<String, UriFragment> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.fragment.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 128;
      }
      cache = new LruCacheMap<String, UriFragment>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}
