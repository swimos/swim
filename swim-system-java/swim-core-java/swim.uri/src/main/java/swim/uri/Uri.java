// Copyright 2015-2019 SWIM.AI inc.
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

import java.util.Collection;
import java.util.Map;
import swim.codec.Base16;
import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Kind;
import swim.util.Murmur3;

public class Uri implements Comparable<Uri>, Debug, Display {
  protected final UriScheme scheme;
  protected final UriAuthority authority;
  protected final UriPath path;
  protected final UriQuery query;
  protected final UriFragment fragment;
  String string;

  protected Uri(UriScheme scheme, UriAuthority authority, UriPath path,
                UriQuery query, UriFragment fragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
  }

  public final boolean isDefined() {
    return this.scheme.isDefined() || this.authority.isDefined() || this.path.isDefined()
        || this.query.isDefined() || this.fragment.isDefined();
  }

  public final boolean isEmpty() {
    return !this.scheme.isDefined() && !this.authority.isDefined() && this.path.isEmpty()
        && !this.query.isDefined() && !this.fragment.isDefined();
  }

  public final UriScheme scheme() {
    return this.scheme;
  }

  public Uri scheme(UriScheme scheme) {
    if (scheme != this.scheme) {
      return copy(scheme, this.authority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public final String schemePart() {
    return this.scheme.toString();
  }

  public Uri schemePart(String scheme) {
    return scheme(UriScheme.parse(scheme));
  }

  public final String schemeName() {
    return this.scheme.name();
  }

  public Uri schemeName(String scheme) {
    return scheme(UriScheme.from(scheme));
  }

  public final UriAuthority authority() {
    return this.authority;
  }

  public Uri authority(UriAuthority authority) {
    if (authority != this.authority) {
      return copy(this.scheme, authority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public final String authorityPart() {
    return this.authority.toString();
  }

  public Uri authorityPart(String authority) {
    return authority(UriAuthority.parse(authority));
  }

  public final UriUser user() {
    return this.authority.user();
  }

  public Uri user(UriUser user) {
    return authority(this.authority.user(user));
  }

  public final String userPart() {
    return this.authority.userPart();
  }

  public Uri userPart(String user) {
    return authority(this.authority.userPart(user));
  }

  public String username() {
    return this.authority.username();
  }

  public Uri username(String username) {
    return authority(this.authority.username(username));
  }

  public Uri username(String username, String password) {
    return authority(this.authority.username(username, password));
  }

  public String password() {
    return this.authority.password();
  }

  public Uri password(String password) {
    return authority(this.authority.password(password));
  }

  public final UriHost host() {
    return this.authority.host();
  }

  public Uri host(UriHost host) {
    return authority(this.authority.host(host));
  }

  public final String hostPart() {
    return this.authority.hostPart();
  }

  public Uri hostPart(String host) {
    return authority(this.authority.hostPart(host));
  }

  public final String hostAddress() {
    return this.authority.hostAddress();
  }

  public final String hostName() {
    return this.authority.hostName();
  }

  public Uri hostName(String address) {
    return authority(this.authority.hostName(address));
  }

  public final String hostIPv4() {
    return this.authority.hostIPv4();
  }

  public Uri hostIPv4(String address) {
    return authority(this.authority.hostIPv4(address));
  }

  public final String hostIPv6() {
    return this.authority.hostIPv6();
  }

  public Uri hostIPv6(String address) {
    return authority(this.authority.hostIPv6(address));
  }

  public final UriPort port() {
    return this.authority.port();
  }

  public Uri port(UriPort port) {
    return authority(this.authority.port(port));
  }

  public final String portPart() {
    return this.authority.portPart();
  }

  public Uri portPart(String port) {
    return authority(this.authority.portPart(port));
  }

  public final int portNumber() {
    return this.authority.portNumber();
  }

  public Uri portNumber(int number) {
    return authority(this.authority.portNumber(number));
  }

  public final UriPath path() {
    return this.path;
  }

  public Uri path(UriPath path) {
    if (path != this.path) {
      return copy(this.scheme, this.authority, path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  public Uri path(String... components) {
    return path(UriPath.from(components));
  }

  public final String pathPart() {
    return this.path.toString();
  }

  public Uri pathPart(String path) {
    return path(UriPath.parse(path));
  }

  public final String pathName() {
    return this.path.name();
  }

  public Uri pathName(String name) {
    return path(this.path.name(name));
  }

  public final UriPath parentPath() {
    return this.path.parent();
  }

  public final UriPath basePath() {
    return this.path.base();
  }

  public final UriPath bodyPath() {
    return this.path.body();
  }

  public final Uri parent() {
    return Uri.from(this.scheme, this.authority, this.path.parent());
  }

  public final Uri base() {
    return Uri.from(this.scheme, this.authority, this.path.base());
  }

  public final Uri body() {
    return Uri.from(this.scheme, this.authority, this.path.body());
  }

  public Uri appendedPath(String component) {
    return path(this.path.appended(component));
  }

  public Uri appendedPath(String... components) {
    return path(this.path.appended(components));
  }

  public Uri appendedPath(Collection<? extends String> components) {
    return path(this.path.appended(components));
  }

  public Uri appendedSlash() {
    return path(this.path.appendedSlash());
  }

  public Uri appendedSegment(String segment) {
    return path(this.path.appendedSegment(segment));
  }

  public Uri prependedPath(String component) {
    return path(this.path.prepended(component));
  }

  public Uri prependedPath(String... components) {
    return path(this.path.prepended(components));
  }

  public Uri prependedPath(Collection<? extends String> components) {
    return path(this.path.prepended(components));
  }

  public Uri prependedSlash() {
    return path(this.path.prependedSlash());
  }

  public Uri prependedSegment(String segment) {
    return path(this.path.prependedSegment(segment));
  }

  public final UriQuery query() {
    return this.query;
  }

  public Uri query(UriQuery query) {
    if (query != this.query) {
      return copy(this.scheme, this.authority, this.path, query, this.fragment);
    } else {
      return this;
    }
  }

  public Uri query(String... keyValuePairs) {
    return query(UriQuery.from(keyValuePairs));
  }

  public final String queryPart() {
    return this.query.toString();
  }

  public Uri queryPart(String query) {
    return query(UriQuery.parse(query));
  }

  public Uri updatedQuery(String key, String value) {
    return query(this.query.updated(key, value));
  }

  public Uri removedQuery(String key) {
    return query(this.query.removed(key));
  }

  public Uri appendedQuery(String value) {
    return query(this.query.appended(value));
  }

  public Uri appendedQuery(String key, String value) {
    return query(this.query.appended(key, value));
  }

  public Uri appendedQuery(String... keyValuePairs) {
    return query(this.query.appended(keyValuePairs));
  }

  public Uri appendedQuery(Map<? extends String, ? extends String> params) {
    return query(this.query.appended(params));
  }

  public Uri prependedQuery(String value) {
    return query(this.query.prepended(value));
  }

  public Uri prependedQuery(String key, String value) {
    return query(this.query.prepended(key, value));
  }

  public Uri prependedQuery(String... keyValuePairs) {
    return query(this.query.prepended(keyValuePairs));
  }

  public Uri prependedQuery(Map<? extends String, ? extends String> params) {
    return query(this.query.prepended(query));
  }

  public final UriFragment fragment() {
    return this.fragment;
  }

  public Uri fragment(UriFragment fragment) {
    if (fragment != this.fragment) {
      return copy(this.scheme, this.authority, this.path, this.query, fragment);
    } else {
      return this;
    }
  }

  public final String fragmentPart() {
    return this.fragment.toString();
  }

  public Uri fragmentPart(String fragment) {
    return fragment(UriFragment.parse(fragment));
  }

  public final String fragmentIdentifier() {
    return this.fragment.identifier();
  }

  public Uri fragmentIdentifier(String fragment) {
    return fragment(UriFragment.from(fragment));
  }

  public Uri endpoint() {
    if (this.path.isDefined() || this.query.isDefined() || this.fragment.isDefined()) {
      return Uri.from(this.scheme, this.authority);
    } else {
      return this;
    }
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
      return copy(relative.scheme,
                  relative.authority,
                  relative.path.removeDotSegments(),
                  relative.query,
                  relative.fragment);
    } else if (relative.authority.isDefined()) {
      return copy(this.scheme,
                  relative.authority,
                  relative.path.removeDotSegments(),
                  relative.query,
                  relative.fragment);
    } else if (relative.path.isEmpty()) {
      return copy(this.scheme,
                  this.authority,
                  this.path,
                  relative.query.isDefined() ? relative.query : this.query,
                  relative.fragment);
    } else if (relative.path.isAbsolute()) {
      return copy(this.scheme,
                  this.authority,
                  relative.path.removeDotSegments(),
                  relative.query,
                  relative.fragment);
    } else {
      return copy(this.scheme,
                  this.authority,
                  merge(relative.path).removeDotSegments(),
                  relative.query,
                  relative.fragment);
    }
  }

  protected UriPath merge(UriPath relative) {
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
      return copy(UriScheme.undefined(),
                  UriAuthority.undefined(),
                  this.path.unmerge(absolute.path),
                  absolute.query,
                  absolute.fragment);
    }
  }

  protected Uri copy(UriScheme scheme, UriAuthority authority, UriPath path,
                     UriQuery query, UriFragment fragment) {
    return Uri.from(scheme, authority, path, query, fragment);
  }

  @Override
  public final int compareTo(Uri that) {
    return toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Uri) {
      return toString().equals(((Uri) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(toString());
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Uri").write('.');
    if (isDefined()) {
      output = output.write("parse").write('(').write('"').display(this).write('"').write(')');
    } else {
      output = output.write("empty").write('(').write(')');
    }
  }

  @Override
  public void display(Output<?> output) {
    if (this.string != null) {
      output = output.write(this.string);
    } else {
      if (this.scheme.isDefined()) {
        output.display(this.scheme).write(':');
      }
      if (this.authority.isDefined()) {
        output = output.write('/').write('/').display(this.authority);
      }
      output.display(this.path);
      if (this.query.isDefined()) {
        output = output.write('?').display(this.query);
      }
      if (this.fragment.isDefined()) {
        output = output.write('#').display(this.fragment);
      }
    }
  }

  @Override
  public final String toString() {
    if (this.string == null) {
      this.string = Format.display(this);
    }
    return this.string;
  }

  private static Uri empty;

  private static UriParser standardParser;

  public static Uri empty() {
    if (empty == null) {
      empty = new Uri(UriScheme.undefined(), UriAuthority.undefined(), UriPath.empty(),
                      UriQuery.undefined(), UriFragment.undefined());
    }
    return empty;
  }

  public static Uri from(UriScheme scheme, UriAuthority authority, UriPath path,
                         UriQuery query, UriFragment fragment) {
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
      return empty();
    }
  }

  public static Uri from(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query) {
    return from(scheme, authority, path, query, null);
  }

  public static Uri from(UriScheme scheme, UriAuthority authority, UriPath path, UriFragment fragment) {
    return from(scheme, authority, path, null, fragment);
  }

  public static Uri from(UriScheme scheme, UriAuthority authority, UriPath path) {
    return from(scheme, authority, path, null, null);
  }

  public static Uri from(UriScheme scheme, UriAuthority authority) {
    return from(scheme, authority, null, null, null);
  }

  public static Uri from(UriPath path, UriQuery query, UriFragment fragment) {
    return from(null, null, path, query, fragment);
  }

  public static Uri from(UriPath path, UriQuery query) {
    return from(null, null, path, query, null);
  }

  public static Uri from(UriPath path, UriFragment fragment) {
    return from(null, null, path, null, fragment);
  }

  public static Uri from(UriPath path) {
    return from(null, null, path, null, null);
  }

  public static Uri from(UriPart part) {
    if (part instanceof UriScheme) {
      return from((UriScheme) part, null, null, null, null);
    } else if (part instanceof UriAuthority) {
      return from(null, (UriAuthority) part, null, null, null);
    } else if (part instanceof UriPath) {
      return from(null, null, (UriPath) part, null, null);
    } else if (part instanceof UriQuery) {
      return from(null, null, null, (UriQuery) part, null);
    } else if (part instanceof UriFragment) {
      return from(null, null, null, null, (UriFragment) part);
    } else {
      throw new ClassCastException(part.toString());
    }
  }

  public static UriParser standardParser() {
    if (standardParser == null) {
      standardParser = new UriParser();
    }
    return standardParser;
  }

  public static Uri parse(String string) {
    return standardParser().parseAbsoluteString(string);
  }

  static boolean isUnreservedChar(int c) {
    return c >= 'A' && c <= 'Z'
        || c >= 'a' && c <= 'z'
        || c >= '0' && c <= '9'
        || c == '-' || c == '.'
        || c == '_' || c == '~';
  }

  static boolean isSubDelimChar(int c) {
    return c == '!' || c == '$'
        || c == '&' || c == '('
        || c == ')' || c == '*'
        || c == '+' || c == ','
        || c == ';' || c == '='
        || c == '\'';
  }

  static boolean isSchemeChar(int c) {
    return c >= 'A' && c <= 'Z'
        || c >= 'a' && c <= 'z'
        || c >= '0' && c <= '9'
        || c == '+' || c == '-'
        || c == '.';
  }

  static boolean isUserInfoChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c) || c == ':';
  }

  static boolean isUserChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c);
  }

  static boolean isHostChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c);
  }

  static boolean isPathChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c) || c == ':' || c == '@';
  }

