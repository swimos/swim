// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Strings} from "@swim/util";
import {Objects} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import type {Display} from "@swim/codec";
import {Format} from "@swim/codec";
import {Base16} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Utf8} from "@swim/codec";
import {Uri} from "./Uri";

/** @public */
export type UriUserLike = UriUser | UriUserInit | string;

/** @public */
export const UriUserLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriUserLike {
    return instance instanceof UriUser
        || UriUserInit[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export interface UriUserInit {
  /** @internal */
  readonly typeid?: "UriUserInit" | "UriAuthorityInit" | "UriInit";
  username?: string;
  password?: string;
}

/** @public */
export const UriUserInit = {
  [Symbol.hasInstance](instance: unknown): instance is UriUserInit {
    return Objects.hasAnyKey<UriUserInit>(instance, "username", "password");
  },
};

/** @public */
export class UriUser implements HashCode, Debug, Display {
  /** @internal */
  constructor(username: string | undefined, password: string | undefined) {
    this.username = username;
    this.password = password;
  }

  /** @internal */
  declare readonly typeid?: "UriUser";

  likeType?(like: UriUserInit | string): void;

  isDefined(): boolean {
    return this.username !== void 0;
  }

  readonly username: string | undefined;

  withUsername(username: string | undefined): UriUser {
    if (username === this.username) {
      return this;
    }
    return this.copy(username, this.password);
  }

  readonly password: string | undefined;

  withPassword(password: string | undefined): UriUser {
    if (password === this.password) {
      return this;
    }
    return this.copy(this.username, password);
  }

  protected copy(username: string | undefined, password: string | undefined): UriUser {
    return UriUser.create(username, password);
  }

  toLike(user?: {username?: string, password?: string}): {username?: string, password?: string} | undefined {
    if (this.username !== void 0) {
      if (user === void 0) {
        user = {};
      }
      user.username = this.username;
      if (this.password !== void 0) {
        user.password = this.password;
      }
    }
    return user;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriUser) {
      return this.username === that.username && this.password === that.password;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Strings.hash(this.toString());
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriUser").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/)
                     .display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  /** @override */
  display<T>(output: Output<T>): Output<T> {
    if (this.username !== void 0) {
      output = Uri.writeUser(output, this.username);
      if (this.password !== void 0) {
        output = output.write(58/*':'*/);
        output = Uri.writeUser(output, this.password);
      }
    }
    return output;
  }

  /** @override */
  toString(): string {
    return Format.display(this);
  }

  @Lazy
  static undefined(): UriUser {
    return new UriUser(void 0, void 0);
  }

  static create(username: string | undefined, password?: string | undefined): UriUser {
    if (username === void 0 && password === void 0) {
      return UriUser.undefined();
    }
    return new UriUser(username, password);
  }

  static fromInit(init: UriUserInit): UriUser {
    return UriUser.create(init.username, init.password);
  }

  static fromLike<T extends UriUserLike | null | undefined>(value: T): UriUser | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriUser) {
      return value as UriUser | Uninitable<T>;
    } else if (typeof value === "object") {
      return UriUser.fromInit(value);
    } else if (typeof value === "string") {
      return UriUser.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriUser>;
  static parse(string: string): UriUser;
  static parse(string: Input | string): Parser<UriUser> | UriUser {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriUserParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }
}

/** @internal */
export class UriUserParser extends Parser<UriUser> {
  private readonly usernameOutput: Output<string> | undefined;
  private readonly passwordOutput: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(usernameOutput?: Output<string>, passwordOutput?: Output<string>,
              c1?: number, step?: number) {
    super();
    this.usernameOutput = usernameOutput;
    this.passwordOutput = passwordOutput;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriUser> {
    return UriUserParser.parse(input, this.usernameOutput, this.passwordOutput,
                               this.c1, this.step);
  }

  static parse(input: Input, usernameOutput?: Output<string>, passwordOutput?: Output<string>,
               c1: number = 0, step: number = 1): Parser<UriUser> {
    let c = 0;
    do {
      if (step === 1) {
        usernameOutput = usernameOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isUserChar(c))) {
          input = input.step();
          usernameOutput!.write(c);
        }
        if (input.isCont() && c === 58/*':'*/) {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(UriUser.create(usernameOutput.bind()));
        }
      }
      if (step === 2) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 3) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          usernameOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 4) {
        passwordOutput = passwordOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isUserInfoChar(c))) {
          input = input.step();
          passwordOutput.write(c);
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          return Parser.done(UriUser.create(usernameOutput!.bind(), passwordOutput.bind()));
        }
      }
      if (step === 5) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 6) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          passwordOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 4;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriUserParser(usernameOutput, passwordOutput, c1, step);
  }
}
