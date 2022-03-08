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

import swim.codec.Base10;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class ContentLengthHeader extends HttpHeader {

  final long length;

  ContentLengthHeader(long length) {
    this.length = length;
  }

  @Override
  public String lowerCaseName() {
    return "content-length";
  }

  @Override
  public String name() {
    return "Content-Length";
  }

  public long length() {
    return this.length;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return Base10.writeLong(output, this.length);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ContentLengthHeader) {
      final ContentLengthHeader that = (ContentLengthHeader) other;
      return this.length == that.length;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ContentLengthHeader.hashSeed == 0) {
      ContentLengthHeader.hashSeed = Murmur3.seed(ContentLengthHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ContentLengthHeader.hashSeed, Murmur3.hash(this.length)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ContentLengthHeader").write('.').write("create").write('(')
                   .debug(this.length).write(')');
    return output;
  }

  public static ContentLengthHeader create(long length) {
    if (length < 0L) {
      throw new IllegalArgumentException(Long.toString(length));
    }
    return new ContentLengthHeader(length);
  }

  public static Parser<ContentLengthHeader> parseHeaderValue(Input input, HttpParser http) {
    return ContentLengthHeaderParser.parse(input);
  }

}
