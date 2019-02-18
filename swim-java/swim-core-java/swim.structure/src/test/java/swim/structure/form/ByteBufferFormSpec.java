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

package swim.structure.form;

import java.nio.ByteBuffer;
import org.testng.annotations.Test;
import swim.structure.Attr;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Record;
import static org.testng.Assert.assertEquals;

public class ByteBufferFormSpec {

  private static final ByteBuffer BB;
  static {
    BB = ByteBuffer.allocate(8)
        .putInt(0xCAFEBABE).putShort((short) 3).putShort((short) 45);
    BB.rewind();
  }

  @Test
  public void moldByteBuffer() {
    final ByteBuffer empty = ByteBuffer.allocate(8);
    assertEquals(Form.forByteBuffer().mold(empty), Data.from(empty));
    assertEquals(Form.forByteBuffer().mold(BB), Data.from(BB));
  }

  @Test
  public void castDataToByteBuffer() {
    final Data d = Data.fromBase16("CAFEBABE0003002D");
    assertEquals(Form.forByteBuffer().cast(d), BB);
  }

  @Test
  public void castFieldsToByteBuffers() {
    assertEquals(Form.forByteBuffer().cast(Attr.of("a", Data.fromBase16("CAFEBABE0003002D"))), BB);
  }

  @Test
  public void castAttributedDataToByteBuffer() {
    assertEquals(Form.forByteBuffer().cast(Record.of(Attr.of("test"), Data.fromBase16("CAFEBABE0003002D"))), BB);
  }
}
