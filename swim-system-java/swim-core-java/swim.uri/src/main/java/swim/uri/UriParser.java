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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Unicode;

public class UriParser {

  public Uri absolute(UriScheme scheme, UriAuthority authority, UriPath path,
                      UriQuery query, UriFragment fragment) {
    return Uri.from(scheme, authority, path, query, fragment);
  }

  public UriScheme scheme(String name) {
    return UriScheme.from(name);
  }

  public UriAuthority authority(UriUser user, UriHost host, UriPort port) {
    return UriAuthority.from(user, host, port);
  }

  public UriUser user(String username, String password) {
    return UriUser.from(username, password);
  }

  public UriHost hostName(String address) {
    return UriHost.name(address);
  }

  public UriHost hostIPv4(String address) {
    return UriHost.ipv4(address);
  }

  public UriHost hostIPv6(String address) {
    return UriHost.ipv6(address);
  }

  public UriPort port(int number) {
    return UriPort.from(number);
  }

  public UriPath pathEmpty() {
    return UriPath.empty();
  }

  public UriPathBuilder pathBuilder() {
    return new UriPathBuilder();
  }

  public UriQueryBuilder queryBuilder() {
    return new UriQueryBuilder();
  }

  public UriFragment fragment(String identifier) {
    return UriFragment.from(identifier);
  }

  public Parser<Uri> absoluteParser() {
    return new UriAbsoluteParser(this);
  }

  public Parser<Uri> parseAbsolute(Input input) {
    return UriAbsoluteParser.parse(input, this);
  }

  public Uri parseAbsoluteString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<Uri> parser = parseAbsolute(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    if (!parser.isDone()) {
      System.out.println(parser);
    }
    return parser.bind();
  }

  public Parser<UriScheme> schemeParser() {
    return new UriSchemeParser(this);
  }

  public Parser<UriScheme> parseScheme(Input input) {
    return UriSchemeParser.parse(input, this);
  }

  public UriScheme parseSchemeString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriScheme> parser = parseScheme(input);
    if (input.isCont() && parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriAuthority> authorityParser() {
    return new UriAuthorityParser(this);
  }

  public Parser<UriAuthority> parseAuthority(Input input) {
    return UriAuthorityParser.parse(input, this);
  }

  public UriAuthority parseAuthorityString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriAuthority> parser = parseAuthority(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriUser> userParser() {
    return new UriUserParser(this);
  }

  public Parser<UriUser> parseUser(Input input) {
    return UriUserParser.parse(input, this);
  }

  public UriUser parseUserString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriUser> parser = parseUser(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriHost> hostParser() {
    return new UriHostParser(this);
  }

  public Parser<UriHost> parseHost(Input input) {
    return UriHostParser.parse(input, this);
  }

  public UriHost parseHostString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriHost> parser = parseHost(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriHost> hostAddressParser() {
    return new UriHostAddressParser(this);
  }

  public Parser<UriHost> parseHostAddress(Input input) {
    return UriHostAddressParser.parse(input, this);
  }

  public Parser<UriHost> hostLiteralParser() {
    return new UriHostLiteralParser(this);
  }

  public Parser<UriHost> parseHostLiteral(Input input) {
    return UriHostLiteralParser.parse(input, this);
  }

  public Parser<UriPort> portParser() {
    return new UriPortParser(this);
  }

  public Parser<UriPort> parsePort(Input input) {
    return UriPortParser.parse(input, this);
  }

  public UriPort parsePortString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriPort> parser = parsePort(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriPath> pathParser(UriPathBuilder builder) {
    return new UriPathParser(this, builder);
  }

  public Parser<UriPath> pathParser() {
    return new UriPathParser(this);
  }

  public Parser<UriPath> parsePath(Input input, UriPathBuilder builder) {
    return UriPathParser.parse(input, this, builder);
  }

  public Parser<UriPath> parsePath(Input input) {
    return UriPathParser.parse(input, this);
  }

  public UriPath parsePathString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriPath> parser = parsePath(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriQuery> queryParser(UriQueryBuilder builder) {
    return new UriQueryParser(this, builder);
  }

  public Parser<UriQuery> queryParser() {
    return new UriQueryParser(this);
  }

  public Parser<UriQuery> parseQuery(Input input, UriQueryBuilder builder) {
    return UriQueryParser.parse(input, this, builder);
  }

  public Parser<UriQuery> parseQuery(Input input) {
    return UriQueryParser.parse(input, this);
  }

  public UriQuery parseQueryString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriQuery> parser = parseQuery(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  public Parser<UriFragment> fragmentParser() {
    return new UriFragmentParser(this);
  }

  public Parser<UriFragment> parseFragment(Input input) {
    return UriFragmentParser.parse(input, this);
  }

  public UriFragment parseFragmentString(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<UriFragment> parser = parseFragment(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }
}
