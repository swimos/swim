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

import swim.codec.Input;
import swim.codec.Parser;
import swim.http.HttpParser;
import swim.http.MediaType;

final class ContentTypeHeaderParser extends Parser<ContentTypeHeader> {

  final HttpParser http;
  final Parser<MediaType> mediaTypeParser;

  ContentTypeHeaderParser(HttpParser http, Parser<MediaType> mediaTypeParser) {
    this.http = http;
    this.mediaTypeParser = mediaTypeParser;
  }

  ContentTypeHeaderParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<ContentTypeHeader> feed(Input input) {
    return ContentTypeHeaderParser.parse(input, this.http, this.mediaTypeParser);
  }

  static Parser<ContentTypeHeader> parse(Input input, HttpParser http,
                                         Parser<MediaType> mediaTypeParser) {
    if (mediaTypeParser == null) {
      mediaTypeParser = http.parseMediaType(input);
    } else {
      mediaTypeParser = mediaTypeParser.feed(input);
    }
    if (mediaTypeParser.isDone()) {
      return Parser.done(ContentTypeHeader.create(mediaTypeParser.bind()));
    } else if (mediaTypeParser.isError()) {
      return mediaTypeParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ContentTypeHeaderParser(http, mediaTypeParser);
  }

  static Parser<ContentTypeHeader> parse(Input input, HttpParser http) {
    return ContentTypeHeaderParser.parse(input, http, null);
  }

}
