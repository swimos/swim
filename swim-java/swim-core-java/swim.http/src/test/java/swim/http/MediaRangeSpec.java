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

package swim.http;

import org.testng.annotations.Test;
import static swim.http.HttpAssertions.assertWrites;

public class MediaRangeSpec {
  public void assertParses(String string, MediaRange mediaRange) {
    HttpAssertions.assertParses(Http.standardParser().mediaRangeParser(), string, mediaRange);
  }

  @Test
  public void parseMediaRanges() {
    assertParses("*/*", MediaRange.from("*", "*"));
    assertParses("text/*", MediaRange.from("text", "*"));
    assertParses("text/plain", MediaRange.from("text", "plain"));
  }

  @Test
  public void writeMediaRanges() {
    assertWrites(MediaRange.from("*", "*"), "*/*");
    assertWrites(MediaRange.from("text", "*"), "text/*");
    assertWrites(MediaRange.from("text", "plain"), "text/plain");
  }

  @Test
  public void parseMediaRangesWithWeights() {
    assertParses("text/*;q=0.5", MediaRange.from("text", "*", 0.5f));
    assertParses("text/* ; q=0.5", MediaRange.from("text", "*", 0.5f));
  }

  @Test
  public void writeMediaRangesWithWeights() {
    assertWrites(MediaRange.from("text", "*", 0.5f), "text/*; q=0.5");
  }

  @Test
  public void parseMediaRangesWithParams() {
    assertParses("text/*;charset=UTF-8",
                 MediaRange.from("text", "*").param("charset", "UTF-8"));
    assertParses("text/* ; charset = UTF-8",
                 MediaRange.from("text", "*").param("charset", "UTF-8"));
  }

  @Test
  public void writeMediaRangesWithParams() {
    assertWrites(MediaRange.from("text", "*").param("charset", "UTF-8"),
                 "text/*; charset=UTF-8");
  }

  @Test
  public void parseMediaRangesWithWeightsAndParams() {
    assertParses("text/*;q=0.5;charset=UTF-8",
                 MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8"));
    assertParses("text/* ; q=0.5 ; charset = UTF-8",
                 MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8"));
  }

  @Test
  public void writeMediaRangesWithWeightsAndParams() {
    assertWrites(MediaRange.from("text", "*", 0.5f).param("charset", "UTF-8"),
                 "text/*; q=0.5; charset=UTF-8");
  }
}
