// Copyright 2015-2023 Nstream, inc.
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

import swim.annotations.Contravariant;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A writer of values to non-blocking chunked output writers.
 *
 * @param <T> the type of values to write
 */
@Public
@Since("5.0")
@FunctionalInterface
public interface Writer<@Contravariant T> extends Encoder<T> {

  @Override
  default Encode<?> encode(OutputBuffer<?> output, @Nullable T value) {
    return this.write(new Utf8EncodedOutput<>(output), value);
  }

  Write<?> write(Output<?> output, @Nullable T value);

  default Write<?> write(@Nullable T value) {
    return this.write(BinaryOutputBuffer.full(), value);
  }

  default String toString(@Nullable T value) {
    final StringOutput output = new StringOutput();
    this.write(output, value).assertDone();
    return output.get();
  }

}
