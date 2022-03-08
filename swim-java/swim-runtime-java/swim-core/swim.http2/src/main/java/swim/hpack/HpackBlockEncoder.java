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

package swim.hpack;

import java.util.Iterator;
import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;

final class HpackBlockEncoder extends Encoder<Object, Object> {

  final HpackEncoder hpack;
  final Iterator<HpackHeader> headers;
  final Encoder<?, ?> part;

  HpackBlockEncoder(HpackEncoder hpack, Iterator<HpackHeader> headers, Encoder<?, ?> part) {
    this.hpack = hpack;
    this.headers = headers;
    this.part = part;
  }

  HpackBlockEncoder(HpackEncoder hpack, Iterator<HpackHeader> headers) {
    this(hpack, headers, null);
  }

  @Override
  public Encoder<Object, Object> pull(OutputBuffer<?> output) {
    return HpackBlockEncoder.encode(output, this.hpack, this.headers, this.part);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, HpackEncoder hpack,
                                        Iterator<HpackHeader> headers, Encoder<?, ?> part) {
    do {
      if (part == null) {
        if (!headers.hasNext()) {
          return Encoder.done();
        } else {
          part = hpack.encodeHeader(output, headers.next());
        }
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        continue;
      } else if (part.isError()) {
        return part.asError();
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Encoder.error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return Encoder.error(output.trap());
    }
    return new HpackBlockEncoder(hpack, headers, part);
  }

  static Encoder<Object, Object> encode(OutputBuffer<?> output, HpackEncoder hpack,
                                        Iterator<HpackHeader> headers) {
    return HpackBlockEncoder.encode(output, hpack, headers, null);
  }

}
