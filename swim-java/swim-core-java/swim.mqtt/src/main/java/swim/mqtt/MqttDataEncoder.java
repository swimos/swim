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

package swim.mqtt;

import swim.codec.Encoder;
import swim.codec.EncoderException;
import swim.codec.OutputBuffer;
import swim.structure.Data;

final class MqttDataEncoder extends Encoder<Data, Data> {
  final Data data;
  final Encoder<?, ?> encoder;
  final int step;

  MqttDataEncoder(Data data, Encoder<?, ?> encoder, int step) {
    this.data = data;
    this.encoder = encoder;
    this.step = step;
  }

  MqttDataEncoder(Data data) {
    this(data, null, 1);
  }

  @Override
  public Encoder<Data, Data> feed(Data data) {
    return new MqttDataEncoder(data, null, 1);
  }

  @Override
  public Encoder<Data, Data> pull(OutputBuffer<?> output) {
    return encode(output, this.data, this.encoder, this.step);
  }

  static int sizeOf(Data data) {
    return 2 + data.size();
  }

  static Encoder<Data, Data> encode(OutputBuffer<?> output, Data data,
                                    Encoder<?, ?> encoder, int step) {
    if (step == 1 && output.isCont()) {
      if (data.size() > 65535) {
        return error(new MqttException("data too long (" + data.size() + " bytes)"));
      }
      output = output.write(data.size() >>> 8);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write(data.size());
      step = 3;
    }
    if (step == 3) {
      if (encoder == null) {
        encoder = data.write(output);
      } else {
        encoder = encoder.pull(output);
      }
      if (encoder.isDone()) {
        return done(data);
      } else if (encoder.isError()) {
        return encoder.asError();
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new MqttDataEncoder(data, encoder, step);
  }

  static Encoder<Data, Data> encode(OutputBuffer<?> output, Data data) {
    return encode(output, data, null, 1);
  }
}
