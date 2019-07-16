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

package swim.ws;

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;

final class WsStatusEncoder extends Encoder<Object, WsStatus> {
  final WsStatus status;
  final Encoder<?, ?> part;
  final int step;

  WsStatusEncoder(WsStatus status, Encoder<?, ?> part, int step) {
    this.status = status;
    this.part = part;
    this.step = step;
  }

  WsStatusEncoder(WsStatus status) {
    this(status, null, 1);
  }

  @Override
  public Encoder<Object, WsStatus> pull(OutputBuffer<?> output) {
    return encode(output, this.status, this.part, this.step);
  }

  static Encoder<Object, WsStatus> encode(OutputBuffer<?> output, WsStatus status,
                                          Encoder<?, ?> part, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write(status.code >>> 8);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write(status.code);
      step = 3;
    }
    if (step == 3) {
      if (part == null) {
        part = Utf8.writeString(status.reason, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return done(status);
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new WsStatusEncoder(status, part, step);
  }

  static Encoder<Object, WsStatus> encode(OutputBuffer<?> output, WsStatus status) {
    return encode(output, status, null, 1);
  }
}
