// Copyright 2015-2022 Swim.inc
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

import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;

@Public
@Since("5.0")
public abstract class EncodedOutput<T> extends Output<T> {

  protected EncodedOutput() {
    // nop
  }

  @Override
  public abstract EncodedOutput<T> asLast(boolean last);

  public abstract EncodedOutput<T> resume(Output<T> output);

  @Override
  public abstract EncodedOutput<T> write(int token);

  public <U> Write<U> writeFrom(Write<U> write) {
    return WriteEncodedOutput.write(this, write);
  }

  @Override
  public EncodedOutput<T> clone() {
    throw new UnsupportedOperationException();
  }

}

final class WriteEncodedOutput<T> extends Write<T> {

  final EncodedOutput<?> output;
  final Write<T> write;

  WriteEncodedOutput(EncodedOutput<?> output, Write<T> write) {
    this.output = output;
    this.write = write;
  }

  @Override
  public Write<T> produce(Output<?> output) {
    return WriteEncodedOutput.write(Assume.<EncodedOutput<Object>>conforms(this.output).resume(Assume.conforms(output)), this.write);
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.write.get();
  }

  @Override
  public Throwable getError() {
    return this.write.getError();
  }

  static <T> Write<T> write(EncodedOutput<?> output, Write<T> write) {
    write = write.produce(output);
    if (!write.isCont()) {
      return write;
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteEncodedOutput<T>(output, write);
  }

}
