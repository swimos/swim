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

package swim.decipher;

import swim.codec.Input;
import swim.codec.Parser;

final class AnyParser<I, V> extends Parser<V> {
  final DecipherParser<I, V> decipher;
  final Parser<V> xmlParser;
  final Parser<V> jsonParser;
  final Parser<V> reconParser;

  AnyParser(DecipherParser<I, V> decipher, Parser<V> xmlParser,
            Parser<V> jsonParser, Parser<V> reconParser) {
    this.decipher = decipher;
    this.xmlParser = xmlParser;
    this.jsonParser = jsonParser;
    this.reconParser = reconParser;
  }

  AnyParser(DecipherParser<I, V> decipher) {
    this(decipher, null, null, null);
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.decipher, this.xmlParser, this.jsonParser, this.reconParser);
  }

  static <I, V> Parser<V> parse(Input input, DecipherParser<I, V> decipher, Parser<V> xmlParser,
                                Parser<V> jsonParser, Parser<V> reconParser) {
    if (xmlParser == null || xmlParser.isCont()) {
      final Input xmlInput = input.clone();
      if (xmlParser == null) {
        xmlParser = decipher.parseXml(xmlInput);
      } else {
        xmlParser = xmlParser.feed(xmlInput);
      }
      if (xmlInput.isDone() && xmlParser.isDone()) {
        return xmlParser;
      }
    }

    if (jsonParser == null || jsonParser.isCont()) {
      final Input jsonInput = input.clone();
      if (jsonParser == null) {
        jsonParser = decipher.parseJson(jsonInput);
      } else {
        jsonParser = jsonParser.feed(jsonInput);
      }
      if (jsonInput.isDone() && jsonParser.isDone()) {
        return jsonParser;
      }
    }

    if (reconParser == null || reconParser.isCont()) {
      final Input reconInput = input.clone();
      if (reconParser == null) {
        reconParser = decipher.parseRecon(reconInput);
      } else {
        reconParser = reconParser.feed(reconInput);
      }
      if (reconInput.isDone() && reconParser.isDone()) {
        return reconParser;
      }
    }

    if (jsonParser.isError() && reconParser.isError()) {
      return xmlParser;
    } else if (xmlParser.isError() && reconParser.isError()) {
      return jsonParser;
    } else if (xmlParser.isError() && jsonParser.isError()) {
      return reconParser;
    }

    if (input.isError()) {
      return error(input.trap());
    }
    return new AnyParser<I, V>(decipher, xmlParser, jsonParser, reconParser);
  }

  static <I, V> Parser<V> parse(Input input, DecipherParser<I, V> decipher) {
    return parse(input, decipher, null, null, null);
  }
}
