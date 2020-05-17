// Copyright 2015-2020 SWIM.AI inc.
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

import {Comparable, HashCode, Murmur3} from "@swim/util";
import {Output, Format, Debug, Display, Base16} from "@swim/codec";
import {Form} from "@swim/structure";
import {UriException} from "./UriException";
import {AnyUriScheme, UriScheme} from "./UriScheme";
import {AnyUriAuthority, UriAuthorityInit, UriAuthority} from "./UriAuthority";
import {AnyUriUser, UriUser} from "./UriUser";
import {AnyUriHost, UriHost} from "./UriHost";
import {UriHostName} from "./UriHostName";
import {UriHostIPv4} from "./UriHostIPv4";
import {UriHostIPv6} from "./UriHostIPv6";
import {UriHostUndefined} from "./UriHostUndefined";
import {AnyUriPort, UriPort} from "./UriPort";
import {AnyUriPath, UriPath} from "./UriPath";
import {UriPathSegment} from "./UriPathSegment";
import {UriPathSlash} from "./UriPathSlash";
import {UriPathEmpty} from "./UriPathEmpty";
import {UriPathBuilder} from "./UriPathBuilder";
import {AnyUriQuery, UriQuery} from "./UriQuery";
import {UriQueryParam} from "./UriQueryParam";
import {UriQueryUndefined} from "./UriQueryUndefined";
import {UriQueryBuilder} from "./UriQueryBuilder";
import {AnyUriFragment, UriFragment} from "./UriFragment";
import {UriParser} from "./UriParser";
import {UriForm} from "./UriForm";
import {UriPathForm} from "./UriPathForm";

export type AnyUri = Uri | UriInit | string;

export interface UriInit extends UriAuthorityInit {
  scheme?: AnyUriScheme;
  authority?: AnyUriAuthority;
  path?: AnyUriPath;
  query?: AnyUriQuery;
  fragment?: AnyUriFragment;
}

export class Uri implements Comparable<Uri>, HashCode, Debug, Display {
  /** @hidden */
  readonly _scheme: UriScheme;
  /** @hidden */
  readonly _authority: UriAuthority;
  /** @hidden */
  readonly _path: UriPath;
  /** @hidden */
  readonly _query: UriQuery;
  /** @hidden */
  readonly _fragment: UriFragment;
  /** @hidden */
  _string?: string;
  /** @hidden */
  _hashCode?: number;

  /** @hidden */
  constructor(scheme: UriScheme, authority: UriAuthority, path: UriPath,
              query: UriQuery, fragment: UriFragment) {
    this._scheme = scheme;
    this._authority = authority;
    this._path = path;
    this._query = query;
    this._fragment = fragment;
  }

  isDefined(): boolean {
    return this._scheme.isDefined() || this._authority.isDefined() || this._path.isDefined()
        || this._query.isDefined() || this._fragment.isDefined();
  }

  isEmpty(): boolean {
    return !this._scheme.isDefined() && !this._authority.isDefined() && this._path.isEmpty()
        && !this._query.isDefined() && !this._fragment.isDefined();
  }

  scheme(): UriScheme;
  scheme(scheme: AnyUriScheme): Uri;
  scheme(scheme?: AnyUriScheme): UriScheme | Uri {
    if (scheme === void 0) {
      return this._scheme;
    } else {
      scheme = Uri.Scheme.fromAny(scheme);
      if (scheme !== this._scheme) {
        return this.copy(scheme, this._authority, this._path, this._query, this._fragment);
      } else {
        return this;
      }
    }
  }

  schemePart(): string;
  schemePart(scheme: string): Uri;
  schemePart(scheme?: string): string | Uri {
    if (scheme === void 0) {
      return this._scheme.toString();
    } else {
      return this.scheme(Uri.Scheme.parse(scheme));
    }
  }

  schemeName(): string;
  schemeName(scheme: string): Uri;
  schemeName(scheme?: string): string | Uri {
    if (scheme === void 0) {
      return this._scheme.name();
    } else {
      return this.scheme(Uri.Scheme.from(scheme));
    }
  }

