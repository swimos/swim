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
public abstract class UriHost implements Comparable<UriHost>, ToSource, ToString {

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

  @Override
  public abstract String toString();

  private static final UriHost UNDEFINED = new UriHostUndefined();

  public static UriHost undefined() {
    return UNDEFINED;
  }

  public static UriHost name(@Nullable String address) {
    if (address != null) {
      return new UriHostName(address);
    } else {
      return UriHost.undefined();
    }
  }

  public static UriHost ipv4(@Nullable String address) {
    if (address != null) {
      return new UriHostIPv4(address);
    } else {
      return UriHost.undefined();
    }
  }

  public static UriHost ipv6(@Nullable String address) {
    if (address != null) {
      return new UriHostIPv6(address);
    } else {
      return UriHost.undefined();
    }
  }

  public static UriHost inetAddress(@Nullable InetAddress address) {
    if (address instanceof Inet4Address) {
      return UriHost.ipv4(address.getHostAddress());
    } else if (address instanceof Inet6Address) {
      return UriHost.ipv6(address.getHostAddress());
    } else if (address != null) {
      return UriHost.name(address.getHostName());
    } else {
      return UriHost.undefined();
    }
  }

  public static UriHost parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriHost> cache = UriHost.cache();
    UriHost host = cache.get(part);
    if (host == null) {
      final Input input = new StringInput(part);
      host = UriHost.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      host = cache.put(part, host);
    }
    return host;
  }

  public static UriHost parse(Input input) {
    if (input.isCont()) {
      if (input.head() == '[') {
        return UriHost.parseHostLiteral(input);
      } else {
        return UriHost.parseHostAddress(input);
      }
    } else if (input.isDone()) {
      return UriHost.name("");
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  private static UriHost parseHostAddress(Input input) {
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    int x = 0;
    int i = 1;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input.step();
          output.write(c);
          x = 10 * x + Base10.decodeDigit(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '.' && i < 4 && x <= 255) {
          input.step();
          output.write(c);
          x = 0;
          i += 1;
          continue;
        } else if (!Uri.isHostChar(c) && c != '%' && i == 4 && x <= 255) {
          return UriHost.ipv4(output.get());
        }
      } else if (input.isReady()) {
        if (i == 4 && x <= 255) {
          return UriHost.ipv4(output.get());
        } else {
          return UriHost.name(output.get());
        }
      }
      break;
    } while (i <= 4);
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isHostChar(c)) {
          input.step();
          output.write(Character.toLowerCase(c));
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return UriHost.name(output.get());
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

  private static UriHost parseHostLiteral(Input input) {
    final StringBuilder builder = new StringBuilder();
    int c = 0;
    if (input.isCont() && input.head() == '[') {
      input.step();
    } else if (input.isDone() || input.isError()) {
      throw new ParseException(Diagnostic.expected('[', input));
    }
    while (input.isCont()) {
      c = input.head();
      if (Uri.isHostChar(c) || c == ':') {
        input.step();
        builder.appendCodePoint(Character.toLowerCase(c));
      } else {
        break;
      }
    }
    if (input.isCont() && c == ']') {
      input.step();
      return UriHost.ipv6(builder.toString());
    } else if (input.isReady()) {
      throw new ParseException(Diagnostic.expected(']', input));
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriHost fromJsonString(String value) {
    return UriHost.parse(value);
  }

  public static String toJsonString(UriHost host) {
    return host.toString();
  }

  public static UriHost fromWamlString(String value) {
    return UriHost.parse(value);
  }

  public static String toWamlString(UriHost host) {
    return host.toString();
  }

  private static final ThreadLocal<CacheMap<String, UriHost>> CACHE = new ThreadLocal<CacheMap<String, UriHost>>();

  private static CacheMap<String, UriHost> cache() {
    CacheMap<String, UriHost> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.host.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 64;
      }
      cache = new LruCacheMap<String, UriHost>(cacheSize);
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
    return this.toString(null);
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
    return this.toString(null);
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
    return this.toString(null);
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
