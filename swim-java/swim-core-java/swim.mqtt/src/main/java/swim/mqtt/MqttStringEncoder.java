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
import swim.codec.Utf8;

final class MqttStringEncoder extends Encoder<String, String> {
  final String string;
  final Encoder<?, ?> encoder;
  final int length;
  final int step;

  MqttStringEncoder(String string, Encoder<?, ?> encoder, int length, int step) {
    this.string = string;
    this.encoder = encoder;
    this.length = length;
    this.step = step;
  }

  MqttStringEncoder(String string) {
    this(string, null, 0, 1);
  }

  @Override
  public Encoder<String, String> feed(String string) {
    return new MqttStringEncoder(string, null, 0, 1);
  }

  @Override
  public Encoder<String, String> pull(OutputBuffer<?> output) {
    return encode(output, this.string, this.encoder, this.length, this.step);
  }

  static int sizeOf(String string) {
    return 2 + Utf8.sizeOf(string);
  }

  static Encoder<String, String> encode(OutputBuffer<?> output, String string,
                                        Encoder<?, ?> encoder, int length, int step) {
    if (step == 1 && output.isCont()) {
      length = Utf8.sizeOf(string);
      if (length > 65535) {
        return error(new MqttException("string too long (" + length + " bytes)"));
      }
      output = output.write(length >>> 8);
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write(length);
      step = 3;
    }
    if (step == 3) {
      if (encoder == null) {
        encoder = Utf8.writeString(string, output);
      } else {
        encoder = encoder.pull(output);
      }
      if (encoder.isDone()) {
        return done(string);
      } else if (encoder.isError()) {
        return encoder.asError();
      }
    }
    if (output.isDone()) {
      return error(new EncoderException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new MqttStringEncoder(string, encoder, length, step);
  }

  static Encoder<String, String> encode(OutputBuffer<?> output, String string) {
    return encode(output, string, null, 0, 1);
  }
}