  authority(): UriAuthority;
  authority(authority: AnyUriAuthority): Uri;
  authority(authority?: AnyUriAuthority): UriAuthority | Uri {
    if (authority === void 0) {
      return this._authority;
    } else {
      authority = Uri.Authority.fromAny(authority);
      if (authority !== this._authority) {
        return this.copy(this._scheme, authority, this._path, this._query, this._fragment);
      } else {
        return this;
      }
    }
  }

  authorityPart(): string;
  authorityPart(authority: string): Uri;
  authorityPart(authority?: string): string | Uri {
    if (authority === void 0) {
      return this._authority.toString();
    } else {
      return this.authority(Uri.Authority.parse(authority));
    }
  }

  user(): UriUser;
  user(user: AnyUriUser): Uri;
  user(user?: AnyUriUser): UriUser | Uri {
    if (user === void 0) {
      return this._authority.user();
    } else {
      return this.authority(this._authority.user(user));
    }
  }

  userPart(): string;
  userPart(user: string): Uri;
  userPart(user?: string): string | Uri {
    if (user === void 0) {
      return this._authority.userPart();
    } else {
      return this.authority(this._authority.userPart(user));
    }
  }

  username(): string;
  username(username: string, password?: string | null): Uri;
  username(username?: string, password?: string | null): string | Uri {
    if (username === void 0) {
      return this._authority.username();
    } else {
      return this.authority(this._authority.username(username, password));
    }
  }

  password(): string | null;
  password(password: string | null): Uri;
  password(password?: string | null): string | null | Uri {
    if (password === void 0) {
      return this._authority.password();
    } else {
      return this.authority(this._authority.password(password));
    }
  }

  host(): UriHost;
  host(host: AnyUriHost): Uri;
  host(host?: AnyUriHost): UriHost | Uri {
    if (host === void 0) {
      return this._authority.host();
    } else {
      return this.authority(this._authority.host(host));
    }
  }

  hostPart(): string;
  hostPart(host: string): Uri;
  hostPart(host?: string): string | Uri {
    if (host === void 0) {
      return this._authority.hostPart();
    } else {
      return this.authority(this._authority.hostPart(host));
    }
  }

  hostAddress(): string {
    return this._authority.hostAddress();
  }

  hostName(): string | null;
  hostName(address: string): Uri;
  hostName(address?: string): string | null | Uri {
    if (address === void 0) {
      return this._authority.hostName();
    } else {
      return this.authority(this._authority.hostName(address));
    }
  }

  hostIPv4(): string | null;
  hostIPv4(address: string): Uri;
  hostIPv4(address?: string): string | null | Uri {
    if (address === void 0) {
      return this._authority.hostIPv4();
    } else {
      return this.authority(this._authority.hostIPv4(address));
    }
  }

  hostIPv6(): string | null;
  hostIPv6(address: string): Uri;
  hostIPv6(address?: string): string | null | Uri {
    if (address === void 0) {
      return this._authority.hostIPv6();
    } else {
      return this.authority(this._authority.hostIPv6(address));
    }
  }

  port(): UriPort;
  port(port: AnyUriPort): Uri;
  port(port?: AnyUriPort): UriPort | Uri {
    if (port === void 0) {
      return this._authority.port();
    } else {
      return this.authority(this._authority.port(port));
    }
  }

  portPart(): string;
  portPart(port: string): Uri;
  portPart(port?: string): string | Uri {
    if (port === void 0) {
      return this._authority.portPart();
    } else {
      return this.authority(this._authority.portPart(port));
    }
  }

  portNumber(): number;
  portNumber(port: number): Uri;
  portNumber(port?: number): number | Uri {
    if (port === void 0) {
      return this._authority.portNumber();
    } else {
      return this.authority(this._authority.portNumber(port));
    }
  }

  path(): UriPath;
  path(...components: AnyUriPath[]): Uri;
  path(...components: AnyUriPath[]): UriPath | Uri {
    if (arguments.length === 0) {
      return this._path;
    } else {
      const path = Uri.Path.from.apply(void 0, components);
      if (path !== this._path) {
        return this.copy(this._scheme, this._authority, path, this._query, this._fragment);
      } else {
        return this;
      }
    }
  }

  pathPart(): string;
  pathPart(path: string): Uri;
  pathPart(path?: string): string | Uri {
    if (path === void 0) {
      return this._path.toString();
    } else {
      return this.path(Uri.Path.parse(path));
    }
  }

