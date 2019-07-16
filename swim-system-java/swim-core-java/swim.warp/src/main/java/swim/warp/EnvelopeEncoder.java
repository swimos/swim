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

import swim.codec.Encoder;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;

final class EnvelopeEncoder extends Encoder<Envelope, Envelope> {
  final Envelope envelope;
  final Encoder<?, ?> input;

  EnvelopeEncoder(Envelope envelope, Encoder<?, ?> input) {
    this.envelope = envelope;
    this.input = input;
  }

  EnvelopeEncoder(Envelope envelope) {
    this(envelope, null);
  }

  EnvelopeEncoder() {
    this(null, null);
  }

  @Override
  public Encoder<Envelope, Envelope> pull(OutputBuffer<?> output) {
    return encode(output, this.envelope, this.input);
  }

  @Override
  public Encoder<Envelope, Envelope> feed(Envelope envelope) {
    return new EnvelopeEncoder(envelope);
  }

  static Encoder<Envelope, Envelope> encode(OutputBuffer<?> output, Envelope envelope, Encoder<?, ?> input) {
    if (input == null) {
      input = Utf8.writeEncoded(envelope.reconWriter(), output);
    } else {
      input = input.pull(output);
    }
    if (input.isDone()) {
      return done(envelope);
    } else if (input.isError()) {
      return error(input.trap());
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new EnvelopeEncoder(envelope, input);
  }
}
