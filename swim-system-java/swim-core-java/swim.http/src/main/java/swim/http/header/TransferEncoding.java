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
import swim.http.TransferCoding;
import swim.util.Builder;
import swim.util.Murmur3;

public final class TransferEncoding extends HttpHeader {
  final FingerTrieSeq<TransferCoding> codings;

  TransferEncoding(FingerTrieSeq<TransferCoding> codings) {
    this.codings = codings;
  }

  @Override
  public boolean isBlank() {
    return this.codings.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "transfer-encoding";
  }

  @Override
  public String name() {
    return "Transfer-Encoding";
  }

  public FingerTrieSeq<TransferCoding> codings() {
    return this.codings;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeParamList(this.codings.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TransferEncoding) {
      final TransferEncoding that = (TransferEncoding) other;
      return this.codings.equals(that.codings);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TransferEncoding.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.codings.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TransferEncoding").write('.').write("from").write('(');
    final int n = this.codings.size();
    if (n != 0) {
      output.debug(this.codings.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.codings.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  private static TransferEncoding chunked;

  public static TransferEncoding chunked() {
    if (chunked == null) {
      chunked = new TransferEncoding(FingerTrieSeq.of(TransferCoding.chunked()));
    }
    return chunked;
  }

  public static TransferEncoding from(FingerTrieSeq<TransferCoding> codings) {
    return new TransferEncoding(codings);
  }

  public static TransferEncoding from(TransferCoding... codings) {
    return from(FingerTrieSeq.of(codings));
  }

  public static TransferEncoding from(String... codingStrings) {
    final Builder<TransferCoding, FingerTrieSeq<TransferCoding>> codings = FingerTrieSeq.builder();
    for (int i = 0, n = codingStrings.length; i < n; i += 1) {
      codings.add(TransferCoding.parse(codingStrings[i]));
    }
    return from(codings.bind());
  }

  public static Parser<TransferEncoding> parseHttpValue(Input input, HttpParser http) {
    return TransferEncodingParser.parse(input, http);
  }
}
