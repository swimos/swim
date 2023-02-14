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

package swim.log;

import org.junit.jupiter.api.Test;
import swim.json.Json;
import swim.util.Severity;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class LogServiceTests {

  @Test
  public void testLogService() throws InterruptedException {
    final LogPrinter log = new LogPrinter(Json.forType(LogEvent.class));
    final LogService service = new LogService(log, 1024);
    service.start();
    int i = 0;
    while (i < 10000) {
      for (int j = 0; j < 1000; j += 1) {
        service.publish(LogEvent.create("test", "", LogScope.root(), Severity.NOTICE, "Message " + i, null, null));
        i += 1;
      }
      Thread.sleep(34L);
    }
    service.stop();
    System.out.println("DROPPED " + service.dropCount + " events");
  }

}
