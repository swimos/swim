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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Uri} from "../Uri";
import {UriScheme} from "../UriScheme";
import {UriAuthority} from "../UriAuthority";
import {UriUser} from "../UriUser";
import {UriHost} from "../UriHost";
import {UriPort} from "../UriPort";
import {UriPath} from "../UriPath";
import {UriPathBuilder} from "../UriPathBuilder";
import type {UriQuery} from "../UriQuery";
import {UriQueryBuilder} from "../UriQueryBuilder";
import {UriFragment} from "../UriFragment";
import {UriAbsoluteParser} from "../"; // forward import
import {UriSchemeParser} from "../"; // forward import
import {UriAuthorityParser} from "../"; // forward import
import {UriUserParser} from "../"; // forward import
import {UriHostParser} from "../"; // forward import
import {UriHostAddressParser} from "../"; // forward import
import {UriHostLiteralParser} from "../"; // forward import
import {UriPortParser} from "../"; // forward import
import {UriPathParser} from "../"; // forward import
import {UriQueryParser} from "../"; // forward import
import {UriFragmentParser} from "../"; // forward import

/** @public */
export class UriParser {
  absolute(scheme?: UriScheme, authority?: UriAuthority, path?: UriPath,
           query?: UriQuery, fragment?: UriFragment): Uri {
    return Uri.create(scheme, authority, path, query, fragment);
  }

  scheme(name: string): UriScheme {
    return UriScheme.create(name);
  }

  authority(user?: UriUser, host?: UriHost, port?: UriPort): UriAuthority {
    return UriAuthority.create(user, host, port);
  }

  user(username: string | undefined, password?: string | undefined): UriUser {
    return UriUser.create(username, password);
  }

  hostName(address: string): UriHost {
    return UriHost.hostname(address);
  }

  hostIPv4(address: string): UriHost {
    return UriHost.ipv4(address);
  }

  hostIPv6(address: string): UriHost {
    return UriHost.ipv6(address);
  }

  port(number: number): UriPort {
    return UriPort.create(number);
  }

  pathEmpty(): UriPath {
    return UriPath.empty();
  }

  pathBuilder(): UriPathBuilder {
    return new UriPathBuilder();
  }

  queryBuilder(): UriQueryBuilder {
    return new UriQueryBuilder();
  }

  fragment(identifier: string | undefined): UriFragment {
    return UriFragment.create(identifier);
  }

  absoluteParser(): Parser<Uri> {
    return new UriAbsoluteParser(this);
  }

  parseAbsolute(input: Input): Parser<Uri> {
    return UriAbsoluteParser.parse(input, this);
  }

  parseAbsoluteString(string: string): Uri {
    const input = Unicode.stringInput(string);
    let parser = this.parseAbsolute(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  schemeParser(): Parser<UriScheme> {
    return new UriSchemeParser(this);
  }

  parseScheme(input: Input): Parser<UriScheme> {
    return UriSchemeParser.parse(input, this);
  }

  parseSchemeString(string: string): UriScheme {
    const input = Unicode.stringInput(string);
    let parser = this.parseScheme(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  authorityParser(): Parser<UriAuthority> {
    return new UriAuthorityParser(this);
  }

  parseAuthority(input: Input): Parser<UriAuthority> {
    return UriAuthorityParser.parse(input, this);
  }

  parseAuthorityString(string: string): UriAuthority {
    const input = Unicode.stringInput(string);
    let parser = this.parseAuthority(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  userParser(): Parser<UriUser> {
    return new UriUserParser(this);
  }

  parseUser(input: Input): Parser<UriUser> {
    return UriUserParser.parse(input, this);
  }

  parseUserString(string: string): UriUser {
    const input = Unicode.stringInput(string);
    let parser = this.parseUser(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  hostParser(): Parser<UriHost> {
    return new UriHostParser(this);
  }

  parseHost(input: Input): Parser<UriHost> {
    return UriHostParser.parse(input, this);
  }

  parseHostString(string: string): UriHost {
    const input = Unicode.stringInput(string);
    let parser = this.parseHost(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  hostAddressParser(): Parser<UriHost> {
    return new UriHostAddressParser(this);
  }

  parseHostAddress(input: Input): Parser<UriHost> {
    return UriHostAddressParser.parse(input, this);
  }

  hostLiteralParser(): Parser<UriHost> {
    return new UriHostLiteralParser(this);
  }

  parseHostLiteral(input: Input): Parser<UriHost> {
    return UriHostLiteralParser.parse(input, this);
  }

  portParser(): Parser<UriPort> {
    return new UriPortParser(this);
  }

  parsePort(input: Input): Parser<UriPort> {
    return UriPortParser.parse(input, this);
  }

  parsePortString(string: string): UriPort {
    const input = Unicode.stringInput(string);
    let parser = this.parsePort(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  pathParser(builder?: UriPathBuilder): Parser<UriPath> {
    return new UriPathParser(this, builder);
  }

  parsePath(input: Input, builder?: UriPathBuilder): Parser<UriPath> {
    return UriPathParser.parse(input, this, builder);
  }

  parsePathString(string: string): UriPath {
    const input = Unicode.stringInput(string);
    let parser = this.parsePath(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  queryParser(builder?: UriQueryBuilder): Parser<UriQuery> {
    return new UriQueryParser(this, builder);
  }

  parseQuery(input: Input, builder?: UriQueryBuilder): Parser<UriQuery> {
    return UriQueryParser.parse(input, this, builder);
  }

  parseQueryString(string: string): UriQuery {
    const input = Unicode.stringInput(string);
    let parser = this.parseQuery(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  fragmentParser(): Parser<UriFragment> {
    return new UriFragmentParser(this);
  }

  parseFragment(input: Input): Parser<UriFragment> {
    return UriFragmentParser.parse(input, this);
  }

  parseFragmentString(string: string): UriFragment {
    const input = Unicode.stringInput(string);
    let parser = this.parseFragment(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}