  static boolean isQueryChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c)
        || c == '/' || c == ':'
        || c == '?' || c == '@';
  }

  static boolean isParamChar(int c) {
    return isUnreservedChar(c)
        || c == '!' || c == '$'
        || c == '(' || c == ')'
        || c == '*' || c == '+'
        || c == ',' || c == '/'
        || c == ':' || c == ';'
        || c == '?' || c == '@'
        || c == '\'';
  }

  static boolean isFragmentChar(int c) {
    return isUnreservedChar(c) || isSubDelimChar(c)
        || c == '/' || c == ':'
        || c == '?' || c == '@';
  }

  static boolean isAlpha(int c) {
    return c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z';
  }

  static void writeScheme(String scheme, Output<?> output) {
    final int n = scheme.length();
    for (int i = 0; i < n; i = scheme.offsetByCodePoints(i, 1)) {
      final int c = scheme.codePointAt(i);
      if (i > 0 && isSchemeChar(c) || i == 0 && isAlpha(c)) {
        output = output.write(c);
      } else {
        throw new UriException("Invalid scheme: " + scheme);
      }
    }
  }

  static void writeUserInfo(String userInfo, Output<?> output) {
    final int n = userInfo.length();
    for (int i = 0; i < n; i = userInfo.offsetByCodePoints(i, 1)) {
      final int c = userInfo.codePointAt(i);
      if (isUserInfoChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeUser(String user, Output<?> output) {
    final int n = user.length();
    for (int i = 0; i < n; i = user.offsetByCodePoints(i, 1)) {
      final int c = user.codePointAt(i);
      if (isUserChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeHost(String address, Output<?> output) {
    final int n = address.length();
    for (int i = 0; i < n; i = address.offsetByCodePoints(i, 1)) {
      final int c = address.codePointAt(i);
      if (isHostChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeHostLiteral(String address, Output<?> output) {
    final int n = address.length();
    for (int i = 0; i < n; i = address.offsetByCodePoints(i, 1)) {
      final int c = address.codePointAt(i);
      if (isHostChar(c) || c == ':') {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writePathSegment(String segment, Output<?> output) {
    final int n = segment.length();
    for (int i = 0; i < n; i = segment.offsetByCodePoints(i, 1)) {
      final int c = segment.codePointAt(i);
      if (isPathChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeQuery(String query, Output<?> output) {
    final int n = query.length();
    for (int i = 0; i < n; i = query.offsetByCodePoints(i, 1)) {
      final int c = query.codePointAt(i);
      if (isQueryChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeParam(String param, Output<?> output) {
    final int n = param.length();
    for (int i = 0; i < n; i = param.offsetByCodePoints(i, 1)) {
      final int c = param.codePointAt(i);
      if (isParamChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeFragment(String fragment, Output<?> output) {
    final int n = fragment.length();
    for (int i = 0; i < n; i = fragment.offsetByCodePoints(i, 1)) {
      final int c = fragment.codePointAt(i);
      if (isFragmentChar(c)) {
        output = output.write(c);
      } else {
        writeEncoded(c, output);
      }
    }
  }

  static void writeEncoded(int c, Output<?> output) {
    if (c == 0x00) { // modified UTF-8
      writePctEncoded(0xC0, output);
      writePctEncoded(0x80, output);
    } else if (c >= 0x00 && c <= 0x7F) { // U+0000..U+007F
      writePctEncoded(c, output);
    } else if (c >= 0x80 && c <= 0x07FF) { // U+0080..U+07FF
      writePctEncoded(0xC0 | (c >>> 6), output);
      writePctEncoded(0x80 | (c & 0x3F), output);
    } else if (c >= 0x0800 && c <= 0xffff) { // (U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
      writePctEncoded(0xE0 | (c >>> 12), output);
      writePctEncoded(0x80 | (c >>>  6 & 0x3F), output);
      writePctEncoded(0x80 | (c        & 0x3F), output);
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      writePctEncoded(0xF0 | (c >>> 18), output);
      writePctEncoded(0x80 | (c >>> 12 & 0x3F), output);
      writePctEncoded(0x80 | (c >>>  6 & 0x3F), output);
      writePctEncoded(0x80 | (c        & 0x3F), output);
    } else { // surrogate or invalid code point
      writePctEncoded(0xEF, output);
      writePctEncoded(0xBF, output);
      writePctEncoded(0xBD, output);
    }
  }

  static void writePctEncoded(int c, Output<?> output) {
    output = output.write('%').write(Base16.lowercase().encodeDigit(c >>> 4 & 0xF))
                              .write(Base16.lowercase().encodeDigit(c       & 0xF));
  }

  private static Form<Uri> form;

  @Kind
  public static Form<Uri> form() {
    if (form == null) {
      form = new UriForm(Uri.empty());
    }
    return form;
  }
}
