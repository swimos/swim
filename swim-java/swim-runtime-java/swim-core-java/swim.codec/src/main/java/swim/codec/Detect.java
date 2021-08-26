// Copyright 2015-2021 Swim Inc.
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

public final class Detect {

  private Detect() {
    // static
  }

  @SuppressWarnings("unchecked")
  public static <O> Parser<O> parser(Parser<?>... parsers) {
    return new DetectParser<O>((Parser<O>[]) parsers);
  }

  @SuppressWarnings("unchecked")
  public static <O> Parser<O> parse(Input input, Parser<?>... parsers) {
    return DetectParser.parse(input, (Parser<O>[]) parsers);
  }

  @SuppressWarnings("unchecked")
  public static <O> Decoder<O> decoder(Decoder<?>... decoders) {
    return new DetectDecoder<O>((Decoder<O>[]) decoders);
  }

  @SuppressWarnings("unchecked")
  public static <O> Decoder<O> decode(InputBuffer input, Decoder<?>... decoders) {
    return DetectDecoder.decode(input, (Decoder<O>[]) decoders);
  }

}
