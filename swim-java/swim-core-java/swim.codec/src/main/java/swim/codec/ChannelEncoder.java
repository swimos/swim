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

import java.io.IOException;
import java.nio.channels.ReadableByteChannel;

final class ChannelEncoder extends Encoder<ReadableByteChannel, ReadableByteChannel> {
  final ReadableByteChannel input;

  ChannelEncoder(ReadableByteChannel input) {
    this.input = input;
  }

  ChannelEncoder() {
    this(null);
  }

  @Override
  public Encoder<ReadableByteChannel, ReadableByteChannel> feed(ReadableByteChannel input) {
    return new ChannelEncoder(input);
  }

  @Override
  public Encoder<ReadableByteChannel, ReadableByteChannel> pull(OutputBuffer<?> output) {
    final ReadableByteChannel input = this.input;
    try {
      final int k = output.write(input);
      if (k < 0 || !output.isPart()) {
        input.close();
        return done(input);
      } else if (output.isError()) {
        input.close();
        return error(output.trap());
      } else {
        return this;
      }
    } catch (IOException error) {
      try {
        input.close();
      } catch (IOException ignore) {
        // swallow
      }
      return error(error);
    } catch (Throwable error) {
      try {
        input.close();
      } catch (IOException ignore) {
        // swallow
      }
      throw error;
    }
  }
}
