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

package swim.db;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.WritableByteChannel;
import swim.codec.Binary;
import swim.codec.Output;
import swim.codec.Unicode;
import swim.codec.Utf8;
import swim.concurrent.Conts;
import swim.recon.Recon;
import swim.structure.Record;
import swim.structure.Value;

public class Germ {
  final int stem;
  final long version;
  final long created;
  final long updated;
  final Value seedRefValue;

  public Germ(int stem, long version, long created, long updated, Value seedRefValue) {
    this.stem = stem;
    this.version = version;
    this.created = created;
    this.updated = updated;
    this.seedRefValue = seedRefValue.commit();
  }

  public int stem() {
    return this.stem;
  }

  public long version() {
    return this.version;
  }

  public long created() {
    return this.created;
  }

  public long updated() {
    return this.updated;
  }

  public Value seedRefValue() {
    return this.seedRefValue;
  }

  public Seed seed() {
    return new Seed(TreeType.BTREE, 1, this.created, this.updated, this.seedRefValue);
  }

  public Value toValue() {
    final Record header = Record.create(4)
        .slot("stem", this.stem)
        .slot("version", this.version)
        .slot("created", this.created)
        .slot("updated", this.updated);
    final Record record = Record.create(2).attr("swimdb", header);
    if (this.seedRefValue.isDefined()) {
      record.slot("seed", this.seedRefValue);
    }
    return record;
  }

  public void writeValue(Output<?> output) {
    final Value value = toValue();
    Recon.write(value, output);
    int i = Recon.sizeOf(value);
    while (i < BLOCK_SIZE) {
      if (i % 1024 == 1023) {
        output.write('\n');
      } else {
        output.write(' ');
      }
      i += 1;
    }
  }

  public void writeValue(WritableByteChannel channel) {
    final ByteBuffer buffer = toByteBuffer();
    int k;
    try {
      do {
        k = channel.write(buffer);
      } while (k > 0 && buffer.hasRemaining());
      if (buffer.hasRemaining()) {
        throw new StoreException("wrote incomplete germ");
      }
    } catch (IOException cause) {
      throw new StoreException(cause);
    }
  }

  public ByteBuffer toByteBuffer() {
    final Output<ByteBuffer> output = Utf8.decodedOutput(Binary.outputBuffer(new byte[BLOCK_SIZE]));
    writeValue(output);
    return output.bind();
  }

  @Override
  public String toString() {
    return Recon.toString(toValue());
  }

  static final int BLOCK_SIZE = 4 * 1024;

  public static Germ fromValue(Value value) {
    Throwable error = null;
    try {
      final Value header = value.header("swimdb");
      if (header != null) {
        final int stem = header.get("stem").intValue();
        final long version = header.get("version").longValue();
        final long created = header.get("created").longValue();
        final long updated = header.get("updated").longValue();
        final Value seedRefValue = value.get("seed");
        return new Germ(stem, version, created, updated, seedRefValue);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        error = cause;
      } else {
        throw cause;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed germ: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), error);
  }
}
