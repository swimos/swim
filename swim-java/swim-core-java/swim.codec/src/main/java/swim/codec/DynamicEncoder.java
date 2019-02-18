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
 * Dynamically generated {@link Encoder} continuation.
 */
public abstract class DynamicEncoder<I, O> extends Encoder<I, O> {
  /**
   * Current encoder continuation.
   */
  protected Encoder<? super I, ? extends O> encoding;

  @Override
  public Encoder<I, O> feed(I input) {
    if (this.encoding != null) {
      this.encoding = this.encoding.feed(input);
      return this;
    } else {
      throw new IllegalStateException();
    }
  }

  @Override
  public Encoder<I, O> pull(OutputBuffer<?> output) {
    Encoder<? super I, ? extends O> encoder = this.encoding;
    if (encoder == null) {
      if (output.isDone()) {
        return done();
      }
      encoder = doEncode();
      this.encoding = encoder;
      if (encoder == null) {
        return done();
      }
    }
    if (encoder != null) {
      encoder = encoder.pull(output);
      if (encoder.isDone()) {
        this.encoding = null;
        didEncode(encoder.bind());
      } else if (encoder.isError()) {
        return encoder.asError();
      }
    }
    if (output.isDone()) {
      return done();
    }
    return this;
  }

  @Override
  public Encoder<I, O> fork(Object condition) {
    if (this.encoding != null) {
      this.encoding = this.encoding.fork(condition);
    }
    return this;
  }

  @Override
  public O bind() {
    if (this.encoding != null) {
      return this.encoding.bind();
    } else {
      throw new IllegalStateException();
    }
  }

  @Override
  public Throwable trap() {
    if (this.encoding != null) {
      return this.encoding.trap();
    } else {
      throw new IllegalStateException();
    }
  }

  /**
   * Returns a new {@code Encoder} continuation for this {@code DynamicEncoder},
   * or {@code null} if this {@code DynamicEncoder} is done.
   */
  protected abstract Encoder<? super I, ? extends O> doEncode();

  /**
   * Lifecycle callback invoked after this {@code DynamicEncoder} has finished
   * encoding a {@code value}.
   */
  protected abstract void didEncode(O value);
}
