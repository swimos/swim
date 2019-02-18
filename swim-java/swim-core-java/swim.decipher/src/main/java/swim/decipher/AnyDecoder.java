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

package swim.decipher;

import swim.codec.Binary;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.codec.UtfErrorMode;

final class AnyDecoder<I, V> extends Decoder<V> {
  final DecipherDecoder<I, V> decipher;
  final Parser<V> xmlParser;
  final Parser<V> jsonParser;
  final Parser<V> reconParser;
  final Decoder<V> protobufDecoder;
  final Decoder<V> textDecoder;
  final Decoder<V> dataDecoder;
  final int consumed;

  AnyDecoder(DecipherDecoder<I, V> decipher, Parser<V> xmlParser, Parser<V> jsonParser,
             Parser<V> reconParser, Decoder<V> protobufDecoder, Decoder<V> textDecoder,
             Decoder<V> dataDecoder, int consumed) {
    this.decipher = decipher;
    this.xmlParser = xmlParser;
    this.jsonParser = jsonParser;
    this.reconParser = reconParser;
    this.protobufDecoder = protobufDecoder;
    this.textDecoder = textDecoder;
    this.dataDecoder = dataDecoder;
    this.consumed = consumed;
  }

  AnyDecoder(DecipherDecoder<I, V> decipher) {
    this(decipher, null, null, null, null, null, null, 0);
  }

  @Override
  public Decoder<V> feed(InputBuffer input) {
    return decode(input, this.decipher, this.xmlParser, this.jsonParser,
                  this.reconParser, this.protobufDecoder, this.textDecoder,
                  this.dataDecoder, this.consumed);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, DecipherDecoder<I, V> decipher,
                                  Parser<V> xmlParser, Parser<V> jsonParser, Parser<V> reconParser,
                                  Decoder<V> protobufDecoder, Decoder<V> textDecoder,
                                  Decoder<V> dataDecoder, int consumed) {
    final int inputStart = input.index();
    final int inputLimit = input.limit();
    final int inputRemaining = inputLimit - inputStart;
    int inputConsumed = 0;

    if (xmlParser == null || xmlParser.isCont()) {
      if (xmlParser == null) {
        xmlParser = Utf8.parseDecoded(decipher.xmlParser(), input, UtfErrorMode.fatalNonZero());
      } else {
        xmlParser = xmlParser.feed(input);
      }
      if (input.isDone() && xmlParser.isDone()) {
        return done(xmlParser.bind());
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    }

    if (jsonParser == null || jsonParser.isCont()) {
      input = input.index(inputStart).limit(inputLimit);
      if (jsonParser == null) {
        jsonParser = Utf8.parseDecoded(decipher.jsonParser(), input, UtfErrorMode.fatalNonZero());
      } else {
        jsonParser = jsonParser.feed(input);
      }
      if (input.isDone() && jsonParser.isDone()) {
        return done(jsonParser.bind());
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    }

    if (reconParser == null || reconParser.isCont()) {
      input = input.index(inputStart).limit(inputLimit);
      if (reconParser == null) {
        reconParser = Utf8.parseDecoded(decipher.reconParser(), input, UtfErrorMode.fatalNonZero());
      } else {
        reconParser = reconParser.feed(input);
      }
      if (input.isDone() && reconParser.isDone()) {
        return done(reconParser.bind());
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    }

    if (protobufDecoder == null || protobufDecoder.isCont()) {
      input = input.index(inputStart).limit(inputLimit);
      if (protobufDecoder == null) {
        protobufDecoder = decipher.decodeProtobuf(input);
      } else {
        protobufDecoder = protobufDecoder.feed(input);
      }
      if (input.isDone() && protobufDecoder.isDone()) {
        return protobufDecoder;
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    } else {
      protobufDecoder = DETECTION_FAILED.asError();
    }

    if (consumed + inputConsumed < DETECTION_WINDOW) {
      input = input.index(inputStart).limit(inputLimit);
      if (textDecoder == null) {
        textDecoder = Utf8.decodeOutput(decipher.textOutput(), input, UtfErrorMode.fatalNonZero());
      } else {
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
        dataDecoder = Binary.parseOutput(decipher.dataOutput(), input);
      } else {
        dataDecoder = dataDecoder.feed(input);
      }
      if (input.isDone() && dataDecoder.isDone()) {
        return dataDecoder;
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
    } else {
      dataDecoder = DETECTION_FAILED.asError();
    }

    if (jsonParser.isError() && reconParser.isError() && protobufDecoder.isError()
        && textDecoder.isError() && dataDecoder.isError()) {
      return xmlParser;
    } else if (xmlParser.isError() && reconParser.isError() && protobufDecoder.isError()
            && textDecoder.isError() && dataDecoder.isError()) {
      return jsonParser;
    } else if (xmlParser.isError() && jsonParser.isError() && protobufDecoder.isError()
            && textDecoder.isError() && dataDecoder.isError()) {
      return reconParser;
    } else if (xmlParser.isError() && jsonParser.isError() && reconParser.isError()
            && textDecoder.isError() && dataDecoder.isError()) {
      return protobufDecoder;
    } else if (xmlParser.isError() && jsonParser.isError() && reconParser.isError()
            && protobufDecoder.isError() && dataDecoder.isError()) {
      return textDecoder;
    } else if (xmlParser.isError() && jsonParser.isError() && reconParser.isError()
            && protobufDecoder.isError() && textDecoder.isError()) {
      return dataDecoder;
    }

    if (input.isDone()) {
      return error(new DecoderException("unexpected end of input"));
    } else if (input.isError()) {
      return error(input.trap());
    }
    consumed += inputConsumed;
    return new AnyDecoder<I, V>(decipher, xmlParser, jsonParser, reconParser,
                                protobufDecoder, textDecoder, dataDecoder, consumed);
  }

  static <I, V> Decoder<V> decode(InputBuffer input, DecipherDecoder<I, V> decipher) {
    return decode(input, decipher, null, null, null, null, null, null, 0);
  }

  static final int DETECTION_WINDOW;
  static final Decoder<Object> DETECTION_FAILED;

  static {
    int detectionWindow;
    try {
      detectionWindow = Integer.parseInt(System.getProperty("swim.any.decoder.detection.window"));
    } catch (NumberFormatException e) {
      detectionWindow = 128;
    }
    DETECTION_WINDOW = detectionWindow;

    DETECTION_FAILED = error(new DecoderException("detection failed"));
  }
}
