// Copyright 2015-2023 Swim.inc
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

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.collections.FingerTrieSeq;
import swim.util.Builder;

final class HpackBlockDecoder extends Decoder<FingerTrieSeq<HpackHeader>> {

  final HpackDecoder hpack;
  final Builder<HpackHeader, FingerTrieSeq<HpackHeader>> headers;
  final Decoder<HpackHeader> headerDecoder;
  final boolean indexed;
  final int value;
  final int shift;
  final int step;

  HpackBlockDecoder(HpackDecoder hpack, Builder<HpackHeader, FingerTrieSeq<HpackHeader>> headers,
                    Decoder<HpackHeader> headerDecoder, boolean indexed, int value, int shift, int step) {
    this.hpack = hpack;
    this.headers = headers;
    this.headerDecoder = headerDecoder;
    this.indexed = indexed;
    this.value = value;
    this.shift = shift;
    this.step = step;
  }

  HpackBlockDecoder(HpackDecoder hpack) {
    this(hpack, null, null, false, 0, 0, 1);
  }

  @Override
  public Decoder<FingerTrieSeq<HpackHeader>> feed(InputBuffer input) {
    return HpackBlockDecoder.decode(input, this.hpack, this.headers, this.headerDecoder,
                                    this.indexed, this.value, this.shift, this.step);
  }

  static Decoder<FingerTrieSeq<HpackHeader>> decode(InputBuffer input, HpackDecoder hpack,
                                                    Builder<HpackHeader, FingerTrieSeq<HpackHeader>> headers,
                                                    Decoder<HpackHeader> headerDecoder, boolean indexed,
                                                    int value, int shift, int step) {
    int b;
    block: do {
      if (step == 1) {
        if (input.isCont()) {
          b = input.head();
          if (hpack.maxDynamicTableSizeChanged && (b & 0xE0) != 0x20) {
            return Decoder.error(new HpackException("max dynamic table size change required"));
          }
          if ((b & 0x80) != 0) {
            // RFC 7541 Section 6.1. Indexed Header Field Representation
            step = 2;
          } else if ((b & 0x40) != 0) {
            // RFC 7541 Section 6.2.1. Literal Header Field with Incremental Indexing
            indexed = true;
            step = 2;
          } else if ((b & 0x20) != 0) {
            // RFC 7541 Section 6.3. Dynamic Table Size Update
            final int maxDynamicTableSize = b & 0x1F;
            if (maxDynamicTableSize == 0x1F) {
              step = 3;
            } else {
              if (maxDynamicTableSize > hpack.maxDynamicTableSize) {
                return Decoder.error(new HpackException("invalid max dynamic table size: " + maxDynamicTableSize));
              }
              hpack.encoderMaxDynamicTableSize = maxDynamicTableSize;
              hpack.maxDynamicTableSizeChanged = false;
              hpack.dynamicTable.setCapacity(maxDynamicTableSize);
              continue;
            }
          } else {
            step = 2;
          }
        } else if (input.isDone()) {
          if (headers != null) {
            return Decoder.done(headers.bind());
          } else {
            return Decoder.done(FingerTrieSeq.empty());
          }
        }
      }
      if (step == 2) {
        if (headerDecoder == null) {
          headerDecoder = hpack.decodeHeader(input);
        } else {
          headerDecoder = headerDecoder.feed(input);
        }
        if (headerDecoder.isDone()) {
          final HpackHeader header = headerDecoder.bind();
          headerDecoder = null;
          if (headers == null) {
            headers = FingerTrieSeq.builder();
          }
          headers.add(header);
          if (indexed) {
            hpack.dynamicTable.add(header);
            indexed = false;
          }
          step = 1;
          continue;
        } else if (headerDecoder.isError()) {
          return headerDecoder.asError();
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          b = input.head();
          input = input.step();
          if (shift == 28 && (b & 0xF8) != 0) {
            return Decoder.error(new DecoderException("max dynamic table size overflow"));
          }
          value |= (b & 0x7F) << shift;
          if ((b & 0x80) != 0) {
            shift += 7;
            if (shift >= 32) {
              return Decoder.error(new DecoderException("max dynamic table size overflow"));
            }
          } else {
            final int maxDynamicTableSize = 0x1F + value;
            if (maxDynamicTableSize < 0) {
              return Decoder.error(new HpackException("invalid max dynamic table size: " + maxDynamicTableSize));
            }
            hpack.encoderMaxDynamicTableSize = maxDynamicTableSize;
            hpack.maxDynamicTableSizeChanged = false;
            hpack.dynamicTable.setCapacity(maxDynamicTableSize);
            value = 0;
            shift = 0;
            step = 1;
            continue block;
          }
        }
      }
      break;
    } while (true);
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new HpackBlockDecoder(hpack, headers, headerDecoder, indexed, value, shift, step);
  }

  static Decoder<FingerTrieSeq<HpackHeader>> decode(InputBuffer input, HpackDecoder hpack) {
    return HpackBlockDecoder.decode(input, hpack, null, null, false, 0, 0, 1);
  }

}
