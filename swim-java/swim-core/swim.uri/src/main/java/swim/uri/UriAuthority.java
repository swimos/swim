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
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.decl.Marshal;
import swim.decl.Unmarshal;
import swim.util.Assume;
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
    if (user == this.user) {
      return this;
    }
    return UriAuthority.of(user, this.host, this.port);
  }

  public String userPart() {
    return this.user.toString();
  }

  public UriAuthority withUserPart(String userPart) {
    try {
      return this.withUser(UriUser.parse(userPart).getNonNull());
    } catch (ParseException cause) {
      throw new IllegalArgumentException(Notation.of("malformed user part: ")
                                                 .appendSource(userPart)
                                                 .toString(), cause);
    }
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
    if (host == this.host) {
      return this;
    }
    return UriAuthority.of(this.user, host, this.port);
  }

  public String hostPart() {
    return this.host.toString();
  }

  public UriAuthority withHostPart(String hostPart) {
    try {
      return this.withHost(UriHost.parse(hostPart).getNonNull());
    } catch (ParseException cause) {
      throw new IllegalArgumentException(Notation.of("malformed host part: ")
                                                 .appendSource(hostPart)
                                                 .toString(), cause);
    }
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
    if (port == this.port) {
      return this;
    }
    return UriAuthority.of(this.user, this.host, port);
  }

  public String portPart() {
    return this.port.toString();
  }

  public UriAuthority withPortPart(String portPart) {
    try {
      return this.withPort(UriPort.parse(portPart).getNonNull());
    } catch (ParseException cause) {
      throw new IllegalArgumentException(Notation.of("malformed port part: ")
                                                 .appendSource(portPart)
                                                 .toString(), cause);
    }
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
    } else if (other instanceof UriAuthority that) {
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
      return;
    }
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

  @Marshal
  @Override
  public String toString() {
    if (this.string == null) {
      this.string = this.toString(null);
    }
    return this.string;
  }

  static final UriAuthority UNDEFINED = new UriAuthority(UriUser.undefined(),
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
    if (!user.isDefined() && !host.isDefined() && !port.isDefined()) {
      return UriAuthority.undefined();
    }
    return new UriAuthority(user, host, port);
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

  @Unmarshal
  public static @Nullable UriAuthority from(String value) {
    return UriAuthority.parse(value).getOr(null);
  }

  public static Parse<UriAuthority> parse(Input input) {
    return ParseUriAuthority.parse(input, null, null, null, 1);
  }

  public static Parse<UriAuthority> parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, Parse<UriAuthority>> cache = UriAuthority.cache();
    Parse<UriAuthority> parseAuthority = cache.get(part);
    if (parseAuthority == null) {
      final StringInput input = new StringInput(part);
      parseAuthority = UriAuthority.parse(input).complete(input);
      if (parseAuthority.isDone()) {
        // Don't cache user info.
        if (!parseAuthority.getNonNullUnchecked().user.isDefined()) {
          parseAuthority = cache.put(part, parseAuthority);
        }
      }
    }
    return parseAuthority;
  }

  static final ThreadLocal<CacheMap<String, Parse<UriAuthority>>> CACHE =
      new ThreadLocal<CacheMap<String, Parse<UriAuthority>>>();

  static CacheMap<String, Parse<UriAuthority>> cache() {
    CacheMap<String, Parse<UriAuthority>> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.authority.cache.size"));
      } catch (NumberFormatException cause) {
        cacheSize = 128;
      }
      cache = new LruCacheMap<String, Parse<UriAuthority>>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}

final class ParseUriAuthority extends Parse<UriAuthority> {

  final @Nullable Parse<UriUser> parseUser;
  final @Nullable Parse<UriHost> parseHost;
  final @Nullable Parse<UriPort> parsePort;
  final int step;

  ParseUriAuthority(@Nullable Parse<UriUser> parseUser,
                    @Nullable Parse<UriHost> parseHost,
                    @Nullable Parse<UriPort> parsePort, int step) {
    this.parseUser = parseUser;
    this.parseHost = parseHost;
    this.parsePort = parsePort;
    this.step = step;
  }

  @Override
  public Parse<UriAuthority> consume(Input input) {
    return ParseUriAuthority.parse(input, this.parseUser, this.parseHost,
                                   this.parsePort, this.step);
  }

  static Parse<UriAuthority> parse(Input input, @Nullable Parse<UriUser> parseUser,
                                   @Nullable Parse<UriHost> parseHost,
                                   @Nullable Parse<UriPort> parsePort, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        final Input lookahead = input.clone();
        while (lookahead.isCont() && (c = lookahead.head()) != '@' && c != '/') {
          lookahead.step();
        }
        if (lookahead.isCont() && c == '@') {
          step = 2;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        step = 3;
      }
    }
    if (step == 2) {
      if (parseUser == null) {
        parseUser = UriUser.parse(input);
      } else {
        parseUser = parseUser.consume(input);
      }
      if (parseUser.isDone()) {
        if (input.isCont() && input.head() == '@') {
          input.step();
          step = 3;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected('@', input));
        }
      } else if (parseUser.isError()) {
        return parseUser.asError();
      }
    }
    if (step == 3) {
      if (parseHost == null) {
        parseHost = UriHost.parse(input);
      } else {
        parseHost = parseHost.consume(input);
      }
      if (parseHost.isDone()) {
        if (input.isCont() && input.head() == ':') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          return Parse.done(UriAuthority.of(parseUser != null ? parseUser.getUnchecked() : null,
                                            parseHost.getUnchecked(),
                                            null));
        }
      } else if (parseHost.isError()) {
        return parseHost.asError();
      }
    }
    if (step == 4) {
      if (parsePort == null) {
        parsePort = UriPort.parse(input);
      } else {
        parsePort = parsePort.consume(input);
      }
      if (parsePort.isDone()) {
        return Parse.done(UriAuthority.of(parseUser != null ? parseUser.getUnchecked() : null,
                                          Assume.nonNull(parseHost).getUnchecked(),
                                          parsePort.getUnchecked()));
      } else if (parsePort.isError()) {
        return parsePort.asError();
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseUriAuthority(parseUser, parseHost, parsePort, step);
  }

}
