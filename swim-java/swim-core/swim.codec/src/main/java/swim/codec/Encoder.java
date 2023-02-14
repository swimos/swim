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

import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
@FunctionalInterface
public interface Encoder<T> {

  Encode<?> encode(OutputBuffer<?> output, @Nullable T value);

  default Encode<?> encode(@Nullable T value) {
    return this.encode(BinaryOutputBuffer.full(), value);
  }

  default long sizeOf(@Nullable T value) {
    final ByteBuffer buffer = ByteBuffer.allocate(1024);
    final BinaryOutputBuffer output = new BinaryOutputBuffer(buffer);
    Encode<?> encode = this.encode(output, value);
    buffer.flip();
    long size = (long) buffer.remaining();
    buffer.clear();
    while (encode.isCont()) {
      encode = encode.produce(output);
      buffer.flip();
      size += buffer.remaining();
      buffer.clear();
    }
    encode.checkDone();
    return size;
  }

}
