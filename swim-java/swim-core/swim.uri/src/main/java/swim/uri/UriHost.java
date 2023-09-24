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
import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
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
public abstract class UriHost implements Comparable<UriHost>, WriteSource, WriteString {

  UriHost() {
    // sealed
  }

  public boolean isDefined() {
    return true;
  }

  public abstract String address();

  public @Nullable String name() {
    return null;
  }

  public @Nullable String ipv4() {
    return null;
  }

  public @Nullable String ipv6() {
    return null;
  }

  public final InetAddress inetAddress() throws UnknownHostException {
    return InetAddress.getByName(this.address());
  }

  @Override
  public final int compareTo(UriHost that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriHost) {
      return this.toString().equals(((UriHost) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(this.toString());
  }

  @Marshal
  @Override
  public abstract String toString();

  static final UriHost UNDEFINED = new UriHostUndefined();

  public static UriHost undefined() {
    return UNDEFINED;
  }

  public static UriHost name(@Nullable String address) {
    if (address == null) {
      return UriHost.undefined();
    }
    return new UriHostName(address);
  }

  public static UriHost ipv4(@Nullable String address) {
    if (address == null) {
      return UriHost.undefined();
    }
    return new UriHostIPv4(address);
  }

  public static UriHost ipv6(@Nullable String address) {
    if (address == null) {
      return UriHost.undefined();
    }
    return new UriHostIPv6(address);
  }

  public static UriHost inetAddress(@Nullable InetAddress address) {
    if (address == null) {
      return UriHost.undefined();
    } else if (address instanceof Inet4Address) {
      return UriHost.ipv4(address.getHostAddress());
    } else if (address instanceof Inet6Address) {
      return UriHost.ipv6(address.getHostAddress());
    } else {
      return UriHost.name(address.getHostName());
    }
  }

  @Unmarshal
  public static @Nullable UriHost from(String value) {
    return UriHost.parse(value).getOr(null);
  }

  public static Parse<UriHost> parse(Input input) {
    return ParseUriHost.parse(input);
  }

  public static Parse<UriHost> parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, Parse<UriHost>> cache = UriHost.cache();
    Parse<UriHost> parseHost = cache.get(part);
    if (parseHost == null) {
      final StringInput input = new StringInput(part);
      parseHost = UriHost.parse(input).complete(input);
      if (parseHost.isDone()) {
        parseHost = cache.put(part, parseHost);
      }
    }
    return parseHost;
  }

  static final ThreadLocal<CacheMap<String, Parse<UriHost>>> CACHE =
      new ThreadLocal<CacheMap<String, Parse<UriHost>>>();

  static CacheMap<String, Parse<UriHost>> cache() {
    CacheMap<String, Parse<UriHost>> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.host.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 64;
      }
      cache = new LruCacheMap<String, Parse<UriHost>>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}

final class UriHostName extends UriHost {

  final String address;

  UriHostName(String address) {
    this.address = address;
  }

  @Override
  public String address() {
    return this.address;
  }

  @Override
  public String name() {
    return this.address;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriHost", "name")
            .appendArgument(this.address)
            .endInvoke();
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    final String address = this.address;
    for (int i = 0, n = address.length(); i < n; i = address.offsetByCodePoints(i, 1)) {
      final int c = address.codePointAt(i);
      if (Uri.isHostChar(c)) {
        output.append((char) c);
      } else {
        Uri.writeEncoded(output, c);
      }
    }
  }

  @Override
  public String toString() {
    return WriteString.toString(this);
  }

}

final class UriHostIPv4 extends UriHost {

  final String address;

  UriHostIPv4(String address) {
    this.address = address;
  }

  @Override
  public String address() {
    return this.address;
  }

  @Override
  public String ipv4() {
    return this.address;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriHost", "ipv4")
            .appendArgument(this.address)
            .endInvoke();
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    final String address = this.address;
    for (int i = 0, n = address.length(); i < n; i = address.offsetByCodePoints(i, 1)) {
      final int c = address.codePointAt(i);
      if (Uri.isHostChar(c)) {
        output.append((char) c);
      } else {
        Uri.writeEncoded(output, c);
      }
    }
  }

  @Override
  public String toString() {
    return WriteString.toString(this);
  }

}

final class UriHostIPv6 extends UriHost {

  final String address;

  UriHostIPv6(String address) {
    this.address = address;
  }

  @Override
  public String address() {
    return this.address;
  }

  @Override
  public String ipv6() {
    return this.address;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriHost", "ipv6")
            .appendArgument(this.address)
            .endInvoke();
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    output.append('[');
    final String address = this.address;
    for (int i = 0, n = address.length(); i < n; i = address.offsetByCodePoints(i, 1)) {
      final int c = address.codePointAt(i);
      if (Uri.isHostChar(c) || c == ':') {
        output.append((char) c);
      } else {
        Uri.writeEncoded(output, c);
      }
    }
    output.append(']');
  }

