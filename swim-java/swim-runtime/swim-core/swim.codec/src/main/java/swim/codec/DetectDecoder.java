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

package swim.codec;

final class DetectDecoder<O> extends Decoder<O> {

  final Decoder<O>[] decoders;
  final int detectionWindow;
  final int consumed;

  DetectDecoder(Decoder<O>[] decoders, int detectionWindow, int consumed) {
    this.decoders = decoders;
    this.detectionWindow = detectionWindow;
    this.consumed = consumed;
  }

  DetectDecoder(Decoder<O>[] decoders, int detectionWindow) {
    this(decoders, detectionWindow, 0);
  }

  DetectDecoder(Decoder<O>[] decoders) {
    this(decoders, DetectDecoder.DETECTION_WINDOW, 0);
  }

  @Override
  public Decoder<O> feed(InputBuffer input) {
    return DetectDecoder.decode(input, this.decoders, this.detectionWindow, this.consumed);
  }

  @SuppressWarnings("unchecked")
  static <O> Decoder<O> decode(InputBuffer input, Decoder<O>[] oldDecoders,
                               int detectionWindow, int consumed) {
    int i = 0;
    final int n = oldDecoders.length;
    Decoder<O>[] newDecoders = (Decoder<O>[]) new Decoder<?>[n];
    int firstCont = -1;
    int contCount = 0;
    int trapCount = 0;

    final int inputStart = input.index();
    final int inputLimit = input.limit();
    final int inputRemaining = inputLimit - inputStart;
    int inputConsumed = 0;
    while (i < n) {
      Decoder<O> decoder = oldDecoders[i];
      input = input.index(inputStart).limit(inputLimit);
      if (contCount == 0 || consumed + inputConsumed < detectionWindow) {
        decoder = decoder.feed(input);
      } else {
        decoder = DetectDecoder.DETECTION_FAILED.asError();
      }
      if (decoder.isDone() && input.isDone()) {
        return decoder;
      }
      inputConsumed = Math.max(inputConsumed, input.index() - inputStart);
      newDecoders[i] = decoder;
      if (decoder.isError()) {
        trapCount += 1;
      } else {
        contCount += 1;
        if (firstCont == -1) {
          firstCont = i;
        }
      }
      i += 1;
    }
    if (input.isDone()) {
      return Decoder.error(new DecoderException("unexpected end of input"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }

    if (contCount == 1) {
      return newDecoders[firstCont];
    } else if (trapCount != 0) {
      oldDecoders = newDecoders;
      newDecoders = (Decoder<O>[]) new Decoder<?>[contCount];
      i = firstCont;
      int j = 0;
      while (i < n) {
        final Decoder<O> decoder = oldDecoders[i];
        if (!decoder.isError()) {
          newDecoders[j] = decoder;
          j += 1;
        }
        i += 1;
      }
    }
    consumed += inputConsumed;
    return new DetectDecoder<O>(newDecoders, detectionWindow, consumed);
  }

  static <O> Decoder<O> decode(InputBuffer input, Decoder<O>[] decoders, int detectionWindow) {
    return DetectDecoder.decode(input, decoders, detectionWindow, 0);
  }

  static <O> Decoder<O> decode(InputBuffer input, Decoder<O>[] decoders) {
    return DetectDecoder.decode(input, decoders, DetectDecoder.DETECTION_WINDOW, 0);
  }

  static final int DETECTION_WINDOW;
  static final Decoder<Object> DETECTION_FAILED;

  static {
    int detectionWindow;
    try {
      detectionWindow = Integer.parseInt(System.getProperty("swim.codec.detection.window"));
    } catch (NumberFormatException e) {
      detectionWindow = 128;
    }
    DETECTION_WINDOW = detectionWindow;

    DETECTION_FAILED = Decoder.error(new DecoderException("detection failed"));
  }

}
