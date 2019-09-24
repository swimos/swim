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

import java.io.File;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.StandardOpenOption;
import java.util.Map;
import org.testng.annotations.Test;
import swim.structure.Form;

public class DatabaseSpec {
  final File testOutputDir = new File("build/test-output");

  @Test
  public void testCommit() throws IOException {
    final Store store = new TestStore() {
      @Override
      public boolean pageShouldSplit(Database database, Page page) {
        return page.arity() > 3;
      }
      @Override
      public boolean pageShouldMerge(Database database, Page page) {
        return page.arity() < 2;
      }
    };
    final Database database = new Database(store);
    final Map<String, Integer> map = database.openBTreeMap("test")
        .keyForm(Form.forString())
        .valueForm(Form.forInteger());

    final int zone = 1;
    final long created = System.currentTimeMillis();
    testOutputDir.mkdirs();
    final File testFile = new File(testOutputDir, "commit-1.swimdb");
    final FileChannel channel = FileChannel.open(testFile.toPath(),
        StandardOpenOption.WRITE, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    channel.position(2 * Germ.BLOCK_SIZE);

    map.put("a", 1);
    map.put("b", 2);
    map.put("c", 3);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("d", 4);
    map.put("e", 5);
    map.put("f", 6);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("a", 0);
    map.put("g", 7);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("h", 8);
    map.put("i", 9);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("j", 10);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("a", 1);
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.remove("a");
    map.remove("b");
    map.remove("c");
    map.remove("d");
    map.remove("e");
    map.remove("f");
    map.remove("g");
    map.remove("h");
    map.remove("i");
    map.remove("j");
    database.commitChunk(Commit.forced(), zone, channel.position()).write(channel);

    map.put("a", 1);
    map.put("b", 2);
    map.put("c", 3);
    map.put("d", 4);
    map.put("e", 5);
    map.put("f", 6);
    map.put("g", 7);
    map.put("h", 8);
    map.put("i", 9);
    map.put("j", 10);
    final Chunk chunk = database.commitChunk(Commit.forced(), zone, channel.position());
    chunk.write(channel);
    channel.position(0);
    final Germ germ = chunk.germ();
    germ.writeValue(channel);
    germ.writeValue(channel);

    channel.close();
    testFile.delete();
  }
}
