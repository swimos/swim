// Copyright 2015-2020 Swim inc.
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
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";
import {AnyUriUser, UriUserInit, UriUser} from "./UriUser";
import {AnyUriHost, UriHost} from "./UriHost";
import {AnyUriPort, UriPort} from "./UriPort";

export type AnyUriAuthority = UriAuthority | UriAuthorityInit | string;

export interface UriAuthorityInit extends UriUserInit {
  user?: AnyUriUser;
  host?: AnyUriHost;
  port?: AnyUriPort;
}

export class UriAuthority implements Comparable<UriAuthority>, HashCode, Debug, Display {
  /** @hidden */
  readonly _user: UriUser;
  /** @hidden */
  readonly _host: UriHost;
  /** @hidden */
  readonly _port: UriPort;
  /** @hidden */
  _string?: string;
  /** @hidden */
  _hashCode?: number;

  /** @hidden */
  constructor(user: UriUser, host: UriHost, port: UriPort) {
    this._user = user;
    this._host = host;
    this._port = port;
  }

  isDefined(): boolean {
    return this._user.isDefined() || this._host.isDefined() || this._port.isDefined();
  }

  user(): UriUser;
  user(user: AnyUriUser): UriAuthority;
  user(user?: AnyUriUser): UriUser | UriAuthority {
    if (user === void 0) {
      return this._user;
    } else {
      user = Uri.User.fromAny(user);
      if (user !== this._user) {
        return this.copy(user, this._host, this._port);
      } else {
        return this;
      }
    }
  }

  userPart(): string;
  userPart(user: string): UriAuthority;
  userPart(user?: string): string | UriAuthority {
    if (user === void 0) {
      return this._user.toString();
    } else {
      return this.user(Uri.User.parse(user));
    }
  }

  username(): string;
  username(username: string, password?: string | null): UriAuthority;
  username(username?: string, password?: string | null): string | UriAuthority {
    if (username === void 0) {
      return this._user._username || "";
    } else if (password === void 0) {
      return this.user(this._user.username(username));
    } else {
      return this.user(Uri.User.from(username, password));
    }
  }

  password(): string | null;
  password(password: string | null): UriAuthority;
  password(password?: string | null): string | null | UriAuthority {
    if (password === void 0) {
      return this._user.password();
    } else {
      return this.user(this._user.password(password));
    }
  }

  host(): UriHost;
  host(host: AnyUriHost): UriAuthority;
  host(host?: AnyUriHost): UriHost | UriAuthority {
    if (host === void 0) {
      return this._host;
    } else {
      host = Uri.Host.fromAny(host);
      if (host !== this._host) {
        return this.copy(this._user, host, this._port);
      } else {
        return this;
      }
    }
  }

  hostPart(): string;
  hostPart(host: string): UriAuthority;
  hostPart(host?: string): string | UriAuthority {
    if (host === void 0) {
      return this._host.toString();
    } else {
      return this.host(Uri.Host.parse(host));
    }
  }

  hostAddress(): string {
    return this._host.address();
  }

  hostName(): string | null;
  hostName(address: string): UriAuthority;
  hostName(address?: string): string | null | UriAuthority {
    if (address === void 0) {
      return this._host.name();
    } else {
      return this.host(Uri.Host.from(address));
    }
  }

  hostIPv4(): string | null;
  hostIPv4(address: string): UriAuthority;
  hostIPv4(address?: string): string | null | UriAuthority {
    if (address === void 0) {
      return this._host.ipv4();
    } else {
      return this.host(Uri.Host.ipv4(address));
    }
  }

  hostIPv6(): string | null;
  hostIPv6(address: string): UriAuthority;
  hostIPv6(address?: string): string | null | UriAuthority {
    if (address === void 0) {
      return this._host.ipv6();
    } else {
      return this.host(Uri.Host.ipv6(address));
    }
  }

  port(): UriPort;
  port(port: AnyUriPort): UriAuthority;
  port(port?: AnyUriPort): UriPort | UriAuthority {
    if (port === void 0) {
      return this._port;
    } else {
      port = Uri.Port.fromAny(port);
      if (port !== this._port) {
        return this.copy(this._user, this._host, port);
      } else {
        return this;
      }
    }
  }

  portPart(): string;
  portPart(port: string): UriAuthority;
  portPart(port?: string): string | UriAuthority {
    if (port === void 0) {
      return this._port.toString();
    } else {
      return this.port(Uri.Port.parse(port));
    }
  }

