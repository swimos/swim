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

import {Input, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Uri} from "./Uri";
import {UriScheme} from "./UriScheme";
import {UriAuthority} from "./UriAuthority";
import {UriUser} from "./UriUser";
import {UriHost} from "./UriHost";
import {UriPort} from "./UriPort";
import {UriPath} from "./UriPath";
import {UriPathBuilder} from "./UriPathBuilder";
import {UriQuery} from "./UriQuery";
import {UriQueryBuilder} from "./UriQueryBuilder";
import {UriFragment} from "./UriFragment";
import {UriAbsoluteParser} from "./UriAbsoluteParser";
import {UriSchemeParser} from "./UriSchemeParser";
import {UriAuthorityParser} from "./UriAuthorityParser";
import {UriUserParser} from "./UriUserParser";
import {UriHostParser} from "./UriHostParser";
import {UriHostAddressParser} from "./UriHostAddressParser";
import {UriHostLiteralParser} from "./UriHostLiteralParser";
import {UriPortParser} from "./UriPortParser";
import {UriPathParser} from "./UriPathParser";
import {UriQueryParser} from "./UriQueryParser";
import {UriFragmentParser} from "./UriFragmentParser";

export class UriParser {
  absolute(scheme?: UriScheme, authority?: UriAuthority, path?: UriPath,
           query?: UriQuery, fragment?: UriFragment): Uri {
    return Uri.from(scheme, authority, path, query, fragment);
  }

  scheme(name: string): UriScheme {
    return Uri.Scheme.from(name);
  }

  authority(user?: UriUser, host?: UriHost, port?: UriPort): UriAuthority {
    return Uri.Authority.from(user, host, port);
  }

  user(username: string | null, password?: string | null): UriUser {
    return Uri.User.from(username, password);
  }

  hostName(address: string): UriHost {
    return Uri.Host.from(address);
  }

  hostIPv4(address: string): UriHost {
    return Uri.Host.ipv4(address);
  }

  hostIPv6(address: string): UriHost {
    return Uri.Host.ipv6(address);
  }

  port(number: number): UriPort {
    return Uri.Port.from(number);
  }

  pathEmpty(): UriPath {
    return Uri.Path.empty();
  }

  pathBuilder(): UriPathBuilder {
    return new Uri.PathBuilder();
  }

  queryBuilder(): UriQueryBuilder {
    return new Uri.QueryBuilder();
  }

  fragment(identifier: string | null): UriFragment {
    return Uri.Fragment.from(identifier);
  }

  absoluteParser(): Parser<Uri> {
    return new UriParser.AbsoluteParser(this);
  }

  parseAbsolute(input: Input): Parser<Uri> {
    return UriParser.AbsoluteParser.parse(input, this);
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
    return new UriParser.SchemeParser(this);
  }

  parseScheme(input: Input): Parser<UriScheme> {
    return UriParser.SchemeParser.parse(input, this);
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
    return new UriParser.AuthorityParser(this);
  }

  parseAuthority(input: Input): Parser<UriAuthority> {
    return UriParser.AuthorityParser.parse(input, this);
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
    return new UriParser.UserParser(this);
  }

  parseUser(input: Input): Parser<UriUser> {
    return UriParser.UserParser.parse(input, this);
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
    return new UriParser.HostParser(this);
  }

  parseHost(input: Input): Parser<UriHost> {
    return UriParser.HostParser.parse(input, this);
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
    return new UriParser.HostAddressParser(this);
  }

  parseHostAddress(input: Input): Parser<UriHost> {
    return UriParser.HostAddressParser.parse(input, this);
  }

  hostLiteralParser(): Parser<UriHost> {
    return new UriParser.HostLiteralParser(this);
  }

  parseHostLiteral(input: Input): Parser<UriHost> {
    return UriParser.HostLiteralParser.parse(input, this);
  }

  portParser(): Parser<UriPort> {
    return new UriParser.PortParser(this);
  }

  parsePort(input: Input): Parser<UriPort> {
    return UriParser.PortParser.parse(input, this);
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
    return new UriParser.PathParser(this, builder);
  }

  parsePath(input: Input, builder?: UriPathBuilder): Parser<UriPath> {
    return UriParser.PathParser.parse(input, this, builder);
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
    return new UriParser.QueryParser(this, builder);
  }

  parseQuery(input: Input, builder?: UriQueryBuilder): Parser<UriQuery> {
    return UriParser.QueryParser.parse(input, this, builder);
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
    return new UriParser.FragmentParser(this);
  }

  parseFragment(input: Input): Parser<UriFragment> {
    return UriParser.FragmentParser.parse(input, this);
  }

  parseFragmentString(string: string): UriFragment {
    const input = Unicode.stringInput(string);
    let parser = this.parseFragment(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  // Forward type declarations
  /** @hidden */
  static AbsoluteParser: typeof UriAbsoluteParser; // defined by UriAbsoluteParser
  /** @hidden */
  static SchemeParser: typeof UriSchemeParser; // defined by UriSchemeParser
  /** @hidden */
  static AuthorityParser: typeof UriAuthorityParser; // defined by UriAuthorityParser
  /** @hidden */
  static UserParser: typeof UriUserParser; // defined by UriUserParser
  /** @hidden */
  static HostParser: typeof UriHostParser; // defined by UriHostParser
  /** @hidden */
  static HostAddressParser: typeof UriHostAddressParser; // defined by UriHostAddressParser
  /** @hidden */
  static HostLiteralParser: typeof UriHostLiteralParser; // defined by UriHostLiteralParser
  /** @hidden */
  static PortParser: typeof UriPortParser; // defined by UriPortParser
  /** @hidden */
  static PathParser: typeof UriPathParser; // defined by UriPathParser
  /** @hidden */
  static QueryParser: typeof UriQueryParser; // defined by UriQueryParser
  /** @hidden */
  static FragmentParser: typeof UriFragmentParser; // defined by UriFragmentParser
}
Uri.Parser = UriParser;