  pathName(): string;
  pathName(name: string): Uri;
  pathName(name?: string): string | Uri {
    if (name === void 0) {
      return this._path.name();
    } else {
      return this.path(this._path.name(name));
    }
  }

  parentPath(): UriPath {
    return this._path.parent();
  }

  basePath(): UriPath {
    return this._path.base();
  }

  parent(): Uri {
    return Uri.from(this._scheme, this._authority, this._path.parent());
  }

  base(): Uri {
    return Uri.from(this._scheme, this._authority, this._path.base());
  }

  appendedPath(...components: AnyUriPath[]): Uri {
    return this.path(this._path.appended.apply(this._path, arguments));
  }

  appendedSlash(): Uri {
    return this.path(this._path.appendedSlash());
  }

  appendedSegment(segment: string): Uri {
    return this.path(this._path.appendedSegment(segment));
  }

  prependedPath(...components: AnyUriPath[]): Uri {
    return this.path(this._path.prepended.apply(this._path, arguments));
  }

  prependedSlash(): Uri {
    return this.path(this._path.prependedSlash());
  }

  prependedSegment(segment: string): Uri {
    return this.path(this._path.prependedSegment(segment));
  }

  query(): UriQuery;
  query(query: AnyUriQuery): Uri;
  query(query?: AnyUriQuery): UriQuery | Uri {
    if (query === void 0) {
      return this._query;
    } else {
      query = Uri.Query.fromAny(query);
      if (query !== this._query) {
        return this.copy(this._scheme, this._authority, this._path, query, this._fragment);
      } else {
        return this;
      }
    }
  }

  queryPart(): string;
  queryPart(query: string): Uri;
  queryPart(query?: string): string | Uri {
    if (query === void 0) {
      return this._query.toString();
    } else {
      return this.query(Uri.Query.parse(query));
    }
  }

  updatedQuery(key: string, value: string): Uri {
    return this.query(this._query.updated(key, value));
  }

  removedQuery(key: string): Uri {
    return this.query(this._query.removed(key));
  }

  appendedQuery(key: string | null, value: string): Uri;
  appendedQuery(params: AnyUriQuery): Uri;
  appendedQuery(key: AnyUriQuery | null, value?: string): Uri {
    return this.query(this._query.appended(key as any, value as any));
  }

  prependedQuery(key: string | null, value: string): Uri;
  prependedQuery(params: AnyUriQuery): Uri;
  prependedQuery(key: AnyUriQuery | null, value?: string): Uri {
    return this.query(this._query.prepended(key as any, value as any));
  }

  fragment(): UriFragment;
  fragment(fragment: AnyUriFragment): Uri;
  fragment(fragment?: AnyUriFragment): UriFragment | Uri {
    if (fragment === void 0) {
      return this._fragment;
    } else {
      fragment = Uri.Fragment.fromAny(fragment);
      if (fragment !== this._fragment) {
        return Uri.from(this._scheme, this._authority, this._path, this._query, fragment);
      } else {
        return this;
      }
    }
  }

  fragmentPart(): string | null;
  fragmentPart(fragment: string): Uri;
  fragmentPart(fragment?: string): string  | null| Uri {
    if (fragment === void 0) {
      return this._fragment.toString();
    } else {
      return this.fragment(Uri.Fragment.parse(fragment));
    }
  }

  fragmentIdentifier(): string | null;
  fragmentIdentifier(identifier: string | null): Uri;
  fragmentIdentifier(identifier?: string | null): string | null | Uri {
    if (identifier === void 0) {
      return this._fragment.identifier();
    } else {
      return this.fragment(Uri.Fragment.from(identifier));
    }
  }

  endpoint(): Uri {
    if (this._path.isDefined() || this._query.isDefined() || this._fragment.isDefined()) {
      return Uri.from(this._scheme, this._authority);
    } else {
      return this;
    }
  }

