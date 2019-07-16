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

package swim.warp;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.codec.Utf8;
import swim.recon.Recon;
import swim.structure.Value;

final class EnvelopeDecoder extends Decoder<Envelope> {
  final Decoder<Value> output;

  EnvelopeDecoder(Decoder<Value> output) {
    this.output = output;
  }

  EnvelopeDecoder() {
    this(null);
  }

  @Override
  public Decoder<Envelope> feed(InputBuffer input) {
    return decode(input, this.output);
  }

  static Decoder<Envelope> decode(InputBuffer input, Decoder<Value> output) {
    if (output == null) {
      output = Utf8.parseDecoded(Recon.structureParser().blockParser(), input);
    } else {
      output = output.feed(input);
    }
    if (output.isDone()) {
      try {
        final Value value = output.bind();
        final Envelope envelope = Envelope.fromValue(value);
        if (envelope != null) {
          return done(envelope);
        } else {
          return error(new DecoderException(Recon.toString(value)));
        }
      } catch (RuntimeException cause) {
        return error(cause);
      }
    } else if (output.isError()) {
      return error(output.trap());
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new EnvelopeDecoder(output);
  }
}
