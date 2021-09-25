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
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";
import {AnyUriUser, UriUserInit, UriUser} from "./"; // forward import
import {AnyUriHost, UriHost} from "./"; // forward import
import {AnyUriPort, UriPort} from "./"; // forward import

export type AnyUriAuthority = UriAuthority | UriAuthorityInit | string;

export interface UriAuthorityInit extends UriUserInit {
  user?: AnyUriUser;
  host?: AnyUriHost;
  port?: AnyUriPort;
}

export class UriAuthority implements HashCode, Compare, Debug, Display {
  /** @hidden */
  constructor(user: UriUser, host: UriHost, port: UriPort) {
    this.user = user;
    this.host = host;
    this.port = port;
    this.hashValue = void 0;
    this.stringValue = void 0;
  }

  isDefined(): boolean {
    return this.user.isDefined() || this.host.isDefined() || this.port.isDefined();
  }

  readonly user: UriUser;

  withUser(user: AnyUriUser): UriAuthority {
    user = UriUser.fromAny(user);
    if (user !== this.user) {
      return this.copy(user as UriUser, this.host, this.port);
    } else {
      return this;
    }
  }

  get userPart(): string {
    return this.user.toString();
  }

  withUserPart(userPart: string): UriAuthority {
    return this.withUser(UriUser.parse(userPart));
  }

  get username(): string | undefined {
    return this.user.username;
  }

  withUsername(username: string | undefined, password?: string): UriAuthority {
    if (arguments.length === 1) {
      return this.withUser(this.user.withUsername(username));
    } else {
      return this.withUser(UriUser.create(username, password));
    }
  }

  get password(): string | undefined {
    return this.user.password;
  }

  withPassword(password: string | undefined): UriAuthority {
    return this.withUser(this.user.withPassword(password));
  }

  readonly host: UriHost;

  withHost(host: AnyUriHost): UriAuthority {
    host = UriHost.fromAny(host);
    if (host !== this.host) {
      return this.copy(this.user, host, this.port);
    } else {
      return this;
    }
  }

  get hostPart(): string {
    return this.host.toString();
  }

  withHostPart(hostPart: string): UriAuthority {
    return this.withHost(UriHost.parse(hostPart));
  }

  get hostAddress(): string {
    return this.host.address;
  }

  get hostName(): string | undefined {
    return this.host.name;
  }

  withHostName(hostName: string): UriAuthority {
    return this.withHost(UriHost.hostname(hostName));
  }

  get hostIPv4(): string | undefined {
    return this.host.ipv4;
  }

  withHostIPv4(hostIPv4: string): UriAuthority {
    return this.withHost(UriHost.ipv4(hostIPv4));
  }

  get hostIPv6(): string | undefined {
    return this.host.ipv6;
  }

  withHostIPv6(hostIPv5: string): UriAuthority {
    return this.withHost(UriHost.ipv6(hostIPv5));
  }

  readonly port: UriPort;

  withPort(port: AnyUriPort): UriAuthority {
    port = UriPort.fromAny(port);
    if (port !== this.port) {
      return this.copy(this.user, this.host, port);
    } else {
      return this;
    }
  }

  get portPart(): string {
    return this.port.toString();
  }

  withPortPart(portPart: string): UriAuthority {
    return this.withPort(UriPort.parse(portPart));
  }

  get portNumber(): number {
    return this.port.number;
  }

  withPortNumber(portNumber: number): UriAuthority {
    return this.withPort(UriPort.create(portNumber));
  }

  protected copy(user: UriUser, host: UriHost, port: UriPort): UriAuthority {
    return UriAuthority.create(user, host, port);
  }

  toAny(authority?: {username?: string, password?: string, host?: string, port?: number}):
      {username?: string, password?: string, host?: string, port?: number} | undefined {
    if (this.isDefined()) {
      if (authority === void 0) {
        authority = {};
      }
      this.user.toAny(authority);
      if (this.host.isDefined()) {
        authority.host = this.host.toAny();
      }
      if (this.port.isDefined()) {
        authority.port = this.port.toAny();
      }
    }
    return authority;
  }