  resolve(relative: AnyUri): Uri {
    relative = Uri.fromAny(relative);
    if (relative._scheme.isDefined()) {
      return this.copy(relative._scheme,
                       relative._authority,
                       relative._path.removeDotSegments(),
                       relative._query,
                       relative._fragment);
    } else if (relative._authority.isDefined()) {
      return this.copy(this._scheme,
                       relative._authority,
                       relative._path.removeDotSegments(),
                       relative._query,
                       relative._fragment);
    } else if (relative._path.isEmpty()) {
      return this.copy(this._scheme,
                       this._authority,
                       this._path,
                       relative._query.isDefined() ? relative._query : this._query,
                       relative._fragment);
    } else if (relative._path.isAbsolute()) {
      return this.copy(this._scheme,
                       this._authority,
                       relative._path.removeDotSegments(),
                       relative._query,
                       relative._fragment);
    } else {
      return this.copy(this._scheme,
                       this._authority,
                       this.merge(relative._path).removeDotSegments(),
                       relative._query,
                       relative._fragment);
    }
  }

  /** @hidden */
  merge(relative: UriPath): UriPath {
    if (this._authority.isDefined() && this._path.isEmpty()) {
      return relative.prependedSlash();
    } else if (this._path.isEmpty()) {
      return relative;
    } else {
      return this._path.merge(relative);
    }
  }

  unresolve(absolute: AnyUri): Uri {
    absolute = Uri.fromAny(absolute);
    if (!this._scheme.equals(absolute._scheme) || !this._authority.equals(absolute._authority)) {
      return absolute;
    } else {
      return Uri.from(Uri.Scheme.undefined(),
                      Uri.Authority.undefined(),
                      this._path.unmerge(absolute._path),
                      absolute._query,
                      absolute._fragment);
    }
  }

  protected copy(scheme: UriScheme, authority: UriAuthority, path: UriPath,
                 query: UriQuery, fragment: UriFragment): Uri {
    return Uri.from(scheme, authority, path, query, fragment);
  }

  toAny(): {scheme?: string, username?: string, password?: string, host?: string,
            port?: number, path: string[], query?: {[key: string]: string},
            fragment?: string} {
    const uri = {} as {scheme?: string, username?: string, password?: string, host?: string,
                       port?: number, path: string[], query?: {[key: string]: string},
                       fragment?: string};
    uri.scheme = this._scheme.toAny();
    this._authority.toAny(uri);
    uri.path = this._path.toAny();
    uri.query = this._query.toAny();
    uri.fragment = this._fragment.toAny();
    return uri;
  }

