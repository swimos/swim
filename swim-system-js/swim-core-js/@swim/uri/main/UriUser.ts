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

import {HashCode, Murmur3} from "@swim/util";
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriUser = UriUser | UriUserInit | string;

export interface UriUserInit {
  username?: string;
  password?: string | null;
}

export class UriUser implements HashCode, Debug, Display {
  /** @hidden */
  readonly _username: string | null;
  /** @hidden */
  readonly _password: string | null;

  /** @hidden */
  constructor(username: string | null, password: string | null) {
    this._username = username;
    this._password = password;
  }

  isDefined(): boolean {
    return this._username !== null;
  }

  username(): string;
  username(username: string): UriUser;
  username(username?: string): string | UriUser {
    if (username === void 0) {
      return this._username || "";
    } else {
      if (username !== this._username) {
        return this.copy(username, this._password);
      } else {
        return this;
      }
    }
  }

  password(): string | null;
  password(password: string | null): UriUser;
  password(password?: string | null): string | null | UriUser {
    if (password === void 0) {
      return this._password;
    } else {
      if (password !== this._password) {
        return this.copy(this._username, password);
      } else {
        return this;
      }
    }
  }

  protected copy(username: string | null, password: string | null): UriUser {
    return UriUser.from(username, password);
  }

  toAny(user?: {username?: string, password?: string}): {username?: string, password?: string} | undefined {
    if (this._username !== null) {
      user = user || {};
      user.username = this._username;
      if (this._password !== null) {
        user.password = this._password;
      }
    }
    return user;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriUser) {
      return this._username === that._username && this._password === that._password;
    }
    return false;
  }

  hashCode(): number {
    if (UriUser._hashSeed === void 0) {
      UriUser._hashSeed = Murmur3.seed(UriUser);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(UriUser._hashSeed,
        Murmur3.hash(this._username)), Murmur3.hash(this._password)));
  }

  debug(output: Output): void {
    output = output.write("UriUser").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    if (this._username !== null) {
      Uri.writeUser(this._username, output);
      if (this._password !== null) {
        output = output.write(58/*':'*/);
        Uri.writeUser(this._password, output);
      }
    }
  }

  toString(): string {
    return Format.display(this);
  }

  private static _hashSeed?: number;

  private static _undefined?: UriUser;

  static undefined(): UriUser {
    if (UriUser._undefined === void 0) {
      UriUser._undefined = new UriUser(null, null);
    }
    return UriUser._undefined;
  }

  static from(username: string | null, password: string | null = null): UriUser {
    if (username !== null || password !== null) {
      return new UriUser(username || "", password);
    } else {
      return UriUser.undefined();
    }
  }

  static fromAny(user: AnyUriUser | null | undefined): UriUser {
    if (user === null || user === void 0) {
      return UriUser.undefined();
    } else if (user instanceof UriUser) {
      return user;
    } else if (typeof user === "object") {
      const username = typeof user.username === "string" ? user.username : null;
      const password = typeof user.password === "string" ? user.password : null;
      return UriUser.from(username, password);
    } else if (typeof user === "string") {
      return UriUser.parse(user);
    } else {
      throw new TypeError("" + user);
    }
  }

  static parse(string: string): UriUser {
    return Uri.standardParser().parseUserString(string);
  }
}
Uri.User = UriUser;
