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

import swim.codec.Input;
import swim.codec.Parser;
import swim.http.HttpParser;
import swim.http.MediaType;

final class ContentTypeParser extends Parser<ContentType> {
  final HttpParser http;
  final Parser<MediaType> mediaType;

  ContentTypeParser(HttpParser http, Parser<MediaType> mediaType) {
    this.http = http;
    this.mediaType = mediaType;
  }

  ContentTypeParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<ContentType> feed(Input input) {
    return parse(input, this.http, this.mediaType);
  }

  static Parser<ContentType> parse(Input input, HttpParser http, Parser<MediaType> mediaType) {
    if (mediaType == null) {
      mediaType = http.parseMediaType(input);
    } else {
      mediaType = mediaType.feed(input);
    }
    if (mediaType.isDone()) {
      return done(ContentType.from(mediaType.bind()));
    } else if (mediaType.isError()) {
      return mediaType.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ContentTypeParser(http, mediaType);
  }

  static Parser<ContentType> parse(Input input, HttpParser http) {
    return parse(input, http, null);
  }
}
