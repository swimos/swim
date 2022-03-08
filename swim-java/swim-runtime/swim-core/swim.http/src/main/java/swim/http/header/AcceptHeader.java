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
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.http.MediaRange;
import swim.util.Builder;
import swim.util.Murmur3;

public final class AcceptHeader extends HttpHeader {

  final FingerTrieSeq<MediaRange> mediaRanges;

  AcceptHeader(FingerTrieSeq<MediaRange> mediaRanges) {
    this.mediaRanges = mediaRanges;
  }

  @Override
  public String lowerCaseName() {
    return "accept";
  }

  @Override
  public String name() {
    return "Accept";
  }

  public FingerTrieSeq<MediaRange> mediaRanges() {
    return this.mediaRanges;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(output, this.mediaRanges.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AcceptHeader) {
      final AcceptHeader that = (AcceptHeader) other;
      return this.mediaRanges.equals(that.mediaRanges);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (AcceptHeader.hashSeed == 0) {
      AcceptHeader.hashSeed = Murmur3.seed(AcceptHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(AcceptHeader.hashSeed, this.mediaRanges.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("AcceptHeader").write('.').write("create").write('(');
    final int n = this.mediaRanges.size();
    if (n > 0) {
      output = output.debug(this.mediaRanges.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.mediaRanges.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static AcceptHeader empty() {
    return new AcceptHeader(FingerTrieSeq.empty());
  }

  public static AcceptHeader create(FingerTrieSeq<MediaRange> mediaRanges) {
    return new AcceptHeader(mediaRanges);
  }

  public static AcceptHeader create(MediaRange... mediaRanges) {
    return new AcceptHeader(FingerTrieSeq.of(mediaRanges));
  }

  public static AcceptHeader create(String... mediaRangeStrings) {
    final Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges = FingerTrieSeq.builder();
    for (int i = 0, n = mediaRangeStrings.length; i < n; i += 1) {
      mediaRanges.add(MediaRange.parse(mediaRangeStrings[i]));
    }
    return new AcceptHeader(mediaRanges.bind());
  }

  public static Parser<AcceptHeader> parseHeaderValue(Input input, HttpParser http) {
    return AcceptHeaderParser.parse(input, http);
  }

}
