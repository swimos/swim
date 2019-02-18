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

package swim.json;

import java.nio.ByteBuffer;
import swim.codec.Base64;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;

final class DataWriter extends Writer<Object, Object> {
  final ByteBuffer buffer;
  final Writer<?, ?> part;
  final int step;

  DataWriter(ByteBuffer buffer, Writer<?, ?> part, int step) {
    this.buffer = buffer;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.buffer, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, ByteBuffer buffer,
                                      Writer<?, ?> part, int step) {
    if (step == 1 && output.isCont()) {
      output = output.write('"');
      step = 2;
    }
    if (step == 2) {
      if (part == null) {
        part = Base64.standard().writeByteBuffer(buffer, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        part = null;
        step = 3;
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (step == 3 && output.isCont()) {
      output = output.write('"');
      return done();
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new DataWriter(buffer, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, ByteBuffer buffer) {
    return write(output, buffer, null, 1);
  }
}
