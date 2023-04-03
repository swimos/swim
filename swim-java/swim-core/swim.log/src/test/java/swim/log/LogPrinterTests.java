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
import swim.json.JsonFormException;
import swim.util.Severity;

public class LogPrinterTests {

  @Test
  public void testLogPrinter() throws JsonFormException {
    final LogPrinter log = new LogPrinter(Json.form(LogEvent.class));
    log.publish(LogEvent.of("test", "", LogScope.root(), Severity.INFO, "Hello, world!", null, null));
  }

  @Test
  public void testLogPrinterWriter() {
    final LogPrinter log = new LogPrinter(LogFormat.provider());
    log.publish(LogEvent.of("test", "", LogScope.root(), Severity.INFO, "Hello, world!", "detail", null));
  }

}
