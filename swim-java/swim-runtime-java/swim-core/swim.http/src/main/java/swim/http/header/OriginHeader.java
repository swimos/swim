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
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.uri.Uri;
import swim.util.Builder;
import swim.util.Murmur3;

public final class OriginHeader extends HttpHeader {

  final FingerTrieSeq<Uri> origins;

  OriginHeader(FingerTrieSeq<Uri> origins) {
    this.origins = origins;
  }

  @Override
  public String lowerCaseName() {
    return "origin";
  }

  @Override
  public String name() {
    return "Origin";
  }

  public FingerTrieSeq<Uri> origins() {
    return this.origins;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    if (this.origins.isEmpty()) {
      return Unicode.writeString(output, "null");
    } else {
      return OriginHeaderWriter.write(output, this.origins.iterator());
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof OriginHeader) {
      final OriginHeader that = (OriginHeader) other;
      return this.origins.equals(that.origins);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (OriginHeader.hashSeed == 0) {
      OriginHeader.hashSeed = Murmur3.seed(OriginHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(OriginHeader.hashSeed, this.origins.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("OriginHeader").write('.');
    final int n = this.origins.size();
    if (n > 0) {
      output = output.write("create").write('(').debug(this.origins.head().toString());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").write(this.origins.get(i).toString());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
    return output;
  }

  private static OriginHeader empty;

  public static OriginHeader empty() {
    if (OriginHeader.empty == null) {
      OriginHeader.empty = new OriginHeader(FingerTrieSeq.<Uri>empty());
    }
    return OriginHeader.empty;
  }

  public static OriginHeader create(FingerTrieSeq<Uri> origins) {
    if (origins.isEmpty()) {
      return OriginHeader.empty();
    } else {
      return new OriginHeader(origins);
    }
  }

  public static OriginHeader create(Uri... origins) {
    if (origins.length == 0) {
      return OriginHeader.empty();
    } else {
      return new OriginHeader(FingerTrieSeq.of(origins));
    }
  }

  public static OriginHeader create(String... originStrings) {
    if (originStrings.length == 0) {
      return OriginHeader.empty();
    } else {
      final Builder<Uri, FingerTrieSeq<Uri>> origins = FingerTrieSeq.builder();
      for (int i = 0, n = originStrings.length; i < n; i += 1) {
        origins.add(Uri.parse(originStrings[i]));
      }
      return new OriginHeader(origins.bind());
    }
  }

  public static Parser<OriginHeader> parseHeaderValue(Input input, HttpParser http) {
    return OriginHeaderParser.parse(input);
  }

}
