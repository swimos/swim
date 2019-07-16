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

package swim.codec;

/**
 * Dynamically generated {@link Decoder} continuation.
 */
public abstract class DynamicDecoder<O> extends Decoder<O> {
  /**
   * Current decoder continuation.
   */
  protected Decoder<? extends O> decoding;

  @Override
  public Decoder<O> feed(InputBuffer input) {
    Decoder<? extends O> decoder = this.decoding;
    if (decoder == null) {
      if (input.isDone()) {
        return done();
      }
      decoder = doDecode();
      this.decoding = decoder;
      if (decoder == null) {
        return done();
      }
    }
    if (decoder != null) {
      decoder = decoder.feed(input);
      if (decoder.isDone()) {
        this.decoding = null;
        didDecode(decoder.bind());
      } else if (decoder.isError()) {
        return decoder.asError();
      }
    }
    if (input.isDone()) {
      return done();
    }
    return this;
  }

  @Override
  public Decoder<O> fork(Object condition) {
    if (this.decoding != null) {
      this.decoding = this.decoding.fork(condition);
    }
    return this;
  }

  @Override
  public O bind() {
    if (this.decoding != null) {
      return this.decoding.bind();
    } else {
      throw new IllegalStateException();
    }
  }

  @Override
  public Throwable trap() {
    if (this.decoding != null) {
      return this.decoding.trap();
    } else {
      throw new IllegalStateException();
    }
  }

  /**
   * Returns a new {@code Decoder} continuation for this {@code DynamicDecoder},
   * or {@code null} if this {@code DynamicDecoder} is done.
   */
  protected abstract Decoder<? extends O> doDecode();

  /**
   * Lifecycle callback invoked after this {@code DynamicDecoder} has finished
   * decoding a {@code value}.
   */
  protected abstract void didDecode(O value);
}