  portNumber(): number;
  portNumber(port: number): UriAuthority;
  portNumber(port?: number): number | UriAuthority {
    if (port === void 0) {
      return this._port.number();
    } else {
      return this.port(Uri.Port.from(port));
    }
  }

  protected copy(user: UriUser, host: UriHost, port: UriPort): UriAuthority {
    return UriAuthority.from(user, host, port);
  }

  toAny(authority?: {username?: string, password?: string, host?: string, port?: number}):
      {username?: string, password?: string, host?: string, port?: number} | undefined {
    if (this.isDefined()) {
      authority = authority || {};
      this._user.toAny(authority);
      if (this._host.isDefined()) {
        authority.host = this._host.toAny();
      }
      if (this._port.isDefined()) {
        authority.port = this._port.toAny();
      }
    }
    return authority;
  }

  compareTo(that: UriAuthority): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriAuthority) {
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
    output = output.write("UriAuthority").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    if (this._string !== void 0) {
      output = output.write(this._string);
    } else {
      if (this._user.isDefined()) {
        output.display(this._user).write(64/*'@'*/);
      }
      output.display(this._host);
      if (this._port.isDefined()) {
        output = output.write(58/*':'*/).display(this._port);
      }
    }
  }

  toString(): string {
    if (this._string === void 0) {
      this._string = Format.display(this);
    }
    return this._string;
  }

  private static _undefined?: UriAuthority;

  static undefined(): UriAuthority {
    if (UriAuthority._undefined === void 0) {
      UriAuthority._undefined = new UriAuthority(Uri.User.undefined(), Uri.Host.undefined(), Uri.Port.undefined());
    }
    return UriAuthority._undefined;
  }

  static from(user: UriUser = Uri.User.undefined(),
              host: UriHost = Uri.Host.undefined(),
              port: UriPort = Uri.Port.undefined()): UriAuthority {
    if (user.isDefined() || host.isDefined() || port.isDefined()) {
      return new UriAuthority(user, host, port);
    } else {
      return UriAuthority.undefined();
    }
  }

  static fromAny(authority: AnyUriAuthority | null | undefined): UriAuthority {
    if (authority === null || authority === void 0) {
      return UriAuthority.undefined();
    } else if (authority instanceof UriAuthority) {
      return authority;
    } else if (typeof authority === "object") {
      const user = Uri.User.fromAny(authority.user || authority);
      const host = Uri.Host.fromAny(authority.host);
      const port = Uri.Port.fromAny(authority.port);
      return UriAuthority.from(user, host, port);
    } else if (typeof authority === "string") {
      return UriAuthority.parse(authority);
    } else {
      throw new TypeError("" + authority);
    }
  }

  static user(user: AnyUriUser): UriAuthority {
    user = Uri.User.fromAny(user);
    return UriAuthority.from(user, void 0, void 0);
  }

  static userPart(part: string): UriAuthority {
    const user = Uri.User.parse(part);
    return UriAuthority.from(user, void 0, void 0);
  }

  static username(username: string, password?: string | null): UriAuthority {
    const user = Uri.User.from(username, password);
    return UriAuthority.from(user, void 0, void 0);
  }

  static password(password: string): UriAuthority {
    const user = Uri.User.from("", password);
    return UriAuthority.from(user, void 0, void 0);
  }

  static host(host: AnyUriHost): UriAuthority {
    host = Uri.Host.fromAny(host);
    return UriAuthority.from(void 0, host, void 0);
  }

  static hostPart(part: string): UriAuthority {
    const host = Uri.Host.parse(part);
    return UriAuthority.from(void 0, host, void 0);
  }

  static hostName(address: string): UriAuthority {
    const host = Uri.Host.from(address);
    return UriAuthority.from(void 0, host, void 0);
  }

  static hostIPv4(address: string): UriAuthority {
    const host = Uri.Host.ipv4(address);
    return UriAuthority.from(void 0, host, void 0);
  }

  static hostIPv6(address: string): UriAuthority {
    const host = Uri.Host.ipv6(address);
    return UriAuthority.from(void 0, host, void 0);
  }

  static port(port: AnyUriPort): UriAuthority {
    port = Uri.Port.fromAny(port);
    return UriAuthority.from(void 0, void 0, port);
  }

  static portPart(part: string): UriAuthority {
    const port = Uri.Port.parse(part);
    return UriAuthority.from(void 0, void 0, port);
  }

  static portNumber(number: number): UriAuthority {
    const port = Uri.Port.from(number);
    return UriAuthority.from(void 0, void 0, port);
  }

  static parse(string: string): UriAuthority {
    return Uri.standardParser().parseAuthorityString(string);
  }
}
Uri.Authority = UriAuthority;