  @Override
  public String toString() {
    return WriteString.toString(this);
  }

}

final class UriHostUndefined extends UriHost {

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public String address() {
    return "";
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriHost", "undefined").endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    // blank
  }

  @Override
  public String toString() {
    return "";
  }

}

final class ParseUriHost extends Parse<UriHost> {

  @Override
  public Parse<UriHost> consume(Input input) {
    return ParseUriHost.parse(input);
  }

  static Parse<UriHost> parse(Input input) {
    if (input.isCont()) {
      if (input.head() == '[') {
        return ParseUriHostLiteral.parse(input, null, 1);
      } else {
        return ParseUriHostAddress.parse(input, null, 0, 0, 1);
      }
    } else if (input.isDone()) {
      return Parse.done(UriHost.name(""));
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriHost();
  }

}

final class ParseUriHostAddress extends Parse<UriHost> {

  final @Nullable Utf8DecodedOutput<String> output;
  final int c1;
  final int x;
  final int step;

  ParseUriHostAddress(@Nullable Utf8DecodedOutput<String> output,
                      int c1, int x, int step) {
    this.output = output;
    this.c1 = c1;
    this.x = x;
    this.step = step;
  }

  @Override
  public Parse<UriHost> consume(Input input) {
    return ParseUriHostAddress.parse(input, this.output, this.c1, this.x, this.step);
  }

  static Parse<UriHost> parse(Input input, @Nullable Utf8DecodedOutput<String> output,
                              int c1, int x, int step) {
    int c = 0;
    if (input.isReady() && output == null) {
      output = new Utf8DecodedOutput<String>(new StringOutput());
    }
    if (step == 1) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        x = Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
        step = 2;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 2) {
      while (input.isCont() && Base10.isDigit(c = input.head()) && x <= 255) {
        x = 10 * x + Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
      }
      if (input.isCont() && c == '.' && x <= 255) {
        Assume.nonNull(output).write(c);
        input.step();
        step = 3;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 3) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        x = Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
        step = 4;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 4) {
      while (input.isCont() && Base10.isDigit(c = input.head()) && x <= 255) {
        x = 10 * x + Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
      }
      if (input.isCont() && c == '.' && x <= 255) {
        Assume.nonNull(output).write(c);
        input.step();
        step = 5;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 5) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        x = Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
        step = 6;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 6) {
      while (input.isCont() && Base10.isDigit(c = input.head()) && x <= 255) {
        x = 10 * x + Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
      }
      if (input.isCont() && c == '.' && x <= 255) {
        Assume.nonNull(output).write(c);
        input.step();
        step = 7;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 7) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        x = Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
        step = 8;
      } else if (input.isReady()) {
        step = 9;
      }
    }
    if (step == 8) {
      while (input.isCont() && Base10.isDigit(c = input.head()) && x <= 255) {
        x = 10 * x + Base10.decodeDigit(c);
        Assume.nonNull(output).write(c);
        input.step();
      }
      if (input.isCont() && (Uri.isHostChar(c) || c != '%' || c > 255)) {
        step = 9;
      } else if (input.isReady()) {
        try {
          return Parse.done(UriHost.ipv4(Assume.nonNull(output).get()));
        } catch (OutputException cause) {
          return Parse.diagnostic(input, cause);
        }
      }
    }
    do {
      if (step == 9) {
        while (input.isCont() && Uri.isHostChar(c = input.head())) {
          Assume.nonNull(output).write(Character.toLowerCase(c));
          input.step();
        }
        if (input.isCont() && c == '%') {
          input.step();
          step = 10;
        } else if (input.isReady()) {
          try {
            return Parse.done(UriHost.name(Assume.nonNull(output).get()));
          } catch (OutputException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 10) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          c1 = c;
          input.step();
          step = 11;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 11) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          Assume.nonNull(output).write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          input.step();
          step = 9;
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
    return new ParseUriHostAddress(output, c1, x, step);
  }

}

final class ParseUriHostLiteral extends Parse<UriHost> {

  final @Nullable StringBuilder builder;
  final int step;

  ParseUriHostLiteral(@Nullable StringBuilder builder, int step) {
    this.builder = builder;
    this.step = step;
  }

  @Override
  public Parse<UriHost> consume(Input input) {
    return ParseUriHostLiteral.parse(input, this.builder, this.step);
  }

  static Parse<UriHost> parse(Input input, @Nullable StringBuilder builder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '[') {
        if (builder == null) {
          builder = new StringBuilder();
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('[', input));
      }
    }
    if (step == 2) {
      while (input.isCont() && ((c = input.head()) == ':' || Uri.isHostChar(c))) {
        Assume.nonNull(builder).appendCodePoint(Character.toLowerCase(c));
        input.step();
      }
      if (input.isCont() && c == ']') {
        input.step();
        return Parse.done(UriHost.ipv6(Assume.nonNull(builder).toString()));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected(']', input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriHostLiteral(builder, step);
  }

}
