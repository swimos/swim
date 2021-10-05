// Copyright 2015-2021 Swim Inc.
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

import {Lazy, HashCode, Compare, Mutable, Strings} from "@swim/util";
import {Output, Format, Debug, Display, Base16} from "@swim/codec";
import type {Form} from "@swim/structure";
import {UriException} from "./UriException";
import {AnyUriScheme, UriScheme} from "./"; // forward import
import {AnyUriAuthority, UriAuthorityInit, UriAuthority} from "./"; // forward import
import type {AnyUriUser, UriUser} from "./UriUser";
import type {AnyUriHost, UriHost} from "./UriHost";
import type {AnyUriPort, UriPort} from "./UriPort";
import {AnyUriPath, UriPath} from "./"; // forward import
import {UriPathBuilder} from "./"; // forward import
import {AnyUriQuery, UriQuery} from "./"; // forward import
import {UriQueryBuilder} from "./"; // forward import
import {AnyUriFragment, UriFragment} from "./"; // forward import
import {UriForm} from "./"; // forward import
import {UriParser} from "./"; // forward import

export type AnyUri = Uri | UriInit | string;

export interface UriInit extends UriAuthorityInit {
  scheme?: AnyUriScheme;
  authority?: AnyUriAuthority;
  path?: AnyUriPath;
  query?: AnyUriQuery;
  fragment?: AnyUriFragment;
}

export class Uri implements HashCode, Compare, Debug, Display {
  /** @internal */
  constructor(scheme: UriScheme, authority: UriAuthority, path: UriPath,
              query: UriQuery, fragment: UriFragment) {
    this.scheme = scheme;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
    this.hashValue = void 0;
    this.stringValue = void 0;
  }

  isDefined(): boolean {
    return this.scheme.isDefined() || this.authority.isDefined() || this.path.isDefined()
        || this.query.isDefined() || this.fragment.isDefined();
  }

  isEmpty(): boolean {
    return !this.scheme.isDefined() && !this.authority.isDefined() && this.path.isEmpty()
        && !this.query.isDefined() && !this.fragment.isDefined();
  }

  readonly scheme: UriScheme;

