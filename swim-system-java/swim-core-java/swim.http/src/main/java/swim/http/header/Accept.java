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

public final class Accept extends HttpHeader {
  final FingerTrieSeq<MediaRange> mediaRanges;

  Accept(FingerTrieSeq<MediaRange> mediaRanges) {
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
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.mediaRanges.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Accept) {
      final Accept that = (Accept) other;
      return this.mediaRanges.equals(that.mediaRanges);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Accept.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.mediaRanges.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Accept").write('.').write("from").write('(');
    final int n = this.mediaRanges.size();
    if (n > 0) {
      output.debug(this.mediaRanges.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.mediaRanges.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static Accept from(FingerTrieSeq<MediaRange> mediaRanges) {
    return new Accept(mediaRanges);
  }

  public static Accept from(MediaRange... mediaRanges) {
    return new Accept(FingerTrieSeq.of(mediaRanges));
  }

  public static Accept from(String... mediaRangeStrings) {
    final Builder<MediaRange, FingerTrieSeq<MediaRange>> mediaRanges = FingerTrieSeq.builder();
    for (int i = 0, n = mediaRangeStrings.length; i < n; i += 1) {
      mediaRanges.add(MediaRange.parse(mediaRangeStrings[i]));
    }
    return new Accept(mediaRanges.bind());
  }

  public static Parser<Accept> parseHttpValue(Input input, HttpParser http) {
    return AcceptParser.parse(input, http);
  }
}
