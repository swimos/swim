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
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class UriAuthority extends UriPart implements Comparable<UriAuthority>, ToSource, ToString {

  final UriUser user;

  final UriHost host;

  final UriPort port;

  transient @Nullable String string;

  UriAuthority(UriUser user, UriHost host, UriPort port) {
    this.user = user;
    this.host = host;
    this.port = port;
  }

  public boolean isDefined() {
    return this.user.isDefined() || this.host.isDefined() || this.port.isDefined();
  }

  public UriUser user() {
    return this.user;
  }

  @SuppressWarnings("ReferenceEquality")
  public UriAuthority withUser(UriUser user) {
    if (user != this.user) {
      return UriAuthority.of(user, this.host, this.port);
    } else {
      return this;
    }
  }

  public String userPart() {
    return this.user.toString();
  }

  public UriAuthority withUserPart(String userPart) {
    return this.withUser(UriUser.parse(userPart));
  }

  public UriAuthority withUserNamePass(@Nullable String userName,
                                       @Nullable String userPass) {
    return this.withUser(UriUser.namePass(userName, userPass));
  }

  public @Nullable String userName() {
    return this.user.name();
  }

  public UriAuthority withUserName(@Nullable String userName) {
    return this.withUser(this.user.withName(userName));
  }

  public @Nullable String userPass() {
    return this.user.pass();
  }

  public UriAuthority withUserPass(@Nullable String userPass) {
    return this.withUser(this.user.withPass(userPass));
  }

  public UriHost host() {
    return this.host;
  }

  @SuppressWarnings("ReferenceEquality")
  public UriAuthority withHost(UriHost host) {
    if (host != this.host) {
      return UriAuthority.of(this.user, host, this.port);
    } else {
      return this;
    }
  }

  public String hostPart() {
    return this.host.toString();
  }

  public UriAuthority withHostPart(String hostPart) {
    return this.withHost(UriHost.parse(hostPart));
  }

  public String hostAddress() {
    return this.host.address();
  }

  public @Nullable String hostName() {
    return this.host.name();
  }

  public UriAuthority withHostName(@Nullable String hostName) {
    return this.withHost(UriHost.name(hostName));
  }

  public @Nullable String hostIPv4() {
    return this.host.ipv4();
  }

  public UriAuthority withHostIPv4(@Nullable String hostIPv4) {
    return this.withHost(UriHost.ipv4(hostIPv4));
  }

  public @Nullable String hostIPv6() {
    return this.host.ipv6();
  }

  public UriAuthority withHostIPv6(@Nullable String hostIPv6) {
    return this.withHost(UriHost.ipv6(hostIPv6));
  }

  public UriPort port() {
    return this.port;
  }

  @SuppressWarnings("ReferenceEquality")
  public UriAuthority withPort(UriPort port) {
    if (port != this.port) {
      return UriAuthority.of(this.user, this.host, port);
    } else {
      return this;
    }
  }

  public String portPart() {
    return this.port.toString();
  }

  public UriAuthority withPortPart(String portPart) {
    return this.withPort(UriPort.parse(portPart));
  }

  public int portNumber() {
    return this.port.number();
  }

  public UriAuthority withPortNumber(int portNumber) {
    return this.withPort(UriPort.number(portNumber));
  }

  @Override
  public int compareTo(UriAuthority that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriAuthority) {
      final UriAuthority that = (UriAuthority) other;
      return this.toString().equals(that.toString());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.seed(this.toString());
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.user.isDefined()) {
      notation.beginInvoke("UriAuthority", "of")
              .appendArgument(this.user)
              .appendArgument(this.host)
              .appendArgument(this.port)
              .endInvoke();
    } else if (this.host.isDefined()) {
      if (this.host.name() != null) {
        notation.beginInvoke("UriAuthority", "hostName")
                .appendArgument(this.host.name())
                .endInvoke();
      } else if (this.host.ipv4() != null) {
        notation.beginInvoke("UriAuthority", "hostIPv4")
                .appendArgument(this.host.ipv4())
                .endInvoke();
      } else if (this.host.ipv6() != null) {
        notation.beginInvoke("UriAuthority", "hostIPv6")
                .appendArgument(this.host.ipv6())
                .endInvoke();
      } else {
        notation.beginInvoke("UriAuthority", "host")
                .appendArgument(this.host)
                .endInvoke();
      }
      if (this.port.isDefined()) {
        notation.beginInvoke("withPortNumber")
                .appendArgument(this.portNumber())
                .endInvoke();
      }
    } else if (this.port.isDefined()) {
      notation.beginInvoke("UriAuthority", "portNumber")
              .appendArgument(this.portNumber())
              .endInvoke();
    } else {
      notation.beginInvoke("UriAuthority", "undefined").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.string != null) {
      output.append(this.string);
    } else {
      if (this.user.isDefined()) {
        this.user.writeString(output);
        output.append('@');
      }
      this.host.writeString(output);
      if (this.port.isDefined()) {
        output.append(':');
        this.port.writeString(output);
      }
    }
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = this.toString(null);
    }
    return this.string;
  }

  private static final UriAuthority UNDEFINED = new UriAuthority(UriUser.undefined(),
                                                                 UriHost.undefined(),
                                                                 UriPort.undefined());

  public static UriAuthority undefined() {
    return UNDEFINED;
  }

  public static UriAuthority of(@Nullable UriUser user,
                                @Nullable UriHost host,
                                @Nullable UriPort port) {
    if (user == null) {
      user = UriUser.undefined();
    }
    if (host == null) {
      host = UriHost.undefined();
    }
    if (port == null) {
      port = UriPort.undefined();
    }
    if (user.isDefined() || host.isDefined() || port.isDefined()) {
      return new UriAuthority(user, host, port);
    } else {
      return UriAuthority.undefined();
    }
  }

  public static UriAuthority user(@Nullable UriUser user) {
    return UriAuthority.of(user, null, null);
  }

  public static UriAuthority userNamePass(@Nullable String userName,
                                          @Nullable String userPass) {
    return UriAuthority.user(UriUser.namePass(userName, userPass));
  }

  public static UriAuthority userName(@Nullable String userName) {
    return UriAuthority.user(UriUser.name(userName));
  }

  public static UriAuthority host(@Nullable UriHost host) {
    return UriAuthority.of(null, host, null);
  }

  public static UriAuthority hostName(@Nullable String hostName) {
    return UriAuthority.host(UriHost.name(hostName));
  }

  public static UriAuthority hostIPv4(@Nullable String hostIPv4) {
    return UriAuthority.host(UriHost.ipv4(hostIPv4));
  }

  public static UriAuthority hostIPv6(@Nullable String hostIPv6) {
    return UriAuthority.host(UriHost.ipv6(hostIPv6));
  }

  public static UriAuthority port(@Nullable UriPort port) {
    return UriAuthority.of(null, null, port);
  }

  public static UriAuthority portNumber(int portNumber) {
    return UriAuthority.port(UriPort.number(portNumber));
  }

  public static UriAuthority parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriAuthority> cache = UriAuthority.cache();
    UriAuthority authority = cache.get(part);
    if (authority == null) {
      final Input input = new StringInput(part);
      authority = UriAuthority.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      if (!authority.user.isDefined()) { // don't cache user info
        authority = cache.put(part, authority);
      }
    }
    return authority;
  }

  public static UriAuthority parse(Input input) {
    UriUser user = null;
    final UriHost host;
    UriPort port = null;
    int c = 0;
    if (input.isCont()) {
      final Input lookahead = input.clone();
      while (lookahead.isCont()) {
        c = lookahead.head();
        if (c != '@' && c != '/') {
          lookahead.step();
        } else {
          break;
        }
      }
      if (lookahead.isCont() && c == '@') {
        user = UriUser.parse(input);
        if (input.isCont() && input.head() == '@') {
          input.step();
        } else if (input.isReady()) {
          throw new ParseException(Diagnostic.expected('@', input));
        }
      }
    }
    host = UriHost.parse(input);
    if (input.isCont() && input.head() == ':') {
      input.step();
      port = UriPort.parse(input);
    }
    if (input.isReady()) {
      return UriAuthority.of(user, host, port);
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriAuthority fromJsonString(String value) {
    return UriAuthority.parse(value);
  }

  public static String toJsonString(UriAuthority authority) {
    return authority.toString();
  }

  public static UriAuthority fromWamlString(String value) {
    return UriAuthority.parse(value);
  }

  public static String toWamlString(UriAuthority authority) {
    return authority.toString();
  }

  private static final ThreadLocal<CacheMap<String, UriAuthority>> CACHE = new ThreadLocal<CacheMap<String, UriAuthority>>();

  private static CacheMap<String, UriAuthority> cache() {
    CacheMap<String, UriAuthority> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.authority.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 128;
      }
      cache = new LruCacheMap<String, UriAuthority>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}
