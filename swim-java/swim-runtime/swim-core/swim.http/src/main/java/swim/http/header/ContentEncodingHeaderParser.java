// Copyright 2015-2022 Swim.inc
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

package swim.http.header;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.HttpParser;

final class ContentEncodingHeaderParser extends Parser<ContentEncodingHeader> {

  final HttpParser http;
  final Parser<FingerTrieSeq<String>> codingsParser;

  ContentEncodingHeaderParser(HttpParser http, Parser<FingerTrieSeq<String>> codingsParser) {
    this.http = http;
    this.codingsParser = codingsParser;
  }

  ContentEncodingHeaderParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<ContentEncodingHeader> feed(Input input) {
    return ContentEncodingHeaderParser.parse(input, this.http, this.codingsParser);
  }

  static Parser<ContentEncodingHeader> parse(Input input, HttpParser http,
                                             Parser<FingerTrieSeq<String>> codingsParser) {
    if (codingsParser == null) {
      codingsParser = http.parseTokenList(input);
    } else {
      codingsParser = codingsParser.feed(input);
    }
    if (codingsParser.isDone()) {
      final FingerTrieSeq<String> tokens = codingsParser.bind();
      if (!tokens.isEmpty()) {
        return Parser.done(ContentEncodingHeader.create(tokens));
      } else {
        return Parser.error(Diagnostic.expected("content coding", input));
      }
    } else if (codingsParser.isError()) {
      return codingsParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ContentEncodingHeaderParser(http, codingsParser);
  }

  static Parser<ContentEncodingHeader> parse(Input input, HttpParser http) {
    return ContentEncodingHeaderParser.parse(input, http, null);
  }

}
