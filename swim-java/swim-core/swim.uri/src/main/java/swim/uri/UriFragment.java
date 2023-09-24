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

package swim.uri;

import java.io.IOException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.OutputException;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8DecodedOutput;
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
public final class UriFragment extends UriPart implements Comparable<UriFragment>, WriteSource, WriteString {

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
    } else if (other instanceof UriFragment that) {
      return Objects.equals(this.identifier, that.identifier);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UriFragment.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, Objects.hashCode(this.identifier)));
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

  @Marshal
  @Override
  public String toString() {
    return WriteString.toString(this);
  }

  static final UriFragment UNDEFINED = new UriFragment(null);

  public static UriFragment undefined() {
    return UNDEFINED;
  }

  public static UriFragment identifier(@Nullable String identifier) {
    if (identifier == null) {
      return UriFragment.undefined();
    }
    return new UriFragment(identifier);
  }

  @Unmarshal
  public static @Nullable UriFragment from(String value) {
    return UriFragment.parse(value).getOr(null);
  }

  public static Parse<UriFragment> parse(Input input) {
    return ParseUriFragment.parse(input, null, 0, 1);
  }

  public static Parse<UriFragment> parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, Parse<UriFragment>> cache = UriFragment.cache();
    Parse<UriFragment> parseFragment = cache.get(part);
    if (parseFragment == null) {
      final StringInput input = new StringInput(part);
      parseFragment = UriFragment.parse(input).complete(input);
      if (parseFragment.isDone()) {
        parseFragment = cache.put(part, parseFragment);
      }
    }
    return parseFragment;
  }

  static final ThreadLocal<CacheMap<String, Parse<UriFragment>>> CACHE =
      new ThreadLocal<CacheMap<String, Parse<UriFragment>>>();

  static CacheMap<String, Parse<UriFragment>> cache() {
    CacheMap<String, Parse<UriFragment>> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.fragment.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 128;
      }
      cache = new LruCacheMap<String, Parse<UriFragment>>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}

final class ParseUriFragment extends Parse<UriFragment> {

  final @Nullable Utf8DecodedOutput<String> output;
  final int c1;
  final int step;

  ParseUriFragment(@Nullable Utf8DecodedOutput<String> output, int c1, int step) {
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  @Override
  public Parse<UriFragment> consume(Input input) {
    return ParseUriFragment.parse(input, this.output, this.c1, this.step);
  }

  static Parse<UriFragment> parse(Input input, @Nullable Utf8DecodedOutput<String> output,
                                  int c1, int step) {
    int c = 0;
    if (input.isReady() && output == null) {
      output = new Utf8DecodedOutput<String>(new StringOutput());
    }
    do {
      if (step == 1) {
        while (input.isCont() && Uri.isFragmentChar(c = input.head())) {
          Assume.nonNull(output).write(c);
          input.step();
        }
        if (input.isCont() && c == '%') {
          input.step();
          step = 2;
        } else if (input.isReady()) {
          try {
            return Parse.done(UriFragment.identifier(Assume.nonNull(output).get()));
          } catch (OutputException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 2) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          c1 = c;
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 3) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          Assume.nonNull(output).write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          input.step();
          step = 1;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriFragment(output, c1, step);
  }

}
