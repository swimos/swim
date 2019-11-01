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

package swim.avro;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class AvroNameSpec {
  @Test
  public void parseUnqualifiedNames() {
    assertEquals(AvroName.parse("test"), AvroName.from("test"));
  }

  @Test
  public void parseQualifiedNames() {
    assertEquals(AvroName.parse("com.example.test"), AvroName.from(AvroNamespace.from("com", "example"), "test"));
  }
}
