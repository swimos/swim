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

package swim.http.header;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.HttpParser;

final class ContentEncodingParser extends Parser<ContentEncoding> {
  final HttpParser http;
  final Parser<FingerTrieSeq<String>> codings;

  ContentEncodingParser(HttpParser http, Parser<FingerTrieSeq<String>> codings) {
    this.http = http;
    this.codings = codings;
  }

  ContentEncodingParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<ContentEncoding> feed(Input input) {
    return parse(input, this.http, this.codings);
  }

  static Parser<ContentEncoding> parse(Input input, HttpParser http,
                                       Parser<FingerTrieSeq<String>> codings) {
    if (codings == null) {
      codings = http.parseTokenList(input);
    } else {
      codings = codings.feed(input);
    }
    if (codings.isDone()) {
      final FingerTrieSeq<String> tokens = codings.bind();
      if (!tokens.isEmpty()) {
        return done(ContentEncoding.from(tokens));
      } else {
        return error(Diagnostic.expected("content coding", input));
      }
    } else if (codings.isError()) {
      return codings.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ContentEncodingParser(http, codings);
  }

  static Parser<ContentEncoding> parse(Input input, HttpParser http) {
    return parse(input, http, null);
  }
}
