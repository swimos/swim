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
import swim.annotations.FromForm;
import swim.annotations.IntoForm;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class UriPort implements Comparable<UriPort>, ToSource, ToString {

  final int number;

  UriPort(int number) {
    this.number = number;
  }

  public boolean isDefined() {
    return this.number != 0;
  }

  public int number() {
    return this.number;
  }

  @Override
  public int compareTo(UriPort that) {
    return Integer.compare(this.number, that.number);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPort) {
      final UriPort that = (UriPort) other;
      return this.number == that.number;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UriPort.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.number));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isDefined()) {
      notation.beginInvoke("UriPort", "number")
              .appendArgument(this.number)
              .endInvoke();
    } else {
      notation.beginInvoke("UriPort", "undefined").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    output.append(Integer.toString(this.number));
  }

  @IntoForm
  @Override
  public String toString() {
    return Integer.toString(this.number);
  }

  private static final UriPort UNDEFINED = new UriPort(0);

  public static UriPort undefined() {
    return UNDEFINED;
  }

  public static UriPort number(int number) {
    if (number < 0) {
      throw new IllegalArgumentException(Integer.toString(number));
    }
    if (number != 0) {
      return new UriPort(number);
    } else {
      return UriPort.undefined();
    }
  }

  @FromForm
  public static @Nullable UriPort from(String value) {
    return UriPort.parse(value).getOr(null);
  }

  public static Parse<UriPort> parse(Input input) {
    return ParseUriPort.parse(input, 0);
  }

  public static Parse<UriPort> parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, Parse<UriPort>> cache = UriPort.cache();
    Parse<UriPort> parsePort = cache.get(part);
    if (parsePort == null) {
      final StringInput input = new StringInput(part);
      parsePort = UriPort.parse(input).complete(input);
      if (parsePort.isDone()) {
        parsePort = cache.put(part, parsePort);
      }
    }
    return parsePort;
  }

  private static @Nullable CacheMap<String, Parse<UriPort>> cache;

  static CacheMap<String, Parse<UriPort>> cache() {
    // Global cache is used in lieu of thread-local cache due to small number
    // of frequently used ports.
    if (UriPort.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.port.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 64;
      }
      UriPort.cache = new LruCacheMap<String, Parse<UriPort>>(cacheSize);
    }
    return UriPort.cache;
  }

}

final class ParseUriPort extends Parse<UriPort> {

  final int number;

  ParseUriPort(int number) {
    this.number = number;
  }

  @Override
  public Parse<UriPort> consume(Input input) {
    return ParseUriPort.parse(input, this.number);
  }

  static Parse<UriPort> parse(Input input, int number) {
    int c = 0;
    while (input.isCont() && Base10.isDigit(c = input.head())) {
      number = 10 * number + Base10.decodeDigit(c);
      if (number > 65535) {
        return Parse.error(Diagnostic.message("port overflow", input));
      }
      input.step();
    }
    if (input.isReady()) {
      return Parse.done(UriPort.number(number));
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriPort(number);
  }

}