  compareTo(that: unknown): number {
    if (that instanceof UriAuthority) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriAuthority) {
      return this.toString() === that.toString();
    }
    return false;
  }

  /** @hidden */
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
    output = output.write("UriAuthority").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/)
                     .display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  display<T>(output: Output<T>): Output<T> {
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else {
      const user = this.user;
      if (user.isDefined()) {
        output = output.display(user).write(64/*'@'*/);
      }
      output = output.display(this.host);
      const port = this.port;
      if (port.isDefined()) {
        output = output.write(58/*':'*/).display(port);
      }
    }
    return output;
  }

  /** @hidden */
  readonly stringValue: string | undefined;

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  @Lazy
  static undefined(): UriAuthority {
    return new UriAuthority(UriUser.undefined(), UriHost.undefined(), UriPort.undefined());
  }

  static create(user: UriUser = UriUser.undefined(),
                host: UriHost = UriHost.undefined(),
                port: UriPort = UriPort.undefined()): UriAuthority {
    if (user.isDefined() || host.isDefined() || port.isDefined()) {
      return new UriAuthority(user, host, port);
    } else {
      return UriAuthority.undefined();
    }
  }

  static fromInit(init: UriAuthorityInit): UriAuthority {
    const user = UriUser.fromAny(init.user !== void 0 ? init.user : init);
    const host = UriHost.fromAny(init.host);
    const port = UriPort.fromAny(init.port);
    return UriAuthority.create(user, host, port);
  }

  static fromAny(value: AnyUriAuthority | null | undefined): UriAuthority {
    if (value === void 0 || value === null) {
      return UriAuthority.undefined();
    } else if (value instanceof UriAuthority) {
      return value;
    } else if (typeof value === "object") {
      return UriAuthority.fromInit(value);
    } else if (typeof value === "string") {
      return UriAuthority.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static user(user: AnyUriUser): UriAuthority {
    user = UriUser.fromAny(user);
    return UriAuthority.create(user as UriUser, void 0, void 0);
  }

  static userPart(userPart: string): UriAuthority {
    const user = UriUser.parse(userPart);
    return UriAuthority.create(user, void 0, void 0);
  }

  static username(username: string, password?: string | undefined): UriAuthority {
    const user = UriUser.create(username, password);
    return UriAuthority.create(user, void 0, void 0);
  }

  static password(password: string): UriAuthority {
    const user = UriUser.create("", password);
    return UriAuthority.create(user, void 0, void 0);
  }

  static host(host: AnyUriHost): UriAuthority {
    host = UriHost.fromAny(host);
    return UriAuthority.create(void 0, host, void 0);
  }

  static hostPart(hostPart: string): UriAuthority {
    const host = UriHost.parse(hostPart);
    return UriAuthority.create(void 0, host, void 0);
  }

  static hostName(hostName: string): UriAuthority {
    const host = UriHost.hostname(hostName);
    return UriAuthority.create(void 0, host, void 0);
  }

  static hostIPv4(hostIPv4: string): UriAuthority {
    const host = UriHost.ipv4(hostIPv4);
    return UriAuthority.create(void 0, host, void 0);
  }

  static hostIPv6(hostIPv6: string): UriAuthority {
    const host = UriHost.ipv6(hostIPv6);
    return UriAuthority.create(void 0, host, void 0);
  }

  static port(port: AnyUriPort): UriAuthority {
    port = UriPort.fromAny(port);
    return UriAuthority.create(void 0, void 0, port);
  }

  static portPart(portPart: string): UriAuthority {
    const port = UriPort.parse(portPart);
    return UriAuthority.create(void 0, void 0, port);
  }

  static portNumber(portNumber: number): UriAuthority {
    const port = UriPort.create(portNumber);
    return UriAuthority.create(void 0, void 0, port);
  }

  static parse(authorityPart: string): UriAuthority {
    return Uri.standardParser.parseAuthorityString(authorityPart);
  }
}
