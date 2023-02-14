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
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.ParseException;
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

  private static final int hashSeed = Murmur3.seed(UriPort.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(UriPort.hashSeed, this.number));
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

  public static UriPort parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriPort> cache = UriPort.cache();
    UriPort port = cache.get(part);
    if (port == null) {
      final Input input = new StringInput(part);
      port = UriPort.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      port = cache.put(part, port);
    }
    return port;
  }

  public static UriPort parse(Input input) {
    int number = 0;
    int c = 0;
    while (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input.step();
        number = 10 * number + Base10.decodeDigit(c);
        if (number < 0) {
          throw new ParseException(Diagnostic.message("port overflow", input));
        }
      } else {
        break;
      }
    }
    if (input.isReady()) {
      return UriPort.number(number);
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriPort fromJsonString(String value) {
    return UriPort.parse(value);
  }

  public static String toJsonString(UriPort port) {
    return port.toString();
  }

  public static UriPort fromWamlString(String value) {
    return UriPort.parse(value);
  }

  public static String toWamlString(UriPort port) {
    return port.toString();
  }

  private static @Nullable CacheMap<String, UriPort> cache;

  static CacheMap<String, UriPort> cache() {
    // Global cache is used in lieu of thread-local cache due to small number
    // of frequently used ports.
    if (UriPort.cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.port.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 64;
      }
      UriPort.cache = new LruCacheMap<String, UriPort>(cacheSize);
    }
    return UriPort.cache;
  }

}
