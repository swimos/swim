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

package swim.protobuf;

import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class PayloadDecoder<V> extends Decoder<V> {
  final ProtobufDecoder<?, V> protobuf;
  final Decoder<V> messageDecoder;
  final Decoder<V> textDecoder;
  final Decoder<V> dataDecoder;
  final int consumed;

  PayloadDecoder(ProtobufDecoder<?, V> protobuf, Decoder<V> messageDecoder,
                 Decoder<V> textDecoder, Decoder<V> dataDecoder, int consumed) {
    this.protobuf = protobuf;
    this.messageDecoder = messageDecoder;
    this.textDecoder = textDecoder;
    this.dataDecoder = dataDecoder;
    this.consumed = consumed;
  }

  PayloadDecoder(ProtobufDecoder<?, V> protobuf) {
    this(protobuf, null, null, null, 0);
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.protobuf, this.messageDecoder, this.textDecoder,
                  this.dataDecoder, this.consumed);
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf,
                               Decoder<V> messageDecoder, Decoder<V> textDecoder,
                               Decoder<V> dataDecoder, int consumed) {
    final int inputStart = input.index();
    final int inputLimit = input.limit();
    final int inputRemaining = inputLimit - inputStart;
    int inputConsumed = 0;
    if (messageDecoder == null) {
      messageDecoder = protobuf.decodeMessage(input);
    } else if (messageDecoder.isCont()) {
      messageDecoder = messageDecoder.feed(input);
    }
    if (input.isDone() && messageDecoder.isDone()) {
      return messageDecoder;
    }
    inputConsumed = Math.max(inputConsumed, input.index() - inputStart);

    if (consumed + inputConsumed < DETECTION_WINDOW) {
      input = input.index(inputStart).limit(inputLimit);
      if (textDecoder == null) {
        textDecoder = protobuf.decodeText(input);
      } else if (textDecoder.isCont()) {
        textDecoder = textDecoder.feed(input);
      }
      if (input.isDone() && textDecoder.isDone()) {
        return textDecoder;
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    } else {
      textDecoder = DETECTION_FAILED.asError();
    }

    if (consumed + inputConsumed < DETECTION_WINDOW) {
      input = input.index(inputStart).limit(inputLimit);
      if (dataDecoder == null) {
        dataDecoder = protobuf.decodeData(input);
      } else if (dataDecoder.isCont()) {
        dataDecoder = dataDecoder.feed(input);
      }
      if (input.isDone() && dataDecoder.isDone()) {
        return dataDecoder;
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    } else {
      dataDecoder = DETECTION_FAILED.asError();
    }

    if (textDecoder.isError() && dataDecoder.isError()) {
      return messageDecoder;
    } else if (messageDecoder.isError() && dataDecoder.isError()) {
      return textDecoder;
    } else if (messageDecoder.isError() && textDecoder.isError()) {
      return dataDecoder;
    }

    if (input.isDone()) {
      return error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    consumed += inputConsumed;
    return new PayloadDecoder<V>(protobuf, messageDecoder, textDecoder, dataDecoder, consumed);
  }

  static <V> Decoder<V> decode(InputBuffer input, ProtobufDecoder<?, V> protobuf) {
    return decode(input, protobuf, null, null, null, 0);
  }

  static final int DETECTION_WINDOW;
  static final Decoder<Object> DETECTION_FAILED;

  static {
    int detectionWindow;
    try {
      detectionWindow = Integer.parseInt(System.getProperty("swim.protobuf.payload.detection.window"));
    } catch (NumberFormatException e) {
      detectionWindow = 128;
    }
    DETECTION_WINDOW = detectionWindow;

    DETECTION_FAILED = error(new DecoderException("detection failed"));
  }
}
