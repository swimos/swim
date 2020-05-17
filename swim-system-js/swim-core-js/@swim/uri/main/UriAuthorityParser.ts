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

import {Input, Diagnostic, Parser} from "@swim/codec";
import {UriAuthority} from "./UriAuthority";
import {UriUser} from "./UriUser";
import {UriHost} from "./UriHost";
import {UriPort} from "./UriPort";
import {UriParser} from "./UriParser";

/** @hidden */
export class UriAuthorityParser extends Parser<UriAuthority> {
  private readonly uri: UriParser;
  private readonly userParser: Parser<UriUser> | undefined;
  private readonly hostParser: Parser<UriHost> | undefined;
  private readonly portParser: Parser<UriPort> | undefined;
  private readonly step: number | undefined;

  constructor(uri: UriParser, userParser?: Parser<UriUser>, hostParser?: Parser<UriHost>,
              portParser?: Parser<UriPort>, step?: number) {
    super();
    this.uri = uri;
    this.userParser = userParser;
    this.hostParser = hostParser;
    this.portParser = portParser;
    this.step = step;
  }

  feed(input: Input): Parser<UriAuthority> {
    return UriAuthorityParser.parse(input, this.uri, this.userParser, this.hostParser,
                                    this.portParser, this.step);
  }

  static parse(input: Input, uri: UriParser, userParser?: Parser<UriUser>, hostParser?: Parser<UriHost>,
               portParser?: Parser<UriPort>, step: number = 1): Parser<UriAuthority> {
    let c = 0;
    if (step === 1) {
      if (input.isCont()) {
        const look = input.clone();
        while (look.isCont() && (c = look.head(), c !== 64/*'@'*/ && c !== 47/*'/'*/)) {
          look.step();
        }
        if (look.isCont() && c === 64/*'@'*/) {
          step = 2;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        step = 3;
      }
    }
    if (step === 2) {
      if (userParser === void 0) {
        userParser = uri.parseUser(input);
      } else {
        userParser = userParser.feed(input);
      }
      if (userParser.isDone()) {
        if (input.isCont() && input.head() === 64/*'@'*/) {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected(64/*'@'*/, input));
        }
      } else if (userParser.isError()) {
        return userParser.asError();
      }
    }
    if (step === 3) {
      if (hostParser === void 0) {
        hostParser = uri.parseHost(input);
      } else {
        hostParser = hostParser.feed(input);
      }
      if (hostParser.isDone()) {
        if (input.isCont() && input.head() === 58/*':'*/) {
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return Parser.done(uri.authority(userParser !== void 0 ? userParser.bind() : void 0,
                                           hostParser.bind()));
        }
      } else if (hostParser.isError()) {
        return hostParser.asError();
      }
    }
    if (step === 4) {
      if (portParser === void 0) {
        portParser = uri.parsePort(input);
      } else {
        portParser = portParser.feed(input);
      }
      if (portParser.isDone()) {
        return Parser.done(uri.authority(userParser !== void 0 ? userParser.bind() : void 0,
                                         hostParser!.bind(),
                                         portParser.bind()));
      } else if (portParser.isError()) {
        return portParser.asError();
      }
    }
    return new UriAuthorityParser(uri, userParser, hostParser, portParser, step);
  }
}
UriParser.AuthorityParser = UriAuthorityParser;