  compareTo(that: Uri): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Uri) {
      return this.toString() === that.toString();
    }
    return false;
  }

  hashCode(): number {
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this.toString());
    }
    return this._hashCode;
  }

  debug(output: Output): void {
    output = output.write("Uri").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    if (this._string !== void 0) {
      output = output.write(this._string);
    } else {
      if (this._scheme.isDefined()) {
        output.display(this._scheme).write(58/*':'*/);
      }
      if (this._authority.isDefined()) {
        output = output.write(47/*'/'*/).write(47/*'/'*/).display(this._authority);
      }
      output.display(this._path);
      if (this._query.isDefined()) {
        output = output.write(63/*'?'*/).display(this._query);
      }
      if (this._fragment.isDefined()) {
        output = output.write(35/*'#'*/).display(this._fragment);
      }
    }
  }

  toString(): string {
    if (this._string === void 0) {
      this._string = Format.display(this);
    }
    return this._string;
  }

  private static _empty?: Uri;

  private static _standardParser?: UriParser;

  static empty(): Uri {
    if (Uri._empty === void 0) {
      Uri._empty = new Uri(Uri.Scheme.undefined(), Uri.Authority.undefined(), Uri.Path.empty(),
                           Uri.Query.undefined(), Uri.Fragment.undefined());
    }
    return Uri._empty;
  }

  static from(scheme: UriScheme = Uri.Scheme.undefined(),
              authority: UriAuthority = Uri.Authority.undefined(),
              path: UriPath = Uri.Path.empty(),
              query: UriQuery = Uri.Query.undefined(),
              fragment: UriFragment = Uri.Fragment.undefined()): Uri {
    if (scheme.isDefined() || authority.isDefined() || path.isDefined()
        || query.isDefined() || fragment.isDefined()) {
      return new Uri(scheme, authority, path, query, fragment);
    } else {
      return Uri.empty();
    }
  }

  static fromAny(uri: AnyUri | null | undefined): Uri {
    if (uri === null || uri === void 0) {
      return Uri.empty();
    } else if (uri instanceof Uri) {
      return uri;
    } else if (typeof uri === "object") {
      const scheme = Uri.Scheme.fromAny(uri.scheme);
      const authority = Uri.Authority.fromAny(uri.authority || uri);
      const path = Uri.Path.fromAny(uri.path);
      const query = Uri.Query.fromAny(uri.query);
      const fragment = Uri.Fragment.fromAny(uri.fragment);
      if (scheme.isDefined() || authority.isDefined() || path.isDefined()
          || query.isDefined() || fragment.isDefined()) {
        return new Uri(scheme, authority, path, query, fragment);
      } else {
        return Uri.empty();
      }
    } else if (typeof uri === "string") {
      return Uri.parse(uri);
    } else {
      throw new TypeError("" + uri);
    }
  }

  static scheme(scheme: AnyUriScheme): Uri {
    scheme = Uri.Scheme.fromAny(scheme);
    return Uri.from(scheme, void 0, void 0, void 0, void 0);
  }

  static schemePart(part: string): Uri {
    const scheme = Uri.Scheme.parse(part);
    return Uri.from(scheme, void 0, void 0, void 0, void 0);
  }

  static schemeName(name: string): Uri {
    const scheme = Uri.Scheme.from(name);
    return Uri.from(scheme, void 0, void 0, void 0, void 0);
  }

  static authority(authority: AnyUriAuthority): Uri {
    authority = Uri.Authority.fromAny(authority);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static authorityPart(part: string): Uri {
    const authority = Uri.Authority.parse(part);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static user(user: AnyUriUser): Uri {
    const authority = Uri.Authority.user(user);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static userPart(part: string): Uri {
    const authority = Uri.Authority.userPart(part);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static username(username: string, password?: string | null): Uri {
    const authority = Uri.Authority.username(username, password);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static password(password: string): Uri {
    const authority = Uri.Authority.password(password);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static host(host: AnyUriHost): Uri {
    const authority = Uri.Authority.host(host);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static hostPart(part: string): Uri {
    const authority = Uri.Authority.hostPart(part);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static hostName(address: string): Uri {
    const authority = Uri.Authority.hostName(address);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static hostIPv4(address: string): Uri {
    const authority = Uri.Authority.hostIPv4(address);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static hostIPv6(address: string): Uri {
    const authority = Uri.Authority.hostIPv6(address);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static port(port: AnyUriPort): Uri {
    const authority = Uri.Authority.port(port);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static portPart(part: string): Uri {
    const authority = Uri.Authority.portPart(part);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static portNumber(number: number): Uri {
    const authority = Uri.Authority.portNumber(number);
    return Uri.from(void 0, authority, void 0, void 0, void 0);
  }

  static path(...components: AnyUriPath[]): Uri {
    const path = Uri.Path.from.apply(void 0, components);
    return Uri.from(void 0, void 0, path, void 0, void 0);
  }

  static pathPart(part: string): Uri {
    const path = Uri.Path.parse(part);
    return Uri.from(void 0, void 0, path, void 0, void 0);
  }

  static query(query: AnyUriQuery): Uri {
    query = Uri.Query.fromAny(query);
    return Uri.from(void 0, void 0, void 0, query, void 0);
  }

  static queryPart(part: string): Uri {
    const query = Uri.Query.parse(part);
    return Uri.from(void 0, void 0, void 0, query, void 0);
  }

  static fragment(fragment: AnyUriFragment): Uri {
    fragment = Uri.Fragment.fromAny(fragment);
    return Uri.from(void 0, void 0, void 0, void 0, fragment);
  }

  static fragmentPart(part: string): Uri {
    const fragment = Uri.Fragment.parse(part);
    return Uri.from(void 0, void 0, void 0, void 0, fragment);
  }

  static fragmentIdentifier(identifier: string): Uri {
    const fragment = Uri.Fragment.from(identifier);
    return Uri.from(void 0, void 0, void 0, void 0, fragment);
  }

  static standardParser(): UriParser {
    if (this._standardParser === void 0) {
      this._standardParser = new Uri.Parser();
    }
    return this._standardParser;
  }

  static parse(string: string): Uri {
    return Uri.standardParser().parseAbsoluteString(string);
  }

  /** @hidden */
  static isUnreservedChar(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c === 45/*'-'*/ || c === 46/*'.'*/
        || c === 95/*'_'*/ || c === 126/*'~'*/;
  }

  /** @hidden */
  static isSubDelimChar(c: number): boolean {
    return c === 33/*'!'*/ || c === 36/*'$'*/
        || c === 38/*'&'*/ || c === 40/*'('*/
        || c === 41/*')'*/ || c === 42/*'*'*/
        || c === 43/*'+'*/ || c === 44/*','*/
        || c === 59/*';'*/ || c === 61/*'='*/
        || c === 39/*'\''*/;
  }

  /** @hidden */
  static isSchemeChar(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c === 43/*'+'*/ || c === 45/*'-'*/
        || c === 46/*'.'*/;
  }

  /** @hidden */
  static isUserInfoChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 58/*':'*/;
  }

  /** @hidden */
  static isUserChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c);
  }

  /** @hidden */
  static isHostChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c);
  }

  /** @hidden */
  static isPathChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 58/*':'*/ || c === 64/*'@'*/;
  }

  /** @hidden */
  static isQueryChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 47/*'/'*/ || c === 58/*':'*/
        || c === 63/*'?'*/ || c === 64/*'@'*/;
  }

  /** @hidden */
  static isParamChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || c === 33/*'!'*/ || c === 36/*'$'*/
        || c === 40/*'('*/ || c === 41/*')'*/
        || c === 42/*'*'*/ || c === 43/*'+'*/
        || c === 44/*','*/ || c === 47/*'/'*/
        || c === 58/*':'*/ || c === 59/*';'*/
        || c === 63/*'?'*/ || c === 64/*'@'*/
        || c === 39/*'\''*/;
  }

  /** @hidden */
  static isFragmentChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 47/*'/'*/ || c === 58/*':'*/
        || c === 63/*'?'*/ || c === 64/*'@'*/;
  }

  /** @hidden */
  static isAlpha(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/;
  }

  /** @hidden */
  static toLowerCase(c: number): number {
    if (c >= 65/*'A'*/ && c <= 90/*'Z'*/) {
      return c + (97/*'a'*/ - 65/*'A'*/);
    } else {
      return c;
    }
  }

  /** @hidden */
  static writeScheme(scheme: string, output: Output): void {
    for (let i = 0, n = scheme.length; i < n; i += 1) {
      const c = scheme.charCodeAt(i);
      if (i > 0 && Uri.isSchemeChar(c) || i === 0 && Uri.isAlpha(c)) {
        output = output.write(c);
      } else {
        throw new UriException("Invalid scheme: " + scheme);
      }
    }
  }

  /** @hidden */
  static writeUserInfo(userInfo: string, output: Output): void {
    for (let i = 0, n = userInfo.length; i < n; i += 1) {
      const c = userInfo.charCodeAt(i);
      if (Uri.isUserInfoChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeUser(user: string, output: Output): void {
    for (let i = 0, n = user.length; i < n; i += 1) {
      const c = user.charCodeAt(i);
      if (Uri.isUserChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeHost(address: string, output: Output): void {
    for (let i = 0, n = address.length; i < n; i += 1) {
      const c = address.charCodeAt(i);
      if (Uri.isHostChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeHostLiteral(address: string, output: Output): void {
    for (let i = 0, n = address.length; i < n; i += 1) {
      const c = address.charCodeAt(i);
      if (Uri.isHostChar(c) || c === 58/*':'*/) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writePathSegment(segment: string, output: Output): void {
    for (let i = 0, n = segment.length; i < n; i += 1) {
      const c = segment.charCodeAt(i);
      if (Uri.isPathChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeQuery(query: string, output: Output): void {
    for (let i = 0, n = query.length; i < n; i += 1) {
      const c = query.charCodeAt(i);
      if (Uri.isQueryChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeParam(param: string, output: Output): void {
    for (let i = 0, n = param.length; i < n; i += 1) {
      const c = param.charCodeAt(i);
      if (Uri.isParamChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeFragment(fragment: string, output: Output): void {
    for (let i = 0, n = fragment.length; i < n; i += 1) {
      const c = fragment.charCodeAt(i);
      if (Uri.isFragmentChar(c)) {
        output = output.write(c);
      } else {
        Uri.writeEncoded(c, output);
      }
    }
  }

  /** @hidden */
  static writeEncoded(c: number, output: Output): void {
    if (c === 0x00) { // modified UTF-8
      Uri.writePctEncoded(0xC0, output);
      Uri.writePctEncoded(0x80, output);
    } else if (c >= 0x00 && c <= 0x7F) { // U+0000..U+007F
      Uri.writePctEncoded(c, output);
    } else if (c >= 0x80 && c <= 0x07FF) { // U+0080..U+07FF
      Uri.writePctEncoded(0xC0 | (c >>> 6), output);
      Uri.writePctEncoded(0x80 | (c & 0x3F), output);
    } else if (c >= 0x0800 && c <= 0xFFFF    // U+0800..U+D7FF
            || c >= 0xE000 && c <= 0xFFFF) { // U+E000..U+FFFF
      Uri.writePctEncoded(0xE0 | (c >>> 12), output);
      Uri.writePctEncoded(0x80 | (c >>>  6 & 0x3F), output);
      Uri.writePctEncoded(0x80 | (c        & 0x3F), output);
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      Uri.writePctEncoded(0xF0 | (c >>> 18), output);
      Uri.writePctEncoded(0x80 | (c >>> 12 & 0x3F), output);
      Uri.writePctEncoded(0x80 | (c >>>  6 & 0x3F), output);
      Uri.writePctEncoded(0x80 | (c        & 0x3F), output);
    } else { // surrogate or invalid code point
      Uri.writePctEncoded(0xEF, output);
      Uri.writePctEncoded(0xBF, output);
      Uri.writePctEncoded(0xBD, output);
    }
  }

  /** @hidden */
  static writePctEncoded(c: number, output: Output) {
    output = output.write(37/*'%'*/)
          .write(Base16.lowercase().encodeDigit(c >>> 4 & 0xF))
          .write(Base16.lowercase().encodeDigit(c       & 0xF));
  }

  // Forward type declarations
  /** @hidden */
  static Scheme: typeof UriScheme; // defined by UriScheme
  /** @hidden */
  static Authority: typeof UriAuthority; // defined by UriAuthority
  /** @hidden */
  static User: typeof UriUser; // defined by UriUser
  /** @hidden */
  static Host: typeof UriHost; // defined by UriHost
  /** @hidden */
  static HostName: typeof UriHostName; // defined by UriHostName
  /** @hidden */
  static HostIPv4: typeof UriHostIPv4; // defined by UriHostIPv4
  /** @hidden */
  static HostIPv6: typeof UriHostIPv6; // defined by UriHostIPv6
  /** @hidden */
  static HostUndefined: typeof UriHostUndefined; // defined by UriHostUndefined
  /** @hidden */
  static Port: typeof UriPort; // defined by UriPort
  /** @hidden */
  static Path: typeof UriPath; // defined by UriPath
  /** @hidden */
  static PathSegment: typeof UriPathSegment; // defined by UriPathSegment
  /** @hidden */
  static PathSlash: typeof UriPathSlash; // defined by UriPathSlash
  /** @hidden */
  static PathEmpty: typeof UriPathEmpty; // defined by UriPathEmpty
  /** @hidden */
  static PathBuilder: typeof UriPathBuilder; // defined by UriPathBuilder
  /** @hidden */
  static Query: typeof UriQuery; // defined by UriQuery
  /** @hidden */
  static QueryParam: typeof UriQueryParam; // defined by UriQueryParam
  /** @hidden */
  static QueryUndefined: typeof UriQueryUndefined; // defined by UriQueryUndefined
  /** @hidden */
  static QueryBuilder: typeof UriQueryBuilder; // defined by UriQueryBuilder
  /** @hidden */
  static Fragment: typeof UriFragment; // defined by UriFragment
  /** @hidden */
  static Parser: typeof UriParser; // defined by UriParser
  /** @hidden */
  static Form: typeof UriForm; // defined by UriForm
  /** @hidden */
  static PathForm: typeof UriPathForm; // defined by UriPathForm

  private static _form?: Form<Uri>;

  static form(): Form<Uri> {
    if (Uri._form === void 0) {
      Uri._form = new Uri.Form(Uri.empty());
    }
    return Uri._form;
  }
}
