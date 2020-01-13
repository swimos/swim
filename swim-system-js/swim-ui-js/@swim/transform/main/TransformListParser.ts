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

import {Input, Parser, Unicode} from "@swim/codec";
import {Transform} from "./Transform";

/** @hidden */
export class TransformListParser extends Parser<Transform> {
  private readonly transform: Transform | undefined;
  private readonly transformParser: Parser<Transform> | undefined;

  constructor(transform?: Transform, transformParser?: Parser<Transform>) {
    super();
    this.transform = transform;
    this.transformParser = transformParser;
  }

  feed(input: Input): Parser<Transform> {
    return TransformListParser.parse(input, this.transform, this.transformParser);
  }

  static parse(input: Input, transform: Transform = Transform.identity(),
               transformParser?: Parser<Transform>): Parser<Transform> {
    do {
      if (!transformParser) {
        while (input.isCont() && Unicode.isSpace(input.head())) {
          input.step();
        }
        if (input.isCont()) {
          transformParser = Transform.Parser.parse(input);
        } else if (input.isDone()) {
          return Parser.done(transform);
        }
      }
      if (transformParser) {
        transformParser = transformParser.feed(input);
        if (transformParser.isDone()) {
          transform = transform.transform(transformParser.bind());
          transformParser = void 0;
          continue;
        } else if (transformParser.isError()) {
          return transformParser.asError();
        }
      }
      break;
    } while (true);
    return new TransformListParser(transform, transformParser);
  }
}
Transform.ListParser = TransformListParser;