  withScheme(scheme: AnyUriScheme): Uri {
    scheme = UriScheme.fromAny(scheme);
    if (scheme !== this.scheme) {
      return this.copy(scheme, this.authority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  get schemePart(): string {
    return this.scheme.toString();
  }

  withSchemePart(schemePart: string): Uri {
    return this.withScheme(UriScheme.parse(schemePart));
  }

  get schemeName(): string {
    return this.scheme.name;
  }

  withSchemeName(schemeName: string): Uri {
    return this.withScheme(UriScheme.create(schemeName));
  }

  readonly authority: UriAuthority;

  withAuthority(authority: AnyUriAuthority): Uri {
    authority = UriAuthority.fromAny(authority);
    if (authority !== this.authority) {
      return this.copy(this.scheme, authority as UriAuthority, this.path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  get authorityPart(): string {
    return this.authority.toString();
  }

  withAuthorityPart(authorityPart: string): Uri {
    return this.withAuthority(UriAuthority.parse(authorityPart));
  }

  get user(): UriUser {
    return this.authority.user;
  }

  withUser(user: AnyUriUser): Uri {
    return this.withAuthority(this.authority.withUser(user));
  }

  get userPart(): string {
    return this.authority.userPart;
  }

  withUserPart(userPart: string): Uri {
    return this.withAuthority(this.authority.withUserPart(userPart));
  }

  get username(): string | undefined {
    return this.authority.username;
  }

  withUsername(username: string | undefined, password?: string): Uri {
    if (arguments.length === 1) {
      return this.withAuthority(this.authority.withUsername(username));
    } else {
      return this.withAuthority(this.authority.withUsername(username, password));
    }
  }

  get password(): string | undefined {
    return this.authority.password;
  }

  withPassword(password: string | undefined): Uri {
    return this.withAuthority(this.authority.withPassword(password));
  }

  get host(): UriHost {
    return this.authority.host;
  }

  withHost(host: AnyUriHost): Uri {
    return this.withAuthority(this.authority.withHost(host));
  }

  get hostPart(): string {
    return this.authority.hostPart;
  }

  withHostPart(hostPart: string): Uri {
    return this.withAuthority(this.authority.withHostPart(hostPart));
  }

  get hostAddress(): string {
    return this.authority.hostAddress;
  }

  get hostName(): string | undefined {
    return this.authority.hostName;
  }

  withHostName(hostName: string): Uri {
    return this.withAuthority(this.authority.withHostName(hostName));
  }

  get hostIPv4(): string | undefined {
    return this.authority.hostIPv4;
  }

  withHostIPv4(hostIPv4: string): Uri {
    return this.withAuthority(this.authority.withHostIPv4(hostIPv4));
  }

  get hostIPv6(): string | undefined {
    return this.authority.hostIPv6;
  }

  withHostIPv6(hostIPv6: string): Uri {
    return this.withAuthority(this.authority.withHostIPv6(hostIPv6));
  }

  get port(): UriPort {
    return this.authority.port;
  }

  withPort(port: AnyUriPort): Uri {
    return this.withAuthority(this.authority.withPort(port));
  }

  get portPart(): string {
    return this.authority.portPart;
  }

  withPortPart(portPart: string): Uri {
    return this.withAuthority(this.authority.withPortPart(portPart));
  }

  get portNumber(): number {
    return this.authority.portNumber;
  }

  withPortNumber(portNumber: number): Uri {
    return this.withAuthority(this.authority.withPortNumber(portNumber));
  }

  readonly path: UriPath;

  withPath(...components: AnyUriPath[]): Uri {
    const path = UriPath.of(...components);
    if (path !== this.path) {
      return this.copy(this.scheme, this.authority, path, this.query, this.fragment);
    } else {
      return this;
    }
  }

  get pathPart(): string {
    return this.path.toString();
  }

  withPathPart(pathPart: string): Uri {
    return this.withPath(UriPath.parse(pathPart));
  }

  get pathName(): string {
    return this.path.name;
  }

  withPathName(pathName: string): Uri {
    return this.withPath(this.path.withName(pathName));
  }

  parentPath(): UriPath {
    return this.path.parent();
  }

  basePath(): UriPath {
    return this.path.base();
  }

  parent(): Uri {
    return Uri.create(this.scheme, this.authority, this.path.parent());
  }

  base(): Uri {
    return Uri.create(this.scheme, this.authority, this.path.base());
  }

  appendedPath(...components: AnyUriPath[]): Uri {
    return this.withPath(this.path.appended(...components));
  }

  appendedSlash(): Uri {
    return this.withPath(this.path.appendedSlash());
  }

  appendedSegment(segment: string): Uri {
    return this.withPath(this.path.appendedSegment(segment));
  }

  prependedPath(...components: AnyUriPath[]): Uri {
    return this.withPath(this.path.prepended(...components));
  }

  prependedSlash(): Uri {
    return this.withPath(this.path.prependedSlash());
  }

  prependedSegment(segment: string): Uri {
    return this.withPath(this.path.prependedSegment(segment));
  }

  readonly query: UriQuery;

  withQuery(query: AnyUriQuery): Uri {
    query = UriQuery.fromAny(query);
    if (query !== this.query) {
      return this.copy(this.scheme, this.authority, this.path, query, this.fragment);
    } else {
      return this;
    }
  }

  get queryPart(): string {
    return this.query.toString();
  }

  withQueryPart(query: string): Uri {
    return this.withQuery(UriQuery.parse(query));
  }

  updatedQuery(key: string, value: string): Uri {
    return this.withQuery(this.query.updated(key, value));
  }

  removedQuery(key: string): Uri {
    return this.withQuery(this.query.removed(key));
  }

  appendedQuery(key: string | undefined, value: string): Uri;
  appendedQuery(params: AnyUriQuery): Uri;
  appendedQuery(key: AnyUriQuery | undefined, value?: string): Uri {
    return this.withQuery(this.query.appended(key as any, value as any));
  }

  prependedQuery(key: string | undefined, value: string): Uri;
  prependedQuery(params: AnyUriQuery): Uri;
  prependedQuery(key: AnyUriQuery | undefined, value?: string): Uri {
    return this.withQuery(this.query.prepended(key as any, value as any));
  }

  readonly fragment: UriFragment;

  withFragment(fragment: AnyUriFragment): Uri {
    fragment = UriFragment.fromAny(fragment);
    if (fragment !== this.fragment) {
      return Uri.create(this.scheme, this.authority, this.path, this.query, fragment);
    } else {
      return this;
    }
  }

  get fragmentPart(): string {
    return this.fragment.toString();
  }

  withFragmentPart(fragmentPart: string): Uri {
    return this.withFragment(UriFragment.parse(fragmentPart));
  }

  get fragmentIdentifier(): string | undefined {
    return this.fragment.identifier;
  }

  withFragmentIdentifier(fragmentIdentifier: string | undefined): Uri {
    return this.withFragment(UriFragment.create(fragmentIdentifier));
  }

  endpoint(): Uri {
    if (this.path.isDefined() || this.query.isDefined() || this.fragment.isDefined()) {
      return Uri.create(this.scheme, this.authority);
    } else {
      return this;
    }
  }

  resolve(relative: AnyUri): Uri {
    const that = Uri.fromAny(relative);
    if (that.scheme.isDefined()) {
      return this.copy(that.scheme,
                       that.authority,
                       that.path.removeDotSegments(),
                       that.query,
                       that.fragment);
    } else if (that.authority.isDefined()) {
      return this.copy(this.scheme,
                       that.authority,
                       that.path.removeDotSegments(),
                       that.query,
                       that.fragment);
    } else if (that.path.isEmpty()) {
      return this.copy(this.scheme,
                       this.authority,
                       this.path,
                       that.query.isDefined() ? that.query : this.query,
                       that.fragment);
    } else if (that.path.isAbsolute()) {
      return this.copy(this.scheme,
                       this.authority,
                       that.path.removeDotSegments(),
                       that.query,
                       that.fragment);
    } else {
      return this.copy(this.scheme,
                       this.authority,
                       this.merge(that.path).removeDotSegments(),
                       that.query,
                       that.fragment);
    }
  }

  /** @internal */
  merge(relative: UriPath): UriPath {
    if (this.authority.isDefined() && this.path.isEmpty()) {
      return relative.prependedSlash();
    } else if (this.path.isEmpty()) {
      return relative;
    } else {
      return this.path.merge(relative);
    }
  }

  unresolve(absolute: AnyUri): Uri {
    const that = Uri.fromAny(absolute);
    if (!this.scheme.equals(that.scheme) || !this.authority.equals(that.authority)) {
      return that;
    } else {
      return Uri.create(UriScheme.undefined(),
                        UriAuthority.undefined(),
                        this.path.unmerge(that.path),
                        that.query,
                        that.fragment);
    }
  }

  protected copy(scheme: UriScheme, authority: UriAuthority, path: UriPath,
                 query: UriQuery, fragment: UriFragment): Uri {
    return Uri.create(scheme, authority, path, query, fragment);
  }

  toAny(): {scheme?: string, username?: string, password?: string, host?: string,
            port?: number, path: string[], query?: {[key: string]: string},
            fragment?: string} {
    const uri = {} as {scheme?: string, username?: string, password?: string, host?: string,
                       port?: number, path: string[], query?: {[key: string]: string},
                       fragment?: string};
    uri.scheme = this.scheme.toAny();
    this.authority.toAny(uri);
    uri.path = this.path.toAny();
    uri.query = this.query.toAny();
    uri.fragment = this.fragment.toAny();
    return uri;
  }

  compareTo(that: Uri): number {
    if (that instanceof Uri) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Uri) {
      return this.toString() === that.toString();
    }
    return false;
  }

  /** @internal */
  readonly hashValue: number | undefined;

  hashCode(): number {
    let hashValue = this.hashValue;
    if (hashValue === void 0) {
      hashValue = Strings.hash(this.toString());
      (this as Mutable<this>).hashValue = hashValue;
    }
    return hashValue;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("Uri").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  display<T>(output: Output<T>): Output<T> {
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else {
      if (this.scheme.isDefined()) {
        output = output.display(this.scheme).write(58/*':'*/);
      }
      if (this.authority.isDefined()) {
        output = output.write(47/*'/'*/).write(47/*'/'*/).display(this.authority);
      }
      output = output.display(this.path);
      if (this.query.isDefined()) {
        output = output.write(63/*'?'*/).display(this.query);
      }
      if (this.fragment.isDefined()) {
        output = output.write(35/*'#'*/).display(this.fragment);
      }
    }
    return output;
  }

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  @Lazy
  static empty(): Uri {
    return new Uri(UriScheme.undefined(), UriAuthority.undefined(), UriPath.empty(),
                   UriQuery.undefined(), UriFragment.undefined());
  }

  static create(scheme: UriScheme = UriScheme.undefined(),
                authority: UriAuthority = UriAuthority.undefined(),
                path: UriPath = UriPath.empty(),
                query: UriQuery = UriQuery.undefined(),
                fragment: UriFragment = UriFragment.undefined()): Uri {
    if (scheme.isDefined() || authority.isDefined() || path.isDefined() ||
        query.isDefined() || fragment.isDefined()) {
      return new Uri(scheme, authority, path, query, fragment);
    } else {
      return Uri.empty();
    }
  }

  static fromInit(init: UriInit): Uri {
    const scheme = UriScheme.fromAny(init.scheme);
    const authority = UriAuthority.fromAny(init.authority !== void 0 ? init.authority : init);
    const path = UriPath.fromAny(init.path);
    const query = UriQuery.fromAny(init.query);
    const fragment = UriFragment.fromAny(init.fragment);
    if (scheme.isDefined() || authority.isDefined() || path.isDefined() ||
        query.isDefined() || fragment.isDefined()) {
      return new Uri(scheme, authority, path, query, fragment);
    } else {
      return Uri.empty();
    }
  }

  static fromAny(value: AnyUri | null | undefined): Uri {
    if (value === void 0 || value === null) {
      return Uri.empty();
    } else if (value instanceof Uri) {
      return value;
    } else if (typeof value === "object") {
      return Uri.fromInit(value);
    } else if (typeof value === "string") {
      return Uri.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static scheme(scheme: AnyUriScheme): Uri {
    scheme = UriScheme.fromAny(scheme);
    return Uri.create(scheme, void 0, void 0, void 0, void 0);
  }

  static schemePart(schemePart: string): Uri {
    const scheme = UriScheme.parse(schemePart);
    return Uri.create(scheme, void 0, void 0, void 0, void 0);
  }

  static schemeName(name: string): Uri {
    const scheme = UriScheme.create(name);
    return Uri.create(scheme, void 0, void 0, void 0, void 0);
  }

  static authority(authority: AnyUriAuthority): Uri {
    authority = UriAuthority.fromAny(authority);
    return Uri.create(void 0, authority as UriAuthority, void 0, void 0, void 0);
  }

  static authorityPart(authorityPart: string): Uri {
    const authority = UriAuthority.parse(authorityPart);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static user(user: AnyUriUser): Uri {
    const authority = UriAuthority.user(user);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static userPart(userPart: string): Uri {
    const authority = UriAuthority.userPart(userPart);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static username(username: string, password?: string): Uri {
    const authority = UriAuthority.username(username, password);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static password(password: string): Uri {
    const authority = UriAuthority.password(password);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static host(host: AnyUriHost): Uri {
    const authority = UriAuthority.host(host);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static hostPart(hostPart: string): Uri {
    const authority = UriAuthority.hostPart(hostPart);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static hostName(hostName: string): Uri {
    const authority = UriAuthority.hostName(hostName);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static hostIPv4(hostIPv4: string): Uri {
    const authority = UriAuthority.hostIPv4(hostIPv4);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static hostIPv6(hostIPv6: string): Uri {
    const authority = UriAuthority.hostIPv6(hostIPv6);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static port(port: AnyUriPort): Uri {
    const authority = UriAuthority.port(port);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static portPart(portPart: string): Uri {
    const authority = UriAuthority.portPart(portPart);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static portNumber(portNumber: number): Uri {
    const authority = UriAuthority.portNumber(portNumber);
    return Uri.create(void 0, authority, void 0, void 0, void 0);
  }

  static path(...components: AnyUriPath[]): Uri {
    const path = UriPath.of(...components);
    return Uri.create(void 0, void 0, path, void 0, void 0);
  }

  static pathPart(pathPart: string): Uri {
    const path = UriPath.parse(pathPart);
    return Uri.create(void 0, void 0, path, void 0, void 0);
  }

  static query(query: AnyUriQuery): Uri {
    query = UriQuery.fromAny(query);
    return Uri.create(void 0, void 0, void 0, query, void 0);
  }

  static queryPart(queryPart: string): Uri {
    const query = UriQuery.parse(queryPart);
    return Uri.create(void 0, void 0, void 0, query, void 0);
  }

  static fragment(fragment: AnyUriFragment): Uri {
    fragment = UriFragment.fromAny(fragment);
    return Uri.create(void 0, void 0, void 0, void 0, fragment);
  }

  static fragmentPart(fragmentPart: string): Uri {
    const fragment = UriFragment.parse(fragmentPart);
    return Uri.create(void 0, void 0, void 0, void 0, fragment);
  }

  static fragmentIdentifier(fragmentIdentifier: string | undefined): Uri {
    const fragment = UriFragment.create(fragmentIdentifier);
    return Uri.create(void 0, void 0, void 0, void 0, fragment);
  }

  @Lazy
  static get standardParser(): UriParser {
    return new UriParser();
  }

  static parse(string: string): Uri {
    return Uri.standardParser.parseAbsoluteString(string);
  }

  static pathBuilder(): UriPathBuilder {
    return new UriPathBuilder();
  }

  static queryBuilder(): UriQueryBuilder {
    return new UriQueryBuilder();
  }

  @Lazy
  static form(): Form<Uri, AnyUri> {
    return new UriForm(Uri.empty());
  }

  /** @internal */
  static isUnreservedChar(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c === 45/*'-'*/ || c === 46/*'.'*/
        || c === 95/*'_'*/ || c === 126/*'~'*/;
  }

  /** @internal */
  static isSubDelimChar(c: number): boolean {
    return c === 33/*'!'*/ || c === 36/*'$'*/
        || c === 38/*'&'*/ || c === 40/*'('*/
        || c === 41/*')'*/ || c === 42/*'*'*/
        || c === 43/*'+'*/ || c === 44/*','*/
        || c === 59/*';'*/ || c === 61/*'='*/
        || c === 39/*'\''*/;
  }

  /** @internal */
  static isSchemeChar(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c === 43/*'+'*/ || c === 45/*'-'*/
        || c === 46/*'.'*/;
  }

  /** @internal */
  static isUserInfoChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 58/*':'*/;
  }

  /** @internal */
  static isUserChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c);
  }

  /** @internal */
  static isHostChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c);
  }

  /** @internal */
  static isPathChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 58/*':'*/ || c === 64/*'@'*/;
  }

  /** @internal */
  static isQueryChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 47/*'/'*/ || c === 58/*':'*/
        || c === 63/*'?'*/ || c === 64/*'@'*/;
  }

  /** @internal */
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

  /** @internal */
  static isFragmentChar(c: number): boolean {
    return Uri.isUnreservedChar(c)
        || Uri.isSubDelimChar(c)
        || c === 47/*'/'*/ || c === 58/*':'*/
        || c === 63/*'?'*/ || c === 64/*'@'*/;
  }

  /** @internal */
  static isAlpha(c: number): boolean {
    return c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/;
  }

  /** @internal */
  static toLowerCase(c: number): number {
    if (c >= 65/*'A'*/ && c <= 90/*'Z'*/) {
      return c + (97/*'a'*/ - 65/*'A'*/);
    } else {
      return c;
    }
  }

  /** @internal */
  static writeScheme<T>(output: Output<T>, scheme: string): Output<T> {
    for (let i = 0, n = scheme.length; i < n; i += 1) {
      const c = scheme.charCodeAt(i);
      if (i > 0 && Uri.isSchemeChar(c) || i === 0 && Uri.isAlpha(c)) {
        output = output.write(c);
      } else {
        output = Output.error(new UriException("Invalid scheme: " + scheme));
      }
    }
    return output;
  }

  /** @internal */
  static writeUserInfo<T>(output: Output<T>, userInfo: string): Output<T> {
    for (let i = 0, n = userInfo.length; i < n; i += 1) {
      const c = userInfo.charCodeAt(i);
      if (Uri.isUserInfoChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeUser<T>(output: Output<T>, user: string): Output<T> {
    for (let i = 0, n = user.length; i < n; i += 1) {
      const c = user.charCodeAt(i);
      if (Uri.isUserChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeHost<T>(output: Output<T>, address: string): Output<T> {
    for (let i = 0, n = address.length; i < n; i += 1) {
      const c = address.charCodeAt(i);
      if (Uri.isHostChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeHostLiteral<T>(output: Output<T>, address: string): Output<T> {
    for (let i = 0, n = address.length; i < n; i += 1) {
      const c = address.charCodeAt(i);
      if (Uri.isHostChar(c) || c === 58/*':'*/) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writePathSegment<T>(output: Output<T>, segment: string): Output<T> {
    for (let i = 0, n = segment.length; i < n; i += 1) {
      const c = segment.charCodeAt(i);
      if (Uri.isPathChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeQuery<T>(output: Output<T>, query: string): Output<T> {
    for (let i = 0, n = query.length; i < n; i += 1) {
      const c = query.charCodeAt(i);
      if (Uri.isQueryChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeParam<T>(output: Output<T>, param: string): Output<T> {
    for (let i = 0, n = param.length; i < n; i += 1) {
      const c = param.charCodeAt(i);
      if (Uri.isParamChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeFragment<T>(output: Output<T>, fragment: string): Output<T> {
    for (let i = 0, n = fragment.length; i < n; i += 1) {
      const c = fragment.charCodeAt(i);
      if (Uri.isFragmentChar(c)) {
        output = output.write(c);
      } else {
        output = Uri.writeEncoded(output, c);
      }
    }
    return output;
  }

  /** @internal */
  static writeEncoded<T>(output: Output<T>, c: number): Output<T> {
    if (c === 0x00) { // modified UTF-8
      output = Uri.writePctEncoded(output, 0xC0);
      output = Uri.writePctEncoded(output, 0x80);
    } else if (c >= 0x00 && c <= 0x7F) { // U+0000..U+007F
      output = Uri.writePctEncoded(output, c);
    } else if (c >= 0x80 && c <= 0x07FF) { // U+0080..U+07FF
      output = Uri.writePctEncoded(output, 0xC0 | (c >>> 6));
      output = Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else if (c >= 0x0800 && c <= 0xFFFF) { // U+0800..U+D7FF, U+E000..U+FFFF, and surrogates
      output = Uri.writePctEncoded(output, 0xE0 | (c >>> 12));
      output = Uri.writePctEncoded(output, 0x80 | (c >>> 6 & 0x3F));
      output = Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else if (c >= 0x10000 && c <= 0x10FFFF) { // U+10000..U+10FFFF
      output = Uri.writePctEncoded(output, 0xF0 | (c >>> 18));
      output = Uri.writePctEncoded(output, 0x80 | (c >>> 12 & 0x3F));
      output = Uri.writePctEncoded(output, 0x80 | (c >>> 6 & 0x3F));
      output = Uri.writePctEncoded(output, 0x80 | (c & 0x3F));
    } else { // surrogate or invalid code point
      output = Uri.writePctEncoded(output, 0xEF);
      output = Uri.writePctEncoded(output, 0xBF);
      output = Uri.writePctEncoded(output, 0xBD);
    }
    return output;
  }

  /** @internal */
  static writePctEncoded<T>(output: Output<T>, c: number): Output<T> {
    const base16 = Base16.lowercase;
    output = output.write(37/*'%'*/)
                   .write(base16.encodeDigit(c >>> 4 & 0xF))
                   .write(base16.encodeDigit(c       & 0xF));
    return output;
  }
}
