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

import {Input, Parser, Diagnostic} from "@swim/codec";
import {DateTimeInit} from "../DateTime";
import {DateTimeFormat} from "../DateTimeFormat";
import {DateTimeSpecifiers} from "../DateTimeSpecifiers";

/** @hidden */
export class PatternParser extends Parser<DateTimeInit> {
  private readonly pattern: string;
  private readonly specifiers: DateTimeSpecifiers;
  private readonly date: DateTimeInit | undefined;
  private readonly dateParser: Parser<DateTimeInit> | undefined;
  private readonly step: number | undefined;

  constructor(pattern: string, specifiers: DateTimeSpecifiers, date?: DateTimeInit,
              dateParser?: Parser<DateTimeInit>, step?: number) {
    super();
    this.pattern = pattern;
    this.specifiers = specifiers;
    this.date = date;
    this.dateParser = dateParser;
    this.step = step;
  }

  feed(input: Input): Parser<DateTimeInit> {
    return PatternParser.parse(input, this.pattern, this.specifiers, this.date,
                                     this.dateParser, this.step);
  }

  static parse(input: Input, pattern: string, specifiers: DateTimeSpecifiers,
               date: DateTimeInit = {}, dateParser?: Parser<DateTimeInit>,
               step: number = 0): Parser<DateTimeInit> {
    let c = 0;
    const n = pattern.length;
    while (step < n) {
      const p = pattern.charCodeAt(step);
      if (p === 37/*'%'*/) {
        if (!dateParser) {
          const s = pattern.charAt(step + 1);
          const format = specifiers[s];
          if (format) {
            dateParser = format.parseDateTime(input, date);
          } else {
            return Parser.error(Diagnostic.message("unknown format specifier: " + s, input));
          }
        } else {
          dateParser = dateParser.feed(input);
        }
        if (dateParser.isDone()) {
          date = dateParser.bind();
          dateParser = void 0;
          step += 2;
          continue;
        } else if (dateParser.isError()) {
          return dateParser.asError();
        }
      } else if (input.isCont()) {
        c = input.head();
        if (c === p) {
          input.step();
          step += 1;
          continue;
        } else {
          return Parser.error(Diagnostic.expected(p, input));
        }
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.unexpected(input));
      }
      break;
    }
    if (step === n) {
      return Parser.done(date);
    }
    return new PatternParser(pattern, specifiers, date, dateParser, step);
  }
}
DateTimeFormat.PatternParser = PatternParser;
