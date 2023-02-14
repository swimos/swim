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
import java.util.Collection;
import java.util.Map;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
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
public final class Uri implements Comparable<Uri>, ToSource, ToString {

  final UriScheme scheme;

  final UriAuthority authority;

  final UriPath path;

  final UriQuery query;

  final UriFragment fragment;

  transient @Nullable String string;

  Uri(UriScheme scheme, UriAuthority authority, UriPath path,
      UriQuery query, UriFragment fragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }

  public boolean isDefined() {
    return this.scheme.isDefined() || this.authority.isDefined() || this.path.isDefined()
        || this.query.isDefined() || this.fragment.isDefined();
  }

  public boolean isEmpty() {
    return !this.scheme.isDefined() && !this.authority.isDefined() && this.path.isEmpty()
        && !this.query.isDefined() && !this.fragment.isDefined();
  }

  public UriScheme scheme() {
    return this.scheme;
  }

  @SuppressWarnings("ReferenceEquality")
  public Uri withScheme(UriScheme scheme) {
    if (scheme != this.scheme) {
      return Uri.of(scheme, this.authority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public String schemePart() {
    return this.scheme.toString();
  }

  public Uri withSchemePart(String schemePart) {
    return this.withScheme(UriScheme.parse(schemePart));
  }

  public @Nullable String schemeName() {
    return this.scheme.name();
  }

  public Uri withSchemeName(@Nullable String schemeName) {
    return this.withScheme(UriScheme.name(schemeName));
  }

  public UriAuthority authority() {
    return this.authority;
  }

  @SuppressWarnings("ReferenceEquality")
  public Uri withAuthority(UriAuthority authority) {
    if (authority != this.authority) {
      return Uri.of(this.scheme, authority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public String authorityPart() {
    return this.authority.toString();
  }

  public Uri withAuthorityPart(String authorityPart) {
    return this.withAuthority(UriAuthority.parse(authorityPart));
  }

  public UriUser user() {
    return this.authority.user();
  }

  public Uri withUser(UriUser user) {
    return this.withAuthority(this.authority.withUser(user));
  }

  public String userPart() {
    return this.authority.userPart();
  }

  public Uri withUserPart(String userPart) {
    return this.withAuthority(this.authority.withUserPart(userPart));
  }

  public Uri withUserNamePass(@Nullable String userName,
                              @Nullable String userPass) {
    return this.withAuthority(this.authority.withUserNamePass(userName, userPass));
  }

  public @Nullable String userName() {
    return this.authority.userName();
  }

  public Uri withUserName(@Nullable String userName) {
    return this.withAuthority(this.authority.withUserName(userName));
  }

  public @Nullable String userPass() {
    return this.authority.userPass();
  }

  public Uri withUserPass(@Nullable String userPass) {
    return this.withAuthority(this.authority.withUserPass(userPass));
  }

  public UriHost host() {
    return this.authority.host();
  }

  public Uri withHost(UriHost host) {
    return this.withAuthority(this.authority.withHost(host));
  }

  public String hostPart() {
    return this.authority.hostPart();
  }

  public Uri withHostPart(String hostPart) {
    return this.withAuthority(this.authority.withHostPart(hostPart));
  }

  public String hostAddress() {
    return this.authority.hostAddress();
  }

  public @Nullable String hostName() {
    return this.authority.hostName();
  }

  public Uri withHostName(@Nullable String hostName) {
    return this.withAuthority(this.authority.withHostName(hostName));
  }

  public @Nullable String hostIPv4() {
    return this.authority.hostIPv4();
  }

  public Uri withHostIPv4(@Nullable String hostIPv4) {
    return this.withAuthority(this.authority.withHostIPv4(hostIPv4));
  }

  public @Nullable String hostIPv6() {
    return this.authority.hostIPv6();
  }

  public Uri withHostIPv6(@Nullable String hostIPv6) {
    return this.withAuthority(this.authority.withHostIPv6(hostIPv6));
  }

  public UriPort port() {
    return this.authority.port();
  }

  public Uri withPort(UriPort port) {
    return this.withAuthority(this.authority.withPort(port));
  }

  public String portPart() {
    return this.authority.portPart();
  }

  public Uri withPortPart(String portPart) {
    return this.withAuthority(this.authority.withPortPart(portPart));
  }

  public int portNumber() {
    return this.authority.portNumber();
  }

  public Uri withPortNumber(int number) {
    return this.withAuthority(this.authority.withPortNumber(number));
  }

  public UriPath path() {
    return this.path;
  }

  @SuppressWarnings("ReferenceEquality")
  public Uri withPath(UriPath path) {
    if (path != this.path) {
      return Uri.of(this.scheme, this.authority, path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public Uri withPath(String... components) {
    return this.withPath(UriPath.of(components));
  }

  public String pathPart() {
    return this.path.toString();
  }

  public Uri withPathPart(String pathPart) {
    return this.withPath(UriPath.parse(pathPart));
  }

  public String pathName() {
    return this.path.name();
  }

  public Uri withPathName(String pathName) {
    return this.withPath(this.path.withName(pathName));
  }

  public UriPath parentPath() {
    return this.path.parent();
  }

  public UriPath basePath() {
    return this.path.base();
  }

  public UriPath bodyPath() {
    return this.path.body();
  }

  public Uri appendedPath(String component) {
    return this.withPath(this.path.appended(component));
  }

  public Uri appendedPath(String... components) {
    return this.withPath(this.path.appended(components));
  }

  public Uri appendedPath(Collection<? extends String> components) {
    return this.withPath(this.path.appendedAll(components));
  }

  public Uri appendedSlash() {
    return this.withPath(this.path.appendedSlash());
  }

  public Uri appendedSegment(String segment) {
    return this.withPath(this.path.appendedSegment(segment));
  }

  public Uri prependedPath(String component) {
    return this.withPath(this.path.prepended(component));
  }

  public Uri prependedPath(String... components) {
    return this.withPath(this.path.prepended(components));
  }

  public Uri prependedPath(Collection<? extends String> components) {
    return this.withPath(this.path.prependedAll(components));
  }

  public Uri prependedSlash() {
    return this.withPath(this.path.prependedSlash());
  }

  public Uri prependedSegment(String segment) {
    return this.withPath(this.path.prependedSegment(segment));
  }

  public UriQuery query() {
    return this.query;
  }

  @SuppressWarnings("ReferenceEquality")
  public Uri withQuery(UriQuery query) {
    if (query != this.query) {
      return Uri.of(this.scheme, this.authority, this.path, query, this.fragment);
    } else {
      return this;
    }
  }

  public Uri withQuery(@Nullable String... keyValuePairs) {
    return this.withQuery(UriQuery.of(keyValuePairs));
  }

  public String queryPart() {
    return this.query.toString();
  }

  public Uri withQueryPart(String queryPart) {
    return this.withQuery(UriQuery.parse(queryPart));
  }

  public Uri updatedQuery(@Nullable String key, String value) {
    return this.withQuery(this.query.updated(key, value));
  }

  public Uri removedQuery(String key) {
    return this.withQuery(this.query.removed(key));
  }

  public Uri appendedQuery(String value) {
    return this.withQuery(this.query.appended(value));
  }

  public Uri appendedQuery(@Nullable String key, String value) {
    return this.withQuery(this.query.appended(key, value));
  }

  public Uri appendedQuery(@Nullable String... keyValuePairs) {
    return this.withQuery(this.query.appended(keyValuePairs));
  }

  public Uri appendedQuery(Map<? extends String, ? extends String> params) {
    return this.withQuery(this.query.appendedAll(params));
  }

  public Uri prependedQuery(String value) {
    return this.withQuery(this.query.prepended(value));
  }

  public Uri prependedQuery(@Nullable String key, String value) {
    return this.withQuery(this.query.prepended(key, value));
  }

  public Uri prependedQuery(@Nullable String... keyValuePairs) {
    return this.withQuery(this.query.prepended(keyValuePairs));
  }

  public Uri prependedQuery(Map<? extends String, ? extends String> params) {
    return this.withQuery(this.query.prependedAll(params));
  }

  public UriFragment fragment() {
    return this.fragment;
  }

  @SuppressWarnings("ReferenceEquality")
  public Uri withFragment(UriFragment fragment) {
    if (fragment != this.fragment) {
      return Uri.of(this.scheme, this.authority, this.path, this.query, fragment);
    } else {
      return this;
    }
  }

  public String fragmentPart() {
    return this.fragment.toString();
  }

  public Uri withFragmentPart(String fragmentPart) {
    return this.withFragment(UriFragment.parse(fragmentPart));
  }

  public @Nullable String fragmentIdentifier() {
    return this.fragment.identifier();
  }

  public Uri withFragmentIdentifier(@Nullable String identifier) {
    return this.withFragment(UriFragment.identifier(identifier));
  }

  public Uri endpoint() {
    if (this.path.isDefined() || this.query.isDefined() || this.fragment.isDefined()) {
      return Uri.of(this.scheme, this.authority, null, null, null);
    } else {
      return this;
    }
  }

  public Uri parent() {
    return Uri.of(this.scheme, this.authority, this.path.parent(), null, null);
  }

  public Uri base() {
    return Uri.of(this.scheme, this.authority, this.path.base(), null, null);
  }

  public Uri body() {
    return Uri.of(this.scheme, this.authority, this.path.body(), null, null);
  }

  public boolean isRelativeTo(Uri absolute) {
    return this.scheme.equals(absolute.scheme) && this.authority.equals(absolute.authority)
        && this.path.isRelativeTo(absolute.path);
  }

  public boolean isChildOf(Uri absolute) {
    return this.scheme.equals(absolute.scheme) && this.authority.equals(absolute.authority)
        && this.path.isChildOf(absolute.path);
  }

  public Uri resolve(Uri relative) {
    if (relative.scheme.isDefined()) {
      return Uri.of(relative.scheme,
                    relative.authority,
                    relative.path.removeDotSegments(),
                    relative.query,
                    relative.fragment);
    } else if (relative.authority.isDefined()) {
      return Uri.of(this.scheme,
                    relative.authority,
                    relative.path.removeDotSegments(),
                    relative.query,
                    relative.fragment);
    } else if (relative.path.isEmpty()) {
      return Uri.of(this.scheme,
                    this.authority,
                    this.path,
                    relative.query.isDefined() ? relative.query : this.query,
                    relative.fragment);
    } else if (relative.path.isAbsolute()) {
      return Uri.of(this.scheme,
                    this.authority,
                    relative.path.removeDotSegments(),
                    relative.query,
                    relative.fragment);
    } else {
      return Uri.of(this.scheme,
                    this.authority,
                    this.merge(relative.path).removeDotSegments(),
                    relative.query,
                    relative.fragment);
    }
  }

  UriPath merge(UriPath relative) {
    if (this.authority.isDefined() && this.path.isEmpty()) {
      return relative.prependedSlash();
    } else if (this.path.isEmpty()) {
      return relative;
    } else {
      return this.path.merge(relative);
    }
  }

  public Uri unresolve(Uri absolute) {
    if (!this.scheme.equals(absolute.scheme) || !this.authority.equals(absolute.authority)) {
      return absolute;
    } else {
      return Uri.of(UriScheme.undefined(),
                    UriAuthority.undefined(),
                    this.path.unmerge(absolute.path),
                    absolute.query,
                    absolute.fragment);
    }
  }

  @Override
  public int compareTo(Uri that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Uri) {
      final Uri that = (Uri) other;
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
    if (this.scheme.isDefined()) {
      notation.beginInvoke("Uri", "of")
              .appendArgument(this.scheme)
              .appendArgument(this.authority)
              .appendArgument(this.path)
              .appendArgument(this.query)
              .appendArgument(this.fragment)
              .endInvoke();
    } else if (this.authority.isDefined()) {
      notation.beginInvoke("Uri", "authority")
              .appendArgument(this.authority)
              .endInvoke();
      if (this.path.isDefined()) {
        notation.beginInvoke("withPath");
        this.path.writeArguments(notation);
        notation.endInvoke();
      }
      if (this.query.isDefined()) {
        notation.beginInvoke("withQuery");
        this.query.writeArguments(notation);
        notation.endInvoke();
      }
      if (this.fragment.isDefined()) {
        notation.beginInvoke("withFragmentIdentifier")
                .appendArgument(this.fragment.identifier())
                .endInvoke();
      }
    } else if (this.path.isDefined()) {
      notation.beginInvoke("Uri", "path");
      this.path.writeArguments(notation);
      notation.endInvoke();
      if (this.query.isDefined()) {
        notation.beginInvoke("withQuery");
        this.query.writeArguments(notation);
        notation.endInvoke();
      }
      if (this.fragment.isDefined()) {
        notation.beginInvoke("withFragmentIdentifier")
                .appendArgument(this.fragment.identifier())
                .endInvoke();
      }
    } else if (this.query.isDefined()) {
      notation.beginInvoke("Uri", "query");
      this.query.writeArguments(notation);
      notation.endInvoke();
      if (this.fragment.isDefined()) {
        notation.beginInvoke("withFragmentIdentifier")
                .appendArgument(this.fragment.identifier())
                .endInvoke();
      }
    } else if (this.fragment.isDefined()) {
      notation.beginInvoke("Uri", "fragmentIdentifier")
              .appendArgument(this.fragment.identifier())
              .endInvoke();
    } else {
      notation.beginInvoke("Uri", "empty").endInvoke();
    }
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.string != null) {
      output.append(this.string);
    } else {
      if (this.scheme.isDefined()) {
        this.scheme.writeString(output);
        output.append(':');
      }
      if (this.authority.isDefined()) {
        output.append('/').append('/');
        this.authority.writeString(output);
      }
      this.path.writeString(output);
      if (this.query.isDefined()) {
        output.append('?');
        this.query.writeString(output);
      }
      if (this.fragment.isDefined()) {
        output.append('#');
        this.fragment.writeString(output);
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

  private static final Uri EMPTY = new Uri(UriScheme.undefined(),
                                           UriAuthority.undefined(),
                                           UriPath.empty(),
                                           UriQuery.undefined(),
                                           UriFragment.undefined());

  public static Uri empty() {
    return EMPTY;
  }

  public static Uri of(@Nullable UriScheme scheme,
                       @Nullable UriAuthority authority,
                       @Nullable UriPath path,
                       @Nullable UriQuery query,
                       @Nullable UriFragment fragment) {
    if (scheme == null) {
      scheme = UriScheme.undefined();
    }
    if (authority == null) {
      authority = UriAuthority.undefined();
    }
    if (path == null) {
      path = UriPath.empty();
    }
    if (query == null) {
      query = UriQuery.undefined();
    }
    if (fragment == null) {
      fragment = UriFragment.undefined();
    }
    if (scheme.isDefined() || authority.isDefined() || path.isDefined()
        || query.isDefined() || fragment.isDefined()) {
      return new Uri(scheme, authority, path, query, fragment);
    } else {
      return Uri.empty();
    }
  }

  public static Uri scheme(@Nullable UriScheme scheme) {
    return Uri.of(scheme, null, null, null, null);
  }

  public static Uri schemeName(@Nullable String schemeName) {
    return Uri.scheme(UriScheme.name(schemeName));
  }

  public static Uri authority(@Nullable UriAuthority authority) {
    return Uri.of(null, authority, null, null, null);
  }

  public static Uri user(@Nullable UriUser user) {
    return Uri.authority(UriAuthority.user(user));
  }

  public static Uri userNamePass(@Nullable String userName,
                                 @Nullable String userPass) {
    return Uri.authority(UriAuthority.userNamePass(userName, userPass));
  }

  public static Uri userName(@Nullable String userName) {
    return Uri.authority(UriAuthority.userName(userName));
  }

  public static Uri host(@Nullable UriHost host) {
    return Uri.authority(UriAuthority.host(host));
  }

  public static Uri hostName(@Nullable String hostName) {
    return Uri.authority(UriAuthority.hostName(hostName));
  }

  public static Uri hostIPv4(@Nullable String hostIPv4) {
    return Uri.authority(UriAuthority.hostIPv4(hostIPv4));
  }

  public static Uri hostIPv6(@Nullable String hostIPv6) {
    return Uri.authority(UriAuthority.hostIPv6(hostIPv6));
  }

  public static Uri port(@Nullable UriPort port) {
    return Uri.authority(UriAuthority.port(port));
  }

  public static Uri portNumber(int portNumber) {
    return Uri.authority(UriAuthority.portNumber(portNumber));
  }

  public static Uri path(@Nullable UriPath path,
                         @Nullable UriQuery query,
                         @Nullable UriFragment fragment) {
    return Uri.of(null, null, path, query, fragment);
  }

  public static Uri path(@Nullable UriPath path,
                         @Nullable UriQuery query) {
    return Uri.of(null, null, path, query, null);
  }

  public static Uri path(@Nullable UriPath path,
                         @Nullable UriFragment fragment) {
    return Uri.of(null, null, path, null, fragment);
  }

  public static Uri path(@Nullable UriPath path) {
    return Uri.of(null, null, path, null, null);
  }

  public static Uri path(String... components) {
    return Uri.of(null, null, UriPath.of(components), null, null);
  }

  public static Uri query(@Nullable UriQuery query) {
    return Uri.of(null, null, null, query, null);
  }

  public static Uri query(@Nullable String... keyValuePairs) {
    return Uri.of(null, null, null, UriQuery.of(keyValuePairs), null);
  }

  public static Uri fragment(@Nullable UriFragment fragment) {
    return Uri.of(null, null, null, null, fragment);
  }

  public static Uri fragmentIdentifier(@Nullable String identifier) {
    return Uri.of(null, null, null, null, UriFragment.identifier(identifier));
  }

  public static Uri parse(String string) {
    Objects.requireNonNull(string);
    final CacheMap<String, Uri> cache = Uri.cache();
    Uri uri = cache.get(string);
    if (uri == null) {
      final Input input = new StringInput(string);
      uri = Uri.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      if (!uri.authority.user.isDefined()) { // don't cache user info
        uri = cache.put(string, uri);
      }
    }
    return uri;
  }

  public static Uri parse(Input input) {
    UriScheme scheme = null;
    UriAuthority authority = null;
    UriPath path = null;
    UriQuery query = null;
    UriFragment fragment = null;
    int c = 0;
    if (input.isCont()) {
      final Input lookahead = input.clone();
      while (lookahead.isCont()) {
        c = lookahead.head();
        if (Uri.isSchemeChar(c)) {
          lookahead.step();
        } else {
          break;
        }
      }
      if (lookahead.isCont() && c == ':') {
        scheme = UriScheme.parse(input);
        if (input.isCont() && input.head() == ':') {
          input.step();
        } else if (input.isReady()) {
          throw new ParseException(Diagnostic.expected(':', input));
        }
      }
    }
    if (input.isCont()) {
      c = input.head();
      if (c == '/') {
        input.step();
        if (input.isCont() && input.head() == '/') {
          input.step();
          authority = UriAuthority.parse(input);
          if (input.isCont()) {
            c = input.head();
            if (c != '?' && c != '#') {
              path = UriPath.parse(input, null);
            }
          }
        } else if (input.isCont()) {
          final UriPathBuilder pathBuilder = new UriPathBuilder();
          pathBuilder.addSlash();
          path = UriPath.parse(input, pathBuilder);
        } else if (input.isReady()) {
          path = UriPath.slash();
        }
      } else if (c != '?' && c != '#') {
        path = UriPath.parse(input, null);
      }
    }
    if (input.isCont() && input.head() == '?') {
      input.step();
      query = UriQuery.parse(input);
    }
    if (input.isCont() && input.head() == '#') {
      input.step();
      fragment = UriFragment.parse(input);
    }
    if (input.isReady()) {
      return Uri.of(scheme, authority, path, query, fragment);
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static Uri fromJsonString(String value) {
    return Uri.parse(value);
  }

  public static String toJsonString(Uri uri) {
    return uri.toString();
  }

  public static Uri fromWamlString(String value) {
    return Uri.parse(value);
  }

  public static String toWamlString(Uri uri) {
    return uri.toString();
  }

  private static final ThreadLocal<CacheMap<String, Uri>> CACHE = new ThreadLocal<CacheMap<String, Uri>>();

  private static CacheMap<String, Uri> cache() {
    CacheMap<String, Uri> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 1024;
      }
      cache = new LruCacheMap<String, Uri>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

  public static boolean isAlpha(int c) {
    return (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z');
  }

  public static boolean isUnreservedChar(int c) {
    return (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z')
        || (c >= '0' && c <= '9')
        || c == '-' || c == '.'
        || c == '_' || c == '~';
  }

  public static boolean isSubDelimChar(int c) {
    return c == '!' || c == '$'
        || c == '&' || c == '('
        || c == ')' || c == '*'
        || c == '+' || c == ','
        || c == ';' || c == '='
        || c == '\'';
  }

  public static boolean isSchemeChar(int c) {
    return (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z')
        || (c >= '0' && c <= '9')
        || c == '+' || c == '-'
        || c == '.';
  }

  public static boolean isUserInfoChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c) || c == ':';
  }

  public static boolean isUserChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c);
  }

  public static boolean isHostChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c);
  }

  public static boolean isPathChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c) || c == ':' || c == '@';
  }

  public static boolean isQueryChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c)
        || c == '/' || c == ':'
        || c == '?' || c == '@';
  }

  public static boolean isParamChar(int c) {
    return Uri.isUnreservedChar(c)
        || c == '!' || c == '$'
        || c == '(' || c == ')'
        || c == '*' || c == '+'
        || c == ',' || c == '/'
        || c == ':' || c == ';'
        || c == '?' || c == '@'
        || c == '\'';
  }

  public static boolean isFragmentChar(int c) {
    return Uri.isUnreservedChar(c) || Uri.isSubDelimChar(c)
        || c == '/' || c == ':'
        || c == '?' || c == '@';
  }

  static void writeEncoded(Appendable output, int c) throws IOException {
    if (c == 0x00) { // modified UTF-8
      Uri.writePctEncoded(output, 0xC0);
      Uri.writePctEncoded(output, 0x80);
    } else if (c >= 0x00 && c <= 0x7F) { // U+0000..U+007F
      Uri.writePctEncoded(output, c);
    } else if (c >= 0x80 && c <= 0x07FF) { // U+0080..U+07FF
      Uri.writePctEncoded(output, 0xC0 | (c >>> 6));
      Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else if (c >= 0x0800 && c <= 0xFFFF) { // U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
      Uri.writePctEncoded(output, 0xE0 | (c >>> 12));
      Uri.writePctEncoded(output, 0x80 | (c >>> 6 & 0x3F));
      Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      Uri.writePctEncoded(output, 0xF0 | (c >>> 18));
      Uri.writePctEncoded(output, 0x80 | (c >>> 12 & 0x3F));
      Uri.writePctEncoded(output, 0x80 | (c >>> 6 & 0x3F));
      Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else { // surrogate or invalid code point
      Uri.writePctEncoded(output, 0xEF);
      Uri.writePctEncoded(output, 0xBF);
      Uri.writePctEncoded(output, 0xBD);
    }
  }

  static void writePctEncoded(Appendable output, int c) throws IOException {
    output.append('%')
          .append(Base16.lowercase().encodeDigit(c >>> 4 & 0xF))
          .append(Base16.lowercase().encodeDigit(c & 0xF));
  }

}
